import type { Message } from '$lib/types';
import type { CoreMessage } from 'ai';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { generateSignature, s3Client } from '$lib/server/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { and, eq, inArray } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

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
		(message.contents || []).map(async (part) => {
			if (part.type === 'text' && part.text) {
				return {
					type: 'text' as const,
					text: part.text as string
				};
			} else if (part.type === 'file' && part.file?.id) {
				// For now, only supporting images
				const extension = part.file.mimeType.split('/')[1];
				return {
					type: 'image' as const,
					image: await generateSignature(`users/${userId}/files/${part.file.id}.${extension}`)
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
	assistantText,
	modelId
}: {
	action: 'new' | 'regenerate';
	chatId: string;
	userMessage: Message;
	assistantMessageId: string;
	assistantText: string;
	modelId: string;
}) => {
	if (action === 'regenerate') {
		await db.transaction(async (tx) => {
			await tx.insert(tables.messages).values({
				id: assistantMessageId,
				chatId,
				role: 'assistant',
				parentId: userMessage?.id,
				modelId
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
				userMessage?.contents?.map((content) => ({
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
				role: 'assistant',
				modelId
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

export const deleteChat = async (chatId: string, userId: string): Promise<void> => {
	await deleteChatFiles(chatId, userId);
	await db
		.delete(tables.chats)
		.where(and(eq(tables.chats.id, chatId), eq(tables.chats.userId, userId)));
};

export const deleteChats = async (chatIds: string[], userId: string): Promise<void> => {
	if (chatIds.length === 0) return;

	// Delete files for all chats
	await Promise.all(chatIds.map((chatId) => deleteChatFiles(chatId, userId)));

	// Delete all chats
	await db
		.delete(tables.chats)
		.where(and(inArray(tables.chats.id, chatIds), eq(tables.chats.userId, userId)));
};

const deleteChatFiles = async (chatId: string, userId: string): Promise<void> => {
	// Get all files associated with messages in this chat
	const chatFiles = await db
		.select({
			id: tables.files.id,
			key: tables.files.key
		})
		.from(tables.files)
		.innerJoin(tables.contents, eq(tables.contents.fileId, tables.files.id))
		.innerJoin(tables.messages, eq(tables.messages.id, tables.contents.messageId))
		.where(and(eq(tables.messages.chatId, chatId), eq(tables.files.userId, userId)));

	if (chatFiles.length === 0) return;

	// Delete files from S3
	const s3DeletePromises = chatFiles.map((file) =>
		s3Client.send(
			new DeleteObjectCommand({
				Bucket: env.AWS_S3_BUCKET!,
				Key: file.key
			})
		)
	);

	try {
		await Promise.allSettled(s3DeletePromises);
	} catch (error) {
		console.error('Some S3 file deletions failed:', error);
		// Continue with database deletion even if S3 fails
	}

	// Delete file records from database
	// Note: The files will be automatically removed from contents table due to cascade delete
	const fileIds = chatFiles.map((file) => file.id);
	await db.delete(tables.files).where(inArray(tables.files.id, fileIds));
};
