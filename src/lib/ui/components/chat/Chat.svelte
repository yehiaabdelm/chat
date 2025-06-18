<script lang="ts">
	import type { Chat as ChatType, Model, FileWithUrl, UploadFile, User } from '$lib/types';
	import ChatMessage from './ChatMessage.svelte';
	import { Chat as ChatV2 } from '$lib/chat/chat.svelte';
	import { Chat } from '@ai-sdk/svelte';
	import FileUploadArea from './FileUploadArea.svelte';
	import ErrorMessage from '../ErrorMessage.svelte';
	import ModelsPanel from './ModelsPanel.svelte';
	import BottomModelsPanel from './BottomModelsPanel.svelte';
	import { v7 as uuid } from 'uuid';

	let {
		models,
		chat,
		unattachedFiles = [],
		user
	}: { models: Model[]; chat?: ChatType; unattachedFiles: FileWithUrl[]; user: User } = $props();

	let isDragging = $state(false);
	let textAreaHeight = $state(0);
	let errorMessage = $state('');
	let chatUtilities = new ChatV2({
		initialChat: chat,
		initialUploadedFiles: unattachedFiles,
		generateId: uuid
	});

	const handleDrop = (event: DragEvent) => {
		isDragging = false;
		chatUtilities.handleFileDrop(event);
	};

	let chatContainer: HTMLDivElement;
	let input = $state('');
	let isChatOpen = $state(true);

	// $effect(() => {
	// 	console.log('chatUtilities.chat', chatUtilities.chat);
	// });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex h-full w-full justify-center px-5 lg:pt-[1.3125rem]"
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
	<div class="no-scrollbar relative flex w-full flex-col overflow-scroll md:w-[43rem]">
		{#if chatUtilities.chat}
			<div
				class="tt-scroll-bar-v no-scrollbar mt-[-1px] flex-1 overflow-auto"
				style="padding-bottom: {textAreaHeight ? textAreaHeight + 56 : 104}px; "
				bind:this={chatContainer}
			>
				{#each chatUtilities.messages as messageId, i (messageId)}
					{#if chatUtilities.chat?.messages[messageId] !== undefined && chatUtilities.chat?.messages[messageId].role !== 'system'}
						<ChatMessage
							{user}
							message={chatUtilities.chat?.messages[messageId]}
							siblings={chatUtilities.chat?.messages[messageId].parentId
								? (chatUtilities.chat?.messages[chatUtilities.chat?.messages[messageId].parentId]
										?.children ?? [])
								: []}
							loading={false}
							navigate={chatUtilities.navigate}
							regenerate={chatUtilities.regenerate}
							editRegenerate={chatUtilities.editAndRegenerate}
							stop={chatUtilities.stop}
							last={i === chatUtilities.messages.length - 1}
						/>
					{/if}
				{/each}
			</div>
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
			{#if chatUtilities.errorMessage}
				<ErrorMessage message={chatUtilities.errorMessage} />
			{/if}
			<div class="relative">
				<FileUploadArea
					{isDragging}
					uploadedFiles={chatUtilities.uploadedFiles}
					removeFile={chatUtilities.removeUploadedFile}
				/>
				<div
					class="relative rounded-xl"
					style="background: linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0.01)), linear-gradient(rgba(var(--theme-color), 1), rgba(var(--theme-color), 1));"
				>
					<form class="px-3 pt-1" onsubmit={chatUtilities.submit}>
						{#if chatUtilities.chat}
							<BottomModelsPanel {models} />
						{/if}
						<div class="flex flex-wrap gap-2"></div>
						<textarea
							bind:value={chatUtilities.input}
							bind:offsetHeight={textAreaHeight}
							class="text-grey-200 font-untitled placeholder:font-untitled placeholder:text-grey-450 tt-scroll-bar-v
							my-auto field-sizing-content max-h-[35rem] w-full resize-none bg-transparent py-3 antialiased outline-none
							placeholder:antialiased sm:text-base"
							style="transition: background-color 1s ease;"
							placeholder="Send a message"
							onkeydown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									chatUtilities.submit(e);
								}
							}}
						></textarea>
					</form>
				</div>
			</div>
		</div>
	</div>
	<div class="fixed right-1 flex h-full items-center lg:right-4">
		<!-- <Scrollbar bind:scrollContainer={chatContainer} dependency={$messages} /> -->
	</div>
</div>
