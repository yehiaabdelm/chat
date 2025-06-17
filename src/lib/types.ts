export type User = {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	avatarUrl: string | null;
};

export type UnattachedFile = {
	id: string;
	fileName: string;
	url: string;
};

export type FileWithUrl = {
	id: string;
	key: string;
	mimeType: string;
	sizeBytes: number | null;
	url?: string;
};

export type UploadFile = {
	id: string;
	file: File;
	url?: string;
	progress: number;
	status: 'uploading' | 'uploaded';
};

export type Model = {
	name: string;
	id: string;
	createdAt: Date | null;
	updatedAt: Date;
	description: string | null;
	modalities: ('text' | 'image' | 'audio')[];
	vendorId: string | null;
	active: boolean | null;
	vendor: {
		id: string;
		name: string;
	} | null;
};

export type Chat = {
	id: string;
	createdAt: Date | null;
	updatedAt: Date;
	userId: string;
	title: string;
	rootMessageId: string | null;
	leafMessageId: string | null;
	saved: boolean | null;
	generations: number | null;
	deleteAfter: Date | null;
	messages: {
		[id: string]: Message;
	};
};

export type Message = {
	id: string;
	parentId: string | null;
	authorRole: 'user' | 'assistant' | 'system';
	model: {
		id: string;
		name: string;
	} | null;
	createdAt: Date | null;
	updatedAt: Date;
	contents: Array<{
		id: string;
		text: string | null;
		type: 'file' | 'text';
		file: never | FileWithUrl | null;
	}>;
	children: string[];
};

export type ChatTitle = {
	id: string;
	rootMessageId: string | null;
	title: string;
	createdAt: Date | null;
	updatedAt: Date;
	userId: string;
	leafMessageId: string | null;
	saved: boolean | null;
	generations: number | null;
	deleteAfter: Date | null;
};
