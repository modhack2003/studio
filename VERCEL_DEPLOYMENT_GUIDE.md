# Vercel Deployment Fix Guide

## Issues Fixed

### 1. **Prisma Client Configuration**
- Created centralized Prisma client in `src/lib/prisma.ts`
- Updated `src/app/page.tsx` to use the centralized client
- This prevents connection pool exhaustion and improves performance

### 2. **Vercel Configuration (`vercel.json`)**
- Added explicit `buildCommand` and `installCommand`
- Ensured Prisma client generation during build process
- Set proper function timeout for API routes

### 3. **Next.js Configuration (`next.config.ts`)**
- Added `output: 'standalone'` for better Vercel compatibility
- Added `serverComponentsExternalPackages: ['@prisma/client']` for proper Prisma handling
- This ensures Prisma client is properly bundled

## Environment Variables Setup in Vercel

### Required Environment Variables:
1. **DATABASE_URL** - Your MongoDB connection string
2. **GITHUB_TOKEN** (optional) - For GitHub API integration
3. **NEXT_PUBLIC_APP_URL** (optional) - Your app's public URL

### How to Set Environment Variables in Vercel:
1. Go to your project dashboard: https://vercel.com/modhack2003s-projects/bikram
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable with appropriate values
5. Make sure to set them for all environments (Production, Preview, Development)

### Example DATABASE_URL format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Deployment Steps

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push origin main
   ```

2. **Redeploy in Vercel:**
   - Go to your Vercel dashboard
   - Click on your latest deployment
   - Click "Redeploy" button

3. **Check deployment logs:**
   - In the deployment page, click on "Functions" tab
   - Check for any build or runtime errors

## Common Issues and Solutions

### Database Connection Issues:
- Ensure DATABASE_URL is correctly set in Vercel environment variables
- Check that your MongoDB cluster allows connections from Vercel's IP ranges
- Verify database credentials are correct

### Build Failures:
- Check the build logs in Vercel dashboard
- Ensure all dependencies are properly installed
- Verify Prisma schema is valid

### Runtime Errors:
- Check function logs in Vercel dashboard
- Ensure all environment variables are set
- Verify API routes are working correctly

## Testing Your Deployment

1. **Home Page:** Visit your Vercel URL to test the main page
2. **API Routes:** Test your API endpoints (if any)
3. **Database:** Verify data is loading correctly from MongoDB

## Additional Recommendations

1. **Monitor Performance:** Use Vercel's Analytics to monitor your app's performance
2. **Error Tracking:** Consider adding error tracking (Sentry, etc.)
3. **Database Monitoring:** Monitor your MongoDB cluster for connection issues
4. **Caching:** Consider adding Redis for better performance if needed
