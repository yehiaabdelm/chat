<script lang="ts">
	import type { PageData } from './$types';
	import SidebarV2 from '$lib/ui/components/sidebar/SidebarV2.svelte';
	import Chat from '$lib/ui/components/chat/Chat.svelte';
	import { selectedModel } from '$lib/stores/model';
	import NewChat from '$lib/ui/icons/NewChat.svelte';
	import Modal from '$lib/ui/components/Modal.svelte';
	import SettingsModal from '$lib/ui/components/settings/SettingsModal.svelte';

	let { data }: { data: PageData } = $props();
	selectedModel.set(data.models[0]);
	let chats = $state(data.chats);

	let showModal = $state(false);

	$effect(() => {
		chats = data.chats;
	});
</script>

<svelte:head>
	<title>{`${data?.chat?.title ?? 'New Chat'}`}</title>
</svelte:head>

<Modal bind:showModal>
	<SettingsModal user={data.user} models={data.models} endpoints={data.endpoints} />
</Modal>

<div class="relative flex h-dvh w-screen flex-col overflow-hidden">
	<div
		class=" fixed top-0 right-0 left-0 z-30 m-0 flex items-center justify-between bg-[rgb(var(--theme-color))] p-2 lg:hidden"
		style="transition: background-color 1s ease;"
	>
		<NewChat text="" href="/" active={false} height="1rem" width="1rem" />
	</div>
	<div class="flex h-full flex-col max-md:pt-8 lg:flex-row">
		<SidebarV2
			bind:chats
			user={data.user}
			onclickSettings={() => {
				showModal = true;
			}}
		/>
		{#key data.chat}
			<Chat
				chat={data.chat}
				unattachedFiles={data.unattachedFiles}
				models={data.models}
				user={data.user}
				openSettings={() => {
					showModal = true;
				}}
			/>
		{/key}
	</div>
</div>
