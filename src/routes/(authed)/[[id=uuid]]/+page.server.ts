import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { and, eq, isNull } from 'drizzle-orm';
import * as tables from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { mapMessagesWithChildren } from '$lib/server/chat';
import { signFile } from '$lib/server/file';
import type { FileWithUrl } from '$lib/types';

export const load = (async ({ params, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const unusedFiles = (await db
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
		unusedFiles.map(async (file) => {
			file.url = await signFile(file.key);
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
						authorRole: true,
						createdAt: true,
						updatedAt: true
					},
					with: {
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
							(c.file as FileWithUrl).url = await signFile((c.file as FileWithUrl).key);
						}
					})
				)
			)
		);

		return {
			unusedFiles,
			chat: {
				...chat,
				messages: mapMessagesWithChildren(chat.messages)
			}
		};
	}
	return {
		unusedFiles
	};
}) satisfies PageServerLoad;
