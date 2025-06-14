<script lang="ts">
	import { Spring } from 'svelte/motion';

	const motion = new Spring(180, { stiffness: 0.05, damping: 0.7 });

	setTimeout(() => {
		motion.set(0);
	}, 200);
</script>

<svg class="w-4" viewBox="0 0 256 256"
	><rect width="256" height="256" fill="none" /><rect
		x="40"
		y="88"
		width="176"
		height="128"
		rx="20"
		fill="#C7C7CC"
		stroke="#C7C7CC"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="0"
	/>
	<g style="transform: rotateY({$motion}deg); transform-origin: 88px 88px;">
		<path
			d="M88,88V56a40,40,0,0,1,80,0V88"
			fill="none"
			stroke="#C7C7CC"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="28"
		/></g
	></svg
>
