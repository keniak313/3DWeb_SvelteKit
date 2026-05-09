import { db } from '$lib/server/db/index';
import { error, redirect, type Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.db = db;

	if (session) {
		event.locals.session = session.session;
		event.locals.session.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
