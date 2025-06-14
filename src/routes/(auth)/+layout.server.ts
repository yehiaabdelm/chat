import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
	return {};
}) satisfies LayoutServerLoad;
