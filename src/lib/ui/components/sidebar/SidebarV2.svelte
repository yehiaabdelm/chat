<script lang="ts">
	import Title from './Title.svelte';
	import NewChat from '$lib/ui/icons/NewChat.svelte';
	import Saved from '$lib/ui/icons/Saved.svelte';
	import Settings from '$lib/ui/icons/Settings.svelte';
	import Expand from '$lib/ui/icons/Expand.svelte';
	import Search from '$lib/ui/icons/Search.svelte';
	import ColorWheel from './ColorWheel.svelte';
	import { page } from '$app/state';
	import { Spring } from 'svelte/motion';
	import type { ChatTitle } from '$lib/types';

	let {
		chats = $bindable(),
		onclickSettings
	}: { chats: ChatTitle[]; onclickSettings: () => void } = $props();

	let maximumGenerations = $derived(Math.max(...chats.map((chat) => chat.generations ?? 0)));
	let saved = $state(false);
	let searchDisabled = $state(true);

	let colorWheelY = new Spring(100, { damping: 0.8, stiffness: 0.1 });
	let buttonsOpacity = new Spring(0, { damping: 0.7, stiffness: 0.1 });
	buttonsOpacity.set(1);

	// Opacity for the section that lists chat titles
	let titlesOpacity = new Spring(0, { damping: 0.8, stiffness: 0.3 });
	titlesOpacity.set(1);

	type Categories =
		| 'Today'
		| 'Yesterday'
		| 'Past week'
		| 'More than a week ago'
		| 'More than a month ago';
	let categories = [
		'Today',
		'Yesterday',
		'Past week',
		'More than a week ago',
		'More than a month ago'
	];

	// let sidebarOpacity = new Spring(0, { damping: 0.8, stiffness: 0.3 });

	const getDateCategory = (dateString: string): string => {
		const updatedAt = new Date(dateString);
		const today = new Date();
		const todayStr = today.toDateString();
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toDateString();
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

		if (updatedAt.toDateString() === todayStr) {
			return 'Today';
		} else if (updatedAt.toDateString() === yesterdayStr) {
			return 'Yesterday';
		} else if (updatedAt.getTime() > oneWeekAgo.getTime()) {
			return 'Past week';
		} else if (updatedAt.getTime() > oneMonthAgo.getTime()) {
			return 'More than a week ago';
		} else {
			return 'More than a month ago';
		}
	};

	const updateChat = async (id: string, type: 'temporary' | 'save', value: boolean) => {
		let response = fetch(`/api/chat/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ [type]: value })
		});
		if (type === 'save') {
			chats = chats.map((chat) => {
				if (chat.id === id) {
					chat.saved = value;
				}
				return chat;
			});
			// let awaitedResponse = await response;
			// if (!awaitedResponse.ok) {
			// 	chat!.saved = !value;
			// }
		}
	};

	let categorizedTitles: [Categories, ChatTitle[]][] = $derived.by(() => {
		return categories
			.map(
				(category) =>
					[
						category as Categories,
						chats
							.filter((chat) => getDateCategory(chat.updatedAt.toISOString()) === category)
							.sort((a, b) => {
								return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
							})
					] as [Categories, ChatTitle[]]
			)
			.filter(([, titles]) => titles.length > 0);
	});
</script>

<div
	class="hidden h-full flex-col p-3 pb-0 sm:w-[30rem] lg:flex"
	style="opacity: {buttonsOpacity.current};"
>
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
		<Settings onclick={onclickSettings} />
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
		class="no-scrollbar
        relative
        h-full
		overflow-x-hidden overflow-y-auto
		rounded-br-xl rounded-bl-xl border
		border-t-0 border-transparent duration-250"
		style="background-color: rgb(var(--sidebar-color)); transition: background-color 1s ease;"
	>
		{#if chats.length > 0}
			{#each categorizedTitles as [category, categoryTitles]}
				<div class="border-b-grey-1100 border-b pt-2 pb-3" style="opacity: {titlesOpacity.current}">
					<p
						class="font-gill text-grey-400 sticky top-0 z-30 pt-3 pb-1 pl-3 text-[0.65rem] tracking-[2px] uppercase antialiased"
						style="background-color: var(--sidebar-color); transition: background-color 1s ease, box-shadow 1s ease;"
					>
						{category}
					</p>
					<div>
						{#each categoryTitles as chat (chat.id)}
							<div>
								<Title {chat} {maximumGenerations} hovered={false} {updateChat} />
							</div>
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			<p
				class="text-grey-500 font-gill m-auto items-center justify-center text-[0.7rem] tracking-[2px] uppercase antialiased"
			>
				No chats yet
			</p>
		{/if}
	</div>
	<div class="my-5 mt-3.5">
		<ColorWheel />
	</div>
</div>
