import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { and, eq, isNull } from 'drizzle-orm';
import * as tables from '$lib/server/db/schema';
import { redirect, type Actions } from '@sveltejs/kit';
import { mapMessagesWithChildren } from '$lib/server/chat';
import { generateSignature } from '$lib/server/s3';
import type { FileWithUrl } from '$lib/types';
import { env } from '$env/dynamic/private';
import * as crypto from '$lib/server/crypto';

export const load = (async ({ params, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const unattachedFiles = (await db
		.select({
			id: tables.files.id,
			key: tables.files.key,
			mimeType: tables.files.mimeType,
			sizeBytes: tables.files.sizeBytes
		})
		.from(tables.files)
		.leftJoin(tables.contents, eq(tables.contents.fileId, tables.files.id))
		.where(
			and(
				eq(tables.files.userId, locals.user.id), // current user
				isNull(tables.contents.fileId) // not attached yet
			)
		)) as FileWithUrl[];
	await Promise.all(
		unattachedFiles.map(async (file) => {
			file.url = await generateSignature(file.key);
		})
	);

	if (params.id) {
		const chat = await db.query.chats.findFirst({
			where: and(eq(tables.chats.id, params.id), eq(tables.chats.userId, locals.user.id)),
			with: {
				messages: {
					columns: {
						id: true,
						parentId: true,
						role: true,
						createdAt: true,
						updatedAt: true
					},
					with: {
						model: {
							columns: {
								id: true,
								name: true
							}
						},
						contents: {
							columns: {
								id: true,
								text: true,
								type: true
							},
							with: {
								file: {
									columns: {
										id: true,
										key: true,
										mimeType: true,
										sizeBytes: true
									}
								}
							}
						}
					}
				}
			}
		});

		if (!chat) {
			redirect(302, '/');
		}

		await Promise.all(
			chat.messages.map((msg) =>
				Promise.all(
					msg.contents.map(async (c) => {
						if (c.type === 'file' && c.file) {
							(c.file as FileWithUrl).url = await generateSignature((c.file as FileWithUrl).key);
						}
					})
				)
			)
		);

		return {
			unattachedFiles,
			chat: {
				...chat,
				messages: mapMessagesWithChildren(chat.messages)
			}
		};
	}
	return {
		unattachedFiles
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	pinned: async ({ locals, request }) => {
		const form = await request.formData();
		const pinned = form.get('pinned') === 'true';
		if (!locals.user) {
			return { error: 'User not found' };
		}
		await db
			.update(tables.users)
			.set({ pinnedChats: pinned })
			.where(eq(tables.users.id, locals.user.id));
		return { success: true };
	},
	userEndpoint: async ({ locals, request }) => {
		const form = await request.formData();
		const endpointId = form.get('endpointId');
		const apiKey = form.get('apiKey');
		const encryptedApiKey = crypto.encrypt(apiKey as string, env.SECRET_KEY);
		if (!locals.user) {
			return { error: 'User not found' };
		}
		await db
			.insert(tables.userEndpoint)
			.values({
				userId: locals.user.id,
				endpointId: endpointId as string,
				apiKey: encryptedApiKey
			})
			.onConflictDoUpdate({
				target: [tables.userEndpoint.userId, tables.userEndpoint.endpointId],
				set: {
					apiKey: encryptedApiKey,
					updatedAt: new Date()
				}
			});
		return { success: true };
	},
	timeToDelete: async ({ locals, request }) => {
		const form = Object.fromEntries(await request.formData());
		const timeToDelete = parseInt(form.timeToDelete as string);
		if (!locals.user) {
			return { error: 'User not found' };
		}
		await db
			.update(tables.users)
			.set({ tempChatDeleteHours: timeToDelete })
			.where(eq(tables.users.id, locals.user.id));
		return { success: true };
	},
	messageWindow: async ({ locals, request }) => {
		const form = Object.fromEntries(await request.formData());
		const messageWindow = parseInt(form.messageWindow as string);
		if (!locals.user) {
			return { error: 'User not found' };
		}
		await db.update(tables.users).set({ messageWindow }).where(eq(tables.users.id, locals.user.id));
		return { success: true };
	}
};
