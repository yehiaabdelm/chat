import { DEFAULT_ENDPOINTS } from '$lib/server/defaultData';
import type { RequestHandler } from './$types';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	const tx = await db.transaction(async (tx) => {
		for (const endpoint of DEFAULT_ENDPOINTS) {
			const [{ id: endpointId }] = await tx
				.insert(table.endpoints)
				.values({
					name: endpoint.name,
					endpointType: endpoint.endpointType as 'openai' | 'anthropic',
					baseUrl: endpoint.baseUrl
				})
				.returning({ id: table.endpoints.id });

			for (const modelConfig of endpoint.models) {
				const vendor = await tx.query.vendors.findFirst({
					where: eq(table.vendors.name, modelConfig.vendor)
				});
				const [{ id: modelId }] = await tx
					.insert(table.models)
					.values({
						name: modelConfig.name,
						vendorId: vendor?.id,
						description: modelConfig.description,
						modalities: modelConfig.modalities,
						active: true
					})
					.returning({ id: table.models.id });
				await tx.insert(table.modelsEndpoints).values({
					modelId,
					endpointId,
					endpointModelName: modelConfig.apiModelName
				});
			}
		}
	});
	return new Response();
};
