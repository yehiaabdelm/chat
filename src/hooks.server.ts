import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import schedule from 'node-schedule';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

// delete temporary chats where deleteAfter is in the past
schedule.scheduleJob('*/30 * * * *', async function () {
	try {
	} catch (error) {
		console.error('Metrics aggregation update failed:', error);
	}
});

export const handle: Handle = handleAuth;
