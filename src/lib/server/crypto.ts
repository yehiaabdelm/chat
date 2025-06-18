import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export const encrypt = (text: string, secret: string): string => {
	const SECRET_BUFFER = Buffer.from(secret, 'hex');
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, SECRET_BUFFER, iv);

	let encrypted = cipher.update(text, 'utf-8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag().toString('hex');
	return `${iv.toString('hex')}:${encrypted}:${authTag}`;
};

export const decrypt = (encryptedText: string, secret: string): string => {
	const SECRET_BUFFER = Buffer.from(secret, 'hex');
	const [ivHex, encrypted, authTagHex] = encryptedText.split(':');

	if (!ivHex || !encrypted || !authTagHex) {
		throw new Error('Invalid encrypted data format');
	}

	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');

	const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_BUFFER, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
	decrypted += decipher.final('utf-8');

	return decrypted;
};
