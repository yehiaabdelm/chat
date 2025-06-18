<script lang="ts">
	import { enhance } from '$app/forms';
	let { threshold = $bindable() }: { threshold: number } = $props();
	let periods = { '12 hours': 12, '24 hours': 24, '7 days': 168, '30 days': 720 };
</script>

<div class="flex w-full flex-col items-center justify-center">
	<div class="flex w-full items-center justify-between">
		{#each Object.entries(periods) as [periodText, period]}
			<form action="?/timeToDelete" method="post" use:enhance>
				<input type="hidden" name="timeToDelete" value={period} />
				<button
					type="submit"
					class="font-untitled hover:text-grey-100 cursor-pointer bg-transparent text-sm antialiased transition-colors duration-500 {threshold ===
					period
						? 'text-grey-100'
						: 'text-grey-450'}"
				>
					{periodText}
				</button>
			</form>
		{/each}
	</div>
</div>
