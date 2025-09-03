import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brokers, users } from "shared/schema";
import { eq, and, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const specialty = searchParams.get("specialty") || "";

    // Query brokers with user information
    let query = db
      .select({
        broker: brokers,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(brokers)
      .innerJoin(users, eq(brokers.userId, users.id))
      .where(eq(brokers.isActive, true));

    // Apply filters
    const conditions = [eq(brokers.isActive, true)];

    if (search) {
      conditions.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(brokers.bio, `%${search}%`),
          like(brokers.location, `%${search}%`)
        )!
      );
    }

    if (location) {
      conditions.push(like(brokers.location, `%${location}%`));
    }

    if (specialty) {
      // For specialty filtering, we need to check if the specialty exists in the specialties array
      // This is a simplified approach - in production you might want to use a more sophisticated search
      conditions.push(like(brokers.specialties, `%${specialty}%`));
    }

    const results = await db
      .select({
        broker: brokers,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(brokers)
      .innerJoin(users, eq(brokers.userId, users.id))
      .where(and(...conditions));

    // Transform the data to match the expected broker format
    const formattedBrokers = results.map(({ broker, user }) => ({
      id: broker.id.toString(),
      firstName: user.firstName || "Unknown",
      lastName: user.lastName || "User",
      email: user.email,
      phone: broker.phone || "Not provided",
      location: broker.location,
      experience: `${broker.experience} years`,
      specialties: broker.specialties,
      rating: broker.rating,
      totalSales: broker.totalSales,
      profileImage: broker.profileImageUrl || user.profileImageUrl,
      bio: broker.bio || "Professional real estate broker",
      languages: broker.languages,
      certifications: broker.certifications,
      licenseNumber: broker.licenseNumber,
      commissionRate: broker.commissionRate,
      website: broker.website,
      linkedin: broker.linkedin,
      isVerified: broker.isVerified,
    }));

    return NextResponse.json(formattedBrokers);
  } catch (error) {
    console.error("Error fetching brokers:", error);
    return NextResponse.json(
      { error: "Failed to fetch brokers" },
      { status: 500 }
    );
  }
}
