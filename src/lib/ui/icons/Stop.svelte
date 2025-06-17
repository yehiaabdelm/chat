<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let { text = 'stop', onclick }: { text?: string; onclick: () => void } = $props();
</script>

{#snippet icon()}
	<svg
		class="h-[0.43em] w-[0.43em]"
		viewBox="0 0 8 8"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g id="Dark-mode-Copy" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
			<g
				id="Apple-TV-Copy"
				transform="translate(-726.000000, -352.000000)"
				fill="#858585"
				stroke="#858585"
			>
				<g id="Group-10-Copy-7" transform="translate(726.419325, 348.520177)">
					<rect id="Rectangle" x="0.5" y="4.01294727" width="5.97410545" height="5.97410545"></rect>
				</g>
			</g>
		</g>
	</svg>
{/snippet}

<TextIcon {onclick} children={icon} {text} />
