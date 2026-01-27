# 🚀 LocalHub Deployment Guide

## Quick Deployment Workflow

### **Local Development → Production**

```bash
# 1. Local: Push your changes
git add .
git commit -m "your changes"
git push origin main

# 2. VPS: Deploy latest changes
./deploy.sh
```

---

## 🛠️ **Initial VPS Setup** (One-time)

### **1. Clone Repository on VPS:**
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Clone your repository
git clone https://github.com/yourusername/food-storage-app.git
cd food-storage-app

# Make deploy script executable
chmod +x deploy.sh
```

### **2. Configure Email:**
```bash
# Edit deploy.sh to add your email for SSL certificates
nano deploy.sh
# Change line 15: EMAIL="your-email@example.com" → EMAIL="youremail@gmail.com"
```

### **3. First Deployment:**
```bash
# Run initial deployment
sudo ./deploy.sh
```

### **4. DNS Configuration:**
Update your domain DNS settings:
```
A Record: thelocalhub.gr → YOUR_VPS_IP
```

---

## 🔄 **Daily Workflow**

### **Development:**
```bash
# Make changes locally
# Test with: npm run dev (frontend) & npm start (backend)

# When ready to deploy:
git add .
git commit -m "feature: add new functionality"
git push origin main
```

### **Deployment:**
```bash
# SSH to VPS
ssh user@your-vps-ip
cd food-storage-app

# Deploy (pulls latest code automatically)
./deploy.sh
```

---

## 📊 **Management Commands**

```bash
# Check application status
docker-compose -f docker-compose.proxy.yml ps

# View logs
docker-compose -f docker-compose.proxy.yml logs -f

# Restart services
docker-compose -f docker-compose.proxy.yml restart

# Stop application
docker-compose -f docker-compose.proxy.yml down

# Manual update without deploy script
git pull origin main
docker-compose -f docker-compose.proxy.yml up -d --build
```

---

## 🔍 **Troubleshooting**

### **SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Restart nginx after renewal
docker-compose -f docker-compose.proxy.yml restart nginx
```

### **Container Issues:**
```bash
# Rebuild containers
docker-compose -f docker-compose.proxy.yml down
docker-compose -f docker-compose.proxy.yml up -d --build

# View specific container logs
docker logs localhub-frontend
docker logs localhub-backend
docker logs localhub-nginx
```

### **Port/Firewall Issues:**
```bash
# Check if ports are open
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## 🌐 **Your Application URLs**

- **Production:** https://thelocalhub.gr
- **API Docs:** https://thelocalhub.gr/api/docs
- **Health Check:** https://thelocalhub.gr/api/health

---

## 📈 **Monitoring**

### **Check Application Health:**
```bash
# Test frontend
curl -I https://thelocalhub.gr

# Test API
curl https://thelocalhub.gr/api/health

# Check SSL certificate expiry
openssl x509 -in /etc/letsencrypt/live/thelocalhub.gr/fullchain.pem -text -noout | grep "Not After"
```

---

## 🎯 **Production Checklist**

- [ ] Domain DNS configured (A record)
- [ ] SSL certificate obtained and auto-renewal setup
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Environment variables secured (.env file)
- [ ] Application accessible at https://thelocalhub.gr
- [ ] API endpoints working
- [ ] Database persisted (./backend/data mounted)
- [ ] File uploads working (./backend/uploads mounted)
- [ ] Git deployment workflow tested

---

**🚀 Happy deploying! Your LocalHub food storage app is production-ready.**