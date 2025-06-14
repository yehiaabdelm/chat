<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let { text = 'edit', onclick }: { text?: string; onclick?: () => void } = $props();
</script>

<TextIcon children={icon} {text} {onclick} />

{#snippet icon()}
	<svg
		class="h-[0.75em] w-[0.75em]"
		viewBox="0 0 13 14"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g
			id="Embedding-version-small-Copy-17"
			stroke="none"
			stroke-width="1"
			fill="none"
			fill-rule="evenodd"
		>
			<g
				transform="translate(-1048.000000, -388.000000)"
				class="stroke-grey-300"
				stroke-width="1.13378731"
			>
				<g transform="translate(1049.011544, 389.520177)">
					<circle />
					<path
						d="M5.55831302,2.17886344 L8.82111706,5.44166743 L5.55831302,2.17886344 Z M10.7271504,1.67544374 C11.0906614,2.03895473 11.0961949,2.6227889 10.723041,2.99594287 L3.78598545,9.93299842 C3.77690239,9.94208147 3.76565436,9.94869985 3.75330322,9.95222875 L0.0963508442,10.9970723 C0.0562121264,11.0085405 0.0143764493,10.9852985 0.0029082441,10.9451597 C-0.000969414685,10.9315879 -0.000969414701,10.9172015 0.00290824406,10.9036297 L1.04775178,7.24667732 C1.05128068,7.23432618 1.05789906,7.22307815 1.06698211,7.21399509 L8.00403764,0.276939525 L8.00403764,0.276939525 C8.36981818,-0.088841021 8.95732293,-0.0943837529 9.32453676,0.272830118 L10.7271504,1.67544374 Z"
						id="Shape"
					></path>
				</g>
			</g>
		</g>
	</svg>
{/snippet}
