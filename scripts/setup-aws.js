#!/usr/bin/env node

const crypto = require('crypto');

console.log('🚀 AWS S3 Setup for PropertyHub\n');

console.log('📋 Required Environment Variables for .env.local:\n');

const region = process.argv[2] || 'us-east-1';
const bucketName = process.argv[3] || 'propertyhub-assets';

console.log(`# Database Configuration
DATABASE_URL=your-neon-database-url

# JWT Configuration
JWT_SECRET=8af923537b7e5e38e45c0ca8893388f4332dc7b46d2b200da2c9ff4053d20988d9f26f58e8734e7e14a5c89455544dff12681340b264ad042df89691688d6ac1
JWT_REFRESH_SECRET=ab961f6231d10bf045217fb431cd0c15aa3dc11e0f43fa95c90169e452984e9c826dd7ae754a4f80f3838dd865f7f039118a87ca2c3dd4778eebd8e3203ddf35

# AWS S3 Configuration
AWS_REGION=${region}
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=${bucketName}

# Optional: AWS CloudFront (for CDN)
# AWS_CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-distribution-id
# AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net`);

console.log('\n🔧 AWS Setup Steps:');
console.log('1. Create AWS account at https://aws.amazon.com/');
console.log('2. Create S3 bucket: aws s3 mb s3://' + bucketName);
console.log('3. Set CORS: aws s3api put-bucket-cors --bucket ' + bucketName + ' --cors-configuration file://cors-config.json');
console.log('4. Create IAM user with S3 permissions');
console.log('5. Get access keys and add to .env.local');
console.log('\n📖 See aws-config-template.md for detailed instructions'); 