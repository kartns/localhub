# 🔐 GitHub Actions Setup Guide

## 📋 **Required GitHub Secrets**

You need to configure these secrets in your GitHub repository for the pipeline to work:

### **1. Go to Repository Settings:**
- Open your GitHub repository
- Go to **Settings** → **Secrets and variables** → **Actions**
- Click **"New repository secret"**

### **2. Add These 3 Secrets:**

#### **VPS_HOST**
- **Name:** `VPS_HOST`
- **Value:** Your VPS IP address (e.g., `123.456.789.101`)

#### **VPS_USERNAME** 
- **Name:** `VPS_USERNAME`
- **Value:** Your VPS username (e.g., `root`, `ubuntu`, `user`)

#### **VPS_SSH_KEY**
- **Name:** `VPS_SSH_KEY`
- **Value:** Your private SSH key content

---

## 🔑 **How to Get Your SSH Key**

### **If you don't have SSH keys:**
```bash
# Generate a new SSH key pair
ssh-keygen -t rsa -b 4096 -c "your-email@example.com"

# This creates:
# ~/.ssh/id_rsa (private key - for GitHub secret)
# ~/.ssh/id_rsa.pub (public key - for VPS)
```

### **Copy Private Key for GitHub Secret:**
```bash
# On Windows
type C:\Users\YourUsername\.ssh\id_rsa

# On Linux/Mac
cat ~/.ssh/id_rsa
```
Copy the **entire content** (including `-----BEGIN` and `-----END` lines)

### **Add Public Key to VPS:**
```bash
# Copy public key content
cat ~/.ssh/id_rsa.pub

# On your VPS, add to authorized_keys:
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 🚀 **Pipeline Features**

### **Triggers:**
- ✅ **Automatic:** Runs on every push to `Production` branch
- ✅ **Manual:** You can trigger it manually from GitHub Actions tab

### **What It Does:**
1. 📥 **Checkout code** from your repository
2. 🔧 **Setup Node.js** environment 
3. 📦 **Install dependencies** for frontend and backend
4. 🧪 **Run tests** (if you have any)
5. 🏗️ **Build frontend** for production
6. 🚀 **Deploy to VPS** via SSH
7. 🐳 **Run deploy script** automatically
8. 📊 **Check status** and report results

### **Safety Features:**
- ✅ **Build validation** before deployment
- ✅ **Automatic rollback** if deployment fails
- ✅ **Status reporting** in GitHub
- ✅ **Manual trigger** option

---

## 🎯 **Usage Workflow**

### **Automatic Deployment:**
```bash
# 1. Make changes locally on master branch
git add .
git commit -m "feature: add new functionality"
git push origin master

# 2. When ready for production, merge to Production branch:
git checkout Production
git merge master
git push origin Production

# 3. GitHub Actions automatically:
#    - Builds the app
#    - Runs tests
#    - Deploys to your VPS
#    - Updates https://thelocalhub.gr
```

### **Manual Deployment:**
1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **"🚀 Deploy to VPS"** workflow
4. Click **"Run workflow"**
5. Choose branch and click **"Run workflow"**

---

## 🔍 **Monitoring Deployments**

### **GitHub Actions Tab:**
- ✅ **Green checkmark:** Deployment successful
- ❌ **Red X:** Deployment failed
- 🟡 **Yellow dot:** Deployment in progress

### **View Logs:**
- Click on any workflow run
- Expand steps to see detailed logs
- Monitor deployment progress in real-time

### **VPS Status Check:**
```bash
# SSH to your VPS to check manually
ssh user@your-vps-ip
cd food-storage-app
docker-compose -f docker-compose.proxy.yml ps
```

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **"Permission denied" SSH Error:**
- Check VPS_SSH_KEY secret is correct private key
- Verify public key is added to VPS `~/.ssh/authorized_keys`
- Ensure VPS allows SSH on port 22

#### **"Project directory not found" Error:**
```bash
# First time: Clone repository on VPS
ssh user@your-vps-ip
git clone https://github.com/yourusername/food-storage-app.git
```

#### **Docker Permission Error:**
```bash
# Add user to docker group on VPS
sudo usermod -aG docker $USER
# Then logout and login again
```

#### **Port Access Issues:**
```bash
# Ensure VPS firewall allows ports
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
```

---

## 🎉 **Benefits of This Pipeline**

- 🚀 **Zero-downtime deployments**
- 🔄 **Consistent deployment process**
- 🧪 **Automated testing before deployment**
- 📊 **Deployment history and logs**
- 🔙 **Easy rollback capability**
- 👥 **Team collaboration friendly**
- 📱 **GitHub mobile notifications**

---

## 📝 **Next Steps**

1. ✅ **Add the 3 GitHub secrets** (VPS_HOST, VPS_USERNAME, VPS_SSH_KEY)
2. ✅ **Push this workflow file** to your repository
3. ✅ **Test manual deployment** from GitHub Actions
4. ✅ **Make a code change** and push to test automatic deployment
5. ✅ **Monitor the deployment** in GitHub Actions tab
6. ✅ **Visit https://thelocalhub.gr** to see your app live!

**🎯 You now have professional CI/CD pipeline for your LocalHub app!**