<script lang="ts">
	import TextIcon from './TextIcon.svelte';
	let {
		onclick,
		disabled = false,
		status
	}: {
		onclick: () => void;
		disabled?: boolean;
		status?: boolean;
	} = $props();
</script>

<TextIcon {onclick} children={icon} text={status ? 'copied' : 'copy'} {disabled} />

{#snippet icon()}
	<svg
		class="h-[0.7em] w-[0.7em]"
		viewBox="0 0 12 13"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g
			id="Orange-and-dark-green-Copy"
			stroke="none"
			stroke-width="1.32"
			fill="none"
			fill-rule="evenodd"
			opacity="0.48"
		>
			<path
				d="M6.85103434,0.5 C7.04706257,0.5 7.22795928,0.564931165 7.37319171,0.674675582 C7.52198017,0.787107107 7.63368076,0.946228052 7.68581036,1.13047243 C8.64093835,1.49430007 9.05279298,1.65707432 9.34611842,1.9313936 C9.63496765,2.2015267 9.80536024,2.57806219 9.80536024,2.99422307 L9.80536024,9.3 C9.80536024,9.71421356 9.63746702,10.0892136 9.36602041,10.3606602 C9.0945738,10.6321068 8.7195738,10.8 8.30536024,10.8 L2,10.8 C1.58578644,10.8 1.21078644,10.6321068 0.939339828,10.3606602 C0.667893219,10.0892136 0.5,9.71421356 0.5,9.3 L0.5,2.99422307 C0.5,2.58000951 0.667893219,2.20500951 0.939339828,1.9335629 C1.21078644,1.66211629 1.58578644,1.49422307 2,1.49422307 C2.55691099,0.998389951 2.7120209,0.807001192 2.90281675,0.67530008 C3.06002586,0.566782965 3.24213581,0.5 3.44033431,0.5 Z"
				id="Combined-Shape"
				stroke="#FFFFFF"
			></path>
			<rect
				id="Rectangle-Copy-2"
				stroke="#FFFFFF"
				x="2.56977432"
				y="0.5"
				width="5.16581159"
				height="2.7479149"
				rx="0.867395744"
			></rect>
		</g></svg
	>
{/snippet}
