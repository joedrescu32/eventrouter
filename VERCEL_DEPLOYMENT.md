# Deploying to Vercel - Step by Step Guide

## Prerequisites
- A GitHub account (free)
- A Vercel account (free tier available)
- Your code ready to deploy

## Step 1: Commit Your Changes

First, commit all the fixes we made:

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Fix build issues for Vercel deployment - remove problematic dependencies, fix import paths, and TypeScript errors"

# Push to GitHub
git push origin main
```

If you haven't pushed your branch yet, you may need to:
```bash
git push -u origin main
```

## Step 2: Create a GitHub Repository (if you don't have one)

1. Go to https://github.com/new
2. Create a new repository (e.g., `my-eventrouter-app`)
3. Don't initialize with README if your code is already there
4. Copy the repository URL

If your code isn't on GitHub yet, connect it:
```bash
# If you need to add a remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 3: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub" to connect your GitHub account
4. Authorize Vercel to access your repositories

## Step 4: Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Find your repository in the list (or search for it)
4. Click **"Import"**

## Step 5: Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

Click **"Deploy"** - but **WAIT!** Don't deploy yet. We need to add environment variables first.

## Step 6: Add Environment Variables

**IMPORTANT:** Before deploying, you must add your environment variables.

### Option A: Add During Setup (Recommended)
Before clicking "Deploy", click **"Environment Variables"** section and add:

```
NEXT_PUBLIC_SUPABASE_URL
```
- Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- Value: Your Supabase anon/public key (from Supabase Dashboard → Settings → API)

```
OPENAI_API_KEY
```
- Value: Your OpenAI API key (if using OpenAI features)
- ✅ Check "Production", "Preview", and "Development" environments

### Option B: Add After Deployment
1. Go to your project dashboard in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable
4. Redeploy after adding variables

## Step 7: Deploy!

1. Review your settings
2. Click **"Deploy"**
3. Wait 2-3 minutes for the build to complete
4. You'll get a live URL like: `https://your-app-name.vercel.app`

## Step 8: Update Your Webhook URLs

After deployment, update any webhook URLs:

### Zapier Webhook URL
Your new webhook URL will be:
```
https://your-app-name.vercel.app/api/zapier-to-supabase
```

Or if using receive-parsed-orders:
```
https://your-app-name.vercel.app/api/receive-parsed-orders
```

Update these in your Zapier workflows.

## Step 9: Verify Deployment

1. Visit your Vercel URL
2. Test the app functionality
3. Check Vercel dashboard for any build errors
4. View logs: Project → "Deployments" → Click a deployment → "View Function Logs"

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify your `package.json` has correct dependencies

### Environment Variables Not Working
- Make sure they're prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables (they don't update automatically)

### API Routes Not Working
- Check Vercel Function Logs
- Verify the routes are in `/app/api/` directory
- Ensure CORS is configured if needed

### Check Build Logs
1. Go to your project in Vercel
2. Click on the failed deployment
3. Scroll to see the error logs
4. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

## Custom Domain (Optional)

1. Go to Project → **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS setup instructions
4. Vercel handles SSL automatically

## Continuous Deployment

Once connected, every push to your `main` branch will automatically deploy!

- Push to `main` = Production deployment
- Push to other branches = Preview deployment
- Create Pull Request = Preview deployment with unique URL

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: support@vercel.com
- Check your deployment logs in the Vercel dashboard

