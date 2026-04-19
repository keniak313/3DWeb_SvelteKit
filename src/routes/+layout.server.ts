export const load = async ({ locals }) => {
	const models = await locals.db.query.model.findMany();
	const colors = await locals.db.query.color.findMany();
	const materials = await locals.db.query.material.findMany();
	const textures = await locals.db.query.texture.findMany();
	const config = await locals.db.query.config.findFirst();

	return { models, colors, materials, textures, config };
};
