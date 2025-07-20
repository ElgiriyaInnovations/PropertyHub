import { NextRequest, NextResponse } from "next/server";
import { authenticateJWT } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { password: _, refreshToken: __, ...userResponse } = user;
    
    // Get role from request headers (set by frontend)
    const clientRole = request.headers.get('x-user-role') as string;
    const role = clientRole && ["buyer", "seller", "broker"].includes(clientRole) 
      ? clientRole 
      : "buyer"; // fallback to buyer
    
    console.log("API /auth/user - Client role from headers:", clientRole);
    console.log("API /auth/user - Final role:", role);
    
    return NextResponse.json({ ...userResponse, role });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 