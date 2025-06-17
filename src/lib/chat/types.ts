import type { Message, Chat } from '$lib/types';

/**
Represents the number of tokens used in a prompt and completion.
 */
type LanguageModelUsage = {
	/**
  The number of tokens used in the prompt.
     */
	promptTokens: number;
	/**
  The number of tokens used in the completion.
   */
	completionTokens: number;
	/**
  The total number of tokens used (promptTokens + completionTokens).
     */
	totalTokens: number;
};

type LanguageModelV1FinishReason =
	| 'stop'
	| 'length'
	| 'content-filter'
	| 'tool-calls'
	| 'error'
	| 'other'
	| 'unknown';

export type UseChatOptions = {
	api?: string;
	/**
	 * Initial chat. Useful to load an existing chat history.
	 */
	initialChat?: Chat;
	/**
	 * Callback function to be called when the API response is received.
	 */
	onResponse?: (response: Response) => void | Promise<void>;
	/**
	 * Optional callback function that is called when the assistant message is finished streaming.
	 *
	 * @param message The message that was streamed.
	 * @param options.usage The token usage of the message.
	 * @param options.finishReason The finish reason of the message.
	 */
	onFinish?: (
		message: Message,
		options: {
			usage: LanguageModelUsage;
			finishReason: LanguageModelV1FinishReason;
		}
	) => void;
	/**
	 * Callback function to be called when an error is encountered.
	 */
	onError?: (error: Error) => void;
	/**
	 * A way to provide a function that is going to be used for ids for messages and the chat.
	 */
	generateId?: () => string;
	/**
	 * Streaming protocol that is used. Defaults to `data`.
	 */
	streamProtocol?: 'data' | 'text';
};
