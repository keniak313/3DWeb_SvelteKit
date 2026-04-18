import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { session } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const handle = async ({ event, resolve }) => {
	event.locals.db = db;

	const sessionId = event.cookies.get('session_auth');

	let isAuthorized = false;

	// Optimization: Only query the database for session validation on routes within the (admin) group
	const needsAuthCheck = event.route.id?.startsWith('/(admin)');

	if (sessionId) {
		const sessionRecord = await db.query.session.findFirst({
			where: eq(session.id, sessionId)
		});

		if (sessionRecord) {
			const expiresAt = new Date(sessionRecord.expiresAt);
			if (expiresAt.getTime() > Date.now()) {
				isAuthorized = true;
			} else {
				// Clean up expired session automatically
				await db.delete(session).where(eq(session.id, sessionId));
				event.cookies.delete('session_auth', { path: '/' });
			}
		} else {
			event.cookies.delete('session_auth', { path: '/' });
		}
	}

	event.locals.user = isAuthorized ? { role: 'admin' } : null;

	if (event.route.id?.startsWith('/(admin)/admin') && !isAuthorized) {
		throw redirect(303, '/login');
	}

	if (event.route.id?.startsWith('/(admin)/login') && isAuthorized) {
		throw redirect(303, '/admin');
	}

	return resolve(event);
};
