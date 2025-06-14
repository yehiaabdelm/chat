<script lang="ts">
	import type { PageData } from './$types';
	import SidebarV2 from '$lib/ui/components/sidebar/SidebarV2.svelte';
	import Chat from '$lib/ui/components/chat/Chat.svelte';
	import { selectedModel } from '$lib/stores/model';

	let { data }: { data: PageData } = $props();
	$selectedModel = data.models[0];
</script>

<div class="flex h-full w-full">
	<SidebarV2 chats={data.chats} />
	<Chat chat={data.chat} unattachedFiles={data.unattachedFiles} models={data.models} />
</div>
