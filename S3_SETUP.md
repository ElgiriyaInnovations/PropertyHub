# S3 Image Upload Setup

This project now uses AWS S3 for image uploads instead of local file storage.

## Required Environment Variables

Add these environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

## AWS S3 Setup

1. **Create an S3 Bucket:**
   - Go to AWS S3 Console
   - Create a new bucket with a unique name
   - Choose your preferred region
   - Configure bucket settings (recommended: enable versioning for safety)

2. **Configure Bucket Permissions:**
   - Go to your bucket's "Permissions" tab
   - Update the bucket policy to allow public read access for images:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

3. **Create IAM User:**
   - Go to AWS IAM Console
   - Create a new user for your application
   - Attach the `AmazonS3FullAccess` policy (or create a custom policy with minimal permissions)
   - Generate access keys and use them in your environment variables

4. **CORS Configuration (if needed):**
   - In your S3 bucket settings, add CORS configuration if you plan to upload directly from the browser:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## Features

- **Automatic Upload:** Images are automatically uploaded to S3 when users add property images
- **Public URLs:** Images are stored with public read access for easy display
- **Automatic Cleanup:** When images are deleted, they're automatically removed from S3
- **File Validation:** Only image files (JPG, PNG, WebP) up to 5MB are allowed
- **Unique Naming:** Files are automatically renamed to prevent conflicts

## Migration from Local Storage

If you have existing images stored locally, you'll need to:
1. Upload them to S3 manually
2. Update your database to use the new S3 URLs
3. Remove the old local files

## Security Notes

- The S3 bucket allows public read access for images (necessary for displaying them)
- Only authenticated users can upload/delete images
- File size and type validation is enforced
- Consider using CloudFront for better performance and security 