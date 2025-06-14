export type FileWithUrl = {
	id: string;
	key: string;
	mimeType: string;
	sizeBytes: number | null;
	url?: string;
};

export type UploadFile = {
	id: string;
	fileName: string;
	url: string;
	status: 'uploaded' | 'uploading';
	progress: number;
};

export type Chat = {
	id: string;
	createdAt: Date | null;
	updatedAt: Date;
	userId: string;
	title: string;
	rootMessageId: string | null;
	currentMessageId: string | null;
	saved: boolean | null;
	generations: number | null;
	deleteAfter: Date | null;
	messages: {
		[id: string]: MessageWithChildren;
	};
};

export type ChatTitle = {
	id: string;
	rootMessageId: string | null;
	title: string;
	createdAt: Date | null;
	updatedAt: Date;
	userId: string;
	currentMessageId: string | null;
	saved: boolean | null;
	generations: number | null;
	deleteAfter: Date | null;
};
export type MessageWithChildren = {
	id: string;
	parentId: string | null;
	authorRole: string;
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

export type Model = {
	name: string;
	vendor: 'openai' | 'anthropic';
	description: string;
	modalities: ('text' | 'image' | 'audio')[];
	apiModelName: string;
};

export type Endpoint = {
	name: string;
	endpointType: 'openai' | 'anthropic';
	endpointName: string;
	baseUrl: string;
	models: Model[];
};
