# DigitalOcean Deployment Summary

This document provides a quick reference for deploying the Go Canvas backend to DigitalOcean using the GitHub Student Developer Pack.

## 📁 New Files Created

### Configuration Files
- **`.do/app.yaml`** - DigitalOcean App Platform specification
- **`.do/deploy.md`** - Complete deployment guide with troubleshooting

### Scripts
- **`scripts/test_db_connection.py`** - Database connectivity testing utility
- **`scripts/migrate_from_supabase.sh`** - Migration script from Supabase to DigitalOcean

### Updated Files
- **`.env.example`** - Added DigitalOcean database URL examples
- **`alphagocanvas/database/connection.py`** - Enhanced with SSL support and connection pooling
- **`README.md`** - Updated with DigitalOcean deployment instructions
- **`.gitignore`** - Added database backup files

## 🚀 Quick Deployment Steps

### 1. Prerequisites
```bash
# Claim GitHub Student Developer Pack
# Visit: https://education.github.com/pack
# Get $200 DigitalOcean credit
```

### 2. Update Configuration
```bash
# Edit .do/app.yaml
# Update line 19 with your GitHub repo:
repo: YOUR_USERNAME/Go_Canvas

# Update line 47 with your Vercel frontend URL:
value: "http://localhost:3000,https://your-app.vercel.app"
```

### 3. Deploy
```bash
# Option A: Upload app.yaml to DigitalOcean dashboard
# Go to: https://cloud.digitalocean.com/apps
# Click: Create → Apps → Upload App Spec

# Option B: Use doctl CLI (if installed)
doctl apps create --spec .do/app.yaml
```

### 4. Set Secret Environment Variable
```bash
# Generate secure key
openssl rand -hex 32

# Add to DigitalOcean App Settings → Environment Variables:
# SECRET_KEY = <generated-key>
```

### 5. Verify Deployment
```bash
# Test API health
curl https://your-app.ondigitalocean.app/

# Expected response:
# {"message": "Go Canvas API is running", "status": "ok"}
```

## 🔄 Database Migration (if needed)

If you have existing data in Supabase:

```bash
# Run migration script
./scripts/migrate_from_supabase.sh

# Follow prompts to enter:
# - Supabase connection URL
# - DigitalOcean connection URL
```

## ✅ Testing

### Test Local Database Connection
```bash
# Create .env file with DATABASE_URL
cp .env.example .env
# Edit .env and set your DATABASE_URL

# Test connection
python3 scripts/test_db_connection.py
```

### Test Docker Build
```bash
# Build locally
docker build -t go-canvas-test .

# Run locally
docker run -p 8000:8000 --env-file .env go-canvas-test

# Test API
curl http://localhost:8000/
```

## 💰 Cost Estimate

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| PostgreSQL Database | Basic | $15 |
| App Platform | Basic XXS | $5 |
| **Total** | | **$20** |

**With $200 credit = ~10 months free hosting**

## 📚 Documentation

- **Detailed Guide**: [.do/deploy.md](.do/deploy.md)
- **App Spec Reference**: [DigitalOcean Docs](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
- **Main README**: [README.md](README.md)

## 🐛 Common Issues

### Database Connection Failed
- Verify DATABASE_URL includes `?sslmode=require`
- Check database cluster is running (green status)

### CORS Errors
- Update CORS_ORIGINS with your Vercel URL
- Redeploy app after changes

### Build Failed
- Check Dockerfile is at repository root
- Verify requirements.txt is complete
- Review build logs in Activity tab

## 🔗 Useful Links

- [DigitalOcean Dashboard](https://cloud.digitalocean.com/)
- [GitHub Student Pack](https://education.github.com/pack)
- [App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
