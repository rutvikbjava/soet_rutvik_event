# Vercel Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git repository
- Vercel account (sign up at https://vercel.com)
- Convex deployment set up

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Deploy from Command Line

### Option A: Quick Deploy (Recommended)
```bash
# Navigate to your project directory
cd "d:\hackathone_unstop\soetevent_supernova\super_nova"

# Deploy
vercel
```

### Option B: Deploy via GitHub Integration

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite framework

## Step 4: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

### Required Variables:
- `VITE_CONVEX_URL`: Your Convex production URL
- `AUTH_SECRET`: Your authentication secret
- `NODE_ENV`: production

### Example:
```
VITE_CONVEX_URL=https://your-production-convex.convex.cloud
AUTH_SECRET=your-super-secret-production-key
NODE_ENV=production
```

## Step 5: Set Up Convex for Production

1. **Create Production Deployment**:
   ```bash
   npx convex deploy --cmd 'npm run build'
   ```

2. **Get Production URL**:
   ```bash
   npx convex env get CONVEX_URL
   ```

3. **Update Environment Variables** in Vercel with the production Convex URL

## Step 6: Deploy and Test

1. **Trigger Deployment**:
   - Either push to GitHub (if using Git integration)
   - Or run `vercel --prod` from CLI

2. **Test Your Deployment**:
   - Check the provided Vercel URL
   - Test all functionality
   - Verify Convex integration works

## Build Configuration

Your project includes optimized build configuration:
- ✅ Vite production build
- ✅ TypeScript compilation
- ✅ SPA routing with redirects
- ✅ Static asset optimization
- ✅ Convex integration

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check TypeScript errors: `npm run build`
   - Verify all dependencies: `npm install`

2. **Convex Connection Issues**:
   - Verify VITE_CONVEX_URL is correct
   - Check Convex deployment status
   - Ensure AUTH_SECRET matches

3. **Routing Issues**:
   - Verify `_redirects` file in public directory
   - Check `vercel.json` configuration

### Getting Help:
- Vercel Documentation: https://vercel.com/docs
- Convex Documentation: https://docs.convex.dev
- Project Issues: Check browser console for errors

## Production Checklist

- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] Convex production deployment ready
- [ ] Domain configured (if custom)
- [ ] SSL certificate (automatic with Vercel)
- [ ] Performance testing completed

## Deployment Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs [deployment-url]

# Remove deployment
vercel remove [deployment-name]
```

Your website is now ready for Vercel deployment! 🚀