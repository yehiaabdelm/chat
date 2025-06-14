<script lang="ts">
	import type { Chat as ChatType, Model, FileWithUrl, UploadFile } from '$lib/types';
	import ChatMessage from './ChatMessage.svelte';
	import { forward, backward } from '$lib/chat';
	import { Chat } from '@ai-sdk/svelte';
	import FileUploadArea from './FileUploadArea.svelte';
	import { v7 as uuid } from 'uuid';
	import { uploadFile, deleteFile } from '$lib/file';
	import ErrorMessage from '../ErrorMessage.svelte';
	import ModelsPanel from './ModelsPanel.svelte';
	import BottomModelsPanel from './BottomModelsPanel.svelte';

	let {
		models,
		chat,
		unattachedFiles = []
	}: { models: Model[]; chat?: ChatType; unattachedFiles: FileWithUrl[] } = $props();

	let isDragging = $state(false);
	let uploadedFiles = $state<(UploadFile | FileWithUrl)[]>(unattachedFiles);
	let errorMessage = $state('');

	let useChat = new Chat();

	let messages: string[] = $state([]);

	if (chat) {
		messages = chat?.currentMessageId
			? forward(chat, chat?.currentMessageId)
			: backward(chat, chat?.rootMessageId ?? '');
		// if (!messages) {
		// 	throw new Error('No current message');
		// }
	}

	const handleDrop = async (event: DragEvent) => {
		isDragging = false;
		event.preventDefault();
		if (event?.dataTransfer && event?.dataTransfer?.files) {
			const files = event.dataTransfer.files;
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const id = uuid();
				if (file.type.startsWith('image/')) {
					try {
						const placeholderFile = {
							id,
							file,
							status: 'uploading' as const,
							progress: 0
						};
						uploadedFiles = [...uploadedFiles, placeholderFile];
						const uploadedFile = await uploadFile(file, id, (progress) => {
							uploadedFiles = uploadedFiles.map((file) =>
								file.id === id ? { ...file, progress } : file
							);
						});
						uploadedFiles = uploadedFiles.map((file) =>
							file.id === id ? { ...uploadedFile, status: 'uploaded' } : file
						);
					} catch (error) {
						if (error instanceof Error) {
							errorMessage = error.message;
							setTimeout(() => (errorMessage = ''), 5000);
						}
						// Remove the placeholder if upload fails
						uploadedFiles = uploadedFiles.filter((file) => file.id !== id);
					}
				}
			}
		}
	};

	const removeImage = async (id: string) => {
		await deleteFile(id);
		uploadedFiles = uploadedFiles.filter((file) => file.id !== id);
	};

	let chatContainer: HTMLDivElement;
	let input = $state('');
	let isChatOpen = $state(true);

	const submit = () => {
		console.log('submit');
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex h-full w-full justify-center max-md:mx-8 max-sm:mx-4 lg:mx-auto lg:pt-[1.3125rem]"
	ondragover={(e) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = true;
	}}
	ondrop={handleDrop}
	ondragleave={(e) => {
		setTimeout(() => {
			isDragging = false;
		}, 2000);
	}}
>
	<div class="no-scrollbar relative flex w-full flex-col overflow-scroll lg:w-[43rem]">
		{#if chat}
			{#each messages as messageId}
				<ChatMessage message={chat.messages[messageId]} onNavigate={() => {}} />
			{/each}
			<!-- <div
				class="tt-scroll-bar-v flex-1 overflow-auto"
				use:snapScrollToBottom={$chat}
				bind:this={chatContainer}
				style="margin-top: -1px; padding-bottom: {textAreaHeight ? textAreaHeight + 56 : 104}px; "
			>
				{#each $messages as id, i (id)}
					<ChatMessage
						loading={$isLoading}
						{id}
						on:retainScrollPosition={() => {
							chatContainer.scrollTo({ top: scrollPositions[0] });
						}}
						{name}
						scrollToMessage={id === startingMessage}
						parent={$chat?.mapping[id]?.parent}
						children={i > 0 ? $chat?.mapping[$messages[i - 1]]?.children : []}
						author={$chat?.mapping[id]?.message?.author}
						content={$chat?.mapping[id]?.message?.content?.body}
						status={$chat?.mapping[id]?.message?.status}
						{i}
						last={i === $messages.length - 1 && $isLoading === true}
						childId={id}
						on:navigate={(e) => {
							navigate(i - 1, e.detail.child);
						}}
						on:regenerate={(e) => {
							regenerate(i, e.detail.parent);
							scrollToBottom();
						}}
						on:editRegenerate={(e) => {
							editAndRegenerate(i, e.detail.parent, e.detail.content);
							scrollToBottom();
						}}
						on:saveModelEdit={(e) => {
							saveModelEdit(i, e.detail.parent, e.detail.content, e.detail.model);
							scrollToBottom();
						}}
						on:continueFromEditModel={(e) => {
							continueModelEdit(i, e.detail.parent, e.detail.content);
							scrollToBottom();
						}}
						on:stop={(e) => {
							stop();
						}}
					/>
				{/each}
			</div> -->
		{:else}
			<div class="flex flex-1 flex-col items-center justify-center" style="opacity: 1;">
				<ModelsPanel {models} />
			</div>
		{/if}
		<div
			class="absolute right-0 bottom-0 left-0 z-30 mb-4 flex flex-col
      justify-center rounded-xl bg-[rgba(var(--theme-color),1)] placeholder:text-center"
			style="transition: box-shadow 1s ease, background-color 1s ease; backdrop-filter: blur(10px); box-shadow: 0px 2px 30px 20px rgba(var(--theme-color), 1);"
		>
			{#if errorMessage}
				<ErrorMessage message={errorMessage} />
			{/if}
			<div class="relative">
				<FileUploadArea {isDragging} {uploadedFiles} removeFile={removeImage} />
				<div
					class="relative rounded-xl"
					style="background: linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0.01)), linear-gradient(rgba(var(--theme-color), 1), rgba(var(--theme-color), 1));"
				>
					<div class="px-3 pt-1">
						{#if chat}
							<BottomModelsPanel {models} />
						{/if}
						<div class="flex flex-wrap gap-2"></div>
						<textarea
							bind:value={input}
							onkeydown={submit}
							class="text-grey-200 font-untitled placeholder:font-untitled placeholder:text-grey-450 tt-scroll-bar-v
							sm:text-base] my-auto
							field-sizing-content max-h-[35rem] w-full resize-none bg-transparent py-3 antialiased
							outline-none placeholder:antialiased"
							style="transition: background-color 1s ease;"
							placeholder="Send a message"
						></textarea>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="fixed right-1 flex h-full items-center lg:right-4">
		<!-- <Scrollbar bind:scrollContainer={chatContainer} dependency={$messages} /> -->
	</div>
</div>
