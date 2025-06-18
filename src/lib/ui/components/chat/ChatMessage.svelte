<script lang="ts">
	import '$lib/ui/teletyped.css';
	import Regenerate from '$lib/ui/icons/Regenerate.svelte';
	import Edit from '$lib/ui/icons/Edit.svelte';
	import Cancel from '$lib/ui/icons/Cancel.svelte';
	import Submit from '$lib/ui/icons/Submit.svelte';
	import Stop from '$lib/ui/icons/Stop.svelte';
	import Copy from '$lib/ui/icons/Copy.svelte';
	import RegenerationArrows from './RegenerationArrows.svelte';
	import Image from './Image.svelte';
	import { marked } from '$lib/ui/utils';
	import { Spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { messageBorders } from '$lib/stores/ui';
	import type { FileWithUrl, Message, User } from '$lib/types';

	let {
		message,
		siblings,
		last,
		loading,
		user,
		scrollToMessage = false,
		navigate,
		regenerate,
		editRegenerate,
		stop
	}: {
		message: Message;
		siblings: string[];
		last: boolean;
		loading: boolean;
		user: User;
		scrollToMessage?: boolean;
		navigate: (id: string) => void;
		regenerate: (id: string) => void;
		editRegenerate: (id: string, text: string) => void;
		stop: () => void;
	} = $props();

	let messageElement: HTMLDivElement;
	let editText = $state(message.contents?.map((content) => content.text)[0]);

	onMount(async () => {
		messageY.set(0);
		messageOpacity.set(1);
		messageBlur.set(0);

		if (scrollToMessage) {
			setTimeout(() => {
				messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 100);
		}
	});

	const messageY = new Spring(last ? 10 : 0, {
		stiffness: 0.1,
		damping: 0.8
	});
	const messageOpacity = new Spring(last ? 0 : 1, {
		stiffness: 0.1,
		damping: 0.8
	});
	const messageBlur = new Spring(last ? 5 : 0, {
		stiffness: 0.1,
		damping: 0.8
	});

	let editMode = $state(false);
	let transitioning = $state(true);

	const editPosition = new Spring(0, { stiffness: 0.15, damping: 0.8 });
	const editOpacity = new Spring(1, { stiffness: 0.15, damping: 0.8 });
	const submitAndCancelPosition = new Spring(20, { stiffness: 0.15, damping: 0.8 });
	const submitAndCancelOpacity = new Spring(0, { stiffness: 0.15, damping: 0.8 });

	let copyStatus = $state(false);

	const resetStyles = () => {
		editPosition.set(0);
		editOpacity.set(1);
		submitAndCancelPosition.set(20);
		submitAndCancelOpacity.set(0);
	};

	const handleEdit = () => {
		editPosition.set(-20);
		editOpacity.set(0);
		submitAndCancelPosition.set(0);
		submitAndCancelOpacity.set(1);
		editMode = true;
		setTimeout(() => {
			transitioning = false;
		}, 200);
	};

	const cancelEdit = async () => {
		resetStyles();
		setTimeout(() => {
			editMode = false;
		}, 200);
		transitioning = true;
		editText = message.contents.map((content) => content.text)[0];
	};
</script>

<div
	id={message.id}
	class="first:mt-5 last:mb-6 {$messageBorders
		? 'my-2 rounded-xl bg-[rgba(255,255,255,0.02)] px-3'
		: ''}"
	style="transform: translateY({messageY.current}px); opacity: {messageOpacity.current}; filter: blur({messageBlur.current}px); will-change: filter, transform, opacity;"
	bind:this={messageElement}
>
	<div class="sticky top-0 z-10 bg-[rgb(var(--theme-color))]" style="transition: all 1s ease;">
		<div
			class="sticky top-0 z-10 flex items-center justify-between gap-2 py-[0.5rem] {$messageBorders
				? 'bg-[rgba(255,255,255,0.02)]'
				: ''}"
			style="transition: background-color 1s ease;"
		>
			<div class="flex items-center">
				{#if message.role === 'user'}
					<p
						class="font-gill text-grey-100 pt-[0.07rem] pr-2 text-[0.68rem] tracking-[2px] uppercase antialiased"
					>
						{user?.firstName ?? 'user'}
					</p>
					<div class="flex h-3 items-center">
						{#if editMode}
							<div
								class="absolute flex gap-1"
								style="transform: translateY({submitAndCancelPosition.current}px); opacity: {submitAndCancelOpacity.current}"
							>
								<Submit
									text="submit"
									onclick={() => {
										editRegenerate(message?.parentId ?? '', editText);
									}}
								/>
								<Cancel
									onclick={() => {
										cancelEdit();
									}}
								/>
							</div>
						{/if}
						{#if transitioning}
							<div
								class="absolute"
								style="transform: translateY({editPosition.current}px); opacity: {editOpacity.current}"
							>
								<Edit
									onclick={() => {
										handleEdit();
									}}
								/>
							</div>
						{/if}
					</div>
				{:else}
					<p
						class="font-gill text-grey-100 pt-[0.07rem] pr-2 text-[0.68rem] tracking-[2px] uppercase antialiased"
					>
						{message.model?.name}
					</p>
					<div class="flex h-3 gap-1">
						{#if message.status === 'generating'}
							<Stop onclick={stop} />
						{:else}
							<div
								class="absolute flex h-3 flex-row gap-1"
								style="transform: translateY({editPosition.current}px); opacity: {editOpacity.current}"
							>
								<Regenerate
									onclick={() => regenerate(message?.parentId ?? '')}
									disabled={loading}
								/>
								<Copy
									status={copyStatus}
									onclick={() => {
										copyStatus = true;
										navigator.clipboard.writeText(message.contents[0].text ?? '');
										setTimeout(() => {
											copyStatus = false;
										}, 1000);
									}}
								/>
							</div>
						{/if}
					</div>
				{/if}
			</div>
			{#if siblings?.length > 1}
				<div class="text-grey-100 flex justify-end md:pr-4">
					<RegenerationArrows {siblings} id={message.id} {navigate} />
				</div>
			{/if}
		</div>
	</div>
	<div class="relative box-border antialiased">
		<div dir="auto" class="font-public tt-scroll-bar-h overflow-auto text-base">
			{#if message.role === 'assistant'}
				<div id="model-{message.id}" class="text-grey-300 tt-markdown">
					{@html marked.parse(message.contents?.[message.contents.length - 1].text ?? '')}
				</div>
			{:else}
				{#each message.contents as content (content.id)}
					{#if content.type === 'file'}
						<div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
							<div class="bg-grey-600 aspect-video overflow-hidden rounded-xl">
								<Image src={content.file?.url ?? ''} alt={''} />
							</div>
						</div>
					{/if}
				{/each}
				{#each message.contents as content (content.id)}
					{#if content.type === 'text'}
						<div class="text-grey-300 overflow-auto break-words" style="white-space: pre-wrap;">
							<textarea
								in:fade
								class="focus-ring-0 field-sizing-content h-auto w-full resize-none border-none bg-transparent outline-none"
								bind:value={editText}
								readonly={!editMode}
								rows="1"
							></textarea>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
</div>
