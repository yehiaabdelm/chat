import type { RequestHandler } from './$types';
import { writeMessage } from '$lib/server/chat';
import { json } from '@sveltejs/kit';
import type { Message } from '$lib/types';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import * as tables from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const { id } = params;
	const { action, chatId, userMessage, assistantMessageId, assistantText, modelId }: {
		action: 'new' | 'regenerate';
		chatId: string;
		userMessage: Message;
		assistantMessageId: string;
		assistantText: string;
		modelId: string;	
	} = await request.json();
	const userOwnsChat = await db.query.chats.findFirst({
		where: and(eq(tables.chats.id, chatId), eq(tables.chats.userId, locals.user.id)),
		with: {
			user: true
		},
		columns: {
			userId: true
		}
	});
	if (!userOwnsChat) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	await writeMessage({
		action,
		chatId,
		userMessage,
		assistantMessageId,
		assistantText,
		modelId
	});
	return json(null, { status: 200 });
};
