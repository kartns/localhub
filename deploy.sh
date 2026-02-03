#!/bin/bash

# LocalHub Deployment Script for thelocalhub.gr

set -e

echo "Deploying LocalHub to thelocalhub.gr..."

# Configuration
DOMAIN="thelocalhub.gr"

# Update code from git repository
echo "Pulling latest code from git repository..."
if [ -d ".git" ]; then
    git fetch origin
    git checkout Production
    git pull origin Production
    echo "Code updated from Production branch"
else
    echo "Not a git repository."
    exit 1
fi

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

# Show container status
echo "Container status:"
docker compose -f docker-compose.proxy.yml ps

echo "Deployment completed!"
echo "LocalHub is live at https://$DOMAIN"
