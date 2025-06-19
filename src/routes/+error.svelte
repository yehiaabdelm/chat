<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex h-screen items-center justify-center">
	<div
		class="font-gill text-grey-100 flex flex-col items-center gap-2 text-xl tracking-[3px] uppercase antialiased"
	>
		<p>{page.status}</p>
		<p>{page.error?.message}</p>
		<a
			class="text-grey-200 hover:text-grey-300 mt-2 text-xs tracking-[3px] uppercase transition-colors ease-linear"
			href="/">Go back home</a
		>
	</div>
</div>
