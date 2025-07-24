# AWS S3 Configuration for PropertyHub

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Database Configuration
DATABASE_URL=your-neon-database-url

# JWT Configuration
JWT_SECRET=8af923537b7e5e38e45c0ca8893388f4332dc7b46d2b200da2c9ff4053d20988d9f26f58e8734e7e14a5c89455544dff12681340b264ad042df89691688d6ac1
JWT_REFRESH_SECRET=ab961f6231d10bf045217fb431cd0c15aa3dc11e0f43fa95c90169e452984e9c826dd7ae754a4f80f3838dd865f7f039118a87ca2c3dd4778eebd8e3203ddf35

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Optional: AWS CloudFront Distribution (for CDN)
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-distribution-id
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
```

## AWS Setup Instructions

### 1. Create AWS Account
- Go to [AWS Console](https://aws.amazon.com/)
- Create a new account or sign in

### 2. Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://your-propertyhub-bucket-name
aws s3api put-bucket-cors --bucket your-propertyhub-bucket-name --cors-configuration file://cors-config.json
```

### 3. Create IAM User
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-propertyhub-bucket-name/*"
        }
    ]
}
```

### 4. CORS Configuration
The `cors-config.json` file is already created in your project root.

### 5. Bucket Policy (Required - for public read access)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-propertyhub-bucket-name/*"
        }
    ]
}
```

### 6. Object Ownership Settings
1. Go to your S3 bucket → Permissions → Object Ownership
2. Choose "Bucket owner enforced" (recommended for security)
3. This disables ACLs but allows public access through bucket policy

## Security Best Practices

1. **Use IAM Roles** instead of access keys in production
2. **Enable bucket versioning** for data protection
3. **Set up CloudTrail** for audit logging
4. **Use CloudFront** for CDN and HTTPS
5. **Enable server-side encryption**
6. **Regular access key rotation**

## Environment Variables Explanation

- `AWS_REGION`: Your AWS region (e.g., us-east-1, eu-west-1)
- `AWS_ACCESS_KEY_ID`: Your IAM user access key
- `AWS_SECRET_ACCESS_KEY`: Your IAM user secret key
- `AWS_S3_BUCKET_NAME`: Your S3 bucket name
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: (Optional) For CDN
- `AWS_CLOUDFRONT_DOMAIN`: (Optional) For CDN domain

## Quick Setup Commands

```bash
# Generate environment template
npm run setup:aws

# Set up AWS CLI (if not already installed)
aws configure

# Create bucket and set CORS
aws s3 mb s3://your-bucket-name
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors-config.json
``` 