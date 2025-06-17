import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const { id } = params;
	const { nodeId } = await request.json();

	// Check if the node has any children
	const children = await db
		.select()
		.from(tables.messages)
		.where(and(eq(tables.messages.parentId, nodeId), eq(tables.messages.chatId, id),))
		.limit(1);

	if (children.length > 0) {
		return json(
			{ error: 'Cannot set leaf message to a node that has children' },
			{ status: 400 }
		);
	}

	const result = await db
		.update(tables.chats)
		.set({ leafMessageId: nodeId })
		.where(and(eq(tables.chats.id, id), eq(tables.chats.userId, locals.user.id)));
	return json(result);
};
