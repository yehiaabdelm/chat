<script lang="ts">
	import { Spring } from 'svelte/motion';
	import { currentTheme, colors } from '$lib/stores/theme';
	let colorOpacity = colors.map(() => new Spring(1, { stiffness: 0.1, damping: 0.8 }));

	function startHover(index: number) {
		colorOpacity[index].set(0.7);
	}
	function press(index: number) {
		colorOpacity[index].set(0.4);
	}
	function release(index: number) {
		colorOpacity[index].set(1);
	}
	function endHover(index: number) {
		colorOpacity[index].set(1);
	}
	let rotation = new Spring(0, { stiffness: 0.1, damping: 0.7 });
	let currentRotation = 0;
	// const updateUserColor = async (color: string) => {
	// 	const data = new URLSearchParams();
	// 	data.append('chat_settings.color_theme', color);
	// 	await fetch(`${PUBLIC_BASE_URL}/api/user`, {
	// 		method: 'POST',
	// 		body: data
	// 	});
	// };

	const rotateColorWheel = (name: string) => {
		const color = colors.find((c) => c.name === name);
		if (!color) return;
		let rawDifference = color.rotation - currentRotation;
		let diff = ((rawDifference + 180) % 360) - 180;
		if (diff < -180) diff += 360;

		rotation.set(currentRotation + diff);

		// Adjusting the rotation of the color centers
		const adjustment = (diff * Math.PI) / 180;
		colorCenters = colorCenters.map(([x, y]) => {
			const dx = x - 24.5; // center of big circle
			const dy = y - 24.5;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const startingAngle = Math.atan2(dy, dx);
			return [
				24.5 + distance * Math.cos(startingAngle + adjustment),
				24.5 + distance * Math.sin(startingAngle + adjustment)
			];
		});
		currentRotation = currentRotation + diff;

		setTimeout(() => {
			currentTheme.set(color);
		}, 300);
		// updateUserColor(color.name);
	};
	let rotations = $derived(
		`translate(58.552506, 1028.627696) rotate(${rotation.current}) translate(-58.552506, -1028.627696) translate(34.052506, 1004.127696)`
	);

	let colorCenters = colors.map((color) => {
		if (!color?.transform) return [0, 0];
		const matches = color.transform.match(/translate\((\d+\.?\d*), (\d+\.?\d*)\)/);
		if (!matches) return [0, 0];
		return matches.slice(1, 3).map(Number);
	});

	function rotateToNearestColor(
		event: MouseEvent & {
			currentTarget: EventTarget & SVGPathElement;
		}
	) {
		let svg = event.currentTarget.ownerSVGElement || event.currentTarget;
		let pt = (svg as any).createSVGPoint();
		pt.x = event.clientX;
		pt.y = event.clientY;
		pt = pt.matrixTransform((svg as any).getScreenCTM().inverse()); // convert to svg points
		let minDistance = Infinity,
			nearestColorIndex;
		colorCenters.forEach((colorCenter, index) => {
			let distance = Math.hypot(colorCenter[0] - pt.x, colorCenter[1] - pt.y);
			if (distance < minDistance) {
				minDistance = distance;
				nearestColorIndex = index;
			}
		});
		rotateColorWheel(colors[nearestColorIndex!].name);
	}
</script>

<svg
	width="50px"
	height="50px"
	viewBox="0 0 50 50"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
>
	<g
		id="Page-2-Copy-61"
		stroke="none"
		stroke-width="1"
		fill="none"
		fill-rule="evenodd"
		opacity="0.808872768"
	>
		<g id="Apple-TV-Copy" transform="translate(-34.000000, -1004.000000)">
			<g id="Color-wheel" transform={`${rotations}`} class="wheel">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<path
					onclick={(event) => rotateToNearestColor(event)}
					d="M24.5,0.25 C31.1964526,0.25 37.2589526,2.9642737 41.6473394,7.35266056 C46.0357263,11.7410474 48.75,17.8035474 48.75,24.5 C48.75,31.1964526 46.0357263,37.2589526 41.6473394,41.6473394 C37.2589526,46.0357263 31.1964526,48.75 24.5,48.75 C17.8035474,48.75 11.7410474,46.0357263 7.35266056,41.6473394 C2.9642737,37.2589526 0.25,31.1964526 0.25,24.5 C0.25,17.8035474 2.9642737,11.7410474 7.35266056,7.35266056 C11.7410474,2.9642737 17.8035474,0.25 24.5,0.25 Z"
					id="Oval"
					stroke="#000000"
					stroke-width="0.5"
					opacity="0.6"
					fill="black"
				></path>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				{#each colors as color, i (color.name)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<g
						id={color.name}
						class="colorcircle"
						transform={color.transform}
						onmouseenter={() => startHover(i)}
						onmouseleave={() => endHover(i)}
						onmousedown={() => press(i)}
						onmouseup={() => release(i)}
						onclick={() => rotateColorWheel(color.name)}
						style={`opacity: ${colorOpacity[i].current};`}
					>
						<path
							d="M3.40356027,0.25 C4.27439189,0.25 5.06278196,0.602974256 5.63346412,1.17365642 C6.20414628,1.74433858 6.55712053,2.53272865 6.55712053,3.40356027 C6.55712053,4.27439189 6.20414628,5.06278196 5.63346412,5.63346412 C5.06278196,6.20414628 4.27439189,6.55712053 3.40356027,6.55712053 C2.53272865,6.55712053 1.74433858,6.20414628 1.17365642,5.63346412 C0.602974256,5.06278196 0.25,4.27439189 0.25,3.40356027 C0.25,2.53272865 0.602974256,1.74433858 1.17365642,1.17365642 C1.74433858,0.602974256 2.53272865,0.25 3.40356027,0.25 Z"
							id="Oval-Copy"
							stroke="#979797"
							stroke-width="0.5"
							opacity="0.2"
							fill="transparent"
						></path>
						<path
							d="M4.48561966,4.48561966 C4.20869651,4.76254281 3.82613075,4.93382334 3.40356027,4.93382334 C2.98098979,4.93382334 2.59842402,4.76254281 2.32150087,4.48561966 C2.04457772,4.20869651 1.87329719,3.82613075 1.87329719,3.40356027 C1.87329719,2.98098979 2.04457772,2.59842402 2.32150087,2.32150087 C2.59842402,2.04457772 2.98098979,1.87329719 3.40356027,1.87329719 C3.82613075,1.87329719 4.20869651,2.04457772 4.48561966,2.32150087 C4.76254281,2.59842402 4.93382334,2.98098979 4.93382334,3.40356027 C4.93382334,3.82613075 4.76254281,4.20869651 4.48561966,4.48561966 Z"
							id={`Oval-Copy-${color.name}`}
							transform="translate(3.403560, 3.403560) rotate(-180.000000) translate(-3.403560, -3.403560) "
							style={`fill: ${color.color};`}
						></path>
					</g>
				{/each}
			</g>
		</g>
	</g>
</svg>

<style>
	.colorcircle {
		cursor: pointer;
	}
	.wheel {
		cursor: pointer;
		/* pointer-events: bounding-box; */
	}
	svg {
		transform: scale(0.8);
	}
</style>
