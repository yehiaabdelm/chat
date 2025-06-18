<script lang="ts">
	let {
		onclick,
		disabled
	}: {
		onclick: () => void;
		disabled: boolean;
	} = $props();

	import { Spring } from 'svelte/motion';
	let initialOpacity = 0.5;
	let activeOpacity = 0.95;

	let firstPathSpring = new Spring(4, { stiffness: 0.1, damping: 0.8 });
	let secondPathSpring = new Spring(8, { stiffness: 0.1, damping: 0.8 });
	let thirdPathSpring = new Spring(9, { stiffness: 0.1, damping: 0.8 });
	let opacity = new Spring(initialOpacity, { stiffness: 0.1, damping: 0.8 });
	let clicked = false;

	function blink() {
		opacity.set(0);
		setTimeout(() => {
			opacity.set(activeOpacity);
		}, 120);
	}

	async function hoverStart() {
		if (!clicked) {
			firstPathSpring.set(5);
			secondPathSpring.set(11);
			thirdPathSpring.set(10);
			opacity.set(activeOpacity);
		}
	}

	function hoverEnd() {
		if (!clicked) {
			firstPathSpring.set(4);
			secondPathSpring.set(8);
			thirdPathSpring.set(9);
			opacity.set(initialOpacity);
		}
	}

	async function mouseDown() {
		clicked = true;
		firstPathSpring.set(6);
		secondPathSpring.set(12);
		thirdPathSpring.set(11);
		blink();
	}

	function mouseUp() {
		if (!clicked) {
			hoverStart();
		}
	}

	function reset() {
		clicked = false;
		firstPathSpring.set(4);
		secondPathSpring.set(8.120368);
		thirdPathSpring.set(9.2);
		opacity.set(activeOpacity);
	}
</script>

<button
	class="flex cursor-pointer items-center justify-center gap-2 p-1"
	onmouseenter={hoverStart}
	onmouseleave={hoverEnd}
	onmousedown={mouseDown}
	onmouseup={mouseUp}
	onclick={() => {
		reset();
		onclick();
	}}
	{disabled}
>
	<svg
		viewBox="0 0 19 10"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		class="h-[1.02em] w-[1.02em] pb-[0.1em]"
		style="opacity: {opacity.current};"
	>
		<g
			id="Page-2-Copy-72"
			stroke="none"
			stroke-width="1"
			fill="none"
			fill-rule="evenodd"
			opacity="1"
		>
			<g id="Apple-TV-Copy" transform="translate(-1345.000000, -431.000000)">
				<g id="Group-6-Copy" transform="translate(1345.726219, 431.206054)">
					<path
						d="M{thirdPathSpring.current},3 L13.2407358,3 C14.8975901,3 16.2407358,4.34314575 16.2407358,6 C16.2407358,7.65685425 14.8975901,9 13.2407358,9 L3,9 C1.34314575,9 2.02906125e-16,7.65685425 0,6 C-2.02906125e-16,4.34314575 1.34314575,3 3,3 L{firstPathSpring.current},3 L3.42266582,3"
						id="Combined-Shape"
						class="stroke-grey-300"
						stroke="#FFFFFF"
						stroke-width="1.17727071"
					/>
					<path
						d="M8.32923845,1.89564958 L10.4591824,3.7174688 C10.5940486,3.83282481 10.6098647,4.03567 10.4945087,4.1705362 C10.4334581,4.24191224 10.3442358,4.28300506 10.2503118,4.28300506 L5.99042399,4.28300506 C5.81295314,4.28300506 5.66908459,4.13913651 5.66908459,3.96166566 C5.66908459,3.86774171 5.71017741,3.77851935 5.78155345,3.7174688 L7.91149737,1.89564958 C8.03175027,1.79279286 8.20898555,1.79279286 8.32923845,1.89564958 Z"
						id="Triangle"
						class="fill-grey-300"
						transform="translate({secondPathSpring.current}, 3.000000) rotate(-90.000000) translate(-8.120368, -3.000000) "
					/>
				</g>
			</g>
		</g>
	</svg>
	<p
		class="font-gill text-grey-300 text-[0.63rem] tracking-[3px] uppercase antialiased"
		style="opacity: {opacity.current};"
	>
		regenerate
	</p>
</button>
