# PropertyHub Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Account**: Your code should be in a Git repository
3. **Neon Database**: Set up a PostgreSQL database on [neon.tech](https://neon.tech)
4. **AWS S3 Bucket**: For file uploads (optional but recommended)

## Step 1: Prepare Your Repository

1. Ensure your code is committed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Make sure all dependencies are in `package.json`
3. Verify your `next.config.js` is properly configured

## Step 2: Set Up Environment Variables

### Required Environment Variables:

```bash
# Database Configuration
DATABASE_URL=your_neon_database_url_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# AWS S3 Configuration (if using file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here

# Application Configuration
NODE_ENV=production
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (if your Next.js app is in the root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add your environment variables in the "Environment Variables" section
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment

## Step 4: Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update your DNS settings as instructed by Vercel

## Step 5: Set Up Database Migrations

After deployment, you may need to run database migrations:

1. Connect to your Neon database
2. Run the migration files from the `migrations/` folder
3. Or use Drizzle Studio to manage your database

## Step 6: Verify Deployment

1. Check that your application is running at the provided Vercel URL
2. Test all major functionality:
   - User authentication
   - Property listings
   - File uploads (if applicable)
   - API endpoints

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check the build logs in Vercel dashboard
2. **Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Verify your DATABASE_URL is correct
4. **Image Uploads**: Check AWS S3 configuration and permissions

### Performance Optimization:

1. Enable Vercel Analytics
2. Configure caching headers
3. Optimize images using Next.js Image component
4. Use Vercel Edge Functions for better performance

## Monitoring

- Use Vercel Analytics to monitor performance
- Set up error tracking with services like Sentry
- Monitor database performance through Neon dashboard

## Security Considerations

1. Never commit sensitive environment variables to Git
2. Use strong, unique secrets for JWT tokens
3. Configure proper CORS settings
4. Set up proper AWS IAM permissions for S3 access

## Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Check Next.js deployment guide: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment) 