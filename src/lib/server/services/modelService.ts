import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { getTableColumns, sql } from 'drizzle-orm';
import { model } from '../db/schema';
import { put } from '@vercel/blob';

export async function updateModels({ formData, locals }) {
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

	for await (const modelId of modelIds) {
		const icon = formData.get(`model-icon-${modelId}`);
		const file = formData.get(`model-file-${modelId}`);
		console.log('NEW FILE FOUND', file);
		console.log('NEW ICON FOUND', icon);
		let uploadedIcon = null;
		let uploadedFile = null;

		if (icon instanceof File) {
			console.log('NEW FILE ICON FOUND', icon);
			const { url } = await put('icons/' + icon.name, icon, {
				access: 'public',
				token: BLOB_READ_WRITE_TOKEN,
				allowOverwrite: true
			});
			uploadedIcon = url;
		}

		if (file instanceof File) {
			console.log('NEW FILE MODEL FOUND', file);
			const { url } = await put('models/' + file.name, file, {
				access: 'public',
				token: BLOB_READ_WRITE_TOKEN,
				allowOverwrite: true
			});
			uploadedFile = url;
		}

		newModels.push({
			id: modelId,
			name: formData.get(`model-name-${modelId}`),
			displayName: formData.get(`model-displayName-${modelId}`),
			description: formData.get(`model-description-${modelId}`),
			url: uploadedFile ? uploadedFile : formData.get(`model-url-${modelId}`),
			icon: uploadedIcon
				? uploadedIcon
				: formData.get(`model-icon-${modelId}`) === 'null'
					? null
					: formData.get(`model-icon-${modelId}`),
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

	console.log(newModels);
}
