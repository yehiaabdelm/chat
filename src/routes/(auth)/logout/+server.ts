import type { RequestHandler } from './$types';
import * as auth from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.session) {
		error(401);
	}
	await auth.invalidateSession(event.locals.session.id);
	auth.deleteSessionTokenCookie(event);
	redirect(302, '/login');
};
