import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: blob("sess").notNull(),
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with JWT authentication
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  password: text("password"), // for local auth
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  phone: text("phone"),
  bio: text("bio"),
  // SSO fields
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
  linkedinId: text("linkedin_id").unique(),
  // JWT refresh tokens
  refreshToken: text("refresh_token"),
  refreshTokenExpiry: integer("refresh_token_expiry", { mode: 'timestamp' }),
  emailVerified: integer("email_verified", { mode: 'boolean' }).default(false),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpiry: integer("reset_password_expiry", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

// Properties table
export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  propertyType: text("property_type", { 
    enum: ["house", "apartment", "condo", "townhouse", "land", "commercial"] 
  }).notNull(),
  status: text("status", { 
    enum: ["active", "pending", "sold", "rented"] 
  }).notNull().default("active"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  squareFeet: integer("square_feet"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  images: blob("images", { mode: 'json' }).$type<string[]>().default([]),
  amenities: blob("amenities", { mode: 'json' }).$type<string[]>().default([]),
  needsBrokerServices: integer("needs_broker_services", { mode: 'boolean' }),
  ownerId: text("owner_id").references(() => users.id).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

// Property inquiries/favorites
export const propertyFavorites = sqliteTable("property_favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
});

// Messages/conversations
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participant1Id: text("participant1_id").references(() => users.id).notNull(),
  participant2Id: text("participant2_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).defaultNow(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: text("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  favorites: many(propertyFavorites),
  sentMessages: many(messages),
  conversations1: many(conversations, { relationName: "participant1" }),
  conversations2: many(conversations, { relationName: "participant2" }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  favorites: many(propertyFavorites),
  conversations: many(conversations),
}));

export const propertyFavoritesRelations = relations(propertyFavorites, ({ one }) => ({
  user: one(users, {
    fields: [propertyFavorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [propertyFavorites.propertyId],
    references: [properties.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
    relationName: "participant1",
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
    relationName: "participant2",
  }),
  property: one(properties, {
    fields: [conversations.propertyId],
    references: [properties.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Zod schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  price: z.number().positive("Price must be positive"),
  propertyType: z.enum(["house", "apartment", "condo", "townhouse", "land", "commercial"]),
  status: z.enum(["active", "pending", "sold", "rented"]).default("active"),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  squareFeet: z.number().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  needsBrokerServices: z.boolean().optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
});

// For client-side validation (without ownerId)
export const clientPropertySchema = insertPropertySchema.omit({
  ownerId: true,
});

export const insertMessageSchema = z.object({
  conversationId: z.number(),
  senderId: z.string().min(1, "Sender ID is required"),
  content: z.string().min(1, "Message content is required"),
  isRead: z.boolean().default(false),
});

export const insertConversationSchema = z.object({
  participant1Id: z.string().min(1, "Participant 1 ID is required"),
  participant2Id: z.string().min(1, "Participant 2 ID is required"),
  propertyId: z.number().optional(),
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type PropertyFavorite = typeof propertyFavorites.$inferSelect;
