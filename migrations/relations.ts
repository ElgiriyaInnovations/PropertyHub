import { relations } from "drizzle-orm/relations";
import { users, conversations, properties, messages, propertyFavorites } from "./schema";

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user_participant1Id: one(users, {
		fields: [conversations.participant1Id],
		references: [users.id],
		relationName: "conversations_participant1Id_users_id"
	}),
	user_participant2Id: one(users, {
		fields: [conversations.participant2Id],
		references: [users.id],
		relationName: "conversations_participant2Id_users_id"
	}),
	property: one(properties, {
		fields: [conversations.propertyId],
		references: [properties.id]
	}),
	messages: many(messages),
}));

export const usersRelations = relations(users, ({many}) => ({
	conversations_participant1Id: many(conversations, {
		relationName: "conversations_participant1Id_users_id"
	}),
	conversations_participant2Id: many(conversations, {
		relationName: "conversations_participant2Id_users_id"
	}),
	properties: many(properties),
	messages: many(messages),
	propertyFavorites: many(propertyFavorites),
}));

export const propertiesRelations = relations(properties, ({one, many}) => ({
	conversations: many(conversations),
	user: one(users, {
		fields: [properties.ownerId],
		references: [users.id]
	}),
	propertyFavorites: many(propertyFavorites),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	}),
}));

export const propertyFavoritesRelations = relations(propertyFavorites, ({one}) => ({
	user: one(users, {
		fields: [propertyFavorites.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [propertyFavorites.propertyId],
		references: [properties.id]
	}),
}));