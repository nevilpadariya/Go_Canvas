# DigitalOcean Deployment Guide

## 🎓 Prerequisites

### 1. Activate GitHub Student Developer Pack

1. Visit [GitHub Student Developer Pack](https://education.github.com/pack)
2. Verify your student status (if not already verified)
3. Find **DigitalOcean** in the offers list
4. Click **"Get access by connecting your GitHub account"**
5. You'll receive **$200 credit for 1 year**

### 2. Create DigitalOcean Account

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Sign up or log in
3. Verify that your $200 credit is applied (check billing section)

---

## 🚀 Deployment Methods

### Method 1: Deploy Using App Spec (Recommended)

This method uses the pre-configured `app.yaml` file for automated setup.

#### Step 1: Update Configuration

1. Open [.do/app.yaml](file:///Users/nevilsmac/Downloads/Projects/Go_Canvas/.do/app.yaml)
2. Update the GitHub repository:
   ```yaml
   github:
     repo: YOUR_GITHUB_USERNAME/Go_Canvas
   ```
3. Update CORS origins with your Vercel frontend URL:
   ```yaml
   - key: CORS_ORIGINS
     value: "http://localhost:3000,https://your-frontend.vercel.app"
   ```

#### Step 2: Deploy to DigitalOcean

1. Log in to [DigitalOcean Dashboard](https://cloud.digitalocean.com/)
2. Click **"Create"** → **"Apps"**
3. Choose **"Upload App Spec"**
4. Upload `.do/app.yaml`
5. Review the configuration
6. Click **"Next"** → **"Create Resources"**

#### Step 3: Configure Secret Environment Variables

After app creation:

1. Go to **Settings** tab in your app
2. Navigate to **App-Level Environment Variables**
3. Add `SECRET_KEY`:
   ```bash
   # Generate a secure key using:
   openssl rand -hex 32
   ```
4. Mark it as **"Secret"** (encrypted)
5. Click **"Save"**

#### Step 4: Trigger Deployment

The app will automatically build and deploy. Monitor the build logs in the **"Activity"** tab.

---

### Method 2: Manual Setup via Dashboard

#### Step 1: Create Database

1. In DigitalOcean dashboard, go to **Databases**
2. Click **"Create Database Cluster"**
3. Choose:
   - **Engine**: PostgreSQL 14
   - **Plan**: Basic ($15/month)
   - **Datacenter**: New York (or closest to you)
   - **Cluster name**: `gocanvas-db-cluster`
4. Click **"Create Database Cluster"**
5. Wait 3-5 minutes for provisioning

#### Step 2: Create Database

1. Once cluster is ready, go to **"Users & Databases"** tab
2. Create a new database named `gocanvas`

#### Step 3: Get Connection String

1. In the database dashboard, go to **"Connection Details"**
2. Copy the **"Connection String"** (format: `postgresql://...`)
3. Make sure **"Connection Parameters"** shows:
   - SSL Mode: `require`
   - Port: `25060`

#### Step 4: Create App Platform Service

1. Go to **Apps** in DigitalOcean dashboard
2. Click **"Create App"**
3. Choose **GitHub** as source
4. Select your repository: `YOUR_USERNAME/Go_Canvas`
5. Select branch: `main`
6. DigitalOcean will auto-detect the Dockerfile

#### Step 5: Configure App

1. **Name**: `go-canvas-api`
2. **Region**: Same as database (e.g., New York)
3. **Plan**: Basic ($5/month)
4. Click **"Next"**

#### Step 6: Configure Environment Variables

Add the following environment variables:

| Key | Value | Type |
|-----|-------|------|
| `SECRET_KEY` | *(generate with `openssl rand -hex 32`)* | Secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Plain |
| `ALGORITHM` | `HS256` | Plain |
| `DATABASE_URL` | *(paste connection string from Step 3)* | Secret |
| `CORS_ORIGINS` | `http://localhost:3000,https://your-frontend.vercel.app` | Plain |
| `ENVIRONMENT` | `production` | Plain |

#### Step 7: Deploy

1. Review settings
2. Click **"Create Resources"**
3. Wait for build and deployment (5-10 minutes)

---

## 📊 Database Migration from Supabase

If you have existing data in Supabase, follow these steps:

### Step 1: Export from Supabase

```bash
# Install pg_dump if not already installed
# macOS: brew install postgresql

# Export your Supabase database
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" \
  --no-owner --no-acl -F c -f supabase_backup.dump
```

### Step 2: Import to DigitalOcean

```bash
# Get your DigitalOcean database connection details
# From DigitalOcean Database dashboard → Connection Details

# Import to DigitalOcean
pg_restore --verbose --clean --no-acl --no-owner \
  -h your-db.db.ondigitalocean.com \
  -U doadmin \
  -d gocanvas \
  -p 25060 \
  supabase_backup.dump
```

### Step 3: Verify Migration

```bash
# Test database connection
python scripts/test_db_connection.py
```

---

## 🔧 Post-Deployment Configuration

### Update Frontend (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Update `REACT_APP_API_URL`:
   ```
   https://go-canvas-api-xxxxx.ondigitalocean.app
   ```
   *(Get this URL from your DigitalOcean app dashboard)*
4. Redeploy your frontend

### Test API Endpoints

```bash
# Test health endpoint
curl https://go-canvas-api-xxxxx.ondigitalocean.app/

# Expected response:
# {"message": "Go Canvas API is running", "status": "ok"}

# Test API documentation
# Visit: https://go-canvas-api-xxxxx.ondigitalocean.app/docs
```

### Enable HTTPS (Auto-configured)

DigitalOcean automatically provisions SSL certificates. Your API will be available at:
- `https://go-canvas-api-xxxxx.ondigitalocean.app`

---

## 💰 Cost Breakdown

| Service | Plan | Cost/Month | Covered by $200 Credit |
|---------|------|-----------|----------------------|
| PostgreSQL Database | Basic | $15 | ✅ Yes |
| App Platform | Basic XXS | $5 | ✅ Yes |
| **Total** | | **$20** | **~10 months free** |

### Setting Up Billing Alerts

1. Go to **Account** → **Billing**
2. Click **"Alerts"**
3. Set alerts at:
   - $50 (25% of credit)
   - $100 (50% of credit)
   - $150 (75% of credit)

---

## 🐛 Troubleshooting

### Issue: "Could not connect to database"

**Solution:**
1. Verify `DATABASE_URL` in environment variables
2. Check database cluster is running (green status)
3. Ensure SSL mode is enabled:
   ```python
   # In connection.py, verify SSL is configured
   connect_args={"sslmode": "require"}
   ```

### Issue: "CORS policy blocked"

**Solution:**
1. Update `CORS_ORIGINS` environment variable
2. Include your Vercel domain: `https://your-app.vercel.app`
3. Redeploy the app for changes to take effect

### Issue: "Build failed"

**Solution:**
1. Check build logs in **Activity** tab
2. Verify `requirements.txt` has all dependencies
3. Ensure Dockerfile is at repository root
4. Check Python version matches (3.11)

### Issue: "App is slow or timing out"

**Solution:**
1. Check database connection pool settings
2. Review app logs for errors
3. Consider upgrading to a larger instance size
4. Enable database connection pooling

### Issue: "Environment variables not loading"

**Solution:**
1. Restart the app after adding environment variables
2. Ensure variables are set at **"App-Level"**, not component-level
3. Check for typos in variable names

---

## 📚 Useful Resources

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [DigitalOcean Managed Databases](https://docs.digitalocean.com/products/databases/)
- [App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
- [GitHub Student Pack](https://education.github.com/pack)

---

## 🔄 Continuous Deployment

Your app is configured for automatic deployment. Any push to the `main` branch will trigger a new deployment.

To disable auto-deploy:
1. Go to **Settings** → **App-Level Settings**
2. Toggle **"Autodeploy"** off

---

## 📞 Support

- **DigitalOcean Community**: [community.digitalocean.com](https://community.digitalocean.com)
- **DigitalOcean Support**: Available in dashboard (chat icon)
- **Student Pack Issues**: [education.github.com/support](https://education.github.com/support)
