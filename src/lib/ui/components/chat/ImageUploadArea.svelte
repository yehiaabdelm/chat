<script lang="ts">
	import Photo from '$lib/ui/icons/Photo.svelte';
	import X from '$lib/ui/icons/X.svelte';
	import UploadingFile from './UploadingFile.svelte';
	import { Spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { springEasingFunction } from '$lib/ui/actions';
	import type { UploadFile } from '$lib/types';

	let {
		isDragging,
		isOverUploadArea,
		uploadedFiles,
		removeFile
	}: {
		isDragging: boolean;
		isOverUploadArea: boolean;
		ondragover: () => void;
		ondragleave: () => void;
		ondrop: () => void;
		uploadedFiles: UploadFile[];
		removeFile: (id: string) => void;
	} = $props();

	let uploadFilesHeight = new Spring(0, { stiffness: 0.1, damping: 0.8 });
	let uploadFilesOpacity = new Spring(0, { stiffness: 0.3, damping: 0.8 });
	let uploadTextOpacity = new Spring(0.7, { stiffness: 0.1, damping: 0.8 });

	$effect(() => {
		if (isDragging || uploadedFiles.length > 0) {
			uploadFilesHeight.set(8);
			uploadFilesOpacity.set(1);
		} else {
			uploadFilesHeight.set(0);
			uploadFilesOpacity.set(0);
		}
	});

	$effect(() => {
		if (isOverUploadArea) {
			uploadTextOpacity.set(1);
		} else {
			uploadTextOpacity.set(0.7);
		}
	});
</script>

<div
	class="relative flex -translate-y-[-1rem]
    items-start
    rounded-t-[1rem]"
	style="height: {uploadFilesHeight.current}rem; background: linear-gradient(rgba(245, 245, 245, 0.03), rgba(245, 245, 245, 0.03)), linear-gradient(rgba(var(--theme-color), 1), rgba(var(--theme-color), 1));"
>
	{#if isDragging}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore attribute_global_event_reference -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex h-full w-full flex-col items-center justify-center gap-1"
			{ondragover}
			{ondragleave}
			{ondrop}
		>
			<div class="flex items-center justify-center gap-2" style="opacity: {$uploadTextOpacity}">
				<Photo />
				<p class="font-gill text-md tracking-[2.3px] text-white uppercase antialiased">
					Drop photos
				</p>
			</div>
			<p class="font-untitled text-grey-500 text-3xs tracking-[1.5px] uppercase antialiased">
				Max 10 photos per chat at 20mb each
			</p>
		</div>
	{:else}
		<div class="scrollbar-none flex items-start overflow-y-auto">
			{#each uploadedFiles as file, index (file.id)}
				<div
					class="relative m-2 mr-1 mb-0"
					transition:fade={{ duration: 300, easing: springEasingFunction }}
				>
					<div class="bg-grey-600 h-24 w-48 overflow-hidden rounded-xl">
						{#if file.status === 'uploaded'}
							<img
								src={file.url}
								alt={file.fileName}
								class="fade-in h-full w-full object-cover"
								style="opacity: 1; -webkit-transition: opacity 2s ease-in-out;"
							/>
						{/if}
						{#if file.status === 'uploading'}
							<UploadingFile progress={file.progress} />
						{/if}
					</div>
					<button
						class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white opacity-65"
						onclick={() => removeFile(file.id)}
					>
						<X />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
