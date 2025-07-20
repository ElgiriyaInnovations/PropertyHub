import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { clearTokenCookies } from "@/lib/auth";
import { authenticateJWT } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Clear refresh token from database
    await storage.updateRefreshToken(user.id, null, null);
    
    // Create response
    const response = NextResponse.json({ message: "Logout successful" });
    
    // Clear cookies
    clearTokenCookies(response);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Logout failed" },
      { status: 500 }
    );
  }
} 