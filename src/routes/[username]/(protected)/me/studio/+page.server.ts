import { eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { color, config, material, model, session, texture } from '$lib/server/db/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { updateConfig } from '$lib/server/services/configService.js';
import { updateColors } from '$lib/server/services/colorService.js';
import { updateMaterials } from '$lib/server/services/materialService.js';
import { updateModels } from '$lib/server/services/modelService.js';
import { updateTextures } from '$lib/server/services/textureService.js';
import z from 'zod';

const requiredString = z.string().min(1, 'Required field');

const safeString = z.string().regex(/^[a-zA-Z0-9_!\- ]*$/, 'Invalid characters');

const safeStringNoSpaces = z
	.string()
	.regex(/^[a-zA-Z0-9_!\-]+$/, 'Spaces and special characters are not allowed');

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

		const colorSchema = z.object({
			id: z.string(),
			color: z.string().min(1, 'Color is required'),
			displayName: safeString,
			name: requiredString.pipe(safeStringNoSpaces),
			deletedAt: z.string().nullable(),
			userId: z.string()
		});

		const parsedData = z.array(colorSchema).safeParse(newColors);

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

		if (!parsedData.success) {
			const errors = z.treeifyError(parsedData.error);
			console.log('DATA ERRORS', errors);
			return fail(400, { error: { ...errors, formName: 'colors' } });
		}

		if (parsedData.data.length > 0) {
			await locals.db
				.insert(color)
				.values(parsedData.data)
				.onConflictDoUpdate({ target: color.id, set: colorUpdateFields });

			return { success: true, error: null };
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
				// transparent: formData.get(`material-transparent-${id}`) === 'on' ? 1 : 0,
				opacity: Number(formData.get(`material-opacity-${id}`)),
				color: formData.get(`material-color-${id}`) || null,
				colors: JSON.parse(formData.get(`material-colors-${id}`)),
				userId: userId
			};
		});

		const materialSchema = z.object({
			id: z.string(),
			name: requiredString.pipe(safeStringNoSpaces),
			displayName: safeString,
			description: safeString,
			metalness: z.number(),
			roughness: z.number(),
			// transparent: z.number(),
			opacity: z.number(),
			color: z.string({ message: 'Color is required' }),
			colors: z.array(z.object({ id: z.string() })).min(1, 'Colors are required'),
			userId: z.string()
		});

		const parsedData = z.array(materialSchema).safeParse(newMaterials);

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

		if (!parsedData.success) {
			const errors = z.treeifyError(parsedData.error);
			console.log('DATA ERRORS', errors);
			return fail(400, { error: { ...errors, formName: 'materials' } });
		}

		if (parsedData.data.length > 0) {
			await locals.db
				.insert(material)
				.values(parsedData.data)
				.onConflictDoUpdate({ target: material.id, set: materialUpdateFields });

			return { success: true, error: null };
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

		const modelSchema = z.object({
			id: z.string(),
			name: requiredString.pipe(safeStringNoSpaces),
			displayName: safeString,
			description: safeString,
			url: z.string(),
			icon: z.string().nullable(),
			isAttachment: z.boolean(),
			parts: z.record(
				z.string(),
				z.object({
					id: z.string(),
					name: requiredString.pipe(safeStringNoSpaces),
					modelName: z.string(),
					displayName: safeString,
					description: safeString,
					materials: z.array(z.object({ id: z.string() })).min(1, 'Materials are required'),
					material: z.string({ message: 'Material is required' }),
					color: z.string({ message: 'Color is required' }),
					isAttachment: z.boolean(),
					socket: z.string().nullable(),
					position: z.array(z.number()).length(3),
					target: z.array(z.number()).length(3)
				})
			),
			sockets: z
				.record(
					z.string(),
					z.object({
						id: z.string(),
						name: requiredString.pipe(safeStringNoSpaces),
						attachment: z.string(),
						attachments: z.array(z.object({ id: z.string() })),
						position: z.array(z.number()).length(3),
						target: z.array(z.number()).length(3)
					})
				)
				.optional(),
			socket: z.string().nullable(),
			updatedAt: z.string(),
			userId: z.string()
		});

		//DODAC SOCKETS I PARTS DO ZAKRESU WALIDACJI

		console.log('DANE DO WALIDACJI:', newModels);

		const parsedData = z.array(modelSchema).safeParse(newModels);

		if (!parsedData.success) {
			const errors = z.treeifyError(parsedData.error);
			console.log('DATA ERRORS', errors);
			return fail(400, { error: { ...errors, formName: 'models' } });
		}

		const modelsColumns = getTableColumns(model);
		const modelsUpdateFields = Object.fromEntries(
			Object.entries(modelsColumns)
				.filter(([key]) => key !== 'id')
				.map(([key, column]) => [key, sql.raw(`excluded.${column.name}`)])
		);

		if (parsedData.data.length > 0) {
			await locals.db
				.insert(model)
				.values(parsedData.data)
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
