import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const load = (async ({ locals }) => {
	if (!locals.session || !locals.user) {
		redirect(303, '/login');
	}
	const getChats = async () => {
		return await db.query.chats.findMany({
			where: eq(tables.chats.userId, locals?.user?.id as string)
		});
	};
	const models = await db.query.models.findMany({
		where: eq(tables.models.active, true),
		with: {
			vendor: true
		}
	});
	return {
		user: locals.user,
		models,
		chats: await getChats()
	};
}) satisfies LayoutServerLoad;
