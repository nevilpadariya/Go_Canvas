# Frontend-Backend Connection Fix

## Issue
Frontend at `https://gocanvas.vercel.app` is getting login errors because the backend CORS configuration was set to allow `https://go-canvas-frontend.vercel.app` (with hyphens) instead of the actual domain.

## Solution

### 1. Update Local .env File ✅
Updated [.env](file:///Users/nevilsmac/Downloads/Projects/Go_Canvas/.env) line 11:
```bash
CORS_ORIGINS=http://localhost:3000,https://gocanvas.vercel.app,https://go-canvas-frontend.vercel.app
```

### 2. Update DigitalOcean Environment Variables

You need to update the environment variable in DigitalOcean App Platform:

1. Go to https://cloud.digitalocean.com/apps
2. Click on your **backend** app
3. Click **Settings** tab
4. Scroll to **Environment Variables**
5. Find `CORS_ORIGINS` variable
6. Update to:
   ```
   http://localhost:3000,https://gocanvas.vercel.app,https://go-canvas-frontend.vercel.app
   ```
7. Click **Save**
8. **App will auto-redeploy** (takes ~2-3 minutes)

### 3. Wait for Redeployment

Once the app redeploys with the new CORS settings:
- ✅ Frontend login will work
- ✅ Signup will work
- ✅ All API calls from frontend will succeed

### 4. Test Again

After redeployment:
1. Go to https://gocanvas.vercel.app/login
2. Use test credentials:
   - Email: `test@gocanvas.com`
   - Password: `TestPassword123`
3. Click Login
4. Should successfully authenticate! ✅

## Why This Happened

The CORS (Cross-Origin Resource Sharing) middleware in the backend checks if incoming requests are from allowed domains. When your frontend at `gocanvas.vercel.app` tried to call the API, the backend rejected it because only `go-canvas-frontend.vercel.app` was in the allowed list.

## Alternative: Update Backend via Git

If you prefer to update via code instead of the dashboard:

1. The change is already in your local `.env`
2. Commit and push
3. DigitalOcean will auto-deploy from GitHub

**Note:** For production, you should use DigitalOcean's environment variables (they override `.env` file).
