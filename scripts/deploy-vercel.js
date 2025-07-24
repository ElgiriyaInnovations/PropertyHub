#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PropertyHub Vercel Deployment Script');
console.log('=====================================\n');

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if .env.local exists
function checkEnvironmentFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  return fs.existsSync(envPath);
}

// Check if package.json has required scripts
function checkPackageScripts() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = ['build', 'dev', 'start'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length > 0) {
    console.log('❌ Missing required scripts in package.json:', missingScripts.join(', '));
    return false;
  }
  
  return true;
}

// Main deployment function
async function deploy() {
  console.log('1. Checking prerequisites...\n');
  
  // Check Vercel CLI
  if (!checkVercelCLI()) {
    console.log('❌ Vercel CLI is not installed.');
    console.log('   Please install it with: npm i -g vercel');
    console.log('   Then run: vercel login\n');
    process.exit(1);
  }
  console.log('✅ Vercel CLI is installed');
  
  // Check package.json scripts
  if (!checkPackageScripts()) {
    console.log('❌ Package.json is missing required scripts');
    process.exit(1);
  }
  console.log('✅ Package.json scripts are valid');
  
  // Check environment file
  if (!checkEnvironmentFile()) {
    console.log('⚠️  .env.local file not found');
    console.log('   Please create .env.local with your environment variables');
    console.log('   See env.example for reference\n');
  } else {
    console.log('✅ Environment file found');
  }
  
  console.log('\n2. Starting deployment...\n');
  
  try {
    // Run vercel deployment
    console.log('Running: vercel --prod');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('\n✅ Deployment completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Set up your environment variables in Vercel dashboard');
    console.log('2. Configure your database connection');
    console.log('3. Set up AWS S3 credentials (if using file uploads)');
    console.log('4. Test your application functionality');
    
  } catch (error) {
    console.log('\n❌ Deployment failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check that you are logged into Vercel: vercel login');
    console.log('2. Ensure your code is committed to a Git repository');
    console.log('3. Verify all environment variables are set');
    console.log('4. Check the deployment logs in Vercel dashboard');
  }
}

// Run deployment
deploy().catch(console.error); 