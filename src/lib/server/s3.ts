import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';

export const s3Client = new S3Client({
	region: env.AWS_REGION!,
	credentials: {
		accessKeyId: env.AWS_S3_ACCESS_KEY_ID!,
		secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY!
	}
});

export const generateSignature = async (key: string) => {
	const command = new GetObjectCommand({
		Bucket: env.AWS_S3_BUCKET!,
		Key: key
	});
	let url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiration
	return url;
};
