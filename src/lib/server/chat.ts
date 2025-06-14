import type { MessageWithChildren } from '$lib/types';

export const mapMessagesWithChildren = (
	messages: Array<Omit<MessageWithChildren, 'children'>>
): Record<string, MessageWithChildren> => {
	const map: Record<string, MessageWithChildren> = {};
	for (const msg of messages) {
		map[msg.id] = { ...msg, children: [] };
	}

	for (const msg of Object.values(map)) {
		if (msg.parentId && map[msg.parentId]) {
			map[msg.parentId].children.push(msg.id);
		}
	}

	return map;
};
