<script lang="ts">
	import { Spring } from 'svelte/motion';
	export let scrollContainer: HTMLDivElement | HTMLTextAreaElement; // Add this line to export a bound variable
	export let dependency: any = [];
	let isDragging: boolean = false;
	let lastScrollTop: number = 0;
	let startY: number;
	let startTop: number;
	const minThumbHeight: number = 20; // Minimum thumb height
	let timeout: any;
	const opacity = new Spring(1, { stiffness: 0.1, damping: 0.8 });
	const thumbHeight = new Spring(10, { stiffness: 0.1, damping: 0.8 });
	let thumbTop = 0;

	const updateThumbPosition = () => {
		if (!scrollContainer) return;
		const viewportHeight = scrollContainer.clientHeight;
		const scrollHeight = scrollContainer.scrollHeight;
		// Calculate thumb height only once using Math.max to ensure it does not drop below minThumbHeight
		thumbHeight.set(
			viewportHeight === 0 && scrollHeight === 0
				? 100
				: Math.max((viewportHeight / scrollHeight) * 100, minThumbHeight)
		);
		const scrollTop = scrollContainer.scrollTop;
		const scrollableHeight = scrollHeight - viewportHeight;
		// Calculate thumb top position based on the current scroll position
		thumbTop =
			scrollTop === 0 && scrollableHeight == 0
				? 0
				: (scrollTop / scrollableHeight) * (100 - $thumbHeight);

		if (scrollTop !== lastScrollTop) {
			opacity.set(1); // Show the scrollbar
			lastScrollTop = scrollTop;
			resetFadeOut();
		}
	};

	const resetFadeOut = () => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => opacity.set(0), 5000); // Hide after 2s of inactivity
	};

	const onMouseDown = (event: MouseEvent) => {
		event.stopPropagation(); // Prevent the mousedown event from reaching the container
		isDragging = true;
		startY = event.clientY;
		startTop = thumbTop;
	};

	const onMouseMove = (event: MouseEvent) => {
		if (!isDragging) return;
		const deltaY = event.clientY - startY;
		const scrollableHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
		const newTop =
			startTop + (deltaY / (scrollContainer.scrollHeight * (minThumbHeight / 100))) * 100;
		scrollContainer.scrollTop = (newTop * scrollableHeight) / (100 - $thumbHeight);
		updateThumbPosition();
	};

	const onMouseUp = () => {
		isDragging = false;
	};

	// This is for when the user navigates through the messages. Without it the scrollbar would not update while navigating
	$: if (dependency && scrollContainer) {
		updateThumbPosition();
	}

	$: if (scrollContainer) {
		scrollContainer.addEventListener('scroll', updateThumbPosition);
		// scrollContainer.addEventListener('mousemove', onMouseMove);
		// scrollContainer.addEventListener('mouseup', onMouseUp);
		updateThumbPosition();
	} else {
		opacity.set(0);
	}
</script>

<div
	class="bg-opacity-20 right-4 flex h-[10%] w-1 flex-col justify-start rounded-sm bg-white"
	style:opacity={$opacity}
>
	<button
		class="relative w-full rounded-sm bg-white opacity-75"
		style="height: {$thumbHeight}%; top: {thumbTop}%"
	>
	</button>
</div>
