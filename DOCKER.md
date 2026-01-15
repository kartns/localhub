# 🐳 Docker Deployment Guide

This guide explains how to deploy LocalHub using Docker.

## Prerequisites

- Docker and Docker Compose installed on your server
- Port 80 (and 443 for HTTPS) available
- A domain name (for HTTPS deployment)

---

## Quick Start (HTTP)

For testing or internal use without HTTPS:

```bash
# Clone the repository
git clone https://github.com/your-repo/localhub.git
cd localhub

# Start the containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Access the app at: `http://your-server-ip`

> ⚠️ **Note:** Geolocation features require HTTPS to work in browsers.

---

## Production Deployment (HTTPS)

For production with automatic SSL certificates:

### 1. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

Set these values in `.env`:
```env
JWT_SECRET=your-random-secret-here
COOKIE_SECRET=your-random-secret-here
DOMAIN=yourdomain.com
ACME_EMAIL=your-email@example.com
```

Generate secure secrets:
```bash
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for COOKIE_SECRET
```

### 2. Point Domain to Server

Create an A record pointing your domain to your server's IP address.

### 3. Deploy

```bash
# Start with HTTPS
docker-compose -f docker-compose.https.yml up -d

# Check status
docker-compose -f docker-compose.https.yml ps

# View logs
docker-compose -f docker-compose.https.yml logs -f
```

Access the app at: `https://yourdomain.com`

---

## Common Commands

```bash
# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View backend logs
docker logs localhub-backend -f

# View frontend logs
docker logs localhub-frontend -f

# Enter backend container
docker exec -it localhub-backend sh

# Backup database
docker cp localhub-backend:/app/data/storage.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db localhub-backend:/app/data/storage.db
docker-compose restart backend
```

---

## Data Persistence

Data is stored in Docker volumes:
- `backend-data` - SQLite database
- `backend-uploads` - Uploaded images

To backup:
```bash
docker run --rm -v localhub_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
docker run --rm -v localhub_backend-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data
```

---

## Troubleshooting

### Build Fails
```bash
# Clear Docker cache and rebuild
docker builder prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

### SSL Certificate Issues
```bash
# Check Traefik logs
docker logs localhub-traefik

# Reset certificates
docker-compose -f docker-compose.https.yml down
rm -rf letsencrypt/
docker-compose -f docker-compose.https.yml up -d
```

### API Not Working
```bash
# Test backend directly
docker exec localhub-backend wget -qO- http://localhost:3001/api/health

# Check nginx config
docker exec localhub-frontend cat /etc/nginx/conf.d/default.conf
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Internet                      │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Traefik (HTTPS only)                │
│         (SSL termination & routing)              │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                   Nginx                          │
│     (Frontend + /api proxy to backend)           │
│                                                  │
│   /          → React SPA                         │
│   /api/*     → Backend:3001                      │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                   Backend                        │
│            (Node.js + Express)                   │
│                                                  │
│   /api/storages  → Storage CRUD                  │
│   /api/items     → Items CRUD                    │
│   /api/auth      → Authentication                │
└─────────────────────────────────────────────────┘
```

---

## Updating

To update to a new version:

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

Your data (database and uploads) will be preserved in Docker volumes.
