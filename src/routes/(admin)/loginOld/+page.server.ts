import { ADMIN_PASSWORD } from '$env/static/private';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { session } from '$lib/server/db/schema';
import { dev } from '$app/environment';

export const prerender = false;

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		console.log('Default action');

		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		console.log(data);

		const password = data.password;

		console.log(password);
		if (password === ADMIN_PASSWORD) {
			console.log('OK');

			// Generate a secure random UUID as session token
			const sessionId = crypto.randomUUID();

			// Sets expiration slightly into the future (7 days)
			const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

			await locals.db.insert(session).values({
				id: sessionId,
				expiresAt: expiresAt.toISOString()
			});

			cookies.set('session_auth', sessionId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 7,
				httpOnly: true,
				secure: !dev,
				sameSite: 'lax'
			});

			throw redirect(303, '/admin');
		} else {
			return fail(401, { error: 'Hasło niepoprawne' });
		}
	}
};
