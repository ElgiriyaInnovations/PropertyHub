import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/lib/storage";
import { comparePassword, generateTokens, setTokenCookies } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(validatedData.password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate tokens (role will be managed client-side)
    const { accessToken, refreshToken } = generateTokens(user.id, user.email!, "buyer");
    
    // Store refresh token
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await storage.updateRefreshToken(user.id, refreshToken, refreshTokenExpiry);

    // Create response (don't include tokens in response body for security)
    const response = NextResponse.json({
      message: "Login successful",
      user: { ...user, role: "buyer" }, // Default to buyer, can be changed client-side
    });

    // Set cookies
    setTokenCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
} 