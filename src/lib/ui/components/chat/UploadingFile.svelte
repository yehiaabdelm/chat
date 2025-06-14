<script lang="ts">
	import { Spring } from 'svelte/motion';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { springEasingFunction } from '$lib/ui/actions';

	let { progress }: { progress: number } = $props();
	const colors = {
		grey: {
			r: 245,
			g: 245,
			b: 245
		},
		green: {
			r: 38,
			g: 255,
			b: 92
		}
	};
	const r = new Spring(colors.grey.r, { stiffness: 0.1, damping: 0.8 });
	const g = new Spring(colors.grey.g, { stiffness: 0.1, damping: 0.8 });
	const b = new Spring(colors.grey.b, { stiffness: 0.1, damping: 0.8 });

	const animatedProgress = new Spring(0, {
		stiffness: 0.1,
		damping: 0.8
	});

	$effect(() => {
		animatedProgress.set(progress);
	});

	const statusOpacity = new Spring(1, { stiffness: 0.08, damping: 0.8 });
	const pulse = () => {
		statusOpacity.set(0);
		setTimeout(() => {
			statusOpacity.set(1);
		}, 500);
	};
	pulse();
	
	const interval = setInterval(pulse, 1500);

	$effect(() => {
		if (progress === 100) {
			setTimeout(() => {
				r.set(colors.green.r);
				g.set(colors.green.g);
				b.set(colors.green.b);
			}, 1500);

			clearInterval(interval);
			statusOpacity.set(1);
		}
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div
	class="absolute right-[3.75rem] bottom-[0.6rem] left-[3.75rem] flex items-center"
	out:fade={{ duration: 400, easing: springEasingFunction }}
>
	<div
		class="mr-[0.45rem] h-1 w-1 rounded-full"
		style={`opacity: ${statusOpacity.current}; background-color: rgb(${r.current}, ${g.current}, ${b.current})`}
	></div>
	<div class="bg-grey-700 h-[0.2rem] flex-grow rounded-full">
		<div class="h-full rounded-full bg-white" style="width: {animatedProgress.current}%;"></div>
	</div>
</div>
