import type { Model } from '$lib/types';
import { writable } from 'svelte/store';

export const selectedModel = writable<Model | null>(null);
