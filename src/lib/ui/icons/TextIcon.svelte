<script lang="ts">
	import { Spring } from 'svelte/motion';
	let {
		children,
		onclick,
		onmousedown,
		onmouseup,
		onmouseenter,
		onmouseleave,
		href,
		type = 'button',
		text = 'new',
		disabled = false,
		active = false,
		textColor = undefined,
		initialOpacity = 0.5
	}: {
		children: () => any;
		onclick?: () => void;
		onmousedown?: () => void;
		onmouseup?: () => void;
		onmouseenter?: () => void;
		onmouseleave?: () => void;
		href?: string;
		type?: 'button' | 'reset' | 'submit';
		text?: string;
		disabled?: boolean;
		active?: boolean;
		textColor?: string;
		initialOpacity?: number;
	} = $props();
	let activeOpacity = 0.95;
	let opacity = new Spring(initialOpacity, { stiffness: 0.1, damping: 0.8 });
	let clicked = false;

	$effect(() => {
		opacity.set(active ? activeOpacity : initialOpacity);
	});

	async function hoverStart() {
		if (!clicked) {
			opacity.set(activeOpacity);
		}
	}

	function hoverEnd() {
		if (!clicked && !active) {
			opacity.set(initialOpacity);
		}
	}

	async function mouseDown() {
		clicked = true;
		opacity.set(0.5);
	}

	function mouseUp() {
		if (!clicked) {
			hoverStart();
		}
	}

	function reset() {
		clicked = false;
		opacity.set(activeOpacity);
	}

	function typeAction(node: HTMLButtonElement) {
		(node as any).type = type;
	}
</script>

{#if href}
	<a
		{href}
		class="flex cursor-pointer items-center justify-center gap-2 truncate"
		onmouseenter={() => {
			hoverStart();
			onmouseenter?.();
		}}
		onmouseleave={() => {
			hoverEnd();
			onmouseleave?.();
		}}
		onmousedown={() => {
			mouseDown();
			onmousedown?.();
		}}
		onmouseup={() => {
			mouseUp();
			onmouseup?.();
		}}
		onclick={() => {
			reset();
			onclick?.();
		}}
		style="opacity: {opacity.current};"
	>
		{@render children()}
		<p
			class="font-gill uppercase {textColor
				? 'text-[rgb(205,86,39)]'
				: 'text-grey-300'} text-xs tracking-[3px] antialiased"
		>
			{text}
		</p>
	</a>
{:else}
	<button
		use:typeAction
		class="flex cursor-pointer items-center justify-center gap-2 truncate"
		{disabled}
		onmouseenter={() => {
			hoverStart();
			onmouseenter?.();
		}}
		onmouseleave={() => {
			hoverEnd();
			onmouseleave?.();
		}}
		onmousedown={() => {
			mouseDown();
			onmousedown?.();
		}}
		onmouseup={() => {
			mouseUp();
			onmouseup?.();
		}}
		onclick={() => {
			reset();
			onclick?.();
		}}
		style="opacity: {opacity.current};"
	>
		{@render children()}
		<p
			class="font-gill uppercase {textColor
				? 'text-[rgb(205,86,39)]'
				: 'text-grey-300'} pb-0.5 text-xs tracking-[3px] antialiased"
		>
			{text}
		</p>
	</button>
{/if}
