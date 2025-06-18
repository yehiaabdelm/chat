<script lang="ts">
	let {
		dialog = $bindable(),
		onClickedDialog,
		children
	}: {
		dialog: HTMLDialogElement;
		onClickedDialog: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	class="no-scrollbar mx-auto my-auto w-fit rounded-xl border-none bg-[rgb(var(--settings-background-color))] font-sans"
	onclick={onClickedDialog}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div>
		{@render children?.()}
	</div>
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
