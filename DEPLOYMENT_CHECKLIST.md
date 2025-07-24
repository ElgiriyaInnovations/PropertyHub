# PropertyHub Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code is committed to Git repository
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] All dependencies are in package.json
- [ ] Build command works locally: `npm run build`
- [ ] Application runs locally: `npm run dev`

### ✅ Database Setup
- [ ] Neon database is created and running
- [ ] DATABASE_URL is available
- [ ] Database migrations are ready
- [ ] Test database connection locally

### ✅ Environment Variables
- [ ] DATABASE_URL (Neon PostgreSQL connection string)
- [ ] JWT_SECRET (strong random string)
- [ ] JWT_REFRESH_SECRET (strong random string)
- [ ] AWS_ACCESS_KEY_ID (if using S3)
- [ ] AWS_SECRET_ACCESS_KEY (if using S3)
- [ ] AWS_REGION (if using S3)
- [ ] AWS_S3_BUCKET (if using S3)
- [ ] NEXTAUTH_URL (your Vercel domain)
- [ ] NEXTAUTH_SECRET (strong random string)

### ✅ AWS S3 Setup (if using file uploads)
- [ ] S3 bucket created
- [ ] IAM user with S3 permissions
- [ ] CORS configuration on S3 bucket
- [ ] Bucket policy configured

### ✅ Vercel Account
- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Logged into Vercel: `vercel login`

## Deployment Steps

### Option 1: Quick Deploy (Recommended)
```bash
npm run deploy
```

### Option 2: Manual Deploy
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables
6. Deploy

## Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Application loads at Vercel URL
- [ ] All pages render correctly
- [ ] API endpoints work
- [ ] Database connections work
- [ ] File uploads work (if applicable)

### ✅ Test Functionality
- [ ] User registration/login
- [ ] Property listing creation
- [ ] Property search and filtering
- [ ] User messaging
- [ ] File uploads
- [ ] Admin features

### ✅ Performance & Security
- [ ] Images load correctly
- [ ] No console errors
- [ ] HTTPS is working
- [ ] Environment variables are secure
- [ ] Database is accessible

### ✅ Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Database monitoring active
- [ ] Performance monitoring set up

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check build logs in Vercel dashboard
2. **Database Connection**: Verify DATABASE_URL format
3. **Environment Variables**: Ensure all required vars are set
4. **Image Uploads**: Check S3 permissions and CORS
5. **API Errors**: Check serverless function logs

### Useful Commands:
```bash
# Check Vercel CLI
vercel --version

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List projects
vercel ls
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Neon Database Docs](https://neon.tech/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

## Emergency Rollback

If deployment fails:
1. Check Vercel dashboard for previous successful deployment
2. Revert to previous version if needed
3. Fix issues locally first
4. Test thoroughly before redeploying 