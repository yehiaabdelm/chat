<script lang="ts">
	import Link from '$lib/ui/components/Link.svelte';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import SmallKeyboard from '$lib/ui/components/SmallKeyboard.svelte';
	import TeletypedSmall from '$lib/ui/logos/TeletypedSmall.svelte';
	import { Spring } from 'svelte/motion';

	let speed = 0.6;
	let slowStiffness = 0.1 * speed;
	let fastStiffness = 0.3 * speed;

	let fastDamping = 0.8 * speed;
	let slowDamping = 0.8 * speed;
	let pageTitleOpacity = new Spring(1, { stiffness: fastStiffness, damping: fastDamping });
	let teletypedOpacity = new Spring(0, { stiffness: slowStiffness, damping: slowDamping });

	function switchToTeletyped(toggle: boolean) {
		if (toggle) {
			// pageTitleOpacity = new Spring(0, { stiffness: slowStiffness, damping: slowDamping });
			// teletypedOpacity = new Spring(1, { stiffness: fastStiffness, damping: fastDamping });
			pageTitleOpacity.set(toggle ? 1 : 0);
			teletypedOpacity.set(toggle ? 0 : 1);
		} else {
			// pageTitleOpacity = new Spring(1, { stiffness: fastStiffness, damping: fastDamping });
			// teletypedOpacity = new Spring(0, { stiffness: slowStiffness, damping: slowDamping });
			pageTitleOpacity.set(toggle ? 1 : 0);
			teletypedOpacity.set(toggle ? 0 : 1);
		}
	}

	switchToTeletyped(false);

	setTimeout(() => {
		switchToTeletyped(true);
	}, 500);
</script>

<svelte:head>
	<title>Teletyped | Login</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-72 pt-3 pr-4 pl-4 antialiased">
	<button
		onmouseenter={() => {
			switchToTeletyped(false);
		}}
		onmouseleave={() => {
			switchToTeletyped(true);
		}}
		class="sticky top-0 flex w-full cursor-pointer items-center gap-2 drop-shadow-[0_3px_3px_rgba(5,5,5,1)]"
	>
		<div class="w-[0.85rem]">
			<TeletypedSmall />
		</div>
		<div class="relative z-0 text-xs">
			<h1
				class="text-grey-100 font-gill tracking-[3px] uppercase antialiased"
				style="opacity: {pageTitleOpacity.current};"
			>
				login
			</h1>
			<div class="justify-left absolute inset-0 z-10 flex items-center">
				<h1
					class="text-grey-100 font-gill tracking-[3px] uppercase antialiased"
					style="opacity: {teletypedOpacity.current};"
				>
					Teletyped
				</h1>
			</div>
		</div>
	</button>
	<div class="flex justify-between gap-2">
		<!-- <div class="hidden sm:block">
			<SmallKeyboard />
		</div> -->
		<div class="flex flex-col gap-5">
			<div class="flex flex-col gap-1.5">
				<p class="font-gill text-grey-300 text-sm tracking-[3px] uppercase antialiased">
					CONTINUE WITH
				</p>
				<div class="flex flex-col">
					<Link href="{PUBLIC_BASE_URL}/oauth?provider=google" provider="google" />
				</div>
			</div>
			<div class="text-grey-450 w-auto text-xs antialiased">
				By continuing, you agree to our <br /><a
					class="text-grey-400 hover:text-grey-200 break-words transition-colors ease-linear"
					href="https://teletyped.com/terms"
				>
					terms of service
				</a>
				and
				<a
					class="text-grey-400 hover:text-grey-200 break-words transition-colors ease-linear"
					href="https://teletyped.com/privacy"
				>
					privacy policy
				</a>
			</div>
		</div>
	</div>
</div>
