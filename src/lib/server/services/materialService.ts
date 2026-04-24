import { getTableColumns, sql } from 'drizzle-orm';
import { material } from '../db/schema';

export async function updateMaterials({ formData, locals }) {
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
}
