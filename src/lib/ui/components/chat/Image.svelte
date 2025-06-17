<script lang="ts">
	let { src, alt }: { src: string; alt: string } = $props();
</script>

<img
	{src}
	{alt}
	class="h-full w-full object-cover"
	style="opacity: 1; -webkit-transition: opacity 2s ease-in-out;"
/>
