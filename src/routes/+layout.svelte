<script lang="ts">
	import '../app.css';
	import { currentTheme } from '$lib/stores/theme';
	let { children } = $props();

	$effect(() => {
		document.documentElement.style.setProperty(
			'--theme-color',
			`${$currentTheme.backgroundColor.r}, ${$currentTheme.backgroundColor.g}, ${$currentTheme.backgroundColor.b}`
		);
		document.documentElement.style.setProperty(
			'--sidebar-color',
			`${$currentTheme.sidebarColor.r}, ${$currentTheme.sidebarColor.g}, ${$currentTheme.sidebarColor.b}`
		);
	});
</script>

<div class="h-dvh w-full bg-[rgb(var(--theme-color))]" style:transition="background-color 1s ease">
	{@render children()}
</div>

<style>
	:global(body) {
		background-color: rgb(var(--theme-color));
		transition: background-color 1s ease;
	}
</style>
