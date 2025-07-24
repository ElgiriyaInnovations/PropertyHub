#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating Secure JWT Secrets for PropertyHub\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ Generated Secure Secrets:\n');
console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_REFRESH_SECRET=' + refreshSecret);
console.log('\n📝 Add these to your .env.local file:\n');
console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_REFRESH_SECRET=' + refreshSecret);
console.log('\n⚠️  Keep these secrets secure and never commit them to version control!'); 