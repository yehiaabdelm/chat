<script lang="ts">
	import { Spring } from 'svelte/motion';
	let { disabled = false, onclick }: { disabled: boolean; onclick?: () => void } = $props();
	const yPosition = new Spring(0, {
		stiffness: 0.1,
		damping: 0.8
	});
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<button {onclick} class="h-5 cursor-pointer">
	<svg
		style="transform: translateX({yPosition.current}px);"
		class="h-[0.5em] w-[0.5em]"
		viewBox="0 0 6 9"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square">
			<g
				transform="translate(-1250.000000, -407.000000)"
				class={disabled ? 'stroke-grey-600' : 'stroke-grey-400'}
				stroke-width="1.2"
			>
				<polyline points="1251.04191 407.904215 1254.34989 411.212196 1251.04191 414.520177"
				></polyline>
			</g>
		</g>
	</svg>
</button>
