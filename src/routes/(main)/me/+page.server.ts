import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { workspace, workspaceToUser } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

function createSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.normalize('NFD') // rozdziela polskie znaki: 'łódź' -> 'łódź'
		.replace(/[\u0300-\u036f]/g, '') // usuwa akcenty: 'łódź' -> 'lodz'
		.replace(/[^a-z0-9\s-]/g, '') // usuwa znaki specjalne (oprócz spacji i myślnika)
		.replace(/\s+/g, '-') // zamienia spacje na myślniki
		.replace(/-+/g, '-') // zamienia wiele myślników na jeden
		.replace(/^-+|-+$/g, ''); // usuwa myślniki z początku i końca
}

export const load: PageServerLoad = async ({ locals }) => {
	const session = locals.session;
	if (!session) return;
	const user = await locals.db.query.user.findFirst({
		where: (user, { eq }) => eq(user.id, session.user.id),
		with: {
			workspaces: {
				with: {
					workspace: {
						with: {
							workspaceToUser: {
								with: {
									user: true
								}
							}
						}
					}
				}
			}
		}
	});

	return { user };
};

export const actions: Actions = {
	createWorkspace: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) return;

		console.log('CREATE WORKSPACE');

		const formData = await request.formData();

		const name = formData.get('name') as string;
		const slug = createSlug(name);

		const result = await locals.db.insert(workspace).values({ name, slug }).returning();

		await locals.db.insert(workspaceToUser).values({
			role: 'owner',
			workspaceId: result[0].id,
			userId: session.user.id
		});
	},
	addUserToWorkspace: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) return;

		console.log('ADD USER TO WORKSPACE');

		const formData = await request.formData();

		const email = formData.get('email') as string;

		if (!email) return { error: 'Email is required' };

		const workspaceId = formData.get('workspaceId') as string;

		const currentUserWorkspace = await locals.db.query.workspaceToUser.findFirst({
			where: (workspaceToUser, { eq, and }) =>
				and(
					eq(workspaceToUser.userId, session.user.id),
					eq(workspaceToUser.workspaceId, workspaceId)
				)
		});

		if (!currentUserWorkspace || currentUserWorkspace.role !== 'owner') {
			return { error: 'Nie masz uprawnień do dodawania użytkowników' };
		}

		console.log(email, workspaceId);

		const user = await locals.db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, email)
		});

		if (!user) return { error: 'User not found' };

		const workspaceUser = await locals.db.query.workspaceToUser.findFirst({
			where: and(eq(workspaceToUser.workspaceId, workspaceId), eq(workspaceToUser.userId, user.id))
		});

		if (workspaceUser) return { error: 'User already in workspace' };

		await locals.db.insert(workspaceToUser).values({
			role: 'member',
			workspaceId: workspaceId,
			userId: user.id
		});

		return { success: true };
	}
};
