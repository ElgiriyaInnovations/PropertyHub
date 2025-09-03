import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { authenticateJWT } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const propertyId = parseInt(params.propertyId);
    const isFavorited = await storage.isPropertyFavorited(user.id, propertyId);
    return NextResponse.json({ isFavorited });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return NextResponse.json(
      { message: "Failed to check favorite status" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const propertyId = parseInt(params.propertyId);
    const favorite = await storage.addFavorite(user.id, propertyId);
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { message: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const propertyId = parseInt(params.propertyId);
    await storage.removeFavorite(user.id, propertyId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { message: "Failed to remove favorite" },
      { status: 500 }
    );
  }
} 