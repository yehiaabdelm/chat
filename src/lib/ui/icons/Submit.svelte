<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let {
		disabled = false,
		text = 'submit',
		onclick
	}: { disabled?: boolean; text: string; onclick: () => void } = $props();
</script>

<TextIcon children={icon} {text} {disabled} {onclick} type="submit" />

{#snippet icon()}
	<svg
		width="12px"
		height="10px"
		viewBox="0 0 12 10"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square">
			<g transform="translate(-530.000000, -351.000000)" class="stroke-grey-300" stroke-width="1.2">
				<g id="Group-12" transform="translate(530.011544, 348.520177)">
					<g id="Group-14" transform="translate(0.859486, 4.184684)">
						<line x1="9.88579862" y1="0" x2="3.30798067" y2="6.57781795" id="Line-2-Copy-12"></line>
						<line x1="3.30798067" y1="6.57781795" x2="0" y2="3.26983727" id="Line-2-Copy-11"></line>
					</g>
				</g>
			</g>
		</g>
	</svg>
{/snippet}
