import {
	generateId,
	type UIMessage,
	callChatApi,
	type CreateMessage,
	type ChatRequestOptions
} from '@ai-sdk/ui-utils';
import { isAbortError } from '@ai-sdk/provider-utils';
import type { Message, Chat as ChatType, ChatRequestBody } from '../types.js';
import type { UseChatOptions } from './types';
import { get } from 'svelte/store';
import { selectedModel } from '$lib/stores/model';
import { invalidateAll, pushState } from '$app/navigation';
import type { FileWithUrl, UploadFile } from '$lib/types';
import { uploadFile, deleteFile } from '$lib/file';
import { page } from '$app/state';

export type ChatOptions = Readonly<
	Omit<UseChatOptions, 'keepLastMessageOnError'> & {
		/**
		 * Maximum number of sequential LLM calls (steps), e.g. when you use tool calls.
		 * Must be at least 1.
		 * A maximum number is required to prevent infinite loops in the case of misconfigured tools.
		 * By default, it's set to 1, which means that only a single LLM call is made.
		 * @default 1
		 */
		maxSteps?: number;
		/**
		 * Pre-existing files that the user has already uploaded but not yet sent.
		 */
		initialUploadedFiles?: (UploadFile | FileWithUrl)[];
	}
>;

export type { CreateMessage, Message, UIMessage };

export class Chat {
	readonly #options: ChatOptions = {};
	readonly #generateId = $derived(this.#options.generateId ?? generateId);
	readonly #streamProtocol = $derived(this.#options.streamProtocol ?? 'data');
	#chat = $state<ChatType | undefined>();
	#messages = $state<string[]>([]);
	#status = $state<'submitted' | 'streaming' | 'ready' | 'error'>('ready');
	#error = $state<Error>();
	#abortController: AbortController | undefined;
	/**
	 * Images/files uploaded by the user but not yet inserted into a chat message.
	 */
	uploadedFiles = $state<(UploadFile | FileWithUrl)[]>([]);
	/** Error related to file uploads */
	errorMessage = $state<string>('');

	/**
	 * Hook status:
	 *
	 * - `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
	 * - `streaming`: The response is actively streaming in from the API, receiving chunks of data.
	 * - `ready`: The full response has been received and processed; a new user message can be submitted.
	 * - `error`: An error occurred during the API request, preventing successful completion.
	 */
	get status() {
		return this.#status;
	}

	/** The error object of the API request */
	get error() {
		return this.#error;
	}

	/** The current value of the input. Writable, so it can be bound to form inputs. */
	input = $state<string>()!;

	/**
	 * Current message ids in the chat.
	 */
	get messages(): string[] {
		return this.#messages;
	}

	/**
	 * Current chat tree.
	 */
	get chat() {
		return this.#chat;
	}

	constructor(options: ChatOptions) {
		this.#options = options;
		// populate any pre-existing unattached files supplied by the caller
		if (options.initialUploadedFiles?.length) {
			this.uploadedFiles = [...options.initialUploadedFiles];
		}
		this.#chat = options.initialChat;
		if (this.#chat) {
			if (
				this.#chat.leafMessageId &&
				this.#chat.messages[this.#chat.leafMessageId].children.length === 0
			) {
				this.#messages = this.walk(this.#chat.leafMessageId, 'backward');
			} else if (this.#chat && this.#chat.rootMessageId) {
				this.#messages = this.walk(this.#chat.rootMessageId, 'forward');
			} else {
				// just use any node and walk both ways
				const node = Object.values(this.#chat.messages)[0];
				this.#messages = this.walk(node.id, 'backward').concat(
					this.walk(node.id, 'forward').slice(1)
				);
			}
		}
	}

	/**
	 * Walk the chat tree.
	 * @param id The id of the message to start from
	 * @param dir The direction to walk
	 * @returns The list of message ids
	 */
	walk = (id: string, dir: 'forward' | 'backward'): string[] => {
		const out: string[] = [];
		let current: string | null = id;

		while (current) {
			const node: Message | undefined = this.#chat?.messages[current];
			if (!node) break;

			if (dir === 'forward') out.push(node.id);
			else out.unshift(node.id);

			current = dir === 'forward' ? (node.children[0] ?? null) : (node.parentId ?? null);
		}
		return out;
	};

	/**
	 * Navigate to a message in the chat.
	 * @param id The id of the message to navigate from
	 */
	navigate = async (id: string): Promise<void> => {
		this.#messages = this.walk(id, 'backward').concat(this.walk(id, 'forward').slice(1));
		const result = await fetch(`/api/chat/${this.#chat?.id}/node`, {
			method: 'PATCH',
			body: JSON.stringify({ nodeId: this.#messages[this.#messages.length - 1] })
		});
		if (result.ok) {
			this.#chat!.leafMessageId = this.#messages[this.#messages.length - 1];
		}
	};

	/**
	 * Regenerate from a specific message.
	 * @param id The id of the message to regenerate from
	 */
	regenerate = (id: string): void => {
		// const messagesIds: string[] = this.walk(id, 'backward');
		// const messages: Message[] = messagesIds.map(
		// 	(messageId) => this.#chat?.messages[messageId] as Message
		// );
		// this.#triggerRequest({ messages });
	};

	/**
	 * Regenerate
	 * @param id The id of the message to navigate from
	 */
	editAndRegenerate = (id: string): void => {
		this.#messages = this.walk(id, 'backward').concat(this.walk(id, 'forward').slice(1));
	};

	/**
	 * Abort the current request immediately, keep the generated tokens if any.
	 */
	stop = () => {
		try {
			this.#abortController?.abort();
		} catch {
			// ignore
		} finally {
			this.#status = 'ready';
			this.#abortController = undefined;
		}
	};

	/**
	 * Handle a drag-and-drop event originating from the UI. This will upload any dropped
	 * image files and keep `uploadedFiles` in sync (placeholder + progress + final url).
	 */
	handleFileDrop = async (event: DragEvent) => {
		event.preventDefault();
		if (!event?.dataTransfer?.files) return;
		const files = Array.from(event.dataTransfer.files);
		for (const file of files) {
			if (!file.type.startsWith('image/')) continue;
			const id = this.#generateId();
			try {
				const placeholder: UploadFile = {
					id,
					file,
					status: 'uploading',
					progress: 0
				};
				this.uploadedFiles = [...this.uploadedFiles, placeholder];
				const uploaded = await uploadFile(file, id, (progress) => {
					this.uploadedFiles = this.uploadedFiles.map((f) =>
						f.id === id && 'status' in f ? { ...f, progress } : f
					);
				});
				// mark as uploaded
				this.uploadedFiles = this.uploadedFiles.map((f) =>
					f.id === id ? { ...uploaded, status: 'uploaded' } : f
				);
			} catch (error) {
				if (error instanceof Error) {
					this.errorMessage = error.message;
					setTimeout(() => (this.errorMessage = ''), 5000);
				}
				// remove placeholder
				this.uploadedFiles = this.uploadedFiles.filter((f) => f.id !== id);
			}
		}
	};

	removeUploadedFile = async (id: string) => {
		try {
			await deleteFile(id);
		} finally {
			this.uploadedFiles = this.uploadedFiles.filter((f) => f.id !== id);
		}
	};

	/** Collect uploaded images that are ready (status==='uploaded' or FileWithUrl without status) */
	#getReadyAttachments(): (FileWithUrl | UploadFile)[] {
		return this.uploadedFiles.filter((f) => {
			// If it has a status field, ensure it's uploaded
			return 'status' in f ? f.status === 'uploaded' : true;
		});
	}

	/** Form submission handler to automatically reset input and append a user message */
	submit = async (event?: { preventDefault?: () => void }, options: ChatRequestOptions = {}) => {
		event?.preventDefault?.();

		const attachments = this.#getReadyAttachments();
		if (!this.input && attachments.length === 0 && !options.allowEmptySubmit) return;

		// Store original state for rollback
		const userInput = this.input;
		const originalChat = this.#chat;
		const originalMessages = this.#messages;
		const originalStatus = this.#status;

		this.input = '';

		try {
			const userMessageId = this.#generateId();
			const assistantMessageId = this.#generateId();
			let parentId;
			// chat exists so the parent is the last message
			if (
				originalMessages.length > 0 &&
				originalChat?.messages[originalMessages[originalMessages.length - 1]].role === 'assistant'
			) {
				parentId = originalMessages[originalMessages.length - 1];
			}
			if (!this.#chat) {
				parentId = this.#generateId();
				this.createOptimisticChat(userInput, parentId, userMessageId);
				const response = await fetch('/api/chat/new', {
					method: 'POST',
					body: JSON.stringify({ input: userInput, rootMessageId: parentId })
				});
				if (!response.ok) {
					throw new Error(`Failed to create chat: ${response.status} ${response.statusText}`);
				}
				let newChat = await response.json();
				pushState(`/${newChat.id}`, page.state);
				this.#chat = {
					...newChat,
					messages: {
						[newChat.rootMessageId!]: {
							...newChat.messages[newChat.rootMessageId!],
							children: [userMessageId]
						}
					}
				};
				this.#messages = this.walk(this.#chat.rootMessageId!, 'forward');
				this.#status = 'ready';
				invalidateAll();
			}

			this.#chat = {
				...this.#chat,
				messages: {
					...this.#chat?.messages,
					[userMessageId]: {
						id: userMessageId,
						createdAt: new Date(),
						role: 'user',
						contents: [
							...(userInput
								? [{ id: this.#generateId(), type: 'text' as const, text: userInput, file: null }]
								: []),
							...this.#getReadyAttachments().map((file) => ({
								file,
								...file,
								text: null,
								type: 'file' as const
							}))
						],
						children: [assistantMessageId],
						model: null,
						updatedAt: new Date(),
						parentId: parentId
					},
					[assistantMessageId]: {
						id: assistantMessageId,
						role: 'assistant',
						contents: [
							{
								type: 'text' as const,
								text: '',
								file: null
							}
						],
						children: [],
						status: 'generating',
						model: get(selectedModel),
						createdAt: new Date(),
						updatedAt: new Date(),
						parentId: userMessageId
					}
				}
			};
			this.#messages = this.walk(assistantMessageId, 'backward');
			// Step 4: Now send the actual message (for both new and existing chats)
			const response = this.#triggerRequest(this.#chat!.id, {
				action: 'new',
				messages: [...this.#messages.map((message) => this.#chat!.messages[message])],
				modelId: get(selectedModel)!.id,
				assistantMessageId
			});

			// If the send worked, clear attachments for the next message
			this.uploadedFiles = [];

			await response;
		} catch (error) {
			console.error('Submit failed:', error);

			// ROLLBACK: Restore original state
			this.#chat = originalChat;
			this.#messages = originalMessages;
			this.#status = originalStatus;

			// Restore user input so they can retry
			this.input = userInput;

			// Set error state
			this.#error = error instanceof Error ? error : new Error(String(error));
			this.#status = 'error';
		}
	};

	private createOptimisticChat(text: string, rootMessageId: string, userMessageId: string): void {
		const now = new Date();
		const chatId = this.#generateId();

		const root: Message = {
			id: rootMessageId,
			createdAt: new Date(),
			role: 'system',
			contents: [],
			parentId: null,
			model: null,
			updatedAt: new Date(),
			children: [userMessageId]
		};

		this.#chat = {
			id: chatId,
			rootMessageId,
			leafMessageId: userMessageId,
			createdAt: now,
			updatedAt: now,
			userId: '',
			title: '',
			saved: false,
			generations: 0,
			deleteAfter: null,
			messages: { [root.id]: root }
		};
		this.#messages = [root.id];
	}

	#triggerRequest = async (chatId: string, chatRequest: ChatRequestBody) => {
		this.#status = 'submitted';
		this.#error = undefined;

		const messages = chatRequest.messages;
		const messageCount = messages.length;

		try {
			const abortController = new AbortController();
			this.#abortController = abortController;

			// Optimistically update messages
			// this.messages = messages;

			await callChatApi({
				api: `/api/chat/${chatId}`,
				body: chatRequest,
				streamProtocol: this.#streamProtocol,
				abortController: () => abortController,
				restoreMessagesOnFailure: () => {},
				onResponse: this.#options.onResponse,
				onUpdate: ({ message, data, replaceLastMessage }) => {
					this.#status = 'streaming';
					console.log('Streaming message: ', message.content);
					this.#chat!.messages[chatRequest.assistantMessageId] = {
						...this.#chat!.messages[chatRequest.assistantMessageId],
						contents: [
							{
								id: this.#generateId(),
								type: 'text' as const,
								text: message.content,
								file: null
							}
						]
					};

					// if (replaceLastMessage) {
					// 	this.messages[this.messages.length - 1] = message;
					// } else {
					// 	this.messages.push(message);
					// }

					if (data?.length) {
						this.data = existingData;
						this.data.push(...data);
					}
				},
				onToolCall: this.#options.onToolCall,
				onFinish: (message) => {
					this.#chat!.messages[chatRequest.assistantMessageId] = {
						...this.#chat!.messages[chatRequest.assistantMessageId],
						status: 'generated'
					};
				},
				generateId: this.#generateId,
				fetch: undefined,
				lastMessage: undefined
			});

			this.#abortController = undefined;
			this.#status = 'ready';
		} catch (error) {
			if (isAbortError(error)) {
				return;
			}

			const coalescedError = error instanceof Error ? error : new Error(String(error));
			if (this.#options.onError) {
				this.#options.onError(coalescedError);
			}

			this.#status = 'error';
			this.#error = coalescedError;
		}

		// auto-submit when all tool calls in the last assistant message have results
		// and assistant has not answered yet
		// if (
		// 	shouldResubmitMessages({
		// 		originalMaxToolInvocationStep: maxStep,
		// 		originalMessageCount: messageCount,
		// 		maxSteps: this.#maxSteps,
		// 		messages: this.messages
		// 	})
		// ) {
		// 	await this.#triggerRequest({ messages: this.messages });
		// }
	};
}
