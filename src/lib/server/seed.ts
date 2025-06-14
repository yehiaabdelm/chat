import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { vendors } from './db/schema.js';

export async function seedVendors() {
	try {
		if (!process.env.DATABASE_URL) {
			throw new Error('DATABASE_URL environment variable is not set');
		}

		const client = postgres(process.env.DATABASE_URL);
		const db = drizzle(client, { casing: 'snake_case' });
		await db.insert(vendors).values([
			{
				name: 'openai'
			},
			{
				name: 'anthropic'
			}
		]);
		console.log('✅ Vendors seeded successfully');
		await client.end();
	} catch (error) {
		console.error('❌ Error seeding vendors:', error);
		throw error;
	}
}

seedVendors();
