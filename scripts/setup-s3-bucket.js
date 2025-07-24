#!/usr/bin/env node

const bucketName = process.argv[2] || 'propertyhub-assets';

console.log('🔧 S3 Bucket Setup for PropertyHub\n');

console.log(`📋 Setting up bucket: ${bucketName}\n`);

console.log('1. Create the bucket:');
console.log(`   aws s3 mb s3://${bucketName}\n`);

console.log('2. Set CORS configuration:');
console.log(`   aws s3api put-bucket-cors --bucket ${bucketName} --cors-configuration file://cors-config.json\n`);

console.log('3. Set bucket policy for public read access:');
console.log(`   aws s3api put-bucket-policy --bucket ${bucketName} --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${bucketName}/*"
    }
  ]
}'\n`);

console.log('4. Configure Object Ownership (via AWS Console):');
console.log('   - Go to S3 Console → Your Bucket → Permissions → Object Ownership');
console.log('   - Choose "Bucket owner enforced"');
console.log('   - This disables ACLs but allows public access through bucket policy\n');

console.log('5. Block Public Access Settings (via AWS Console):');
console.log('   - Go to S3 Console → Your Bucket → Permissions → Block public access');
console.log('   - Uncheck "Block all public access" or configure as needed');
console.log('   - This allows the bucket policy to grant public read access\n');

console.log('✅ After completing these steps, your bucket will be ready for image uploads!'); 