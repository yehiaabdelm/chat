<script lang="ts">
	import type { Model as ModelType } from '$lib/types';
	import { selectedModel } from '$lib/stores/model';
	import Model from './Model.svelte';
	import { Spring } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import { springEasingFunction } from '$lib/ui/actions';
	let { models }: { models: ModelType[] } = $props();

	let scrollContainer: HTMLDivElement;
	const initialOpacity = 0;
	const opacity = new Spring(initialOpacity, { stiffness: 0.1, damping: 0.8 });
	const fadeOpacity = new Spring(0.65, { stiffness: 0.1, damping: 0.8 });

	opacity.set(1);

	function handleScroll() {
		if (scrollContainer) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
			const scrollThreshold = scrollWidth * 0.005; // Adjust this value to set the threshold
			if (scrollLeft >= scrollThreshold) {
				const fullscrollRange = scrollWidth - scrollThreshold;
				const scrollRange = fullscrollRange - clientWidth;
				const scrollProgress = 1 - (scrollLeft - scrollThreshold) / scrollRange;
				fadeOpacity.set(1 - scrollProgress * 0.35); // Adjust the multiplier to control the fading speed
			} else {
				fadeOpacity.set(0.65);
			}
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="z-20 pt-[0.1rem]" style="opacity: {opacity.current}">
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<div
		class="text-grey-150 no-scrollbar flex gap-5 overflow-y-auto"
		bind:this={scrollContainer}
		onscroll={handleScroll}
		style="position: relative; mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) {fadeOpacity.current *
			100}%, rgba(0, 0, 0, {fadeOpacity.current - 1}));"
	>
		{#each models as model, i (model.id)}
			<div
				transition:fly={{
					delay: 0,
					duration: 400,
					easing: springEasingFunction,
					x: -50
				}}
			>
				<Model {model} disabled={false} />
			</div>
		{/each}
	</div>
</div>
