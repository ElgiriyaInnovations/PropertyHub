import { z } from "zod";

// Client-side property schema (without server dependencies)
export const clientPropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
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
});

// Property type for client-side use
export interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  propertyType: "house" | "apartment" | "condo" | "townhouse" | "land" | "commercial";
  status: "active" | "pending" | "sold" | "rented";
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  amenities: string[];
  needsBrokerServices?: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
    role?: string;
  };
}

export type InsertProperty = z.infer<typeof clientPropertySchema>; 