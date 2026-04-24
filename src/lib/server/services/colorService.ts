import { getTableColumns, sql } from 'drizzle-orm';
import { color } from '../db/schema';

export async function updateColors({ formData, locals }) {
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
}
