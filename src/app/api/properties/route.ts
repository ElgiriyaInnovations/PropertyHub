import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { optionalJWT } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("Properties API called with query:", request.nextUrl.searchParams);
    
    const filters = {
      city: request.nextUrl.searchParams.get('city') as string,
      state: request.nextUrl.searchParams.get('state') as string,
      propertyType: request.nextUrl.searchParams.get('propertyType') as string,
      minPrice: request.nextUrl.searchParams.get('minPrice') ? parseFloat(request.nextUrl.searchParams.get('minPrice')!) : undefined,
      maxPrice: request.nextUrl.searchParams.get('maxPrice') ? parseFloat(request.nextUrl.searchParams.get('maxPrice')!) : undefined,
      minBedrooms: request.nextUrl.searchParams.get('minBedrooms') ? parseInt(request.nextUrl.searchParams.get('minBedrooms')!) : undefined,
      status: request.nextUrl.searchParams.get('status') as string || "active",
      ownerId: request.nextUrl.searchParams.get('ownerId') as string,
    };

    console.log("Parsed filters:", filters);

    // Remove undefined and empty values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ""
      )
    );

    console.log("Clean filters passed to storage:", cleanFilters);

    const properties = await storage.getProperties(cleanFilters);
    
    console.log(`Found ${properties.length} properties`);
    
    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { message: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await optionalJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('=== CREATE PROPERTY API CALLED ===');
    console.log('User:', user?.id);
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const userId = user.id;
    console.log('Setting owner ID:', userId);
    
    // Create property data with ownerId, then validate
    const propertyDataWithOwner = {
      ...body,
      ownerId: userId,
    };
    
    console.log('Property data before validation:', propertyDataWithOwner);
    
    // Import the schema
    const { insertPropertySchema } = await import("@shared/schema");
    
    // Now validate the complete data including ownerId
    const propertyData = insertPropertySchema.parse(propertyDataWithOwner);
    
    console.log('Final property data for storage:', propertyData);

    console.log('Validation successful, creating property...');
    const property = await storage.createProperty(propertyData);
    console.log('Property created successfully:', property.id);
    
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    
    // Import the schema for error handling
    const { z } = await import("zod");
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { message: "Invalid property data", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create property", error: (error as Error).message },
      { status: 500 }
    );
  }
} 