import { color, material, model, texture, user, workspace } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals, params }) => {
	const slug = params.workspace_slug;
	const workspaceData = await locals.db.query.workspace.findFirst({
		where: eq(workspace.slug, slug)
	});

	if (!workspaceData) {
		throw error(404, 'Workspace nie istnieje');
	}

	console.log(slug);

	const { textures, models, colors, materials } = await locals.db.query.workspace.findFirst({
		where: eq(workspace.slug, slug),
		with: {
			textures: true,
			models: true,
			colors: true,
			materials: true
		}
	});

	const configData = await locals.db.query.config.findMany();
	const config = Object.fromEntries(configData.map((c) => [c.name, c.settings]));
	return { models, colors, materials, textures, config };
};
