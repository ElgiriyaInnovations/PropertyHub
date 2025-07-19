import { pgTable, index, varchar, jsonb, timestamp, unique, text, boolean, foreignKey, serial, integer, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	email: varchar().notNull(),
	password: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	phone: varchar(),
	bio: text(),
	googleId: varchar("google_id"),
	githubId: varchar("github_id"),
	linkedinId: varchar("linkedin_id"),
	refreshToken: varchar("refresh_token"),
	refreshTokenExpiry: timestamp("refresh_token_expiry", { mode: 'string' }),
	emailVerified: boolean("email_verified").default(false),
	resetPasswordToken: varchar("reset_password_token"),
	resetPasswordExpiry: timestamp("reset_password_expiry", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_google_id_unique").on(table.googleId),
	unique("users_github_id_unique").on(table.githubId),
	unique("users_linkedin_id_unique").on(table.linkedinId),
]);

export const conversations = pgTable("conversations", {
	id: serial().primaryKey().notNull(),
	participant1Id: varchar("participant1_id").notNull(),
	participant2Id: varchar("participant2_id").notNull(),
	propertyId: integer("property_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.participant1Id],
			foreignColumns: [users.id],
			name: "conversations_participant1_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.participant2Id],
			foreignColumns: [users.id],
			name: "conversations_participant2_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "conversations_property_id_properties_id_fk"
		}),
]);

export const properties = pgTable("properties", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	propertyType: varchar("property_type").notNull(),
	status: varchar().default('active').notNull(),
	bedrooms: integer(),
	bathrooms: integer(),
	squareFeet: integer("square_feet"),
	address: varchar({ length: 500 }).notNull(),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 50 }).notNull(),
	zipCode: varchar("zip_code", { length: 10 }).notNull(),
	latitude: numeric({ precision: 10, scale:  8 }),
	longitude: numeric({ precision: 11, scale:  8 }),
	images: jsonb().default([]),
	amenities: jsonb().default([]),
	ownerId: varchar("owner_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "properties_owner_id_users_id_fk"
		}),
]);

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	conversationId: integer("conversation_id").notNull(),
	senderId: varchar("sender_id").notNull(),
	content: text().notNull(),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "messages_conversation_id_conversations_id_fk"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_users_id_fk"
		}),
]);

export const propertyFavorites = pgTable("property_favorites", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: integer("property_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "property_favorites_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_favorites_property_id_properties_id_fk"
		}),
]);
