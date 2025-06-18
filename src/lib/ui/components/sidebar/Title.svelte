<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Spring } from 'svelte/motion';
	import { sigmoid } from '$lib/ui/actions';
	import TemporaryChatButton from './TemporaryChatButton.svelte';
	import SaveButton from '$lib/ui/icons/SaveButton.svelte';
	import type { ChatTitle } from '$lib/types';

	let {
		maximumGenerations,
		chat,
		hovered,
		updateChat
	}: {
		maximumGenerations: number;
		chat: ChatTitle;
		hovered: boolean;
		updateChat: (id: string, type: 'temporary' | 'save', value: boolean) => Promise<void>;
	} = $props();

	let lastUpdated: string = chat.deleteAfter?.toISOString() ?? new Date().toISOString();

	let titleOpacity = new Spring(0, { stiffness: 0.1, damping: 0.8 });
	titleOpacity.set(1);

	let currentRoute = $derived(page.url.pathname);

	let normalizedGeneration = (chat?.generations ?? 0) / maximumGenerations;
	let adjusted = sigmoid((normalizedGeneration - 0.5) * 10); // Adjust '10' to control the steepness
	// let sunOpacity = 0.01 + 0.5 * adjusted; // Scale between 0.2 and 0.8
	let sunOpacity = 0 + 0.9 * adjusted; // Scale between 0.2 and 0.8
	sunOpacity = 1 - sunOpacity;

	// Hack because when you use pushState, the page.url.pathname is not updated
	// $effect(() => {
	// 	if (currentRoute) {
	// 		currentRoute = page.url.pathname;
	// 		currentRoute = document.location.pathname;
	// 	}
	// });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	onmouseover={() => {
		hovered = true;
	}}
	onmouseout={() => {
		hovered = false;
	}}
>
	<div
		class="text-grey-450 flex items-center justify-center px-2 pt-[0.2rem] first:mt-1"
		style="opacity: {titleOpacity.current}"
	>
		<div class="pr-1">
			<TemporaryChatButton
				generationsRatio={normalizedGeneration}
				onclick={() => updateChat(chat.id, 'temporary', !chat.deleteAfter)}
				{sunOpacity}
				updatedAtString={lastUpdated}
				temporary={chat.deleteAfter !== null}
			/>
		</div>
		<a
			href="/{chat.id}"
			class="font-gill truncate uppercase {currentRoute === `/${chat.id}`
				? 'text-grey-200'
				: 'text-grey-450'} hover:text-grey-200 w-full pb-0.5
		text-sm tracking-[1.5px] antialiased transition-colors ease-linear"
		>
			{chat.title}
		</a>
		<div>
			<SaveButton
				onclick={() => {
					updateChat(chat.id, 'save', !chat.saved);
				}}
				active={chat.saved ?? false}
				{hovered}
			/>
		</div>
	</div>
</div>
