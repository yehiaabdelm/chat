import { PUBLIC_BASE_URL } from '$env/static/public';
import type { UploadFile } from '$lib/types';

export const uploadFile = async (
	file: File,
	id: string,
	onProgress: (progress: number) => void
): Promise<UploadFile> => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('id', id);
	const xhr = new XMLHttpRequest();
	xhr.open('POST', `${PUBLIC_BASE_URL}/api/file`, true);

	return new Promise((resolve, reject) => {
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				const percentComplete = (event.loaded / event.total) * 100;
				onProgress(percentComplete);
			}
		};

		xhr.onload = () => {
			if (xhr.status === 200) {
				const lines = xhr.responseText.split('\n\n');
				let finalData;
				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const eventData = JSON.parse(line.slice(6));
						if (eventData.id && eventData.url && eventData.status === 'uploaded') {
							finalData = eventData;
							onProgress(100);
						} else if (eventData.progress) {
							onProgress(eventData.progress);
						}
					}
				}
				if (finalData) {
					resolve(finalData);
				} else {
					reject(new Error('No valid data received'));
				}
			} else {
				reject(new Error('Upload failed'));
			}
		};

		xhr.onerror = () => {
			reject(new Error('Network error'));
		};

		xhr.send(formData);
	});
};

export const deleteFile = async (id: string) => {
	const response = await fetch(`${PUBLIC_BASE_URL}/api/file`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id })
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to delete file. Please try again.');
	}
};

export const mimeToExt: { [key: string]: string } = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp'
};
