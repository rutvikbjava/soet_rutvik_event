# Deployment Troubleshooting Guide

## Common Issues After Deployment

### 1. Events Menu Not Loading (Infinite Loading)

**Symptoms:**
- Register button shows events loading indefinitely
- Events list appears empty or stuck in loading state
- Console shows errors related to Convex queries

**Solutions:**

#### Check Environment Variables
```bash
# Verify these variables are set in your deployment platform
VITE_CONVEX_URL=https://your-deployment.convex.cloud
NODE_ENV=production
```

#### Verify Convex Deployment
```bash
# Check if Convex is deployed and running
npx convex dev --once
npx convex logs
```

#### Test API Endpoints
Open browser console and test:
```javascript
// Test in browser console on your deployed site
fetch(import.meta.env.VITE_CONVEX_URL + '/api/events/listPublished')
  .then(r => r.json())
  .then(console.log)
```

### 2. CORS Issues

**Symptoms:**
- Cross-origin request errors in console
- API calls failing with CORS policy errors

**Solutions:**
```bash
# Update Convex environment for production
npx convex env set SITE_URL https://your-deployed-site.vercel.app
```

### 3. Build Failures

**Common Build Errors:**

#### TypeScript Errors
```bash
# Fix TypeScript issues
npm run build
# Check for any TS errors and fix them
```

#### Missing Dependencies
```bash
# Install all dependencies including dev dependencies
npm install --include=dev
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 4. Performance Issues

**Symptoms:**
- Slow loading times
- Large bundle size warnings

**Solutions:**

#### Code Splitting
Already implemented with React.lazy() in App.tsx

#### Image Optimization
- Ensure images are compressed and properly sized
- Use WebP format where possible

#### Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer dist/assets
```

## Git Push and Deployment Workflow

### Step 1: Prepare for Deployment
```bash
# Navigate to project directory
cd "d:\hackathone_unstop\soetevent_supernova\super_nova"

# Ensure all changes are committed
git status
git add .
git commit -m "Fix: Resolve events loading issue and add registration functionality"
```

### Step 2: Test Build Locally
```bash
# Test the build process
npm run build

# Test the production build locally
npm run preview
```

### Step 3: Deploy Convex Backend
```bash
# Deploy Convex functions to production
npx convex deploy

# Get the production URL
npx convex env get CONVEX_URL
```

### Step 4: Update Environment Variables
Update your deployment platform (Vercel/Netlify/Render) with:
- `VITE_CONVEX_URL`: The production Convex URL from step 3
- `NODE_ENV`: production

### Step 5: Deploy Frontend

#### Option A: Vercel CLI
```bash
# Deploy to Vercel
vercel --prod
```

#### Option B: Git Push (if connected to GitHub)
```bash
# Push to GitHub (triggers auto-deployment)
git push origin main
```

#### Option C: Render Deployment
```bash
# If using Render, push to your connected repository
git push origin main
```

### Step 6: Verify Deployment
1. Visit your deployed URL
2. Test the register button
3. Verify events load properly
4. Check browser console for errors

## Environment-Specific Configurations

### Development
```bash
# .env.local
VITE_CONVEX_URL=https://your-dev-deployment.convex.cloud
NODE_ENV=development
```

### Production
```bash
# Environment variables in deployment platform
VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
NODE_ENV=production
```

## Debugging Commands

### Check Convex Connection
```bash
npx convex dev --once
npx convex logs --tail
```

### Check Build Output
```bash
npm run build 2>&1 | tee build.log
```

### Verify Environment Variables
```bash
# In your deployed app, open browser console:
console.log(import.meta.env.VITE_CONVEX_URL)
```

## Quick Fix Commands

```bash
# Complete deployment pipeline
npm install --include=dev
npm run build
npx convex deploy
# Update VITE_CONVEX_URL in deployment platform
# Redeploy frontend
```

## Support Resources

- **Convex Documentation**: https://docs.convex.dev
- **Vercel Documentation**: https://vercel.com/docs
- **Render Documentation**: https://render.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/

## Common Error Messages and Solutions

### "Failed to fetch" or Network Errors
- Check VITE_CONVEX_URL is correct
- Verify Convex deployment is running
- Check network connectivity

### "Module not found" Errors
- Run `npm install --include=dev`
- Check import paths are correct
- Ensure all dependencies are in package.json

### "Build failed" Errors
- Fix TypeScript errors: `npm run build`
- Check for syntax errors
- Verify all imports are correct

---

Need help? Check the browser console for specific error messages and refer to the appropriate section above.