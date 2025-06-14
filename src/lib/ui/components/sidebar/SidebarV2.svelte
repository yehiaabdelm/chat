<script lang="ts">
	import { page } from '$app/state';
	import { Spring } from 'svelte/motion';
	import NewChat from '$lib/ui/icons/NewChat.svelte';
	import Saved from '$lib/ui/icons/Saved.svelte';
	import Settings from '$lib/ui/icons/Settings.svelte';
	import Expand from '$lib/ui/icons/Expand.svelte';
	import Search from '$lib/ui/icons/Search.svelte';
	import ColorWheel from './ColorWheel.svelte';
	import type { ChatTitle } from '$lib/types';

	let { chats }: { chats: ChatTitle[] } = $props();

	let saved = $state(false);
	let searchDisabled = $state(true);
	let colorWheelY = new Spring(100, { damping: 0.8, stiffness: 0.1 });

	// const onInput = debounce(async (e: KeyboardEvent) => {
	// 	query = (e.target as HTMLInputElement).value;
	// 	if (query === '') {
	// 		search = false;
	// 		return;
	// 	}
	// 	search = true;
	// 	searchResults = [];
	// 	const res = await fetch(new URL(`/api/chat/search?q=${query}`, PUBLIC_BASE_URL));
	// 	searchResults = await res.json();
	// });
	let buttonsOpacity = new Spring(0, { damping: 0.7, stiffness: 0.1 });
	// let sidebarOpacity = new Spring(0, { damping: 0.8, stiffness: 0.3 });
	$effect(() => {
		buttonsOpacity.set(1);
	});
</script>

<div class="h-full flex-col p-3 pb-0 sm:w-88 md:flex" style="opacity: {buttonsOpacity.current};">
	<div
		class="grid justify-between gap-[0.2rem] px-[0.15rem] pb-3 md:grid-flow-col md:grid-rows-2 md:justify-items-start"
		style="opacity: {buttonsOpacity.current};"
	>
		<NewChat text="new chat" href="/" active={page.url.pathname !== '/'} />
		<Saved
			text="saved chats"
			active={saved}
			onclick={() => {
				saved = !saved;
			}}
		/>
		<Expand text="model settings" active={false} />
		<Settings />
	</div>
	<div
		class="border-grey-1100 flex items-center rounded-tl-xl
	rounded-tr-xl border-0 border-b
	py-2 pl-2"
		style="background-color: rgb(var(--sidebar-color)); transition: background-color 1s ease;"
	>
		<Search />
		<input
			type="text"
			class="text-grey-400
            font-gill
            placeholder:text-grey-450
            caret-grey-500
            ml-2
            w-full
            bg-transparent
            text-[0.7rem]
            tracking-[0.1rem]
            uppercase antialiased
            placeholder:text-[0.7rem]
            placeholder:tracking-[0.1rem]
            placeholder:uppercase
            placeholder:antialiased
            focus:ring-0
            focus:outline-none focus:placeholder:text-transparent
            {searchDisabled ? 'cursor-not-allowed opacity-50' : ''}"
			placeholder={searchDisabled ? 'temporarily disabled' : 'Search'}
			disabled={searchDisabled}
		/>
	</div>
	<div
		class="relative
        h-full
        overflow-x-hidden
		overflow-y-auto rounded-br-xl
		rounded-bl-xl border border-t-0
		border-transparent duration-250"
		style="background-color: rgb(var(--sidebar-color)); transition: background-color 1s ease;"
	>
		<div class="flex h-full flex-col">
			<p
				class="text-grey-500 font-gill m-auto items-center justify-center text-[0.7rem] tracking-[2px] uppercase antialiased"
			>
				No chats yet
			</p>
		</div>
	</div>
	<div class="my-5 mt-3.5">
		<ColorWheel />
	</div>
</div>
