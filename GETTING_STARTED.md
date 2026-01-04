# 🎬 Step-by-Step Getting Started Guide

## 🎯 Your Goal: Get the App Running in 5 Minutes

---

## Step 1️⃣: Install Node.js (5 minutes)

### Windows Installation
1. Go to: **https://nodejs.org/**
2. Click the big "LTS" button (Long Term Support)
3. Run the installer (.msi file)
4. Click "Next" through all screens
5. ✅ Make sure "Add to PATH" is checked
6. Click "Install"
7. Wait for installation to complete
8. Restart your computer (important!)

### Verify Installation
1. Open PowerShell (search for it in Windows)
2. Type: `node --version`
3. Type: `npm --version`
4. ✅ Both should show version numbers (e.g., v18.15.0)

---

## Step 2️⃣: Open VS Code in Project Folder

1. Open Visual Studio Code
2. Click "File" → "Open Folder"
3. Navigate to: `C:\Users\kartn\Documents\Projects\food-storage-app`
4. Click "Select Folder"
5. ✅ Project should open in VS Code

---

## Step 3️⃣: Open Two Terminals

### Terminal 1: Backend
1. In VS Code, press `Ctrl + ` (backtick)
2. A terminal appears at the bottom
3. Type:
```bash
cd backend
npm install
```
4. ⏳ Wait for installation (1-2 minutes)
5. Type:
```bash
npm run dev
```
6. ✅ Look for: `🚀 Server running on http://localhost:3001`
7. **KEEP THIS TERMINAL OPEN**

### Terminal 2: Frontend
1. Click the "+" button in the terminal to add a new terminal
2. Type:
```bash
cd frontend
npm install
```
3. ⏳ Wait for installation (1-2 minutes)
4. Type:
```bash
npm run dev
```
5. ✅ Look for: `Local: http://localhost:3000/`
6. **KEEP THIS TERMINAL OPEN**

---

## Step 4️⃣: Access API Documentation

After starting both servers, you can view the interactive API documentation:

1. Open your browser to: **http://localhost:3001/api/docs**
2. 📚 Interactive Swagger UI will show all API endpoints
3. You can test endpoints directly from the documentation
4. All endpoints are documented with examples and required parameters

---

## Step 5️⃣: Open Your App

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:3000**
3. 🎉 You should see the Food Storage Hub app!

---

## Step 6️⃣: Test the Features

### Create User Account (First Time)
1. Click "Sign Up" button
2. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123`
3. Click "Register"
4. ✅ Account created and you're logged in!

### Add a Storage (Admin Feature)
1. Click "+ Add Storage" button
2. Fill in the form:
   - Name: "My Local Farm"
   - Type: "Farm"
   - Description: "Fresh vegetables"
   - Address: "123 Main Street"
3. Click "Create Storage"
4. ✅ New storage appears on the page!

### Upload Item Image
1. Click "View Details" on a storage
2. Click "+ Add Item"
3. Fill in item details
4. Click "Choose Image" and select a JPG/PNG file
5. Click "Add Item"
6. ✅ Item appears with uploaded image!

### View Storage Details
1. Click "View Details" on a storage card
2. See all items in that storage
3. Click on items to view full-size images

### Delete Storage
1. Click the 🗑️ button on a storage
2. Confirm deletion
3. ✅ Storage removed!

### Test Security Features
- Try accessing `/admin` without logging in → redirected to login
- Rate limiting is active (try many API calls quickly)
- Input validation prevents invalid data
- Image uploads are validated for security

---

## 📱 Using on Mobile

The app is mobile-responsive! You can:

1. **On Computer:** 
   - Press `F12` to open Developer Tools
   - Click the mobile icon (top left)
   - Choose different phone sizes

2. **On Actual Phone:**
   - Same computer must be on same WiFi
   - On your phone, go to: `http://YOUR_COMPUTER_IP:3000`
   - Find YOUR_COMPUTER_IP by typing `ipconfig` in PowerShell

---

## 🆘 Troubleshooting

### Issue: "npm command not found"
**Solution:**
- Node.js not installed correctly
- Restart PowerShell or computer
- Download from https://nodejs.org/ again

### Issue: "Port 3000/3001 already in use"
**Solution:**
- Another app is using that port
- Edit `backend/.env` and change `PORT=3001` to a different port (e.g., 3002)
- Update `frontend/src/config.js` with new backend port

### Issue: "Can't reach localhost:3000"
**Solution:**
- Both servers must be running (check both terminal tabs)
- Wait 5 seconds for servers to start
- Try refreshing the page (Ctrl+R)
- Check browser console (F12) for errors

### Issue: "Login not working / 'Invalid credentials'"
**Solution:**
- Make sure you signed up first
- Check that email and password match your signup
- Backend server must be running
- Check browser console for API errors

### Issue: "Can't upload image / 'File upload failed'"
**Solution:**
- File must be JPG or PNG
- File size must be under 10MB
- Check file permissions
- Backend server must be running

### Issue: "Can't create storage / 'Unauthorized' error"
**Solution:**
- Must be logged in as admin
- Check that you're logged in (see "Sign Out" in navigation)
- Use test account or create new one
- Check browser console for token errors

### Issue: "Rate limit exceeded"
**Solution:**
- Too many API requests in a short time
- Wait a few minutes before trying again
- Different endpoints have different limits:
  - Auth: 5 requests per 15 minutes
  - Admin: 50 requests per 15 minutes
  - General: 100 requests per 15 minutes

### Issue: "Database error / storage not saving"
**Solution:**
- Delete folder: `backend/data/`
- Restart backend server: `npm run dev`
- Database will recreate automatically
- Check backend console for error messages

---

## 🔍 Where to Find Things

| What | Location |
|-----|----------|
| App Code | `frontend/src/` |
| API Code | `backend/src/` |
| Main Component | `frontend/src/App.jsx` |
| Storage Card | `frontend/src/components/StorageCard.jsx` |
| Database | `backend/src/database.js` |
| API Routes | `backend/src/routes/storages.js` |
| Styles | `frontend/src/index.css` |

---

## 📚 Documentation

After you get the app running, explore these files in order:
1. ✅ **README.md** - Complete feature overview and architecture
2. ✅ **API_TESTING.md** - Detailed API endpoint examples (curl commands)
3. ✅ **TECH_REFERENCE.md** - Technology stack and package details
4. ✅ **DEPLOYMENT.md** - Deploy to production on Render.com
5. ✅ **FINAL_CHECKLIST.md** - Project completion verification

**Interactive API Docs:** http://localhost:3001/api/docs (when servers are running)

---

## 💡 Quick Tips

✅ **Keyboard Shortcuts in VS Code:**
- `Ctrl + ` (backtick) = Open/Close terminal
- `Ctrl + Shift + C` = New terminal in VS Code
- `Ctrl + L` = Clear terminal
- `Ctrl + K` = Scroll terminal history

✅ **Browser Developer Tools:**
- `F12` = Open developer tools
- `Ctrl + Shift + I` = Open inspector
- `Ctrl + Shift + J` = Open console
- `Ctrl + Shift + M` = Toggle mobile view

✅ **React Hot Reload:**
- Edit a file → Auto-reloads in browser
- No need to restart!

---

## 🎓 Learning Activities

### Activity 1: Add a New Field
- Try adding a "phone number" field to the storage form
- Edit: `frontend/src/components/StorageForm.jsx`
- See changes instantly!

### Activity 2: Change Colors
- Edit: `frontend/tailwind.config.js`
- Change color values
- App updates automatically

### Activity 3: Test the API
- Use PowerShell to test API
- Follow examples in: `API_TESTING.md`

### Activity 4: Add a New Route
- Create new endpoint in: `backend/src/routes/storages.js`
- Test it with Postman or PowerShell

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Install Node.js | 5 min |
| npm install (backend) | 2 min |
| npm install (frontend) | 2 min |
| Start servers | 1 min |
| Test app | 5 min |
| **Total** | **~15 minutes** |

---

## 🎯 What Happens When You Run npm install

```
npm install
↓
Reads package.json
↓
Downloads all packages from npm registry
↓
Installs in node_modules/ folder
↓
Creates package-lock.json
↓
Done! Ready to use
```

Backend: ~200MB downloaded  
Frontend: ~400MB downloaded  
(Both on your computer, not in the cloud)

---

## 🚀 Next Steps After Getting It Working

1. **Read the code** - Understand how components work
2. **Make small changes** - Edit colors, text, styling
3. **Add features** - Create item management
4. **Connect a database** - Deploy with PostgreSQL
5. **Deploy online** - Use Vercel, Netlify, or Railway

---

## 🎉 You're Ready!

Everything is set up and ready to go!

**Next Step:** Open terminal and run:
```bash
cd c:\Users\kartn\Documents\Projects\food-storage-app
```

Then follow the Terminal 1 and Terminal 2 steps above.

**Questions?** Check the documentation files or look at the code comments.

**Happy coding!** 🥬📦🌾

---

*Last Updated: December 5, 2025*
