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
		.default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at'),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' })
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
		.default(sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at'),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' })
});

export const model = sqliteTable('model', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: text('name').notNull(),
	displayName: text('display_name'),
	description: text('description'),
	url: text('url'),
	icon: text('icon'),
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
	isAttachment: int('is_attachment', { mode: 'boolean' }).default(false),
	socket: text('socket'),
	sockets: text('sockets', { mode: 'json' }),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
	deletedAt: text('deleted_at'),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' })
});

export const texture = sqliteTable('texture', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: text('name').notNull(),
	url: text('url'),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' })
});

export const config = sqliteTable('config', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: text('name').notNull(),
	settings: text('settings', { mode: 'json' })
});

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	username: text('username').unique().notNull(),
	displayName: text('display_name'),
	email: text('email').notNull().unique(),
	emailVerified: int('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	role: text('role').notNull().default('user'),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: int('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as int))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: int('expires_at', { mode: 'timestamp_ms' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: int('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as int))`)
		.notNull(),
	updatedAt: int('updated_at', { mode: 'timestamp_ms' })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: int('access_token_expires_at', {
		mode: 'timestamp_ms'
	}),
	refreshTokenExpiresAt: int('refresh_token_expires_at', {
		mode: 'timestamp_ms'
	}),
	scope: text('scope'),
	password: text('password'),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: int('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as int))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: int('expires_at', { mode: 'timestamp_ms' }).notNull(),
	createdAt: text('created_at', { mode: 'text' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: int('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as int))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export type Model = InferSelectModel<typeof model>;
export type Texture = InferSelectModel<typeof texture>;
export type Material = InferSelectModel<typeof material>;
export type Color = InferSelectModel<typeof color>;
