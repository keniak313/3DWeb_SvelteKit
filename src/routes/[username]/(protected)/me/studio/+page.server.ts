import { eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { color, config, material, model, session, texture } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { updateConfig } from '$lib/server/services/configService.js';
import { updateColors } from '$lib/server/services/colorService.js';
import { updateMaterials } from '$lib/server/services/materialService.js';
import { updateModels } from '$lib/server/services/modelService.js';
import { updateTextures } from '$lib/server/services/textureService.js';

export const actions = {
	// logout: async ({ locals, cookies }) => {
	// 	console.log('logout action');
	// 	const sessionId = cookies.get('session_auth');
	// 	if (sessionId) {
	// 		await locals.db.delete(session).where(eq(session.id, sessionId));
	// 	}
	// 	cookies.delete('session_auth', { path: '/' });

	// 	throw redirect(303, '/login');
	// },
	saveColors: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) return;

		const userId = session?.user.id;

		const formData = await request.formData();

		const colorsIds = formData.getAll('color-id');

		const newColors = colorsIds.map((id) => {
			return {
				id: id,
				color: formData.get(`color-color-${id}`),
				displayName: formData.get(`color-displayName-${id}`),
				name: formData.get(`color-name-${id}`),
				deletedAt: formData.get(`color-deletedAt-${id}`)
					? formData.get(`color-deletedAt-${id}`)
					: null,
				userId: userId
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
		}
	},
	saveMaterials: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) return;

		const userId = session?.user.id;

		const formData = await request.formData();

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
				colors: JSON.parse(formData.get(`material-colors-${id}`)),
				userId: userId
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
	},
	saveModels: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) return;

		const userId = session?.user.id;

		const formData = await request.formData();

		const modelIds = formData.getAll('model-id');
		const partsIds = formData.getAll('part-id');
		const socketIds = formData.getAll('socket-id');

		const newParts = {};
		const newSockets = {};

		modelIds.forEach((id) => {
			newParts[id] = {};
		});

		socketIds.forEach((id) => {
			newSockets[formData.get(`socket-model-id-${id}`)] = {
				...newSockets[formData.get(`socket-model-id-${id}`)],
				[formData.get(`socket-name-${id}`)]: {
					id: id,
					name: formData.get(`socket-name-${id}`),
					attachment: formData.get(`socket-attachment-${id}`),
					attachments: JSON.parse(formData.getAll(`socket-attachments-${id}`)),
					position: [
						Number(formData.get(`socket-position-x-${id}`)),
						Number(formData.get(`socket-position-y-${id}`)),
						Number(formData.get(`socket-position-z-${id}`))
					],
					target: [
						Number(formData.get(`socket-target-x-${id}`)),
						Number(formData.get(`socket-target-y-${id}`)),
						Number(formData.get(`socket-target-z-${id}`))
					]
				}
			};
		});

		partsIds.forEach((id) => {
			newParts[formData.get(`part-model-id-${id}`)] = {
				...newParts[formData.get(`part-model-id-${id}`)],
				[formData.get(`part-name-${id}`)]: {
					id: id,
					name: formData.get(`part-name-${id}`),
					modelName: formData.get(`part-model-name-${id}`),
					displayName: formData.get(`part-displayName-${id}`),
					description: formData.get(`part-description-${id}`),
					materials: JSON.parse(formData.getAll(`part-materials-${id}`)),
					material: formData.get(`part-material-${id}`),
					color: formData.get(`part-color-${id}`),
					isAttachment: formData.get(`part-isAttachment-${id}`) === 'true' ? true : false,
					socket: formData.get(`part-socket-${id}`) || null,
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

		for await (const modelId of modelIds) {
			const icon = formData.get(`model-icon-${modelId}`);
			let uploadedIcon = null;

			if (icon && icon instanceof File && icon.size > 0) {
				console.log('NEW FILE ICON FOUND', icon);
				const { url } = await put(`users/${userId}/models/icons/${icon.name}`, icon, {
					access: 'public',
					token: BLOB_READ_WRITE_TOKEN,
					allowOverwrite: true
				});
				uploadedIcon = url;
			} else {
				console.log('NO NEW ICONS');
			}

			newModels.push({
				id: modelId,
				name: formData.get(`model-name-${modelId}`),
				displayName: formData.get(`model-displayName-${modelId}`),
				description: formData.get(`model-description-${modelId}`),
				url: formData.get(`model-url-${modelId}`),
				icon: uploadedIcon
					? uploadedIcon
					: formData.get(`model-icon-${modelId}`) === 'null'
						? null
						: formData.get(`model-icon-${modelId}`),
				parts: newParts[modelId],
				sockets: newSockets[modelId],
				isAttachment: formData.get(`model-isAttachment-${modelId}`) === 'true' ? true : false,
				socket: formData.get(`model-socket-${modelId}`) || null,
				updatedAt: new Date().toISOString(),
				userId: userId
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

		const updatedModels = await locals.db.query.model.findMany({
			where: eq(model.userId, userId)
		});
		return { updatedModels };
	},
	addModel: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) return;

		const userId = session?.user.id;

		const formData = await request.formData();
		const modelData = JSON.parse(formData.get('model'));
		modelData.file = formData.get('modelFile');
		modelData.userId = userId;

		let uploadedFile;

		if (modelData.file instanceof File) {
			console.log('NEW FILE MODEL FOUND', modelData.file);
			const { url } = await put(`users/${userId}/models/${modelData.file.name}`, modelData.file, {
				access: 'public',
				token: BLOB_READ_WRITE_TOKEN,
				allowOverwrite: true
			});
			uploadedFile = url;
		}

		modelData.url = uploadedFile;
		console.log(modelData);

		const modelsColumns = getTableColumns(model);
		const modelsUpdateFields = Object.fromEntries(
			Object.entries(modelsColumns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [key, sql.raw(`excluded.${column.name}`)])
		);

		await locals.db
			.insert(model)
			.values(modelData)
			.onConflictDoUpdate({ target: model.id, set: modelsUpdateFields });

		const updatedModels = await locals.db.query.model.findMany({ where: eq(model.userId, userId) });

		return { updatedModels };
	},
	addTexture: async ({ request, locals }) => {
		const session = locals.session;
		if (!session) return;

		const userId = session?.user.id;

		const formData = await request.formData();

		const texturesIds = formData.getAll('texture-id');
		// const texturesToDelete = formData.get('texturesToDelete');
		// console.log('TO DEL', texturesToDelete);

		// if (texturesToDelete) {
		// 	for await (const id of texturesToDelete?.toString()?.split(',')) {
		// 		console.log('usuwam', id);
		// 		const tex = await locals.db.select().from(texture).where(eq(texture.id, id));
		// 		console.log(tex);
		// 		await del(tex[0].url, { token: BLOB_READ_WRITE_TOKEN });
		// 		await locals.db.delete(texture).where(eq(texture.id, id));
		// 	}
		// }

		const newTextures = [];

		for await (const id of texturesIds) {
			const file = formData.get(`texture-file-${id}`) as File;

			const { url } = await put(`users/${userId}/textures/${file.name}`, file, {
				access: 'public',
				token: BLOB_READ_WRITE_TOKEN,
				allowOverwrite: true
			});

			newTextures.push({
				id: id,
				name: file.name.split('.')[0],
				url: url,
				updatedAt: new Date().toISOString(),
				userId: userId
			});
		}

		const texturesColumns = getTableColumns(texture);
		const textureUpdateFields = Object.fromEntries(
			Object.entries(texturesColumns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [
					key,
					// Używamy column.name, aby dostać czysty string nazwy kolumny w SQL
					sql.raw(`excluded.${column.name}`)
				])
		);

		if (newTextures.length > 0) {
			await locals.db
				.insert(texture)
				.values(newTextures)
				.onConflictDoUpdate({ target: texture.id, set: textureUpdateFields });
			console.log(newTextures);
		}
	},
	saveSettings: async ({ request, locals }) => {
		const formData = await request.formData();

		await updateConfig({ formData, locals });
		await updateColors({ formData, locals });
		await updateMaterials({ formData, locals });
		await updateModels({ formData, locals });
		await updateTextures({ formData, locals });

		return { success: true };
	}
};
