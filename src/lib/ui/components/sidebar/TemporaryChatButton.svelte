<script lang="ts">
	import { Spring } from 'svelte/motion';
	import { onMount } from 'svelte';

	let {
		generationsRatio,
		sunOpacity,
		temporary,
		updatedAtString,
		onclick
	}: {
		generationsRatio: number;
		sunOpacity: number;
		temporary: boolean;
		updatedAtString: string;
		onclick: () => void;
	} = $props();

	let intervalId: NodeJS.Timeout;

	let temporaryChatsThreshold = 12;

	const getProgress = (updatedAt: Date) => {
		return Math.abs(Date.now() - updatedAt.getTime()) / 3600000 / temporaryChatsThreshold; // hours since the chat was last updated
	};

	const updatedAt = new Date(updatedAtString);

	const sunsetColors = [
		{ red: 255, green: 207, blue: 117 },
		{ red: 255, green: 160, blue: 38 },
		{ red: 255, green: 140, blue: 27 },
		{ red: 255, green: 113, blue: 21 },
		{ red: 255, green: 71, blue: 0 }
	];

	let progress = getProgress(updatedAt); // hours since the chat was last updated

	const sunAltitudeDefault = 6;
	const sunSizeDefault = 3;
	const opacity = new Spring(temporary ? sunOpacity : generationsRatio, {
		stiffness: 0.1,
		damping: 0.5
	});
	const sunSize = new Spring(sunSizeDefault, { stiffness: 0.1, damping: 0.8 });

	// Interpolate the color based on the progress
	const interpolateColor = (
		color1: { red: number; green: number; blue: number },
		color2: { red: number; green: number; blue: number },
		t: number
	) => {
		const r = Math.round(color1.red + (color2.red - color1.red) * t);
		const g = Math.round(color1.green + (color2.green - color1.green) * t);
		const b = Math.round(color1.blue + (color2.blue - color1.blue) * t);
		return { red: r, green: g, blue: b };
	};

	let colorIndex = Math.min(Math.floor(progress * (sunsetColors.length - 1)), 3);
	let colorProgress = progress * (sunsetColors.length - 1) - colorIndex;
	let initialColor =
		colorIndex === sunsetColors.length - 1
			? sunsetColors[colorIndex]
			: interpolateColor(sunsetColors[colorIndex], sunsetColors[colorIndex + 1], colorProgress);

	const red = new Spring(initialColor.red, { stiffness: 0.1, damping: 0.8 });
	const green = new Spring(initialColor.green, { stiffness: 0.1, damping: 0.8 });
	const blue = new Spring(initialColor.blue, { stiffness: 0.1, damping: 0.8 });

	// Interpolate the sun altitude based on the progress
	let initialAltitude = sunAltitudeDefault - progress * (sunAltitudeDefault - 9.5);
	const sunAltitude = new Spring(initialAltitude, {
		stiffness: 0.1,
		damping: 0.8
	});

	function turnOff() {
		sunAltitude.set(sunAltitudeDefault);
		red.set(255);
		green.set(255);
		blue.set(255);
		opacity.set(generationsRatio);
		sunSize.set(sunSizeDefault);
		temporary = false;
		// clearInterval(intervalId);
	}

	// const updateSun = () => {
	// 	progress = Math.min(getProgress(updatedAt), 1);
	// 	colorIndex = Math.min(Math.floor(progress * (sunsetColors.length - 1)), 3);
	// 	colorProgress = progress * (sunsetColors.length - 1) - colorIndex;
	// 	initialColor =
	// 		colorIndex === sunsetColors.length - 1
	// 			? sunsetColors[colorIndex]
	// 			: interpolateColor(sunsetColors[colorIndex], sunsetColors[colorIndex + 1], colorProgress);

	// 	red.set(initialColor.red);
	// 	green.set(initialColor.green);
	// 	blue.set(initialColor.blue);

	// 	initialAltitude = sunAltitudeDefault - progress * (sunAltitudeDefault - 9.5);
	// 	sunAltitude.set(initialAltitude);
	// };

	// const sunset = () => {
	// 	temporary = true;
	// 	opacity.set(1);
	// 	updateSun();
	// 	intervalId = setInterval(updateSun, 1000);
	// };

	// onMount(() => {
	// 	if (temporary) {
	// 		sunset();
	// 	} else {
	// 		turnOff();
	// 	}
	// 	return () => {
	// 		clearInterval(intervalId);
	// 	};
	// });

	function toggleSunsetMode() {
		temporary ? turnOff() : () => {};
	}

	function pressDown() {
		sunSize.set(2);
	}

	function release() {
		sunSize.set(3);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<button
	onmousedown={pressDown}
	onmouseup={release}
	onclick={() => {
		toggleSunsetMode();
		onclick();
	}}
	class="flex h-4 w-4 items-center justify-center"
>
	<svg width="16" height="12" style="cursor: pointer;">
		<defs>
			<clipPath id="cut-off-bottom">
				<rect x="0" y="1" width="16" height="8" fill="black" />
			</clipPath>
		</defs>
		<g transform="translate(0, 0)" clip-path="url(#cut-off-bottom)">
			<circle
				cx="6"
				cy={sunAltitude.current}
				r={sunSize.current}
				fill="rgb({red.current}, {green.current}, {blue.current})"
				opacity={opacity.current}
			/>
		</g>
	</svg>
</button>
