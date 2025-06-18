<script lang="ts">
	import { PUBLIC_BASE_URL } from '$env/static/public';
	let { messageWindow }: { messageWindow: number } = $props();
	let limits = {
		Off: 1000,
		'Last 20': 20,
		'Last 10': 10,
		'Last 5': 5
	};
</script>

<form
	action="{PUBLIC_BASE_URL}/api/user"
	target="dummyframe"
	method="post"
	class="flex items-center"
>
	<div class="flex w-full items-center justify-between self-start">
		<input
			type="text"
			name="chat_settings.max_messages_count"
			bind:value={messageWindow}
			class="hidden"
		/>
		{#each Object.entries(limits) as [limitText, limit]}
			<button
				onclick={() => {
					messageWindow = limit;
				}}
				class="font-untitled hover:text-grey-100 bg-transparent text-sm antialiased transition-colors duration-500 {messageWindow ===
				limit
					? 'text-grey-100'
					: 'text-grey-450'}"
			>
				{limitText}
			</button>
		{/each}
	</div>
</form>
