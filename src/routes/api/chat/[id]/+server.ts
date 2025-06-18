import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { transformMessage, writeMessage } from '$lib/server/chat';
import type { CoreMessage } from 'ai';
import type { ChatRequestBody } from '$lib/types';
import { env } from '$env/dynamic/private';
import * as crypto from '$lib/server/crypto';

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const { id } = params;
	const { messages, modelId, action, assistantMessageId }: ChatRequestBody = await request.json();

	const chat = await db.query.chats.findFirst({
		where: and(eq(tables.chats.id, id), eq(tables.chats.userId, locals.user!.id)),
		columns: { id: true }
	});

	if (!chat) {
		return json({ error: 'Chat not found or access denied' }, { status: 404 });
	}

	const model = await db.query.models.findFirst({
		where: eq(tables.models.id, modelId),
		columns: {
			id: true
		},
		with: {
			endpoints: {
				with: {
					endpoint: {
						columns: {
							name: true
						},
						with: {
							userEndpoints: {
								where: eq(tables.userEndpoint.userId, locals.user!.id),
								columns: {
									apiKey: true
								}
							}
						}
					}
				}
			}
		}
	});

	if (!model) {
		return json({ error: 'Model not found' }, { status: 404 });
	}

	const firstEndpoint = model.endpoints[0];
	if (!firstEndpoint || !firstEndpoint.endpoint.userEndpoints.length) {
		return json({ error: 'No endpoint configuration found' }, { status: 404 });
	}

	const endpointConfig = firstEndpoint.endpoint;
	const apiKey = crypto.decrypt(endpointConfig.userEndpoints[0].apiKey, env.SECRET_KEY);
	const modelName = firstEndpoint.endpointModelName;

	let aiClient;
	if (endpointConfig.name === 'openai') {
		aiClient = createOpenAI({
			apiKey: apiKey
		});
	} else if (endpointConfig.name === 'anthropic') {
		aiClient = createAnthropic({
			apiKey: apiKey
		});
	} else {
		return json({ error: 'Unsupported endpoint type' }, { status: 400 });
	}

	const coreMessages: CoreMessage[] = await Promise.all(
		messages
			.filter((message) => {
				// Filter out messages with no contents or only empty/whitespace text
				return message.contents && message.contents.length > 0;
			})
			.map((message) => transformMessage(message, locals.user!.id))
	);

	const result = streamText({
		model: aiClient(modelName),
		messages: coreMessages.slice(-locals.user.messageWindow),
		onFinish: async (result) => {
			await writeMessage({
				action,
				chatId: id,
				userMessage: messages[messages.length - 1],
				assistantMessageId,
				assistantText: result.text,
				modelId
			});
		},
		onError: async (error) => {
			// console.error('AI streaming error:', error);
			// console.error('AI streaming error:', error);
		}
	});

	return result.toDataStreamResponse();
};

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
