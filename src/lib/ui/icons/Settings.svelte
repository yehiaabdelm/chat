<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let { disabled = false } = $props();
</script>

<TextIcon text="settings" {disabled} children={icon} />

{#snippet icon()}
	<svg
		class="h-[1em] w-[0.72em]"
		viewBox="1 1 15 15"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g
			id="Stars-collections"
			stroke="none"
			stroke-width="1"
			fill="none"
			fill-rule="evenodd"
			opacity="0.55"
			stroke-linecap="square"
		>
			<g
				id="Apple-TV-Copy"
				transform="translate(-227.000000, -47.000000)"
				stroke="white"
				stroke-width="1.7"
			>
				<g id="Group-18" transform="translate(229.133821, 48.398034)">
					<g
						id="Group-10"
						transform="translate(7.103689, 7.168111) rotate(-255.000000) translate(-7.103689, -7.168111) translate(1.231698, 1.387227)"
					>
						<line
							x1="6.84169871"
							y1="1.31349947"
							x2="5.00898803"
							y2="0.822426119"
							id="Line-3-Copy-23"
							transform="translate(5.925343, 1.067963) rotate(255.000000) translate(-5.925343, -1.067963) "
						></line>
						<line
							x1="10.1821578"
							y1="3.79896866"
							x2="9.41043124"
							y2="2.06564249"
							id="Line-3-Copy-23"
							transform="translate(9.796295, 2.932306) rotate(255.000000) translate(-9.796295, -2.932306) "
						></line>
						<line
							x1="10.3066794"
							y1="7.95793991"
							x2="11.1974368"
							y2="6.28266895"
							id="Line-3-Copy-23"
							transform="translate(10.752058, 7.120304) rotate(255.000000) translate(-10.752058, -7.120304) "
						></line>
						<line
							x1="7.14192957"
							y1="10.6604356"
							x2="9.00443141"
							y2="10.2984019"
							id="Line-3-Copy-23"
							transform="translate(8.073180, 10.479419) rotate(255.000000) translate(-8.073180, -10.479419) "
						></line>
						<line
							x1="3.06152771"
							y1="9.85702809"
							x2="4.49348478"
							y2="11.1018094"
							id="Line-3-Copy-23"
							transform="translate(3.777506, 10.479419) rotate(255.000000) translate(-3.777506, -10.479419) "
						></line>
						<line
							x1="1.13173711"
							y1="6.17220148"
							x2="1.06552014"
							y2="8.06840738"
							id="Line-3-Copy-23"
							transform="translate(1.098629, 7.120304) rotate(255.000000) translate(-1.098629, -7.120304) "
						></line>
						<line
							x1="2.82189117"
							y1="2.37468496"
							x2="1.2868933"
							y2="3.48992619"
							id="Line-3-Copy-23"
							transform="translate(2.054392, 2.932306) rotate(255.000000) translate(-2.054392, -2.932306) "
						></line>
					</g>
				</g>
			</g>
		</g>
	</svg>
{/snippet}
