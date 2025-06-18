<script lang="ts">
	import type { PageData } from './$types';
	import SidebarV2 from '$lib/ui/components/sidebar/SidebarV2.svelte';
	import Chat from '$lib/ui/components/chat/Chat.svelte';
	import { selectedModel } from '$lib/stores/model';
	import NewChat from '$lib/ui/icons/NewChat.svelte';
	import Modal from '$lib/ui/components/Modal.svelte';
	import SettingsModal from '$lib/ui/components/settings/SettingsModal.svelte';
	import { setSelectedModel } from '$lib/stores/model.svelte';

	let { data }: { data: PageData } = $props();
	setSelectedModel(data.models[0]);
	let chats = $state(data.chats);

	let dialog = $state<any>(null);

	$effect(() => {
		chats = data.chats;
	});
</script>

<Modal
	bind:dialog
	onClickedDialog={() => {
		// if (dialog) {
		// 	dialog.close();
		// }
	}}
>
	<SettingsModal user={data.user} models={data.models} />
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
			onclickSettings={() => {
				dialog.showModal();
			}}
		/>
		{#key data.chat}
			<Chat
				chat={data.chat}
				unattachedFiles={data.unattachedFiles}
				models={data.models}
				user={data.user}
			/>
		{/key}
	</div>
</div>
