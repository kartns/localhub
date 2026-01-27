#!/bin/bash

# 🚀 LocalHub Deployment Script for thelocalhub.gr
# Run this script on your VPS to deploy the application

set -e  # Exit on any error

echo "🌟 Deploying LocalHub to thelocalhub.gr..."

# Update code from git repository
echo "📥 Pulling latest code from git repository..."
if [ -d ".git" ]; then
    git pull origin main || git pull origin master
    echo "✅ Code updated from git repository"
else
    echo "⚠️ Not a git repository. Make sure you're in the right directory."
    echo "   Clone your repository first: git clone <your-repo-url> ."
fi

# Configuration
DOMAIN="thelocalhub.gr"
EMAIL="your-email@example.com"  # Change this to your email for Let's Encrypt

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/certbot
sudo mkdir -p /etc/letsencrypt

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.proxy.yml down || true

# Get SSL certificates
echo "🔐 Getting SSL certificates for $DOMAIN..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo "📦 Installing certbot..."
        sudo apt update
        sudo apt install -y certbot
    fi
    
    # Get certificate
    sudo certbot certonly \
        --webroot \
        -w /var/www/certbot \
        -d $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive
    
    echo "✅ SSL certificate obtained successfully!"
else
    echo "✅ SSL certificate already exists for $DOMAIN"
fi

# Set environment variables
echo "⚙️ Setting environment variables..."
export DOMAIN=$DOMAIN

# Generate secure secrets if they don't exist
if [ ! -f ".env" ]; then
    echo "🔑 Generating secure environment variables..."
    JWT_SECRET=$(openssl rand -base64 32)
    COOKIE_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOF
# Production Environment Variables
NODE_ENV=production
DOMAIN=$DOMAIN
JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$COOKIE_SECRET
FORCE_HTTPS=true
EOF
    echo "✅ Environment variables created in .env file"
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose -f docker-compose.proxy.yml up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for containers to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.proxy.yml ps

# Test the deployment
echo "🔍 Testing deployment..."
if curl -f -s https://$DOMAIN > /dev/null; then
    echo "✅ Deployment successful! Your app is running at https://$DOMAIN"
else
    echo "⚠️ Deployment may have issues. Check the logs:"
    echo "   docker-compose -f docker-compose.proxy.yml logs"
fi

# Setup auto-renewal for SSL certificates
echo "🔄 Setting up SSL certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && docker-compose -f $(pwd)/docker-compose.proxy.yml restart nginx") | crontab -

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "🌐 Your LocalHub app is available at:"
echo "   https://$DOMAIN"
echo ""
echo "📝 Deployment workflow:"
echo "1. Push changes: git push origin main"
echo "2. Deploy on VPS: ./deploy.sh"
echo "3. Check status: docker-compose -f docker-compose.proxy.yml ps"
echo ""
echo "🔧 Management commands:"
echo "   Deploy:  ./deploy.sh"
echo "   Start:   docker-compose -f docker-compose.proxy.yml up -d"
echo "   Stop:    docker-compose -f docker-compose.proxy.yml down"
echo "   Logs:    docker-compose -f docker-compose.proxy.yml logs -f"
echo "   Update:  git pull && docker-compose -f docker-compose.proxy.yml up -d --build"