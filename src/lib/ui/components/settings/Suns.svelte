<script lang="ts">
	import { spring } from 'svelte/motion';
	import { inview } from 'svelte-inview';

	interface InViewEventDetail {
		inView: boolean;
	}

	interface InViewEvent extends CustomEvent {
		detail: InViewEventDetail;
	}

	let isInView = false;

	const sunYellowPosition = spring(20, { stiffness: 0.04, damping: 0.8 });
	const sunBrightOrangePosition = spring(20, { stiffness: 0.04, damping: 0.8 });
	const sunOrangePosition = spring(20, { stiffness: 0.03, damping: 0.8 });
	const sunDarkOrangePosition = spring(20, { stiffness: 0.02, damping: 0.8 });
	const sunRedPosition = spring(20, { stiffness: 0.02, damping: 0.8 });
	const sunsBlur = spring(10, { stiffness: 0.02, damping: 0.8 });

	$: if (isInView) {
		sunYellowPosition.set(0);
		sunBrightOrangePosition.set(0);
		sunOrangePosition.set(0);
		sunDarkOrangePosition.set(0);
		sunRedPosition.set(0);
		sunsBlur.set(0);
	}
</script>

<div
	use:inview={{ unobserveOnEnter: true, rootMargin: '-20%' }}
	on:change={(e) => {
		isInView = e.detail.inView;
	}}
	style="filter: blur({$sunsBlur}px); will-change: filter; -webkit-transform:scale(1.3, 1.3); transform: scale(1.3);"
>
	<svg
		width="203px"
		height="15px"
		viewBox="0 0 203 20"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<defs>
			<clipPath id="cut-off-bottom-1">
				<rect id="Rectangle-Copy-29" fill="#030303" x="0" y="-8.4" width="16" height="10.6"></rect>
			</clipPath>
			<clipPath id="cut-off-bottom-2">
				<rect id="Rectangle-Copy-30" fill="#030303" x="0" y="-6.8" width="16" height="10.6"></rect>
				<!-- <rect id="Rectangle-Copy-27" fill="#030303" x="0" y="3.88275828" width="16" height="15.6"></rect> -->
			</clipPath>

			<clipPath id="cut-off-bottom-3">
				<rect id="Rectangle-Copy-31" fill="#030303" x="0" y="-5.2" width="16" height="10.6"></rect>
				<!-- <rect id="Rectangle-Copy" fill="#030303" x="0" y="5.48275828" width="16" height="15.6"></rect> -->
			</clipPath>

			<clipPath id="cut-off-bottom-4">
				<rect id="Rectangle-Copy-31" fill="#030303" x="0" y="-4.35" width="16" height="10.6"></rect>
				<!-- <rect id="Rectangle-Copy" fill="#030303" x="0" y="5.48275828" width="16" height="15.6"></rect> -->
			</clipPath>

			<clipPath id="cut-off-bottom-5">
				<rect id="Rectangle-Copy-31" fill="#030303" x="0" y="-2.6" width="16" height="10.6"></rect>
				<!-- <rect id="Rectangle-Copy" fill="#030303" x="0" y="5.48275828" width="16" height="15.6"></rect> -->
			</clipPath>
		</defs>
		<g
			id="Settings-MVP-Copy-26-runner-up"
			stroke="none"
			stroke-width="1"
			fill="none"
			fill-rule="evenodd"
		>
			<g id="Apple-TV-Copy" transform="translate(-840.000000, -488.000000)">
				<g id="Group-11" transform="translate(459.500000, 307.052255)">
					<g id="Group-24" transform="translate(381.480372, 181.865906)">
						<g id="Group-23" clip-path="url(#cut-off-bottom-5)">
							<rect id="Rectangle" fill="#030303" x="0" y="8" width="16" height="5.6"></rect>
							<circle id="Oval" fill="#FFCF75" cx="8" cy={3.2 + $sunYellowPosition} r="3.6"
							></circle>
						</g>
						<g
							id="Group-22"
							transform="translate(46.500000, 0.146552)"
							clip-path="url(#cut-off-bottom-4)"
						>
							<circle
								id="Oval-Copy-3"
								fill="#FFA026"
								cx="8"
								cy={3.6 + $sunBrightOrangePosition}
								r="3.94137914"
							></circle>
							<rect id="Rectangle" fill="#030303" x="0" y="6.28275828" width="16" height="15.6"
							></rect>
						</g>
						<g
							id="Group-21"
							transform="translate(93.000000, 0.646552)"
							clip-path="url(#cut-off-bottom-3)"
						>
							<circle
								id="Oval-Copy-4"
								fill="#FF8C1B"
								cx="8"
								cy={3.7 + $sunOrangePosition}
								r="3.94137914"
							></circle>
							<rect id="Rectangle-Copy" fill="#030303" x="0" y="5.48275828" width="16" height="15.6"
							></rect>
						</g>
						<g
							id="Group-20"
							transform="translate(139.500000, 2.646552)"
							clip-path="url(#cut-off-bottom-2)"
						>
							<circle
								id="Oval-Copy-5"
								fill="#FF7115"
								cx="8"
								cy={3 + $sunDarkOrangePosition}
								r="3.94137914"
							></circle>
							<rect
								id="Rectangle-Copy-27"
								fill="#030303"
								x="0"
								y="3.88275828"
								width="16"
								height="15.6"
							></rect>
						</g>
						<g
							id="Group-19"
							transform="translate(186.000000, 3.946552)"
							clip-path="url(#cut-off-bottom-1)"
						>
							<circle id="Oval-Copy-6" fill="#FF4700" cx="8" cy={3 + $sunRedPosition} r="3.94137914"
							></circle>
							<rect
								id="Rectangle-Copy-28"
								fill="#030303"
								x="0"
								y="2.28275828"
								width="16"
								height="15.6"
							></rect>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>
</div>
