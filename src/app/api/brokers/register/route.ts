import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brokers, users } from "shared/schema";
import { insertBrokerSchema } from "shared/schema";
import { eq } from "drizzle-orm";
import { authenticateJWT } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = insertBrokerSchema.parse({
      ...body,
      userId: user.id,
    });

    // Check if user already has a broker profile
    const existingBroker = await db
      .select()
      .from(brokers)
      .where(eq(brokers.userId, user.id))
      .limit(1);

    if (existingBroker.length > 0) {
      return NextResponse.json(
        { error: "User already has a broker profile" },
        { status: 400 }
      );
    }

    // Check if license number is already taken
    const existingLicense = await db
      .select()
      .from(brokers)
      .where(eq(brokers.licenseNumber, validatedData.licenseNumber))
      .limit(1);

    if (existingLicense.length > 0) {
      return NextResponse.json(
        { error: "License number already exists" },
        { status: 400 }
      );
    }

    // Create the broker profile
    const [newBroker] = await db
      .insert(brokers)
      .values(validatedData)
      .returning();

    return NextResponse.json(
      { 
        message: "Broker profile created successfully",
        broker: newBroker 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating broker profile:", error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create broker profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has a broker profile
    const brokerProfile = await db
      .select()
      .from(brokers)
      .where(eq(brokers.userId, user.id))
      .limit(1);

    if (brokerProfile.length === 0) {
      return NextResponse.json(
        { error: "No broker profile found" },
        { status: 404 }
      );
    }

    return NextResponse.json(brokerProfile[0]);

  } catch (error) {
    console.error("Error fetching broker profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch broker profile" },
      { status: 500 }
    );
  }
}
