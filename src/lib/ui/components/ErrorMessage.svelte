<script lang="ts">
	import Error from '$lib/ui/icons/Error.svelte';
	import { fly } from 'svelte/transition';
	import { SpringSolverCustom } from '$lib/ui/actions';
	export let message: string;
	const springSolver = new SpringSolverCustom({
		mass: 0.4,
		stiffness: 30,
		damping: 300,
		initialVelocity: 1
	});

	export const springEasingFunction = (t: number) => springSolver.solve(t);
</script>

<div
	class=" font-gill fixed bottom-20 z-0 mb-[12px] inline-flex items-center self-start rounded-lg bg-[rgb(155,11,11)]/10 tracking-wide"
	in:fly={{ y: 40, duration: 1000, easing: springEasingFunction }}
	out:fly={{ y: 40, duration: 1000, easing: springEasingFunction }}
>
	<div class="flex items-center gap-3 py-[0.3rem] pr-2 pl-[0.2rem]">
		<div class="pl-1">
			<Error />
		</div>
		<p class="text-xs tracking-[2px] text-red-100 uppercase antialiased">{message}</p>
	</div>
</div>
