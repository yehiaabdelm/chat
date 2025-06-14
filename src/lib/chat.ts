import type { Chat, MessageWithChildren } from '$lib/types';

type Dir = 'forward' | 'backward';

const walk = (chat: Chat, id: string, dir: Dir): string[] => {
	const out: string[] = [];
	let current: string | null = id;

	while (current) {
		const node: MessageWithChildren | undefined = chat.messages[current];
		if (!node) break;

		if (dir === 'forward') out.push(node.id);
		else out.unshift(node.id);

		current = dir === 'forward' ? (node.children[0] ?? null) : (node.parentId ?? null);
	}
	return out;
};

export const forward = (chat: Chat, id: string) => walk(chat, id, 'forward');
export const backward = (chat: Chat, id: string) => walk(chat, id, 'backward');
