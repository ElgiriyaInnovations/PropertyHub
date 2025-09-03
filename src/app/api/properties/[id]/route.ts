import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { authenticateJWT } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = parseInt(params.id);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { message: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const propertyId = parseInt(params.id);
    
    // Check if user owns the property
    const existingProperty = await storage.getProperty(propertyId);
    if (!existingProperty) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      );
    }
    
    if (existingProperty.ownerId !== user.id) {
      return NextResponse.json(
        { message: "Not authorized to update this property" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { insertPropertySchema } = await import("@shared/schema");
    const updateData = insertPropertySchema.partial().parse(body);
    const updatedProperty = await storage.updateProperty(propertyId, updateData);
    
    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
    
    const { z } = await import("zod");
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid property data", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const propertyId = parseInt(params.id);
    
    // Check if user owns the property
    const existingProperty = await storage.getProperty(propertyId);
    if (!existingProperty) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      );
    }
    
    if (existingProperty.ownerId !== user.id) {
      return NextResponse.json(
        { message: "Not authorized to delete this property" },
        { status: 403 }
      );
    }

    await storage.deleteProperty(propertyId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { message: "Failed to delete property" },
      { status: 500 }
    );
  }
} 