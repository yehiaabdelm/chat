<script lang="ts">
	import OpenAI from '$lib/ui/logos/OpenAI.svelte';
	import Anthropic from '$lib/ui/logos/Anthropic.svelte';
	import { Spring } from 'svelte/motion';
	import { invalidateAll } from '$app/navigation';

	let {
		endpoints
	}: {
		endpoints: {
			id: string;
			name: string;
			apiKey: boolean;
		}[];
	} = $props();

	// Create local state for API keys
	let apiKeys = $state<Record<string, string>>({});
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

	async function handleSubmit(event: Event) {
		event.preventDefault();
		saving = true;
		edited = false;

		// Clear any existing interval
		if (breathingInterval) {
			clearInterval(breathingInterval);
		}

		// Start breathing animation
		pulse();
		breathingInterval = setInterval(pulse, 1000);

		try {
			// Submit all endpoints with API keys
			const submissions = Object.entries(apiKeys)
				.filter(([_, apiKey]) => apiKey.trim() !== '')
				.map(async ([endpointId, apiKey]) => {
					const formData = new FormData();
					formData.append('endpointId', endpointId);
					formData.append('apiKey', apiKey);

					return fetch('?/userEndpoint', {
						method: 'POST',
						body: formData
					});
				});

			await Promise.all(submissions);

			// Clear the inputs after successful save
			apiKeys = {};

			await invalidateAll();
		} catch (error) {
			console.error('Error saving API keys:', error);
		} finally {
			// Stop the saving state
			saving = false;

			// Clear the breathing interval
			if (breathingInterval) {
				clearInterval(breathingInterval);
				breathingInterval = null;
			}
		}
	}

	// Function to track if any key has been edited
	function updateEdited() {
		edited = Object.values(apiKeys).some((key) => key.trim() !== '');
	}

	// Update API key for specific endpoint
	function updateApiKey(endpointId: string, value: string) {
		apiKeys[endpointId] = value;
		updateEdited();
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
</script>

<div class="flex items-center gap-3 max-sm:flex-col max-sm:items-start max-sm:gap-2">
	<div class="flex flex-col">
		<form class="flex w-full gap-4" onsubmit={handleSubmit}>
			{#each endpoints as endpoint}
				<div class="flex items-center">
					{#if endpoint.name}
						{@const Logo = getLogo(endpoint.name)}
						<Logo />
					{:else}
						<OpenAI />
					{/if}
					<div class="relative flex-grow pb-1">
						<input
							type="password"
							value={apiKeys[endpoint.id] || ''}
							oninput={(e) => updateApiKey(endpoint.id, e.currentTarget.value)}
							placeholder={endpoint.apiKey ? '••••••••••••••••••' : 'Enter API key...'}
							class="font-public text-grey-200 placeholder:text-grey-450 w-full rounded bg-transparent px-3 text-sm focus:outline-none"
						/>
					</div>
				</div>
			{/each}
			<button
				type="submit"
				style="opacity: {breathe.current};"
				disabled={saving || !edited}
				class="font-public text-grey-100 cursor-pointer bg-transparent text-sm antialiased transition-colors
				duration-500
					{saving ? 'text-grey-100' : edited ? 'text-grey-100' : 'text-grey-450'}
					hover:text-grey-100 disabled:hover:text-grey-450"
			>
				{saving ? 'Saving...' : 'Save'}
			</button>
		</form>
	</div>
</div>
