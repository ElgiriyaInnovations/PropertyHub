# Vercel Deployment Guide for PropertyHub

This guide will help you deploy your PropertyHub application to Vercel successfully.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Repository**: Your code should be in a Git repository
3. **Environment Variables**: You'll need to configure these in Vercel

## Step 1: Environment Variables Setup

Before deploying, you need to set up these environment variables in Vercel:

### Required Environment Variables

```env
# Database
DATABASE_URL=your_neon_database_url_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# AWS S3 Configuration (for image uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Other
NODE_ENV=production
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**:
   - Framework Preset: `Other`
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all the variables listed above

4. **Deploy**:
   - Click "Deploy"

## Step 3: Verify Deployment

After deployment, your app should be available at:
- **Production**: `https://your-project-name.vercel.app`
- **Preview**: `https://your-project-name-git-branch.vercel.app`

## Step 4: Test Your Application

1. **Test API Endpoints**:
   - Visit `https://your-project-name.vercel.app/api/properties`
   - Should return JSON data (empty array if no properties)

2. **Test Frontend**:
   - Visit `https://your-project-name.vercel.app`
   - Should show your React application

3. **Test Image Upload**:
   - Go to Add Property page
   - Try uploading images
   - Check your S3 bucket for uploaded files

## Troubleshooting

### Common Issues

1. **404 Error**:
   - Make sure your `vercel.json` is in the root directory
   - Check that the API routes are properly configured

2. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation

3. **Environment Variables**:
   - Ensure all required variables are set in Vercel dashboard
   - Check variable names match exactly

4. **Database Connection**:
   - Verify your Neon database URL is correct
   - Check that your database is accessible from Vercel

### Debugging

1. **Check Vercel Logs**:
   - Go to your project dashboard
   - Click on "Functions" tab
   - Check for any error logs

2. **Test Locally**:
   ```bash
   npm run build
   npm start
   ```

## File Structure for Vercel

Your project should have this structure:

```
PropertyHub/
├── api/
│   ├── index.ts
│   └── [...path].ts
├── client/
│   ├── package.json
│   ├── src/
│   └── ...
├── server/
│   ├── index.ts
│   ├── routes.ts
│   └── ...
├── vercel.json
├── package.json
└── vite.config.ts
```

## Important Notes

1. **Serverless Functions**: Your Express.js app runs as serverless functions on Vercel
2. **Cold Starts**: First request might be slower due to cold start
3. **Function Limits**: Each function has a 30-second timeout
4. **Environment**: Production environment variables are automatically used

## Post-Deployment

1. **Set up Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Monitor Performance**:
   - Use Vercel Analytics
   - Check function execution times

3. **Set up Webhooks** (if needed):
   - Configure webhooks for database changes
   - Set up notifications

## Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review deployment logs in Vercel dashboard
3. Test locally to isolate issues
4. Check environment variables are correctly set

Your PropertyHub application should now be successfully deployed on Vercel! 🚀 