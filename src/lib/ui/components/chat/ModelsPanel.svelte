<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import Model from './Model.svelte';
	import { Spring } from 'svelte/motion';
	import type { Model as ModelType } from '$lib/types';
	import { selectedModel } from '$lib/stores/model';

	let { models }: { models: ModelType[] } = $props();

	let opacity = new Spring(0, { stiffness: 0.1, damping: 0.8 });

	$effect(() => {
		opacity.set(1);
	});
</script>

<div class="flex flex-col items-center gap-y-4" style="opacity: {opacity.current}">
	<p class="font-gill text-grey-300 text-[0.7rem] tracking-[3px] uppercase antialiased">
		Select a model
	</p>
	<div class="text-grey-150 grid grid-rows-2 lg:grid-flow-col" style="grid-column-gap: 3rem;">
		{#each models as model, i}
			<Model {model} />
		{/each}
	</div>
</div>
