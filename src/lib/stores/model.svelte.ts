import type { Model } from '$lib/types';
let selectedModel = $state<Model | null>(null);
export const setSelectedModel = (model: Model) => {};
