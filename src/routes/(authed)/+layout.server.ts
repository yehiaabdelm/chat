import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const load = (async ({ locals }) => {
	if (!locals.session || !locals.user) {
		redirect(303, '/login');
	}

	const endpoints = await db.query.endpoints.findMany({
		where: eq(tables.endpoints.active, true),
		columns: {
			id: true,
			name: true
		},
		with: {
			userEndpoints: {
				columns: {
					endpointId: true
				},
				where: eq(tables.userEndpoint.userId, locals.user.id)
			}
		}
	});

	const endpointsWithKey = endpoints.map((endpoint) => ({
		id: endpoint.id,
		name: endpoint.name,
		apiKey: endpoint.userEndpoints.length > 0
	}));

	const modelsWithUserEndpoints = await db.query.models.findMany({
		where: eq(tables.models.active, true),
		with: {
			vendor: true,
			endpoints: {
				with: {
					endpoint: {
						with: {
							userEndpoints: {
								where: eq(tables.userEndpoint.userId, locals.user.id)
							}
						}
					}
				}
			}
		}
	});

	const models = modelsWithUserEndpoints
		.filter((model) =>
			model.endpoints.some((modelEndpoint) => modelEndpoint.endpoint.userEndpoints.length > 0)
		)
		.map(({ endpoints, ...model }) => model);

	return {
		user: locals.user,
		models,
		endpoints: endpointsWithKey,
		chats: await db.query.chats.findMany({
			where: eq(tables.chats.userId, locals?.user?.id as string)
		})
	};
}) satisfies LayoutServerLoad;
