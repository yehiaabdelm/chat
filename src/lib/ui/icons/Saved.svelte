<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	import { Spring } from 'svelte/motion';
	let {
		active = false,
		text = 'saved chats',
		onclick
	}: { active: boolean; text: string; onclick?: () => void } = $props();
	let grey = 245;
	let r = new Spring(grey, { stiffness: 0.1, damping: 0.8 });
	let g = new Spring(grey, { stiffness: 0.1, damping: 0.8 });
	let b = new Spring(grey, { stiffness: 0.1, damping: 0.8 });
	let aFill = new Spring(0.542, { stiffness: 0.1, damping: 0.8 });
	let aStroke = new Spring(0.542, { stiffness: 0.1, damping: 0.8 });

	$effect(() => {
		if (active) {
			aFill.set(1);
			r.set(180);
			g.set(47);
			b.set(47);
		} else {
			aFill.set(0);
			r.set(grey);
			g.set(grey);
			b.set(grey);
		}
	});
</script>

<TextIcon children={icon} {text} {active} {onclick} />

{#snippet icon()}
	<svg
		class="mr-[0.12em] ml-[0.1em] h-[0.6em] w-[0.6em]"
		width="10px"
		height="9px"
		viewBox="0 0 10 9"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g
			stroke="none"
			stroke-width="1"
			fill={`rgb(${r.current}, ${g.current}, ${b.current}, ${aFill.current})`}
			fill-rule="evenodd"
		>
			<g
				transform="translate(-21.000000, -51.000000)"
				stroke={`rgb(${r.current}, ${g.current}, ${b.current}, ${aStroke.current})`}
			>
				<polygon
					points="21.5503121 59.4973948 21.5503121 51.5019232 30.168814 51.5019232 30.168814 59.4973948 25.859563 55.7932851"
				></polygon>
			</g>
		</g>
	</svg>
{/snippet}
