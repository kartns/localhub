# 🚀 LocalHub Deployment Guide

This guide explains how to deploy the LocalHub application to production using Render.com.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed
- [ ] Render.com account (free tier available)
- [ ] All changes committed and pushed to GitHub

### Required Files (Already Created)

| File | Purpose |
|------|---------|
| `render.yaml` | Render deployment configuration |
| `backend/.env.example` | Backend environment template |
| `frontend/.env.example` | Frontend environment template |
| `frontend/src/config.js` | Frontend API configuration |

---

## Project Structure

```
localhub/
├── backend/                 # Express.js API Server
│   ├── src/
│   │   ├── index.js        # Server entry point (production-ready)
│   │   ├── database.js     # SQLite database
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Auth middleware
│   ├── data/               # SQLite database files
│   ├── .env                # Environment variables (not committed)
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/               # React + Vite Application
│   ├── src/
│   │   ├── config.js       # API URL configuration
│   │   ├── pages/          # Page components
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   └── hooks/          # Custom hooks
│   ├── .env.example        # Environment template
│   ├── vite.config.js      # Vite config (dev proxy + build)
│   └── package.json
│
├── render.yaml             # Render deployment config
└── DEPLOYMENT.md           # This file
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `10000` (Render default) |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | JWT signing key | Auto-generated on Render |
| `FRONTEND_URL` | Frontend URL for CORS | `https://localhub-frontend.onrender.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://localhub-api.onrender.com` |

---

## Deployment Steps

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin master
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Deploy Backend (Web Service)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`kartns/localhub`)
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `localhub-api` |
| **Region** | Choose nearest to your users |
| **Branch** | `master` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Click "Generate" for random value |
| `PORT` | `10000` |
| `FRONTEND_URL` | (leave empty for now) |

5. Click **"Create Web Service"**

6. Wait for deployment (2-5 minutes)

7. Copy your backend URL: `https://localhub-api.onrender.com`

### Step 4: Deploy Frontend (Static Site)

1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `localhub-frontend` |
| **Branch** | `master` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://localhub-api.onrender.com` |

5. Click **"Create Static Site"**

6. Wait for deployment (2-5 minutes)

7. Copy your frontend URL: `https://localhub-frontend.onrender.com`

### Step 5: Update Backend CORS

1. Go to your backend service on Render
2. Navigate to **Environment**
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://localhub-frontend.onrender.com
   ```
4. Click **"Save Changes"** (triggers redeploy)

---

## Post-Deployment Configuration

### Verify Deployment

1. **Check Backend Health:**
   ```
   https://localhub-api.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "OK",
     "message": "LocalHub API is running",
     "environment": "production"
   }
   ```

2. **Check API Documentation:**
   ```
   https://localhub-api.onrender.com/api/docs
   ```

3. **Test Frontend:**
   - Visit `https://localhub-frontend.onrender.com`
   - Create an account
   - Test GPS proximity filtering

### Custom Domain (Optional)

1. Go to your service on Render
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain (e.g., `localhub.yourdomain.com`)
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

---

## Troubleshooting

### Common Issues

#### 1. "CORS Error" in Browser

**Cause:** Frontend URL not in backend's allowed origins

**Solution:**
- Check `FRONTEND_URL` environment variable in backend
- Ensure it matches your frontend URL exactly (with `https://`)
- Redeploy backend after changes

#### 2. "502 Bad Gateway" on Backend

**Cause:** Server crashed or failed to start

**Solution:**
- Check Render logs: Service → Logs
- Verify `PORT` is set to `10000`
- Check for database errors

#### 3. "404 Not Found" on Frontend Routes

**Cause:** SPA routing not configured

**Solution:** Render.yaml already has redirect rules configured

#### 4. Slow First Load (30+ seconds)

**Cause:** Free tier services sleep after 15 minutes of inactivity

**Solution:**
- This is normal for free tier
- First request "wakes up" the server
- Consider paid plan for always-on

#### 5. Database Reset on Redeploy

**Cause:** SQLite stored in ephemeral storage

**Solution:**
- This is expected behavior with SQLite on Render
- For persistent data, upgrade to PostgreSQL
- Use Render's managed PostgreSQL (free tier available)

### Checking Logs

```bash
# In Render Dashboard:
# 1. Go to your service
# 2. Click "Logs" tab
# 3. Filter by time or search for errors
```

---

## Monitoring & Maintenance

### Free Tier Limitations

| Limitation | Description |
|------------|-------------|
| Sleep after inactivity | Services sleep after 15 min without requests |
| Cold start time | ~30 seconds to wake up |
| Monthly hours | 750 hours shared across services |
| Bandwidth | Limited bandwidth |
| Storage | Ephemeral (resets on redeploy) |

### Health Monitoring

The backend exposes a health endpoint for monitoring:

```
GET /api/health
```

You can use external monitoring services like:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

### Database Backup

Since SQLite data is ephemeral:

1. **Export data regularly:**
   - Add an admin endpoint to export JSON
   - Download backups before major changes

2. **Consider PostgreSQL upgrade:**
   - Render offers free PostgreSQL
   - Requires database migration

---

## Quick Reference

### URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://localhub-frontend.onrender.com` |
| Backend API | `https://localhub-api.onrender.com` |
| Health Check | `https://localhub-api.onrender.com/api/health` |
| API Docs | `https://localhub-api.onrender.com/api/docs` |

### Useful Commands

```bash
# Push changes to trigger redeploy
git add .
git commit -m "Your message"
git push origin master

# Check git remote
git remote -v

# View deployment status
# (Check Render Dashboard)
```

### Environment Variables Summary

**Backend (Web Service):**
```env
NODE_ENV=production
JWT_SECRET=<auto-generated>
PORT=10000
FRONTEND_URL=https://localhub-frontend.onrender.com
```

**Frontend (Static Site):**
```env
VITE_API_URL=https://localhub-api.onrender.com
```

---

## Next Steps After Deployment

1. ✅ Verify health check endpoint
2. ✅ Create admin account
3. ✅ Test authentication flow
4. ✅ Test GPS proximity filtering
5. ✅ Add some test brands/products
6. ⬜ Set up custom domain (optional)
7. ⬜ Configure monitoring (optional)
8. ⬜ Migrate to PostgreSQL for persistent data (optional)

---

**Need Help?**

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check the project's GitHub Issues

---

*Last updated: December 11, 2025*
