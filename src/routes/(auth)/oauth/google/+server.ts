import type { RequestHandler } from './$types';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';
import { google } from '$lib/server/oauth';
import { decodeIdToken, OAuth2Tokens } from 'arctic';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { DEFAULT_ENDPOINTS } from '$lib/server/defaultData';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response('Invalid request', {
			status: 400
		});
	}

	if (state !== storedState) {
		return new Response('Invalid state', {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		return new Response('Invalid code or client credentials', {
			status: 400
		});
	}
	const claims = decodeIdToken(tokens.idToken());
	const googleUserId = (claims as any).sub;

	const existingUser = await db.query.oauth.findFirst({
		where: and(eq(table.oauth.providerId, googleUserId), eq(table.oauth.provider, 'google'))
	});

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.userId);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		redirect(302, '/');
	}

	const tx = await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(table.users)
			.values({
				firstName: (claims as any).given_name as string,
				lastName: (claims as any).family_name as string,
				avatarUrl: (claims as any).picture as string,
				email: (claims as any).email as string
			})
			.returning();
		await tx.insert(table.oauth).values({
			userId: user.id,
			provider: 'google',
			providerId: googleUserId,
			data: claims
		});
		await tx.insert(table.userEndpoint).values({
			userId: user.id,
			endpointId: '77536ae3-c772-4d3d-adca-21d3d084ee93',
			apiKey: env.OPENAI_API_KEY
		});
		return { user };
	});
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, tx.user.id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	redirect(302, '/');
};
