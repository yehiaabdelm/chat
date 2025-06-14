<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let {
		disabled = false,
		text = 'continue',
		onclick
	}: { disabled: boolean; text: string; onclick?: () => void } = $props();
</script>

<TextIcon children={icon} {disabled} {text} {onclick} />

{#snippet icon()}
	<svg
		class="h-[0.75em] w-[0.75em]"
		viewBox="0 0 12 9"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g
			stroke="none"
			stroke-width="1"
			fill="none"
			fill-rule="evenodd"
			opacity="0.545974702"
			stroke-linecap="square"
		>
			<g
				transform="translate(-530.000000, -370.000000)"
				class=" stroke-grey-100"
				stroke-width="1.2"
			>
				<g id="Group-12-Copy-3" transform="translate(530.893331, 367.520177)">
					<g id="Continue-Generating" transform="translate(0.000000, 3.384854)">
						<g
							transform="translate(5.224874, 3.751948) rotate(-270.000000) translate(-5.224874, -3.751948) translate(1.472926, -1.472926)"
						>
							<g
								transform="translate(3.751948, 5.224874) rotate(-90.000000) translate(-3.751948, -5.224874) translate(-1.472926, 1.472926)"
							>
								<line
									x1="4.18781274"
									y1="3.84236217"
									x2="0.879832065"
									y2="0.534381498"
									id="Line-2-Copy-4"
								></line>
								<line
									x1="4.18781274"
									y1="3.84236217"
									x2="0.879832065"
									y2="7.15034285"
									id="Line-2-Copy-6"
								></line>
								<line
									x1="9.68781274"
									y1="3.84236217"
									x2="6.37983206"
									y2="0.534381498"
									id="Line-2-Copy-8"
								></line>
								<line
									x1="9.68781274"
									y1="3.84236217"
									x2="6.37983206"
									y2="7.15034285"
									id="Line-2-Copy-7"
								></line>
							</g>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>
{/snippet}
