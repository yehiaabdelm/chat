<script lang="ts">
	import type { Model } from '$lib/types';
	let { models }: { models: Model[] } = $props();
	import ModelComponent from './Model.svelte';
	import { Spring } from 'svelte/motion';

	const initialOpacity = 0;
	const opacity = new Spring(initialOpacity, { stiffness: 0.1, damping: 0.8 });

	setTimeout(() => {
		opacity.set(1);
	}, 400);
</script>

<div class="flex flex-col items-center gap-y-4" style="opacity: {opacity.current}">
	{#if models.length === 0}
		<div class="flex flex-col items-center gap-y-3 text-center">
			<p class="font-gill text-grey-300 text-xs tracking-[3px] uppercase">No models available</p>
			<p class="font-public text-grey-400 max-w-sm text-sm">
				Add an API key in settings to start using Teletyped
			</p>
		</div>
	{:else}
		<p class="font-gill text-grey-300 text-xs tracking-[3px] uppercase">Select a model</p>
		<div class="text-grey-150 grid grid-rows-2 lg:grid-flow-col" style="grid-column-gap: 3rem;">
			{#each models as model, i}
				<ModelComponent {model} disabled={false} />
			{/each}
		</div>
	{/if}
</div>
