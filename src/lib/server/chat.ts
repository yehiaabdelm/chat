import type { Message } from '$lib/types';

export const mapMessagesWithChildren = (
	messages: Array<Omit<Message, 'children'>>
): Record<string, Message> => {
	const map: Record<string, Message> = {};
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
