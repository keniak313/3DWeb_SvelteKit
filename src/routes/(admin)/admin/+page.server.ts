import { eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { color, config, material, model, session, texture } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';

export const actions = {
	logout: async ({ locals, cookies }) => {
		console.log('logout action');
		const sessionId = cookies.get('session_auth');
		if (sessionId) {
			await locals.db.delete(session).where(eq(session.id, sessionId));
		}
		cookies.delete('session_auth', { path: '/' });

		throw redirect(303, '/login');
	},
	updateColors: async ({ locals, request }) => {
		const formData = await request.formData();
		const ids = formData.getAll('id');
		const newColors = ids.map((id) => {
			return {
				id: id,
				color: formData.get(`color-${id}`),
				displayName: formData.get(`displayName-${id}`),
				name: formData.get(`name-${id}`)
			};
		});

		console.log(formData);

		const columns = getTableColumns(color);
		const updateFields = Object.fromEntries(
			Object.entries(columns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [
					key,
					// Używamy column.name, aby dostać czysty string nazwy kolumny w SQL
					sql.raw(`excluded.${column.name}`)
				])
		);

		if (newColors.length > 0) {
			await locals.db
				.insert(color)
				.values(newColors)
				.onConflictDoUpdate({ target: color.id, set: updateFields });
		}
	},
	updateMaterials: async ({ locals, request }) => {
		const formData = await request.formData();
		const ids = formData.getAll('id');

		const newMaterials = ids.map((id) => {
			return {
				id: id,
				name: formData.get(`name-${id}`),
				displayName: formData.get(`displayName-${id}`),
				description: formData.get(`description-${id}`),
				metalness: Number(formData.get(`metalness-${id}`)),
				roughness: Number(formData.get(`roughness-${id}`)),
				transparent: formData.get(`transparent-${id}`) === 'on' ? 1 : 0,
				opacity: Number(formData.get(`opacity-${id}`)),
				color: formData.get(`color-${id}`),
				colors: formData.getAll(`colors-${id}`)
			};
		});

		const columns = getTableColumns(material);
		const updateFields = Object.fromEntries(
			Object.entries(columns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [
					key,
					// Używamy column.name, aby dostać czysty string nazwy kolumny w SQL
					sql.raw(`excluded.${column.name}`)
				])
		);

		if (newMaterials.length > 0) {
			await locals.db
				.insert(material)
				.values(newMaterials)
				.onConflictDoUpdate({ target: material.id, set: updateFields });

			console.log(newMaterials);
		}
	},
	updateModels: async ({ locals, request }) => {
		const formdata = await request.formData();
		const ids = formdata.getAll('id');

		const partsIds = formdata.getAll('partId');

		const newParts = {};

		ids.forEach((id) => {
			newParts[id] = {};
		});

		partsIds.forEach((id) => {
			newParts[formdata.get(`part-modelId-${id}`)] = {
				...newParts[formdata.get(`part-modelId-${id}`)],
				[formdata.get(`part-name-${id}`)]: {
					id: id,
					name: formdata.get(`part-name-${id}`),
					displayName: formdata.get(`part-displayName-${id}`),
					description: formdata.get(`part-description-${id}`),
					materials: formdata.getAll(`part-materials-${id}`),
					material: formdata.get(`part-material-${id}`),
					color: formdata.get(`part-color-${id}`),
					position: [
						Number(formdata.get(`part-position-x-${id}`)),
						Number(formdata.get(`part-position-y-${id}`)),
						Number(formdata.get(`part-position-z-${id}`))
					],
					target: [
						Number(formdata.get(`part-target-x-${id}`)),
						Number(formdata.get(`part-target-y-${id}`)),
						Number(formdata.get(`part-target-z-${id}`))
					]
				}
			};
		});

		const newModels = [];

		for await (const modelId of ids) {
			const icon = formdata.get(`icon-${modelId}`);
			let uploadedIcon = null;
			if (icon instanceof File) {
				const { url } = await put('icons/' + icon.name, icon, {
					access: 'public',
					token: BLOB_READ_WRITE_TOKEN,
					allowOverwrite: true
				});
				uploadedIcon = url;
			}
			newModels.push({
				id: modelId,
				name: formdata.get(`name-${modelId}`),
				displayName: formdata.get(`displayName-${modelId}`),
				description: formdata.get(`description-${modelId}`),
				url: formdata.get(`url-${modelId}`),
				icon: uploadedIcon ? uploadedIcon : formdata.get(`icon-${modelId}`),
				parts: newParts[modelId]
			});
		}

		const columns = getTableColumns(model);
		const updateFields = Object.fromEntries(
			Object.entries(columns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [key, sql.raw(`excluded.${column.name}`)])
		);

		if (newModels.length > 0) {
			await locals.db
				.insert(model)
				.values(newModels)
				.onConflictDoUpdate({ target: model.id, set: updateFields });

			console.log(newModels);
		}

		return { success: true, models: newModels };
	},
	addModel: async ({ request, locals }) => {
		const form = await request.formData();

		const file = form.get('file') as File;
		const modelInfo = JSON.parse(form.get('modelInfo') as string);

		if (!file) {
			throw error(400, { message: 'No file to upload.' });
		}

		const name = file.name.split('.')[0];

		const existingModel = await locals.db.query.model.findFirst({
			where: eq(model.name, name)
		});

		const { url } = await put('models/' + file.name, file, {
			access: 'public',
			token: BLOB_READ_WRITE_TOKEN,
			allowOverwrite: true
		});

		if (existingModel) {
			await locals.db
				.update(model)
				.set({
					name: modelInfo.name,
					displayName: modelInfo.displayName,
					description: modelInfo.description,
					url: modelInfo.url,
					icon: modelInfo.icon,
					parts: modelInfo.parts
				})
				.where(eq(model.id, modelInfo.id));
		} else {
			await locals.db.insert(model).values({
				id: modelInfo.id,
				name: modelInfo.name,
				displayName: modelInfo.displayName,
				description: modelInfo.description,
				url: url,
				icon: null,
				parts: modelInfo.parts
			});
		}

		// throw redirect(303, '/admin');
		const models = await locals.db.query.model.findMany();
		const modelurl = url;
		const modelName = name;

		return { success: true, models, modelurl, modelName };
	},
	addTexture: async ({ request, locals }) => {
		const formData = await request.formData();

		const newTextures = formData.getAll('texture');

		for (const tx of newTextures) {
			const name = tx.name.split('.')[0];
			const { url } = await put('textures/' + tx.name, tx, {
				access: 'public',
				token: BLOB_READ_WRITE_TOKEN,
				allowOverwrite: true
			});

			await locals.db.insert(texture).values({
				name: name,
				url: url
			});
		}

		const textures = await locals.db.query.texture.findMany({});

		return { textures };
	},
	updateSceneConfig: async ({ request, locals }) => {
		const formData = await request.formData();

		const data = {
			camera: {
				position: [
					Number(formData.get('pos-x')),
					Number(formData.get('pos-y')),
					Number(formData.get('pos-z'))
				],
				target: [
					Number(formData.get('target-x')),
					Number(formData.get('target-y')),
					Number(formData.get('target-z'))
				]
			},
			bloom: {
				luminanceThreshold: Number(formData.get('bloom-threshold')),
				luminanceSmoothing: Number(formData.get('bloom-smoothing')),
				intensity: Number(formData.get('bloom-intensity')),
				radius: Number(formData.get('bloom-radius'))
			}
		};

		await locals.db.update(config).set({ settings: data.camera }).where(eq(config.name, 'camera'));
		await locals.db.update(config).set({ settings: data.bloom }).where(eq(config.name, 'bloom'));

		console.log(data);

		return { success: true };
	},
	saveSettings: async ({ request, locals }) => {
		const formData = await request.formData();

		//Scene Config

		const sceneConfig = {
			camera: {
				position: [
					Number(formData.get('config-pos-x')),
					Number(formData.get('config-pos-y')),
					Number(formData.get('config-pos-z'))
				],
				target: [
					Number(formData.get('config-target-x')),
					Number(formData.get('config-target-y')),
					Number(formData.get('config-target-z'))
				]
			},
			bloom: {
				luminanceThreshold: Number(formData.get('config-bloom-threshold')),
				luminanceSmoothing: Number(formData.get('config-bloom-smoothing')),
				intensity: Number(formData.get('config-bloom-intensity')),
				radius: Number(formData.get('config-bloom-radius'))
			}
		};

		await locals.db
			.update(config)
			.set({ settings: sceneConfig.camera })
			.where(eq(config.name, 'camera'));
		await locals.db
			.update(config)
			.set({ settings: sceneConfig.bloom })
			.where(eq(config.name, 'bloom'));

		//Colors

		const colorsIds = formData.getAll('color-id');

		const newColors = colorsIds.map((id) => {
			return {
				id: id,
				color: formData.get(`color-color-${id}`),
				displayName: formData.get(`color-displayName-${id}`),
				name: formData.get(`color-name-${id}`),
				deletedAt: formData.get(`color-deletedAt-${id}`)
					? formData.get(`color-deletedAt-${id}`)
					: null
			};
		});

		const colorColumns = getTableColumns(color);
		const colorUpdateFields = Object.fromEntries(
			Object.entries(colorColumns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [
					key,
					// Używamy column.name, aby dostać czysty string nazwy kolumny w SQL
					sql.raw(`excluded.${column.name}`)
				])
		);

		if (newColors.length > 0) {
			await locals.db
				.insert(color)
				.values(newColors)
				.onConflictDoUpdate({ target: color.id, set: colorUpdateFields });
			// console.log(newColors);
		}

		//Materials

		const materialsIds = formData.getAll('material-id');

		const newMaterials = materialsIds.map((id) => {
			return {
				id: id,
				name: formData.get(`material-name-${id}`),
				displayName: formData.get(`material-displayName-${id}`),
				description: formData.get(`material-description-${id}`),
				metalness: Number(formData.get(`material-metalness-${id}`)),
				roughness: Number(formData.get(`material-roughness-${id}`)),
				transparent: formData.get(`material-transparent-${id}`) === 'on' ? 1 : 0,
				opacity: Number(formData.get(`material-opacity-${id}`)),
				color: formData.get(`material-color-${id}`) || null,
				colors: JSON.parse(formData.get(`material-colors-${id}`))
			};
		});

		const materialColumns = getTableColumns(material);
		const materialUpdateFields = Object.fromEntries(
			Object.entries(materialColumns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [
					key,
					// Używamy column.name, aby dostać czysty string nazwy kolumny w SQL
					sql.raw(`excluded.${column.name}`)
				])
		);

		if (newMaterials.length > 0) {
			await locals.db
				.insert(material)
				.values(newMaterials)
				.onConflictDoUpdate({ target: material.id, set: materialUpdateFields });

			// console.log(newMaterials);
		}

		//Models

		const modelIds = formData.getAll('model-id');
		const partsIds = formData.getAll('part-id');

		const newParts = {};

		modelIds.forEach((id) => {
			newParts[id] = {};
		});

		partsIds.forEach((id) => {
			newParts[formData.get(`part-model-id-${id}`)] = {
				...newParts[formData.get(`part-model-id-${id}`)],
				[formData.get(`part-name-${id}`)]: {
					id: id,
					name: formData.get(`part-name-${id}`),
					displayName: formData.get(`part-displayName-${id}`),
					description: formData.get(`part-description-${id}`),
					materials: JSON.parse(formData.getAll(`part-materials-${id}`)),
					material: formData.get(`part-material-${id}`),
					color: formData.get(`part-color-${id}`),
					position: [
						Number(formData.get(`part-position-x-${id}`)),
						Number(formData.get(`part-position-y-${id}`)),
						Number(formData.get(`part-position-z-${id}`))
					],
					target: [
						Number(formData.get(`part-target-x-${id}`)),
						Number(formData.get(`part-target-y-${id}`)),
						Number(formData.get(`part-target-z-${id}`))
					]
				}
			};
		});

		const newModels = [];
		const updatedIcons = [];

		for await (const modelId of modelIds) {
			const icon = formData.get(`model-icon-${modelId}`);
			let uploadedIcon = null;
			if (icon instanceof File) {
				console.log('NEW FILE ICON FOUND', icon);
				const { url } = await put('icons/' + icon.name, icon, {
					access: 'public',
					token: BLOB_READ_WRITE_TOKEN,
					allowOverwrite: true
				});
				uploadedIcon = url;
				updatedIcons.push({
					id: modelId,
					icon: url
				});
			}
			newModels.push({
				id: modelId,
				name: formData.get(`model-name-${modelId}`),
				displayName: formData.get(`model-displayName-${modelId}`),
				description: formData.get(`model-description-${modelId}`),
				url: formData.get(`model-url-${modelId}`),
				icon: uploadedIcon ? uploadedIcon : formData.get(`model-icon-${modelId}`),
				parts: newParts[modelId],
				updatedAt: new Date().toISOString()
			});
		}

		const modelsColumns = getTableColumns(model);
		const modelsUpdateFields = Object.fromEntries(
			Object.entries(modelsColumns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [key, sql.raw(`excluded.${column.name}`)])
		);

		if (newModels.length > 0) {
			await locals.db
				.insert(model)
				.values(newModels)
				.onConflictDoUpdate({ target: model.id, set: modelsUpdateFields });
		}

		return { success: true, updatedIcons };
	}
};
