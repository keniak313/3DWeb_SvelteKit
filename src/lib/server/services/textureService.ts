import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { put, del } from '@vercel/blob';
import { texture } from '../db/schema';

export async function updateTextures({ formData, locals }: { formData: FormData; locals: any }) {
	const texturesIds = formData.getAll('texture-id');
	const texturesToDelete = formData.get('texturesToDelete');
	console.log('TO DEL', texturesToDelete);

	if (texturesToDelete) {
		for await (const id of texturesToDelete?.toString()?.split(',')) {
			console.log('usuwam', id);
			const tex = await locals.db.select().from(texture).where(eq(texture.id, id));
			console.log(tex);
			await del(tex[0].url, { token: BLOB_READ_WRITE_TOKEN });
			await locals.db.delete(texture).where(eq(texture.id, id));
		}
	}

	const newTextures = [];

	for await (const id of texturesIds) {
		const file = formData.get(`texture-file-${id}`) as File;

		const { url } = await put('textures/' + file.name, file, {
			access: 'public',
			token: BLOB_READ_WRITE_TOKEN,
			allowOverwrite: true
		});

		newTextures.push({
			id: id,
			name: file.name.split('.')[0],
			url: url,
			updatedAt: new Date().toISOString()
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
