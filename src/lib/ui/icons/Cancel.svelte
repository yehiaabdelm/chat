<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let { text = 'cancel', onclick }: { text?: string; onclick?: () => void } = $props();
</script>

<TextIcon children={icon} {text} {onclick} />

{#snippet icon()}
	<svg
		width="9px"
		height="9px"
		viewBox="0 0 9 9"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square">
			<g
				transform="translate(-629.000000, -351.000000)"
				class="stroke-grey-300"
				stroke-width="1.134"
			>
				<g transform="translate(630.589389, 348.520177)">
					<g transform="translate(0.000000, 3.999764)">
						<line x1="6.21603796" y1="0.0360455159" x2="0" y2="6.25208347"></line>
						<line x1="6.37465112" y1="6.25208347" x2="0.122567641" y2="0"></line>
					</g>
				</g>
			</g>
		</g>
	</svg>
{/snippet}
