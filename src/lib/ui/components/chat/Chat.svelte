<script lang="ts">
	import type { Chat as ChatType, MessageWithChildren, UploadFile } from '$lib/types';
	import ChatMessage from './ChatMessage.svelte';
	import { forward, backward } from '$lib/chat';
	import { Chat } from '@ai-sdk/svelte';
	import ImageUploadArea from './ImageUploadArea.svelte';
	let { chat }: { chat?: ChatType } = $props();

	let isDragging = $state(false);
	let isOverUploadArea = $state(false);
	// let uploadedImages = $state<UploadImage[]>([]);

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

	let chatContainer: HTMLDivElement;
	let input = $state('');
	let isChatOpen = $state(true);

	const submit = () => {
		console.log('submit');
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex h-full max-md:mx-8 max-sm:mx-4 lg:mx-auto lg:pt-[1.3125rem] {isChatOpen
		? ''
		: 'hidden'}"
	ondragover={() => (isOverUploadArea = true)}
	ondragleave={() => {
		setTimeout(() => {
			isDragging = false;
		}, 1000);
	}}
	ondrop={() => (isOverUploadArea = false)}
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
				<!-- <ModelsPanel on:click {models} /> -->
			</div>
		{/if}
		<div
			class="absolute right-0 bottom-0 left-0 z-30 mb-4 flex flex-col
      justify-center rounded-xl bg-[rgba(var(--theme-color),1)] placeholder:text-center"
			style="transition: box-shadow 1s ease, background-color 1s ease; backdrop-filter: blur(10px); box-shadow: 0px 2px 30px 20px rgba(var(--theme-color), 1);"
		>
			<!-- {#if showError}
				<ErrorMessage message={errorMessage} />
			{/if} -->
			<div class="relative">
				<ImageUploadArea
					{isDragging}
					{isOverUploadArea}
					uploadedFiles={[]}
					removeFile={() => {}}
					ondragover={() => (isOverUploadArea = true)}
					ondragleave={() => (isOverUploadArea = false)}
					ondrop={() => (isOverUploadArea = false)}
				/>
				<div
					class="relative rounded-xl"
					style="background: linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0.01)), linear-gradient(rgba(var(--theme-color), 1), rgba(var(--theme-color), 1));"
				>
					<div class="pt-1">
						{#if chat}
							<!-- <div>
							<BottomModelsPanel {models} />
						</div> -->
						{/if}
						<textarea
							bind:value={input}
							onkeydown={submit}
							class="text-grey-200 font-untitled placeholder:font-untitled placeholder:text-grey-450
                                tt-scroll-bar-v my-auto field-sizing-content
                                max-h-[35rem] w-full resize-none bg-transparent py-3 antialiased outline-none
                                placeholder:antialiased sm:text-base"
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
