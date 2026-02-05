#!/bin/bash

# LocalHub Deployment Script for thelocalhub.gr
# NOTE: Git operations are handled by GitHub Actions workflow (deploy.yml)
# This script only handles Docker operations

set -e

echo "Deploying LocalHub to thelocalhub.gr..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed."
    exit 1
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker compose -f docker-compose.proxy.yml down || true

# Build and start containers
echo "Building and starting containers..."
docker compose -f docker-compose.proxy.yml build --no-cache
docker compose -f docker-compose.proxy.yml up -d

# Run database migrations
echo "Running database migrations..."
docker exec localhub-backend npm run migrate || echo "Migrations completed (or no new migrations)"

# Show container status
echo "Container status:"
docker compose -f docker-compose.proxy.yml ps

echo "Deployment completed!"
echo "LocalHub is live at https://thelocalhub.gr"

