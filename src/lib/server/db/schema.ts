import {
	pgTable,
	integer,
	text,
	timestamp,
	uuid,
	boolean,
	type AnyPgColumn,
	index,
	pgEnum,
	jsonb,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { now } from './helpers';

// Tables

export const users = pgTable('user', {
	id: uuid().primaryKey().defaultRandom(),
	firstName: text(),
	lastName: text(),
	email: text().notNull().unique(),
	passwordHash: text(),
	avatarUrl: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().$onUpdate(now)
});

export const provider = pgEnum('provider', ['google', 'github']);
export const oauth = pgTable(
	'oauth',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id),
		provider: provider().notNull(),
		providerId: text().notNull(),
		data: jsonb(),
		createdAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().$onUpdate(now)
	},
	(table) => [uniqueIndex('oauth_provider_provider_id_unique').on(table.provider, table.providerId)]
);

export const sessions = pgTable('session', {
	id: text().primaryKey(),
	userId: uuid()
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp({ withTimezone: true, mode: 'date' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().$onUpdate(now)
});

export const chats = pgTable(
	'chats',
	{
		id: uuid().primaryKey(),
		userId: uuid()
			.notNull()
			.references(() => users.id),
		title: text().notNull(),
		rootMessageId: uuid().references((): AnyPgColumn => messages.id),
		currentMessageId: uuid().references((): AnyPgColumn => messages.id),
		saved: boolean().default(false),
		generations: integer().default(0),
		deleteAfter: timestamp(),
		createdAt: timestamp().defaultNow(),
		updatedAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow().$onUpdate(now)
	},
	(table) => [index('chats_user_id_idx').on(table.userId)]
);
export const authorRoleEnum = pgEnum('author_role', ['user', 'assistant', 'system']);

export const messages = pgTable(
	'messages',
	{
		id: uuid().primaryKey().defaultRandom(),
		chatId: uuid()
			.notNull()
			.references(() => chats.id, { onDelete: 'cascade' }),
		parentId: uuid().references((): AnyPgColumn => messages.id, { onDelete: 'set null' }),
		authorRole: authorRoleEnum().notNull(),
		modelId: uuid().references(() => models.id, { onDelete: 'restrict' }),
		status: text(),
		createdAt: timestamp().defaultNow(),
		updatedAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow().$onUpdate(now)
	},
	(table) => [index('messages_chat_id_idx').on(table.chatId)]
);

export const contentTypeEnum = pgEnum('content_type', ['text', 'file']);
export const contents = pgTable('contents', {
	id: uuid().primaryKey().defaultRandom(),
	messageId: uuid()
		.notNull()
		.references(() => messages.id, { onDelete: 'cascade' }),
	type: contentTypeEnum().notNull(),
	text: text(),
	fileId: uuid().references(() => files.id, { onDelete: 'cascade' }),
	createdAt: timestamp().defaultNow()
});

export const files = pgTable(
	'files',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		key: text().notNull(),
		mimeType: text().notNull(),
		sizeBytes: integer(),
		createdAt: timestamp().defaultNow()
	},
	(t) => [index('files_user_id_idx').on(t.userId)] // quick look-ups
);

export const endpointTypeEnum = pgEnum('endpoint_type', [
	'openai',
	'anthropic'
	// 'deepseek',
	// 'google',
]);

export const modalityEnum = pgEnum('modality', ['text', 'image', 'audio']);

export const vendors = pgTable('vendors', {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull().unique(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow().$onUpdate(now)
});

export const models = pgTable('models', {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	description: text(),
	modalities: modalityEnum().array().notNull().default(['text']),
	vendorId: uuid().references(() => vendors.id),
	active: boolean().default(true),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow().$onUpdate(now)
});

export const endpoints = pgTable('endpoints', {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	endpointType: endpointTypeEnum().notNull(),
	baseUrl: text(),
	config: jsonb(),
	active: boolean().default(true),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow().$onUpdate(now)
});

export const modelsEndpoints = pgTable(
	'models_endpoints',
	{
		modelId: uuid()
			.notNull()
			.references(() => models.id, { onDelete: 'cascade' }),
		endpointId: uuid()
			.notNull()
			.references(() => endpoints.id, { onDelete: 'cascade' }),
		endpointModelName: text().notNull(),
		createdAt: timestamp().defaultNow(),
		updatedAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow().$onUpdate(now)
	},
	(table) => [uniqueIndex('model_endpoint_unique').on(table.modelId, table.endpointId)]
);

export const userEndpoint = pgTable(
	'user_endpoint',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		endpointId: uuid()
			.notNull()
			.references(() => endpoints.id, { onDelete: 'cascade' }),
		apiKey: text().notNull(),
		createdAt: timestamp().defaultNow(),
		updatedAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow().$onUpdate(now)
	},
	(table) => [uniqueIndex('user_endpoint_key_unique').on(table.userId, table.endpointId)]
);

// Relations
export const chatsRelations = relations(chats, ({ one, many }) => ({
	currentMessage: one(messages, {
		fields: [chats.currentMessageId],
		references: [messages.id]
	}),
	messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
	chat: one(chats, {
		fields: [messages.chatId],
		references: [chats.id]
	}),
	parent: one(messages, {
		// self-reference
		fields: [messages.parentId],
		references: [messages.id]
	}),
	contents: many(contents),
	model: one(models, {
		fields: [messages.modelId],
		references: [models.id]
	})
}));

export const contentsRelations = relations(contents, ({ one }) => ({
	file: one(files, {
		fields: [contents.fileId],
		references: [files.id]
	}),
	message: one(messages, {
		fields: [contents.messageId],
		references: [messages.id]
	})
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
	models: many(models)
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
	vendor: one(vendors, { fields: [models.vendorId], references: [vendors.id] }),
	endpoints: many(modelsEndpoints)
}));

export const endpointsRelations = relations(endpoints, ({ many }) => ({
	models: many(modelsEndpoints)
}));

export const modelsToEndpointsRelations = relations(modelsEndpoints, ({ one }) => ({
	model: one(models, {
		fields: [modelsEndpoints.modelId],
		references: [models.id]
	}),
	endpoint: one(endpoints, {
		fields: [modelsEndpoints.endpointId],
		references: [endpoints.id]
	})
}));

export const filesRelations = relations(files, ({ one }) => ({
	owner: one(users, { fields: [files.userId], references: [users.id] })
}));

export const userEndpointRelations = relations(userEndpoint, ({ one }) => ({
	user: one(users, {
		fields: [userEndpoint.userId],
		references: [users.id]
	}),
	endpoint: one(endpoints, {
		fields: [userEndpoint.endpointId],
		references: [endpoints.id]
	})
}));

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type File = typeof files.$inferSelect;
export type Content = typeof contents.$inferSelect;
export type Model = typeof models.$inferSelect;
export type Endpoint = typeof endpoints.$inferSelect;
export type ModelToEndpoint = typeof modelsEndpoints.$inferSelect;
export type UserEndpointKey = typeof userEndpoint.$inferSelect;
