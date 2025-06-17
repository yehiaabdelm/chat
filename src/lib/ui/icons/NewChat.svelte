<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let {
		active = false,
		height = '0.8rem',
		width = '0.8rem',
		href = '',
		text = ''
	}: { active: boolean; href: string; text: string; height?: string; width?: string } = $props();
</script>

<TextIcon children={icon} {text} {href} {active} />

{#snippet icon()}
	<svg
		{height}
		{width}
		viewBox="0 0 14 13"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g
			id="Models-at-the-bottom"
			stroke="none"
			stroke-width="1"
			fill="none"
			fill-rule="evenodd"
			stroke-linecap="square"
		>
			<g transform="translate(-19.000000, -23.000000)" class="stroke-grey-300">
				<g transform="translate(20.500000, 24.264161)">
					<line x1="0.5" y1="5.49481608" x2="11" y2="5.49740804"></line>
					<g
						id="Group-8-Copy"
						transform="translate(5.497408, 5.497408) rotate(-270.000000) translate(-5.497408, -5.497408) "
					>
						<g
							id="Group-3"
							transform="translate(5.497408, 5.497408) rotate(-45.000000) translate(-5.497408, -5.497408) translate(1.598915, 1.621392)"
						>
							<line
								x1="3.86645296"
								y1="2.97366567e-14"
								x2="3.86645296"
								y2="7.75203279"
								id="Line-2-Copy-5"
							></line>
							<line
								x1="7.79698522"
								y1="3.71278798"
								x2="8.18183567e-14"
								y2="3.71278798"
								id="Line-2-Copy-4"
							></line>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>
{/snippet}
