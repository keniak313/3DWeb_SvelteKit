import { color, material, model, texture, user } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals, params }) => {
	const username = params.username;
	if (!username) return;

	const currentUser = await locals.db.query.user.findFirst({
		where: eq(user.username, username)
	});

	if (!currentUser) {
		throw error(404, { message: 'User not found' });
	}

	const models = await locals.db.query.model.findMany({
		where: eq(model.userId, currentUser.id)
	});
	const colors = await locals.db.query.color.findMany({
		where: eq(color.userId, currentUser.id)
	});
	const materials = await locals.db.query.material.findMany({
		where: eq(material.userId, currentUser.id)
	});
	const textures = await locals.db.query.texture.findMany({
		where: eq(texture.userId, currentUser.id)
	});

	const configData = await locals.db.query.config.findMany();
	const config = Object.fromEntries(configData.map((c) => [c.name, c.settings]));

	return { models, colors, materials, textures, config };
};
