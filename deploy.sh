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
EMAIL="kartns93@hotmail.com"  # Change this to your email for Let's Encrypt

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/certbot
sudo mkdir -p /etc/letsencrypt

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.proxy.yml down || true

# Create temporary HTTP-only nginx config for SSL verification
echo "📝 Creating temporary nginx config for SSL verification..."
cp nginx-http-only.conf nginx-proxy.conf

# Start containers first (for webroot validation)
echo "🐳 Starting containers for SSL verification..."
docker compose -f docker-compose.proxy.yml up -d --build

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to start..."
sleep 15

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
    
    # Now update nginx config to use HTTPS
    echo "🔄 Updating nginx config for HTTPS..."
    cat > nginx-proxy.conf << 'EOF'
server {
    listen 80;
    server_name thelocalhub.gr;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name thelocalhub.gr;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/thelocalhub.gr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thelocalhub.gr/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Proxy to frontend container
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # File upload limits
        client_max_body_size 50M;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF
    
    # Restart containers to pick up new certificates
    echo "🔄 Restarting containers with SSL certificates..."
    docker compose -f docker-compose.proxy.yml restart nginx
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
docker compose -f docker-compose.proxy.yml up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for containers to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker compose -f docker-compose.proxy.yml ps

# Test the deployment
echo "🔍 Testing deployment..."
if curl -f -s https://$DOMAIN > /dev/null; then
    echo "✅ Deployment successful! Your app is running at https://$DOMAIN"
else
    echo "⚠️ Deployment may have issues. Check the logs:"
    echo "   docker compose -f docker-compose.proxy.yml logs"
fi

# Setup auto-renewal for SSL certificates
echo "🔄 Setting up SSL certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && docker compose -f $(pwd)/docker-compose.proxy.yml restart nginx") | crontab -

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "🌐 Your LocalHub app is available at:"
echo "   https://$DOMAIN"
echo ""
echo "📝 Deployment workflow:"
echo "1. Push changes: git push origin main"
echo "2. Deploy on VPS: ./deploy.sh"
echo "3. Check status: docker compose -f docker-compose.proxy.yml ps"
echo ""
echo "🔧 Management commands:"
echo "   Deploy:  ./deploy.sh"
echo "   Start:   docker compose -f docker-compose.proxy.yml up -d"
echo "   Stop:    docker compose -f docker-compose.proxy.yml down"
echo "   Logs:    docker compose -f docker-compose.proxy.yml logs -f"
echo "   Update:  git pull && docker compose -f docker-compose.proxy.yml up -d --build"