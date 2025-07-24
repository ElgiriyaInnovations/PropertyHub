import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { authenticateJWT } from "@/lib/auth";

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
      needsBrokerServices: request.nextUrl.searchParams.get('needsBrokerServices') === 'true' ? true : undefined,
    };
    
    console.log("Parsed filters:", filters);
    console.log("OwnerId filter:", filters.ownerId);

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
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('=== CREATE PROPERTY API CALLED ===');
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('User ID:', user?.id);
    console.log('User ID type:', typeof user?.id);
    
    // Verify the user exists in the database
    const { storage } = await import("@/lib/storage");
    const dbUser = await storage.getUser(user.id);
    console.log('Database user found:', !!dbUser);
    if (dbUser) {
      console.log('Database user ID:', dbUser.id);
    } else {
      console.error('User not found in database for ID:', user.id);
      return NextResponse.json(
        { message: "User not found in database. Please log in again." },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const userId = user.id;
    console.log('Setting owner ID:', userId);
    
    // Convert string values to numbers where needed
    const processedBody = {
      ...body,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      bedrooms: body.bedrooms ? parseInt(body.bedrooms, 10) : undefined,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms, 10) : undefined,
      squareFeet: body.squareFeet ? parseInt(body.squareFeet, 10) : undefined,
    };
    
    // Create property data with ownerId, then validate
    const propertyDataWithOwner = {
      ...processedBody,
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
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        message: "Failed to create property", 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 