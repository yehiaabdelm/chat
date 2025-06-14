<script lang="ts">
	import { spring } from 'svelte/motion';
	export let active: boolean;
	export let confirm: boolean;
	// export let margin: number = 0;
	let r = spring(60, { stiffness: 0.1, damping: 0.8 });
	let g = spring(60, { stiffness: 0.1, damping: 0.8 });
	let b = spring(60, { stiffness: 0.1, damping: 0.8 });

	$: {
		if (confirm) {
			r.set(176);
			g.set(224);
			b.set(107);
		} else if (active) {
			r.set(226);
			g.set(171);
			b.set(121);
		} else {
			r.set(60);
			g.set(60);
			b.set(60);
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg width="4px" height="8px" viewBox="0 0 4 3">
	<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
		<g transform="translate(-814.000000, -362.000000)" fill="rgb({$r}, {$g}, {$b})">
			<circle id="Oval-Copy-63" cx="815.90303" cy="363.495272" r="1.5" />
		</g>
	</g>
</svg>
