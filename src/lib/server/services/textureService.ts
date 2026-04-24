import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { getTableColumns, sql } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { texture } from '../db/schema';

export async function updateTextures({ formData, locals }: { formData: FormData; locals: any }) {
	const texturesIds = formData.getAll('texture-id');
	const newTextures = [];

	for await (const id of texturesIds) {
		const file = formData.get(`texture-file-${id}`) as File;
		const name = file.name.split('.')[0];

		const { url } = await put('textures/' + file.name, file, {
			access: 'public',
			token: BLOB_READ_WRITE_TOKEN,
			allowOverwrite: true
		});

		newTextures.push({
			id: id,
			name: name,
			url: url
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
}
