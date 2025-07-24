import { NextRequest, NextResponse } from "next/server";
import { authenticateJWT } from "@/lib/auth";
import { S3Service } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateJWT(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate file types and sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}` 
        }, { status: 400 });
      }

      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `File too large: ${file.name}. Maximum size: 5MB` 
        }, { status: 400 });
      }
    }

    // Upload files to S3
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadFile = {
        buffer,
        originalname: file.name,
        mimetype: file.type,
      };

      return await S3Service.uploadFile(uploadFile, 'properties');
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.url);

    return NextResponse.json({ 
      message: "Images uploaded successfully",
      imageUrls 
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to upload images";
    if (error instanceof Error) {
      if (error.message.includes('AccessControlListNotSupported')) {
        errorMessage = "S3 bucket configuration issue: ACLs are disabled. Please configure bucket policy for public access.";
      } else if (error.message.includes('NoSuchBucket')) {
        errorMessage = "S3 bucket not found. Please check your AWS_S3_BUCKET_NAME configuration.";
      } else if (error.message.includes('AccessDenied')) {
        errorMessage = "Access denied to S3. Please check your AWS credentials and permissions.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 