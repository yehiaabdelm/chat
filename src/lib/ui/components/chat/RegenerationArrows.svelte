<script lang="ts">
	import ArrowLeft from '$lib/ui/icons/ArrowLeft.svelte';
	import ArrowRight from '$lib/ui/icons/ArrowRight.svelte';
	let {
		id,
		siblings,
		navigate
	}: {
		siblings: string[];
		id: string;
		navigate: (id: string) => void;
	} = $props();

	let activeIndex: number = $state(siblings.indexOf(id));
</script>

<div class="flex items-center gap-[0.35rem]">
	<ArrowLeft
		disabled={activeIndex === 0}
		onclick={() => {
			if (activeIndex === 0) return;
			navigate(siblings[activeIndex - 1]);
		}}
	/>
	<div
		class="text-grey-450 font-gill flex items-center pb-0.75 text-sm tracking-[3px] antialiased"
		style="transform: translateX(0.06rem);"
	>
		<span>{activeIndex + 1}</span>/<span>{siblings.length}</span>
	</div>
	<ArrowRight
		disabled={activeIndex === siblings.length - 1}
		onclick={() => {
			if (activeIndex === siblings.length - 1) return;
			navigate(siblings[activeIndex + 1]);
		}}
	/>
</div>
