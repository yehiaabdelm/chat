import type { Endpoint } from '$lib/types';

export const DEFAULT_ENDPOINTS: Endpoint[] = [
	{
		name: 'OpenAI',
		endpointType: 'openai',
		endpointName: 'openai',
		baseUrl: 'https://api.openai.com/v1',
		models: [
			// {
			// 	name: 'gpt 4.5',
			// 	description: `OpenAI's largest and most knowledgeable model yet.`,
			// 	endpointName: 'OpenAI'
			// },
			{
				name: 'gpt 4o mini',
				vendor: 'openai',
				description: `The most powerful reasoning model by OpenAI.`,
				modalities: ['text', 'image'],
				apiModelName: 'gpt-4o-mini'
			},
			{
				name: 'gpt 4o',
				vendor: 'openai',
				description: `The best model for general purpose tasks by OpenAI.`,
				modalities: ['text', 'image'],
				apiModelName: 'gpt-4o'
			}
		]
	},
	{
		name: 'Anthropic',
		endpointType: 'anthropic',
		endpointName: 'anthropic',
		baseUrl: 'https://api.anthropic.com/v1',
		models: [
			{
				name: 'claude sonnet 4',
				vendor: 'anthropic',
				description: `The best model for general purpose tasks by Anthropic.`,
				modalities: ['text', 'image'],
				apiModelName: 'claude-sonnet-4-20250514'
			},
			{
				name: 'claude opus 4',
				vendor: 'anthropic',
				description: `The most powerful model by Anthropic.`,
				modalities: ['text', 'image'],
				apiModelName: 'claude-opus-4-20250514'
			}
		]
	}
];
