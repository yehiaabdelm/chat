import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { s3Client, generateSignature } from '$lib/server/s3';
import { ObjectCannedACL, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { env } from '$env/dynamic/private';
import { checkUserStatus } from '$lib/server/utils';
import { mimeToExt } from '$lib/server/utils';
import sharp from 'sharp';
import * as tables from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { FileWithUrl } from '$lib/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const unusedFiles = (await db
		.select({
			id: tables.files.id,
			key: tables.files.key,
			mimeType: tables.files.mimeType,
			sizeBytes: tables.files.sizeBytes
		})
		.from(tables.files)
		.leftJoin(tables.contents, eq(tables.contents.fileId, tables.files.id))
		.where(
			and(
				eq(tables.files.userId, locals.user.id), // current user
				isNull(tables.contents.fileId) // not attached yet
			)
		)) as FileWithUrl[];

	if (unusedFiles.length > 4) {
		return json({ message: 'You can only upload 4 files at a time' }, { status: 400 });
	}

	const parts = await request.formData();
	const file = parts.get('file') as File;
	const id = parts.get('id') as string;

	if (!file) {
		return json({ message: 'No file uploaded' }, { status: 400 });
	}

	if (!mimeToExt[file.type]) {
		return json(
			{ message: 'Unsupported file type. Supported file types: JPG, PNG, WEBP' },
			{ status: 400 }
		);
	}

	const fileBuffer = await file.arrayBuffer();

	const lastDotIndex = file.name.lastIndexOf('.');
	let fileName, fileExtension;

	if (lastDotIndex !== -1) {
		fileName = file.name.substring(0, lastDotIndex);
		fileExtension = file.name.substring(lastDotIndex).toLowerCase();
	} else {
		fileName = file.name;
		fileExtension = '';
	}

	const finalExtension = Object.values(mimeToExt).includes(fileExtension)
		? fileExtension
		: mimeToExt[file.type];

	const key = `${locals.user.id}/files/${id}${finalExtension}`;

	const metadata = await sharp(Buffer.from(fileBuffer)).metadata();
	const { width, height } = metadata;

	const putObjectParams = {
		Bucket: env.DIGITALOCEAN_SPACES_BUCKET,
		Key: key,
		Body: Buffer.from(fileBuffer),
		ContentType: file.type,
		ACL: ObjectCannedACL.authenticated_read,
		Metadata: {
			...(width?.toString() && { width: width?.toString() }),
			...(height?.toString() && { height: height?.toString() }),
			filename: encodeURIComponent(file.name)
		}
	};

	try {
		const stream = new ReadableStream({
			start(controller) {
				const upload = new Upload({
					client: s3Client,
					params: putObjectParams
				});

				upload.on('httpUploadProgress', (progress) => {
					if (!progress.total || !progress.loaded) return;
					const percent = Math.round((progress.loaded / progress.total) * 100);
					controller.enqueue(`data: ${JSON.stringify({ id, progress: percent })}\n\n`);
				});

				upload
					.done()
					.then(async () => {
						const sig = await generateSignature(key);
						controller.enqueue(
							`data: ${JSON.stringify({
								id,
								key,
								sig,
								width: width,
								height: height,
								file_size: file.size,
								file_name: file.name,
								status: 'uploaded',
								progress: 100
							})}\n\n`
						);
						controller.close();
					})
					.catch((error) => {
						console.error('Failed to upload image - ', error);
						controller.error(error);
					});
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (error) {
		console.error('Error uploading file:', error);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const data = await request.json();
	const id = data.id;
	const file = await db.query.files.findFirst({
		where: and(eq(tables.files.id, id), eq(tables.files.userId, locals.user.id))
	});
	if (!file) {
		return json({ message: 'File not found' }, { status: 404 });
	}
	const deleteParams = {
		Bucket: env.DIGITALOCEAN_SPACES_BUCKET,
		Key: file.key
	};
	try {
		await s3Client.send(new DeleteObjectCommand(deleteParams));
		return json({ message: 'File deleted' });
	} catch (error) {
		console.error('Error deleting file:', error);
		return json({ message: 'Failed to delete file' }, { status: 500 });
	}
};
