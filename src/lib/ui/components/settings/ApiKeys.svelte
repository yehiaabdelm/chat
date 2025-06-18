<script lang="ts">
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import OpenAI from '$lib/ui/logos/OpenAI.svelte';
	import Anthropic from '$lib/ui/logos/Anthropic.svelte';
	import { page } from '$app/state';
	import { Spring } from 'svelte/motion';
	import { invalidate, invalidateAll } from '$app/navigation';

	let providers = {
		OpenAI: {
			provider: 'openai',
			key: '',
			placeholder: 'sk-oHvZWhrvMi8GifAJ...'
		},
		Anthropic: { provider: 'anthropic', key: '', placeholder: 'sk-ant-api03-9y3irFHL...' }
	};

	let edited = $state(false);
	let saving = $state(false);

	// Create spring animation for breathing effect
	const breathe = new Spring(1, { stiffness: 0.1, damping: 0.8 });

	const pulse = () => {
		breathe.set(0.5);
		setTimeout(() => {
			breathe.set(0.9);
		}, 1000);
	};

	// Define breathingInterval at the script level
	let breathingInterval: ReturnType<typeof setInterval> | null = null;

	function handleSave() {
		saving = true;
		edited = false;

		// Store the keys to clear them after submission
		const openaiKey = providers.OpenAI.key;
		const anthropicKey = providers.Anthropic.key;

		// Clear any existing interval
		if (breathingInterval) {
			clearInterval(breathingInterval);
		}

		// Start breathing animation
		pulse();
		breathingInterval = setInterval(pulse, 1000);

		// Simulate API call (replace with actual form submission logic)
		setTimeout(async () => {
			// Clear the inputs after successful save
			providers.OpenAI.key = '';
			providers.Anthropic.key = '';

			// Stop the saving state
			saving = false;

			// Clear the breathing interval
			if (breathingInterval) {
				clearInterval(breathingInterval);
				breathingInterval = null;
			}
			await invalidate('reload:user');
		}, 3000);
	}

	// Function to track if any key has been edited
	function updateEdited() {
		edited = providers.OpenAI.key !== '' || providers.Anthropic.key !== '';
	}

	const getLogo = (providerName: string) => {
		switch (providerName) {
			case 'openai':
				return OpenAI;
			case 'anthropic':
				return Anthropic;
			default:
				return OpenAI;
		}
	};

	// Check if API keys are initialized
	let hasOpenAI = $derived(page.data.user?.api_keys?.openai || false);
	let hasAnthropic = $derived(page.data.user?.api_keys?.anthropic || false);
</script>

<form
	action="{PUBLIC_BASE_URL}/api/user"
	target="dummyframe"
	method="post"
	class="flex items-center gap-3 max-sm:flex-col max-sm:items-start max-sm:gap-2"
	onsubmit={handleSave}
>
	<div class="flex flex-col">
		<div class="flex w-full gap-4">
			{#each Object.entries(providers) as [provider, data]}
				<div class="flex items-center">
					<svelte:component this={getLogo(data.provider)} />
					<div class="relative flex-grow pb-1">
						<input
							type="password"
							id="{provider.toLowerCase()}-key"
							name="api_keys.{provider.toLowerCase()}"
							bind:value={data.key}
							oninput={updateEdited}
							placeholder={(provider === 'OpenAI' && hasOpenAI) ||
							(provider === 'Anthropic' && hasAnthropic)
								? '••••••••••••••••••'
								: data.placeholder}
							class="font-untitled text-grey-200 placeholder:text-grey-450 w-full rounded bg-transparent px-3 text-sm focus:outline-none"
						/>
					</div>
				</div>
			{/each}
			<button
				type="submit"
				style="opacity: {breathe.current};"
				disabled={saving || !edited}
				class="font-untitled text-grey-100 bg-transparent text-sm antialiased transition-colors
				duration-500
					{saving ? 'text-grey-100' : edited ? 'text-grey-100' : 'text-grey-450'}
					hover:text-grey-100 disabled:hover:text-grey-450"
			>
				{saving ? 'Saving...' : 'Save'}
			</button>
		</div>
	</div>
</form>
