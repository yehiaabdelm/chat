<script lang="ts">
	let {
		showModal = $bindable(),
		children
	}: {
		showModal: boolean;
		children?: import('svelte').Snippet;
	} = $props();

	let dialog = $state(); // HTMLDialogElement

	$effect(() => {
		if (showModal) dialog?.showModal();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	class="no-scrollbar mx-auto my-auto w-fit rounded-xl border-none bg-[rgb(var(--settings-background-color))] font-sans"
	onclose={() => (showModal = false)}
	onclick={(e) => {
		if (e.target === dialog) {
			dialog?.close();
		}
	}}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	{@render children?.()}
</dialog>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
