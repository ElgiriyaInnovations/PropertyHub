import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "@/lib/storage";
import { hashPassword, generateTokens, setTokenCookies } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required").regex(/^[\+]?[\d\s\-\(\)]{10,15}$/, "Please enter a valid phone number (10-15 digits)"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create user
    const userId = uuidv4();
    const user = await storage.createUser({
      id: userId,
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      emailVerified: false,
    });

    // Generate tokens (role will be managed client-side)
    const { accessToken, refreshToken } = generateTokens(user.id, user.email!, "buyer");
    
    // Store refresh token
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await storage.updateRefreshToken(user.id, refreshToken, refreshTokenExpiry);

    // Create response
    const response = NextResponse.json({
      message: "User registered successfully",
      user: { ...user, role: "buyer" }, // Default to buyer, can be changed client-side
      accessToken,
    }, { status: 201 });

    // Set cookies
    setTokenCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
} 