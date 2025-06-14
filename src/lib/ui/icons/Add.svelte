<script lang="ts">
	let {
		disabled = false,
		text = 'new',
		type = 'button'
	}: { disabled: boolean; text: string; type: 'submit' | 'reset' | 'button' } = $props();
	import TextIcon from './TextIcon.svelte';
</script>

<TextIcon children={icon} {type} {text} {disabled} />

{#snippet icon()}
	<svg
		class="h-[0.6rem] w-[0.6rem]"
		viewBox="0 0 9 9"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		style="margin-top: 1.5px;"
	>
		<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
			<g transform="translate(-53.000000, -696.000000)" class="fill-grey-300">
				<g transform="translate(53.500000, 696.000000)">
					<rect id="Rectangle" x="3.5" y="0" width="1" height="8"></rect>
					<rect
						id="Rectangle"
						transform="translate(4.000000, 4.000000) rotate(90.000000) translate(-4.000000, -4.000000) "
						x="3.5"
						y="0"
						width="1"
						height="8"
					></rect>
				</g>
			</g>
		</g>
	</svg>
{/snippet}
