<script lang="ts">
	import { enhance } from '$app/forms';
	let { messageWindow = $bindable() }: { messageWindow: number } = $props();
	let limits = {
		Off: 10000,
		'Last 20': 20,
		'Last 10': 10,
		'Last 5': 5
	};
</script>

<div class="flex items-center">
	<div class="flex w-full items-center justify-between self-start">
		{#each Object.entries(limits) as [limitText, limit]}
			<form action="?/messageWindow" method="post" use:enhance>
				<input type="hidden" name="messageWindow" value={limit} />
				<button
					type="submit"
					class="font-untitled hover:text-grey-100 cursor-pointer bg-transparent text-sm antialiased transition-colors duration-500 {messageWindow ===
					limit
						? 'text-grey-100'
						: 'text-grey-450 '}"
				>
					{limitText}
				</button>
			</form>
		{/each}
	</div>
</div>
