# Go Canvas - Deployment URLs & Configuration

## 🌐 Your Live Backend

**Backend URL:** https://squid-app-bgn4p.ondigitalocean.app

**API Documentation:** https://squid-app-bgn4p.ondigitalocean.app/docs

**Status:** ✅ Active and Running

---

## 🔌 API Health Check

```bash
curl https://squid-app-bgn4p.ondigitalocean.app/
```

**Response:**
```json
{"message":"Go Canvas API is running","status":"ok"}
```

---

## 🎨 Frontend Configuration (Vercel)

### Update Environment Variables

Go to your Vercel project settings and update:

**Variable Name:** `REACT_APP_API_URL`  
**Value:** `https://squid-app-bgn4p.ondigitalocean.app`

### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `Go_Canvas` frontend project
3. Go to **Settings** → **Environment Variables**
4. Find or add `REACT_APP_API_URL`
5. Set value to: `https://squid-app-bgn4p.ondigitalocean.app`
6. Click **Save**
7. Redeploy your frontend

---

## 🔐 CORS Configuration

Your backend is already configured to accept requests from:
- `http://localhost:3000` (local development)
- Your Vercel frontend domain

If you need to update CORS origins:
1. Go to DigitalOcean App Platform
2. Select your app
3. Go to **Settings** → **Environment Variables**
4. Update `CORS_ORIGINS` to include your Vercel URL

---

## 📊 Database Configuration

**Database:** DigitalOcean Managed PostgreSQL 17.7  
**Status:** ✅ Connected  
**SSL:** Enabled

---

## 🧪 Testing Your Deployment

### Test Backend API
```bash
# Health check
curl https://squid-app-bgn4p.ondigitalocean.app/

# API Documentation
open https://squid-app-bgn4p.ondigitalocean.app/docs
```

### Test Frontend-Backend Connection
1. Update `REACT_APP_API_URL` in Vercel
2. Redeploy frontend
3. Test login/signup functionality
4. Check browser console for any CORS errors

---

## 📝 Quick Reference

| Service | URL | Status |
|---------|-----|--------|
| Backend API | https://squid-app-bgn4p.ondigitalocean.app | ✅ Live |
| API Docs | https://squid-app-bgn4p.ondigitalocean.app/docs | ✅ Live |
| Database | DigitalOcean PostgreSQL | ✅ Connected |
| Frontend | (Update with your Vercel URL) | - |

---

## 💰 Current Costs

- **Backend (App Platform):** $5/month
- **Database (PostgreSQL):** $15/month
- **Total:** $20/month
- **Covered by:** GitHub Student Pack ($200 credit)
- **Free for:** ~10 months

---

## 🚀 Next Steps

1. ✅ Backend deployed and running
2. ✅ Database connected
3. ✅ API endpoints accessible
4. ⏳ Update frontend environment variables
5. ⏳ Test frontend-backend integration
6. ⏳ Run database migrations if needed

---

## 📞 Support

- **DigitalOcean Dashboard:** https://cloud.digitalocean.com/apps
- **Database Dashboard:** https://cloud.digitalocean.com/databases
- **Deployment Guide:** [.do/deploy.md](file:///Users/nevilsmac/Downloads/Projects/Go_Canvas/.do/deploy.md)
