import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { authenticateJWT } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const favorites = await storage.getUserFavorites(user.id);
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { message: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
} 