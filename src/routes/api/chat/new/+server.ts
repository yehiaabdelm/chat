import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as tables from '$lib/server/db/schema';
import { generateAndUpdateTitle } from '$lib/server/chat';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { input, rootMessageId } = await request.json();

	const chat = await db.transaction(async (tx) => {
		const [chat] = await tx
			.insert(tables.chats)
			.values({
				userId: locals?.user?.id ?? '',
				title: 'New Chat'
			})
			.returning();
		const [rootMessage] = await tx
			.insert(tables.messages)
			.values({
				id: rootMessageId,
				chatId: chat.id,
				role: 'system'
			})
			.returning();
		await tx
			.update(tables.chats)
			.set({
				rootMessageId: rootMessage.id
			})
			.where(eq(tables.chats.id, chat.id));
		return {
			...chat,
			rootMessageId: rootMessage.id,
			messages: {
				[rootMessage.id]: {
					...rootMessage,
					children: []
				}
			}
		};
	});
	generateAndUpdateTitle(chat.id, locals.user.id, input);
	return json(chat);
};
