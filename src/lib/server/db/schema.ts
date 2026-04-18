import { relations, sql, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, int, primaryKey } from 'drizzle-orm/sqlite-core';
import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoid = customAlphabet(alphabet, 21); // 21 is the default length

export const color = sqliteTable('color', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: text('name').notNull(),
	displayName: text('display_name'),
	color: text('color').notNull(),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const material = sqliteTable('material', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: text('name').notNull(),
	displayName: text('display_name').notNull(),
	description: text('description').notNull(),
	metalness: int('metalness').default(0),
	roughness: int('roughness').default(0),
	transparent: int('transparent').default(0),
	opacity: int('opacity').default(1),
	color: text('color'),
	colors: text('colors', { mode: 'json' }).$type<string[]>(),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const model = sqliteTable('model', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: text('name').notNull(),
	displayName: text('display_name'),
	description: text('description'),
	url: text('url'),
	parts: text('parts', { mode: 'json' }).$type<
		{
			name: string;
			displayName: string;
			description: string;
			material: string;
			color: string;
			position: [number, number, number];
			target: [number, number, number];
			materials: string[];
		}[]
	>(),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const texture = sqliteTable('texture', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: text('name').notNull(),
	url: text('url')
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: text('expires_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export type Model = InferSelectModel<typeof model>;
export type Texture = InferSelectModel<typeof texture>;
export type Material = InferSelectModel<typeof material>;
export type Color = InferSelectModel<typeof color>;
