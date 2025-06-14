<script lang="ts">
	import { Spring } from 'svelte/motion';
	import TextIcon from '$lib/ui/icons/TextIcon.svelte';
	let {
		active = false,
		text = '',
		onclick
	}: { active: boolean; text: string; onclick?: () => void } = $props();

	let centerStartingPosition = 4.6243584;
	let centerHoverPosition = centerStartingPosition - 0.631526;

	let centerClickedPosition = centerStartingPosition - 4.731526;
	let centerClickedHoverPosition = centerClickedPosition + 0.5;

	let sideStartingPosition = 1.4082229;
	let sideHoverPositionUp = 1.4082229;

	let sideEndPosition = sideStartingPosition + 1.338717;
	let sideHoverPositionDown = sideHoverPositionUp + 1.338717;

	let center = new Spring(centerStartingPosition, { stiffness: 0.1, damping: 0.8 });
	let sides = new Spring(sideStartingPosition, { stiffness: 0.1, damping: 0.8 });

	let scale = new Spring(1, { stiffness: 0.1, damping: 0.8 });

	let hovering = false;
	let clicked = false;

	function startHover() {
		hovering = true;
		updatePosition();
	}

	function endHover() {
		hovering = false;
		updatePosition();
	}

	function animate() {
		clicked = !clicked;
		updatePosition();
	}

	function press() {
		center.set(centerStartingPosition);
	}

	function updatePosition() {
		if (clicked && hovering) {
			center.set(centerClickedHoverPosition);
			sides.set(sideHoverPositionDown);
		} else if (!clicked && hovering) {
			center.set(centerHoverPosition);
			sides.set(sideHoverPositionUp);
		} else if (clicked) {
			center.set(centerClickedPosition);
			sides.set(sideEndPosition);
		} else {
			center.set(centerStartingPosition);
			sides.set(sideStartingPosition);
		}
	}

	let polylinePoints = $derived(
		`${1.768239} ${sides.current} ${4.978483} ${center.current} ${8.341735} ${sides.current}`
	);
</script>

<TextIcon
	children={icon}
	{text}
	onclick={() => {
		animate();
		onclick?.();
	}}
	onmouseenter={startHover}
	onmouseleave={endHover}
	onmousedown={press}
	{active}
/>

{#snippet icon()}
	<span class="mr-[0.1em] ml-[0.12em] h-4" style="transform: scale({scale.current});">
		<svg viewBox="0.5 0 9 5" class="h-2 w-2">
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square">
				<g class="stroke-grey-300" stroke-width="1.38">
					{@html `<polyline points="${polylinePoints}"></polyline>`}
				</g>
			</g>
		</svg>
		<svg viewBox="0.5 0 9 5" class="h-2 w-2" style="transform:scaleY(-1);">
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square">
				<g class="stroke-grey-300" stroke-width="1.38">
					{@html `<polyline points="${polylinePoints}"></polyline>`}
				</g>
			</g>
		</svg>
	</span>
{/snippet}
