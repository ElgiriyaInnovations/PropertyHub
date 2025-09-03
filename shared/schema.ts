import {
  pgTable,
  text,
  integer,
  real,
  jsonb,
  timestamp,
  boolean,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with JWT authentication
export const users = pgTable("users", {
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
  refreshTokenExpiry: timestamp("refresh_token_expiry"),
  emailVerified: boolean("email_verified").default(false),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpiry: timestamp("reset_password_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
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
  images: jsonb("images").$type<string[]>().default([]),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  needsBrokerServices: boolean("needs_broker_services"),
  ownerId: text("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property inquiries/favorites
export const propertyFavorites = pgTable("property_favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Brokers table - separate from users for broker-specific information
export const brokers = pgTable("brokers", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull().unique(),
  licenseNumber: text("license_number").notNull().unique(),
  experience: integer("experience").notNull(), // years of experience
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  languages: jsonb("languages").$type<string[]>().default([]),
  location: text("location").notNull(),
  serviceAreas: jsonb("service_areas").$type<string[]>().default([]),
  commissionRate: real("commission_rate"), // percentage
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  phone: text("phone"),
  website: text("website"),
  linkedin: text("linkedin"),
  rating: real("rating").default(0),
  totalSales: integer("total_sales").default(0),
  totalReviews: integer("total_reviews").default(0),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages/conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  participant1Id: text("participant1_id").references(() => users.id).notNull(),
  participant2Id: text("participant2_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: text("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  properties: many(properties),
  favorites: many(propertyFavorites),
  sentMessages: many(messages),
  conversations1: many(conversations, { relationName: "participant1" }),
  conversations2: many(conversations, { relationName: "participant2" }),
  brokerProfile: one(brokers, {
    fields: [users.id],
    references: [brokers.userId],
  }),
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

export const brokersRelations = relations(brokers, ({ one }) => ({
  user: one(users, {
    fields: [brokers.userId],
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

// Broker schemas
export const insertBrokerSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  experience: z.number().min(0, "Experience must be non-negative"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  location: z.string().min(1, "Location is required"),
  serviceAreas: z.array(z.string()).default([]),
  commissionRate: z.number().min(0).max(100).optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// For client-side validation (without userId)
export const clientBrokerSchema = insertBrokerSchema.omit({
  userId: true,
});

export type InsertBroker = z.infer<typeof insertBrokerSchema>;
export type Broker = typeof brokers.$inferSelect;
