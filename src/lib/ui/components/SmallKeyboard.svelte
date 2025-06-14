<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { spring } from 'svelte/motion';
	import { writable } from 'svelte/store';
	import { keys } from '$lib/ui/utils/keyboard';

	const keyGroups: {
		[key: string]: string[];
	} = {
		"K-L-;-'-key": ['K-key', 'L-key', ';-key', `'-key`],
		'I-O-P-[-]-\\-key': ['I-key', 'O-key', 'P-key', '[-key', ']-key', '\\-key'],
		',-.-/-key': [',-key', '.-key', '/-key']
	};

	let keyStates = writable({});

	// Create a map to hold the springs for each key
	const keySprings = new Map();

	// Initialize keyStates with default opacities and create springs
	keys.forEach(({ id }) => {
		const keySpring = spring(0.7, { stiffness: 0.1, damping: 0.5 });
		keySprings.set(id, keySpring);
		keyStates.update((currentStates) => ({ ...currentStates, [id]: 1 }));
		const unsubscribe = keySpring.subscribe((value) => {
			keyStates.update((currentStates) => ({ ...currentStates, [id]: value }));
		});
		onDestroy(() => unsubscribe()); // Ensure subscriptions are cleaned up
	});

	let pressedKeys = new Set();
	let timeoutId: any;

	function setKeyOpacity(keyId: string, opacity: number) {
		const keySpring = keySprings.get(keyId);
		if (keySpring) {
			keySpring.set(opacity);
		}
	}

	function handleKeydown(event: any) {
		let pressedKey = event?.key?.toUpperCase() + '-key';
		for (const key in keyGroups) {
			if (keyGroups[key].includes(pressedKey)) {
				pressedKey = key;
			}
		}

		// Set bright opacity for the pressed key
		setKeyOpacity(pressedKey, 1);

		pressedKeys.add(pressedKey);

		// Dim all other keys and handle the BORDER-key exception
		keys.forEach(({ id }) => {
			if (!pressedKeys.has(id)) {
				const targetOpacity = id === 'BORDER-key' ? 0.1 : 0.4;
				setKeyOpacity(id, targetOpacity);
			} else if (id !== pressedKey) {
				// Keep the previously pressed keys a bit brighter
				setKeyOpacity(id, 0.7);
			}
		});

		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			// After 2 seconds, reset the opacities for all keys
			keys.forEach(({ id }) => {
				const targetOpacity = 0.7; // Reset all keys to full opacity
				setKeyOpacity(id, targetOpacity);
			});
			pressedKeys.clear(); // Clear all remembered key states
		}, 4000);
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	// Ensure reactivity for opacity values
	$: if ($keyStates) {
	}

	function highlightEnterKey() {
		keys.forEach(({ id }) => {
			const opacity = id === 'ENTER-key' ? 1 : id.includes('BORDER-key') ? 0.2 : 0.4;
			setKeyOpacity(id, opacity); // Highlight ENTER-key, keep BORDER-key's opacity at 0.2, dim others
		});
	}

	function resetKeyHighlight() {
		keys.forEach(({ id }) => {
			setKeyOpacity(id, 0.7); // Reset all keys to full opacity
		});
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<svg
	width="37px"
	height="27px"
	viewBox="0 0 49 27"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	on:mouseover={highlightEnterKey}
	on:mouseout={resetKeyHighlight}
>
	<g
		id="Page-2-Copy-43"
		stroke="none"
		stroke-width="1"
		fill="#FCFCFC"
		fill-rule="evenodd"
		opacity="0.9"
	>
		<g id="Apple-TV-Copy" fill-rule="nonzero">
			{#each keys as { id, transform, pathD }}
				<g id="{id}-key" {transform} fill="#FCFCFC" opacity={$keyStates[id]}>
					<path d={pathD} />
				</g>
			{/each}
		</g>
	</g>
</svg>

<style>
	svg {
		cursor: pointer;
	}
</style>
