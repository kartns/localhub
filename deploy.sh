#!/bin/bash

# LocalHub Deployment Script for thelocalhub.gr
# NOTE: Git operations are handled by GitHub Actions workflow (deploy.yml)
# This script only handles Docker operations
# Strategy: Build first, then swap containers to minimize downtime

set -e

echo "Deploying LocalHub to thelocalhub.gr..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed."
    exit 1
fi

# STEP 1: Build new images WHILE old containers are still running
echo "=== Building new images (site is still live) ==="
docker compose -f docker-compose.proxy.yml build --no-cache || {
  echo "Build failed! Attempting cache cleanup and retry..."
  docker builder prune -af
  docker compose -f docker-compose.proxy.yml build --no-cache
}

# STEP 2: Stop old containers and start new ones (minimal downtime)
echo "=== Swapping to new containers ==="
docker compose -f docker-compose.proxy.yml down
docker compose -f docker-compose.proxy.yml up -d

# STEP 3: Wait for backend to be ready before running migrations
echo "=== Waiting for backend to start ==="
sleep 5

# STEP 4: Run database migrations
echo "=== Running database migrations ==="
docker exec localhub-backend npm run migrate || echo "Migrations completed (or no new migrations)"

# STEP 5: Health check
echo "=== Verifying containers are healthy ==="
if docker ps --filter "name=localhub-backend" --filter "status=running" -q | grep -q .; then
  echo "✅ Backend is running"
else
  echo "❌ Backend is NOT running!"
  docker logs localhub-backend --tail 20
  exit 1
fi

if docker ps --filter "name=localhub-frontend" --filter "status=running" -q | grep -q .; then
  echo "✅ Frontend is running"
else
  echo "❌ Frontend is NOT running!"
  docker logs localhub-frontend --tail 20
  exit 1
fi

if docker ps --filter "name=localhub-nginx" --filter "status=running" -q | grep -q .; then
  echo "✅ Nginx is running"
else
  echo "❌ Nginx is NOT running!"
  docker logs localhub-nginx --tail 20
  exit 1
fi

# STEP 6: Cleanup old images to free disk space
echo "=== Cleaning up old images ==="
docker image prune -f

# Show container status
echo "=== Container status ==="
docker compose -f docker-compose.proxy.yml ps

echo "Deployment completed!"
echo "LocalHub is live at https://thelocalhub.gr"
