import { color, material, type Color, type Material } from '$lib/server/db/schema.js';
import { decodeConfig } from '$lib/utilities/helpers';
import { eq } from 'drizzle-orm';

export const load = async ({ locals, url }) => {
	const urlItem = decodeConfig(url.searchParams.get('item'));
	const modelsData = await locals.db.query.model.findMany();
	const colors = await locals.db.query.color.findMany();
	const textures = await locals.db.query.texture.findMany({});
	const materialsData = await locals.db.query.material.findMany();

	const materials = materialsData.map((mat) => {
		mat.transparent = Boolean(mat.transparent);
		mat.color = colors.find((c) => c.id === mat.color);
		mat.colors = mat.colors?.map((color) => {
			return colors.find((c) => c.id === color);
		});
		return mat;
	});

	const models = modelsData.reduce((acc, item) => {
		const { parts, ...rest } = item;
		const newParts = {};
		Object.values(parts).forEach((part) => {
			const newPart = { ...part };
			newParts[part.name] = newPart;
			newPart.material = materials.find((material) => material.id === part.material);
			newPart.color = colors.find((color) => color.id === part.color);
			newPart.materials = part.materials?.map((mat) => {
				return materials.find((material) => material.id === mat);
			});
		});

		acc[item.name] = { ...rest, parts: newParts };
		return acc;
	}, {});

	if (urlItem) {
		urlItem.parts.forEach((part) => {
			models[urlItem.model].parts[part.name].material = materials.find(
				(material) => material.id === part.material
			);
			models[urlItem.model].parts[part.name].color = colors.find(
				(color) => color.id === part.color
			);
		});
	}

	const user = locals.user;

	return { models, materials, colors, textures, user, modelsData };
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		console.log(formData);

		const newColor = {
			id: formData.get('colorId'),
			color: formData.get('color')
		};

		const newMaterial = {
			id: formData.get('materialId'),
			metalness: Number(formData.get('metalness')),
			roughness: Number(formData.get('roughness')),
			transparent: formData.get('transparent') === 'on' ? 1 : 0,
			opacity: Number(formData.get('opacity'))
		};

		await locals.db.update(material).set(newMaterial).where(eq(material.id, newMaterial.id));
		await locals.db.update(color).set(newColor).where(eq(color.id, newColor.id));

		console.log(newColor, newMaterial);
		return {};
	}
};
