import type { Message } from '$lib/types';
import type { CoreMessage } from 'ai';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { generateSignature } from '$lib/server/s3';

export const mapMessagesWithChildren = (
	messages: Array<Omit<Message, 'children'>>
): Record<string, Message> => {
	const map: Record<string, Message> = {};
	for (const msg of messages) {
		map[msg.id] = { ...msg, children: [] };
	}

	for (const msg of Object.values(map)) {
		if (msg.parentId && map[msg.parentId]) {
			map[msg.parentId].children.push(msg.id);
		}
	}

	return map;
};

export const transformMessage = async (message: Message, userId: string): Promise<CoreMessage> => {
	const content = await Promise.all(
		message.contents.map(async (part) => {
			if (part.type === 'text' && part.text) {
				return {
					type: 'text' as const,
					text: part.text as string
				};
			} else if (part.type === 'file' && part.file?.id) {
				// For now, only supporting images
				return {
					type: 'image' as const,
					image: await generateSignature(`users/${userId}/files/${part.file.id}`)
				};
			}
			return undefined;
		})
	);
	const filteredContent = content.filter(
		(part): part is { type: 'text'; text: string } | { type: 'image'; image: string } =>
			Boolean(part)
	);
	return {
		role: message.role as 'user' | 'assistant' | 'system',
		content: filteredContent
	} as CoreMessage;
};

export const writeMessage = async ({
	action,
	chatId,
	userMessage,
	assistantMessageId,
	assistantText
}: {
	action: 'new' | 'regenerate';
	chatId: string;
	userMessage: Message;
	assistantMessageId: string;
	assistantText: string;
}) => {
	if (action === 'regenerate') {
		await db.transaction(async (tx) => {
			await tx.insert(tables.messages).values({
				id: assistantMessageId,
				chatId,
				role: 'assistant',
				parentId: userMessage?.id
			});
			await tx.insert(tables.contents).values({
				messageId: assistantMessageId,
				type: 'text',
				text: assistantText
			});
		});
	} else if (action === 'new') {
		await db.transaction(async (tx) => {
			const [message] = await tx
				.insert(tables.messages)
				.values({
					id: userMessage?.id,
					parentId: userMessage?.parentId,
					chatId,
					role: 'user'
				})
				.returning();
			await tx.insert(tables.contents).values(
				userMessage?.contents.map((content) => ({
					messageId: message.id,
					type: content.type,
					text: content.text,
					fileId: content.type === 'file' ? (content.file?.id ?? null) : null
				})) as (typeof tables.contents.$inferInsert)[]
			);
			await tx.insert(tables.messages).values({
				id: assistantMessageId,
				parentId: userMessage?.id,
				chatId,
				role: 'assistant'
			});
			await tx.insert(tables.contents).values({
				messageId: assistantMessageId,
				type: 'text',
				text: assistantText
			});
		});
	} else {
		throw new Error('Invalid action');
	}
};
