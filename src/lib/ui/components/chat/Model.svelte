<script lang="ts">
	import { selectedModel } from '$lib/stores/model';
	import { Spring } from 'svelte/motion';
	import OpenAI from '$lib/ui/logos/OpenAI.svelte';
	import Anthropic from '$lib/ui/logos/Anthropic.svelte';
	import type { Model as ModelType } from '$lib/types';

	let { model, disabled = false }: { model: ModelType; disabled: boolean } = $props();

	let modelOpacity = new Spring(0, { stiffness: 0.1, damping: 0.8 });

	$effect(() => {
		if (model?.id === $selectedModel?.id) {
			modelOpacity.set(0.95);
		} else {
			modelOpacity.set(0.5);
		}
	});

	const getLogo = (providerName: string) => {
		switch (providerName) {
			case 'openai':
				return OpenAI;
			case 'anthropic':
				return Anthropic;
			default:
				return OpenAI;
		}
	};
</script>

<button
	class="z-30 flex items-center gap-3 {$selectedModel?.id === model?.id
		? 'opacity-95'
		: 'opacity-50'}  cursor-pointer transition-opacity ease-linear hover:opacity-95"
	style="opacity: {modelOpacity.current}"
	type="button"
	value={model.id}
	{disabled}
	onclick={() => {
		$selectedModel = model;
	}}
>
	<div class="h-[1.6rem] w-3">
		{#if model.vendor?.name}
			{@const Logo = getLogo(model.vendor?.name)}
			<Logo />
		{:else}
			<OpenAI />
		{/if}
	</div>
	<p
		class="text-grey-150 font-gill hover:text-grey-150 text-start text-xs tracking-[2.5px] whitespace-nowrap uppercase antialiased"
	>
		{model?.name}
	</p>
</button>
