export const load = async ({ locals }) => {
	const models = await locals.db.query.model.findMany();
	const colors = await locals.db.query.color.findMany();
	const materials = await locals.db.query.material.findMany();
	const textures = await locals.db.query.texture.findMany();
	const configData = await locals.db.query.config.findMany();

	const config = Object.fromEntries(configData.map((c) => [c.name, c.settings]));

	return { models, colors, materials, textures, config };
};
