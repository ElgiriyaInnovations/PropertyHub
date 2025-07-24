#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🌐 PropertyHub Domain Setup Helper');
console.log('==================================\n');

function checkDomain(domain) {
  try {
    console.log(`Checking ${domain}...`);
    const result = execSync(`nslookup ${domain}`, { encoding: 'utf8' });
    console.log(`✅ ${domain} is accessible`);
    return true;
  } catch (error) {
    console.log(`❌ ${domain} is not accessible yet (DNS may still be propagating)`);
    return false;
  }
}

function showDNSInstructions(domain) {
  console.log('\n📝 DNS Configuration for Namecheap:');
  console.log('====================================');
  console.log(`Domain: ${domain}`);
  console.log('\nGo to Namecheap Dashboard → Domain List → Manage → Advanced DNS');
  console.log('\nAdd these records:');
  console.log('\nOption A (Recommended - A Records):');
  console.log('Type: A');
  console.log('Host: @');
  console.log('Value: 76.76.19.36');
  console.log('TTL: Automatic');
  console.log('\nType: A');
  console.log('Host: @');
  console.log('Value: 76.76.19.37');
  console.log('TTL: Automatic');
  console.log('\nType: CNAME');
  console.log('Host: www');
  console.log('Value: cname.vercel-dns.com');
  console.log('TTL: Automatic');
  
  console.log('\nOption B (CNAME Records):');
  console.log('Type: CNAME');
  console.log('Host: @');
  console.log('Value: cname.vercel-dns.com');
  console.log('TTL: Automatic');
  console.log('\nType: CNAME');
  console.log('Host: www');
  console.log('Value: cname.vercel-dns.com');
  console.log('TTL: Automatic');
}

function showVercelInstructions(domain) {
  console.log('\n🔧 Vercel Configuration:');
  console.log('=======================');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project: property-hub');
  console.log('3. Go to Settings → Domains');
  console.log(`4. Add domain: ${domain}`);
  console.log('5. Follow Vercel\'s DNS verification instructions');
}

function showEnvironmentUpdate(domain) {
  console.log('\n⚙️ Environment Variables Update:');
  console.log('=================================');
  console.log('After domain is configured, update in Vercel dashboard:');
  console.log(`NEXTAUTH_URL=https://${domain}`);
  console.log('\nGo to: Settings → Environment Variables');
}

// Get domain from command line argument
const domain = process.argv[2];

if (!domain) {
  console.log('❌ Please provide a domain name');
  console.log('Usage: node scripts/setup-domain.js yourdomain.com');
  process.exit(1);
}

console.log(`Setting up domain: ${domain}\n`);

// Show current Vercel domain
console.log('📍 Current Vercel Domain:');
console.log('https://property-rlbmi1yuv-elgiriyas-projects.vercel.app\n');

// Show instructions
showDNSInstructions(domain);
showVercelInstructions(domain);
showEnvironmentUpdate(domain);

console.log('\n⏱️ DNS Propagation:');
console.log('==================');
console.log('DNS changes can take up to 48 hours to propagate globally.');
console.log('Usually works within 1-2 hours.\n');

console.log('🧪 Testing Commands:');
console.log('===================');
console.log(`After setup, test with:`);
console.log(`curl -I https://${domain}`);
console.log(`curl -I https://www.${domain}`);

console.log('\n✅ Setup Complete!');
console.log('Follow the steps above to configure your domain.'); 