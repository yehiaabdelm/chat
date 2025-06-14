<script lang="ts">
	let { href, provider }: { href: string; provider: string } = $props();
</script>

<a
	class="font-gill text-grey-150 hover:text-grey-300 pt-[0.28rem] text-[15px] tracking-[3px] uppercase antialiased transition-colors ease-linear"
	{href}
>
	{provider}
</a>
