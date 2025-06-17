import type { RequestHandler } from './$types';
import { createOpenAI } from '@ai-sdk/openai';
import type { Message } from '$lib/types';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const {
		id,
		messages,
		modelId,
		action,
		assistantMessageId
	}: {
		id: string;
		modelId: string;
		action: 'new' | 'regenerate';
		messages: Message[];
		assistantMessageId: string;
	} = await request.json();

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
								where: eq(tables.userEndpoint.userId, locals.user.id),
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
	const apiKey = endpointConfig.userEndpoints[0].apiKey;
	const modelName = firstEndpoint.endpointModelName;

	let aiClient;
	if (endpointConfig.name === 'OpenAI') {
		aiClient = createOpenAI({
			apiKey: apiKey
		});
	} else if (endpointConfig.name === 'Anthropic') {
		aiClient = createAnthropic({
			apiKey: apiKey
		});
	} else {
		return json({ error: 'Unsupported endpoint type' }, { status: 400 });
	}

	const result = streamText({
		model: aiClient(modelName),
		messages: messages as any,
		onFinish: async (result) => {
			await writeMessage({
				action,
				chatId: id,
				userMessage: messages[messages.length - 1],
				assistantMessageId,
				assistantText: result.text
			});
		},
		onError: async (error) => {
			// console.error('AI streaming error:', error);
		}
	});

	return result.toDataStreamResponse();
};

const writeMessage = async ({
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
				authorRole: 'assistant',
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
					authorRole: 'user'
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
				authorRole: 'assistant'
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
