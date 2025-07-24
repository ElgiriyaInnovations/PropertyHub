#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🌐 PropertyHub Subdomain Setup Helper');
console.log('=====================================\n');

function showSubdomainDNSInstructions(domain, subdomain) {
  const fullDomain = `${subdomain}.${domain}`;
  
  console.log('📝 Subdomain DNS Configuration for Namecheap:');
  console.log('==============================================');
  console.log(`Main Domain: ${domain}`);
  console.log(`Subdomain: ${subdomain}`);
  console.log(`Full Domain: ${fullDomain}`);
  console.log('\nGo to Namecheap Dashboard → Domain List → Manage → Advanced DNS');
  console.log('\nAdd this CNAME record:');
  console.log('Type: CNAME');
  console.log(`Host: ${subdomain}`);
  console.log('Value: cname.vercel-dns.com');
  console.log('TTL: Automatic');
  console.log('\nThis will create:');
  console.log(`https://${subdomain}.${domain}`);
}

function showVercelInstructions(fullDomain) {
  console.log('\n🔧 Vercel Configuration:');
  console.log('=======================');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project: property-hub');
  console.log('3. Go to Settings → Domains');
  console.log(`4. Add domain: ${fullDomain}`);
  console.log('5. Vercel will automatically detect it\'s a subdomain');
  console.log('6. Wait for DNS verification (usually 5-10 minutes)');
}

function showEnvironmentUpdate(fullDomain) {
  console.log('\n⚙️ Environment Variables Update:');
  console.log('=================================');
  console.log('After subdomain is configured, update in Vercel dashboard:');
  console.log(`NEXTAUTH_URL=https://${fullDomain}`);
  console.log('\nGo to: Settings → Environment Variables');
}

function showTestingCommands(fullDomain) {
  console.log('\n🧪 Testing Commands:');
  console.log('===================');
  console.log(`After setup, test with:`);
  console.log(`curl -I https://${fullDomain}`);
  console.log(`nslookup ${fullDomain}`);
  console.log(`dig ${fullDomain}`);
}

// Get domain and subdomain from command line arguments
const subdomain = process.argv[2];
const domain = process.argv[3];

if (!subdomain || !domain) {
  console.log('❌ Please provide both subdomain and domain name');
  console.log('Usage: node scripts/setup-subdomain.js subdomain yourdomain.com');
  console.log('Example: node scripts/setup-subdomain.js propertyhub yourdomain.com');
  process.exit(1);
}

const fullDomain = `${subdomain}.${domain}`;

console.log(`Setting up subdomain: ${fullDomain}\n`);

// Show current Vercel domain
console.log('📍 Current Vercel Domain:');
console.log('https://property-rlbmi1yuv-elgiriyas-projects.vercel.app\n');

// Show instructions
showSubdomainDNSInstructions(domain, subdomain);
showVercelInstructions(fullDomain);
showEnvironmentUpdate(fullDomain);

console.log('\n⏱️ DNS Propagation:');
console.log('==================');
console.log('Subdomain DNS changes usually propagate within 5-15 minutes.');
console.log('Sometimes it can take up to 1 hour.\n');

showTestingCommands(fullDomain);

console.log('\n📋 Quick Checklist:');
console.log('==================');
console.log(`□ Add CNAME record in Namecheap for ${subdomain}.${domain}`);
console.log(`□ Add domain ${fullDomain} in Vercel dashboard`);
console.log(`□ Wait for DNS verification (green checkmark in Vercel)`);
console.log(`□ Update NEXTAUTH_URL environment variable`);
console.log(`□ Test the subdomain`);

console.log('\n✅ Setup Complete!');
console.log(`Your PropertyHub will be available at: https://${fullDomain}`); 