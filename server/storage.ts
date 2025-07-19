import {
  users,
  properties,
  propertyFavorites,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Message,
  type InsertMessage,
  type Conversation,
  type InsertConversation,
  type PropertyFavorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, ilike, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (JWT Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  updateRefreshToken(id: string, refreshToken: string | null, expiry: Date | null): Promise<void>;

  // Property operations
  getProperties(filters?: {
    city?: string;
    state?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    status?: string;
    ownerId?: string;
  }): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;

  // Favorites
  addFavorite(userId: string, propertyId: number): Promise<PropertyFavorite>;
  removeFavorite(userId: string, propertyId: number): Promise<void>;
  getUserFavorites(userId: string): Promise<Property[]>;

  // Messaging
  getOrCreateConversation(participant1Id: string, participant2Id: string, propertyId?: number): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; property?: Property; lastMessage?: Message }>>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for JWT Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData as any)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() } as any)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string | null, expiry: Date | null): Promise<void> {
    await db
      .update(users)
      .set({ 
        refreshToken, 
        refreshTokenExpiry: expiry,
        updatedAt: new Date()
      } as any)
      .where(eq(users.id, id));
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Property operations
  async getProperties(filters?: {
    city?: string;
    state?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    status?: string;
    ownerId?: string;
  }): Promise<Property[]> {
    console.log("Storage getProperties called with filters:", filters);
    
    let query = db.select({
      id: properties.id,
      title: properties.title,
      description: properties.description,
      price: properties.price,
      propertyType: properties.propertyType,
      status: properties.status,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      squareFeet: properties.squareFeet,
      address: properties.address,
      city: properties.city,
      state: properties.state,
      zipCode: properties.zipCode,
      latitude: properties.latitude,
      longitude: properties.longitude,
      images: properties.images,
      amenities: properties.amenities,
      ownerId: properties.ownerId,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
      owner: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: sql<string>`COALESCE(${users.role}, 'buyer')`.as('role'),
      }
    }).from(properties).leftJoin(users, eq(properties.ownerId, users.id));

    const conditions = [];

    if (filters) {
      // Handle location search - if city and state are the same (from location search), 
      // combine them into a single OR condition
      if (filters.city && filters.state && filters.city === filters.state) {
        console.log("Adding combined location filter:", filters.city);
        conditions.push(
          or(
            ilike(properties.city, `%${filters.city}%`),
            ilike(properties.state, `%${filters.city}%`),
            ilike(properties.address, `%${filters.city}%`)
          )
        );
      } else {
        // Handle separate city and state filters
        if (filters.city) {
          console.log("Adding city filter:", filters.city);
          conditions.push(
            or(
              ilike(properties.city, `%${filters.city}%`),
              ilike(properties.address, `%${filters.city}%`)
            )
          );
        }
        if (filters.state) {
          console.log("Adding state filter:", filters.state);
          conditions.push(ilike(properties.state, `%${filters.state}%`));
        }
      }
      if (filters.propertyType) {
        console.log("Adding propertyType filter:", filters.propertyType);
        conditions.push(eq(properties.propertyType, filters.propertyType));
      }
      if (filters.minPrice) {
        console.log("Adding minPrice filter:", filters.minPrice);
        conditions.push(gte(sql`CAST(${properties.price} AS DECIMAL)`, filters.minPrice));
      }
      if (filters.maxPrice) {
        console.log("Adding maxPrice filter:", filters.maxPrice);
        conditions.push(lte(sql`CAST(${properties.price} AS DECIMAL)`, filters.maxPrice));
      }
      if (filters.minBedrooms) {
        console.log("Adding minBedrooms filter:", filters.minBedrooms);
        conditions.push(gte(properties.bedrooms, filters.minBedrooms));
      }
      if (filters.status) {
        console.log("Adding status filter:", filters.status);
        conditions.push(eq(properties.status, filters.status));
      }
      if (filters.ownerId) {
        console.log("Adding ownerId filter:", filters.ownerId);
        conditions.push(eq(properties.ownerId, filters.ownerId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(properties.createdAt));
    console.log(`Storage found ${result.length} properties after filtering`);
    return result;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    console.log('Storage: Creating property with data:', JSON.stringify(property, null, 2));
    console.log('Owner ID in storage:', property.ownerId);
    
    const [newProperty] = await db
      .insert(properties)
      .values(property as any)
      .returning();
      
    console.log('Storage: Property created successfully:', newProperty.id);
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() } as any)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Favorites
  async addFavorite(userId: string, propertyId: number): Promise<PropertyFavorite> {
    const [favorite] = await db
      .insert(propertyFavorites)
      .values({ userId, propertyId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, propertyId: number): Promise<void> {
    await db
      .delete(propertyFavorites)
      .where(and(eq(propertyFavorites.userId, userId), eq(propertyFavorites.propertyId, propertyId)));
  }

  async getUserFavorites(userId: string): Promise<Property[]> {
    return db
      .select({
        id: properties.id,
        title: properties.title,
        description: properties.description,
        price: properties.price,
        propertyType: properties.propertyType,
        status: properties.status,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareFeet: properties.squareFeet,
        address: properties.address,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        latitude: properties.latitude,
        longitude: properties.longitude,
        images: properties.images,
        amenities: properties.amenities,
        ownerId: properties.ownerId,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
      })
      .from(propertyFavorites)
      .innerJoin(properties, eq(propertyFavorites.propertyId, properties.id))
      .where(eq(propertyFavorites.userId, userId));
  }

  // Messaging
  async getOrCreateConversation(participant1Id: string, participant2Id: string, propertyId?: number): Promise<Conversation> {
    // Try to find existing conversation
    const [existing] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participant1Id, participant1Id),
            eq(conversations.participant2Id, participant2Id),
            propertyId ? eq(conversations.propertyId, propertyId) : sql`property_id IS NULL`
          ),
          and(
            eq(conversations.participant1Id, participant2Id),
            eq(conversations.participant2Id, participant1Id),
            propertyId ? eq(conversations.propertyId, propertyId) : sql`property_id IS NULL`
          )
        )
      );

    if (existing) {
      return existing;
    }

    // Create new conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        participant1Id,
        participant2Id,
        propertyId,
      })
      .returning();

    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; property?: Property; lastMessage?: Message }>> {
    return db
      .select({
        id: conversations.id,
        participant1Id: conversations.participant1Id,
        participant2Id: conversations.participant2Id,
        propertyId: conversations.propertyId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        otherUser: {
          id: sql`CASE WHEN ${conversations.participant1Id} = ${userId} THEN ${users.id} ELSE p1.id END`.as('other_user_id'),
          email: sql`CASE WHEN ${conversations.participant1Id} = ${userId} THEN ${users.email} ELSE p1.email END`.as('other_user_email'),
          firstName: sql`CASE WHEN ${conversations.participant1Id} = ${userId} THEN ${users.firstName} ELSE p1.first_name END`.as('other_user_first_name'),
          lastName: sql`CASE WHEN ${conversations.participant1Id} = ${userId} THEN ${users.lastName} ELSE p1.last_name END`.as('other_user_last_name'),
          profileImageUrl: sql`CASE WHEN ${conversations.participant1Id} = ${userId} THEN ${users.profileImageUrl} ELSE p1.profile_image_url END`.as('other_user_profile_image'),
          role: sql`CASE WHEN ${conversations.participant1Id} = ${userId} THEN ${users.role} ELSE p1.role END`.as('other_user_role'),
        },
        property: properties,
      })
      .from(conversations)
      .leftJoin(users, eq(conversations.participant2Id, users.id))
      .leftJoin(sql`users p1`, sql`${conversations.participant1Id} = p1.id`)
      .leftJoin(properties, eq(conversations.propertyId, properties.id))
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.updatedAt)) as any;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`sender_id != ${userId}`
        )
      );
  }
}

export const storage = new DatabaseStorage();
