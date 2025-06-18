<script lang="ts">
	import Suns from './Suns.svelte';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	export let threshold: number;

	let periods = { '12 hours': 12, '24 hours': 24, '7 days': 168, '30 days': 720 };

	function selectPeriod(period: number) {
		threshold = period;
		// TODO: update user settings
	}
</script>

<div class="flex w-full flex-col items-center justify-center">
	<!-- <Suns />
	<p class="font-gill text-grey-100 pt-2 text-[0.7rem] tracking-[2px] uppercase antialiased">
		temporary chats
	</p> -->
	<form
		action="{PUBLIC_BASE_URL}/api/user"
		target="dummyframe"
		method="post"
		class="flex w-full items-center justify-between"
	>
		<input
			type="text"
			name="chat_settings.temporary_chats_threshold"
			bind:value={threshold}
			class="hidden"
		/>

		{#each Object.entries(periods) as [periodText, period]}
			<button
				on:click={() => selectPeriod(period)}
				class="font-untitled hover:text-grey-100 bg-transparent text-sm antialiased transition-colors duration-500 {threshold ===
				period
					? 'text-grey-100'
					: 'text-grey-450'}"
			>
				{periodText}
			</button>
		{/each}
	</form>
</div>
