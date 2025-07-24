import { NextRequest, NextResponse } from "next/server";
import { S3Service } from "@/lib/s3";

export async function GET(request: NextRequest) {
  try {
    // Test S3 configuration
    const testFile = {
      buffer: Buffer.from('test image data'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
    };

    const result = await S3Service.uploadFile(testFile, 'test');
    
    return NextResponse.json({ 
      message: "S3 configuration is working",
      uploadedFile: result
    });

  } catch (error) {
    console.error('S3 test error:', error);
    return NextResponse.json({ 
      error: "S3 configuration failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 