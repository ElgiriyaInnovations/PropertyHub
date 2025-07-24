import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { generateTokens, verifyToken, setTokenCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token provided" },
        { status: 401 }
      );
    }

    // Verify the refresh token
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    // Verify refresh token is still valid in database
    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { message: "Refresh token invalidated" },
        { status: 401 }
      );
    }

    // Check if refresh token has expired
    if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
      return NextResponse.json(
        { message: "Refresh token expired" },
        { status: 401 }
      );
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id, 
      user.email!, 
      "buyer" // Default role, can be enhanced to use stored role
    );

    // Store new refresh token
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await storage.updateRefreshToken(user.id, newRefreshToken, refreshTokenExpiry);

    // Create response (don't include tokens in response body for security)
    const response = NextResponse.json({
      message: "Token refreshed successfully",
    });

    // Set new cookies
    setTokenCookies(response, accessToken, newRefreshToken);

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { message: "Token refresh failed" },
      { status: 500 }
    );
  }
} 