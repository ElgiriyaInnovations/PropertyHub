import { NextRequest, NextResponse } from "next/server";
import { authenticateJWT } from "@/lib/auth";
import { S3Service } from "@/lib/s3";

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Extract S3 key from URL
    const key = S3Service.extractKeyFromUrl(imageUrl);
    if (!key) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    // Delete file from S3
    await S3Service.deleteFile(key);

    return NextResponse.json({ 
      message: "Image deleted successfully" 
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json({ 
      error: "Failed to delete image" 
    }, { status: 500 });
  }
} 