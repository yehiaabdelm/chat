import type { RequestHandler } from './$types';
import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/oauth';

export const GET: RequestHandler = async (event) => {
	const provider = event.url.searchParams.get('provider');
	if (provider === 'google') {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
		event.cookies.set('google_oauth_state', state, {
			path: '/',
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
		event.cookies.set('google_code_verifier', codeVerifier, {
			path: '/',
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
		return new Response(null, {
			status: 302,
			headers: {
				Location: url.toString()
			}
		});
	} else {
		return new Response('Provider not found', { status: 400 });
	}
};
