import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
	}
	const { id } = params;
	const body = await request.json();

	if (body.save !== undefined) {
		await db
			.update(tables.chats)
			.set({ saved: body.save })
			.where(and(eq(tables.chats.id, id), eq(tables.chats.userId, locals.user.id)));
		return new Response(null, { status: 204 });
	}
	if (body.temporary !== undefined) {
		await db
			.update(tables.chats)
			.set({ deleteAfter: body.temporary ? new Date(Date.now() + 1000 * 60 * 60 * 24) : null })
			.where(and(eq(tables.chats.id, id), eq(tables.chats.userId, locals.user.id)));
		return new Response(null, { status: 204 });
	}
	return new Response(null, { status: 400 });
};
