# 🚀 Installation Guide - Food Storage App

## Prerequisites: Install Node.js

### Windows Installation

1. **Download Node.js**
   - Visit https://nodejs.org/
   - Download the LTS (Long Term Support) version (recommended)
   - The download will include both Node.js and npm (Node Package Manager)

2. **Install Node.js**
   - Run the installer
   - Follow the default installation steps
   - Accept the license agreement
   - Choose default installation path
   - Make sure to check "Add to PATH" during installation

3. **Verify Installation**
   - Open PowerShell or Command Prompt
   - Run: `node --version`
   - Run: `npm --version`
   - You should see version numbers for both

---

## After Installing Node.js

Once Node.js is installed, return to VS Code and run these commands:

### Terminal 1: Start Backend

```bash
cd c:\Users\kartn\Documents\Projects\food-storage-app\backend
npm install
npm run dev
```

**Expected output:**
```
✅ Database initialized
🚀 Server running on http://localhost:3001
```

### Terminal 2: Start Frontend

```bash
cd c:\Users\kartn\Documents\Projects\food-storage-app\frontend
npm install
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms
  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### Access the App

Open your browser and navigate to: **http://localhost:3000**

---

## Troubleshooting

**Issue:** npm command not found after installing Node.js
- **Solution:** Restart PowerShell/Command Prompt or restart your computer

**Issue:** Port 3000 or 3001 already in use
- **Solution:** Edit the port numbers in:
  - Backend: `.env` file (PORT=3001)
  - Frontend: `vite.config.js` (port: 3000)

**Issue:** "Database initialization failed"
- **Solution:** Ensure the `backend/data` directory can be created and check folder permissions

---

## Next Steps

1. ✅ Install Node.js
2. ✅ Run backend: `npm install && npm run dev` (in backend folder)
3. ✅ Run frontend: `npm install && npm run dev` (in frontend folder)
4. ✅ Open http://localhost:3000 in your browser
5. ✅ Start adding food storages!

Happy storing! 🥬
