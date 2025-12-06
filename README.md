# 🥬 Food Storage Hub

A modern, mobile-friendly web application for managing and discovering local food storages in your area. Built with Node.js backend and React frontend.

## Features

✅ **Storage Management** - Create, view, and delete local food storage locations  
✅ **Mobile-Responsive** - Beautiful UI optimized for mobile devices  
✅ **Real-time Updates** - Instant synchronization with backend API  
✅ **Location Tracking** - Store GPS coordinates for each storage location  
✅ **Item Inventory** - Track items within each storage (coming soon)  
✅ **Modern Stack** - Express.js + React with Vite + Tailwind CSS  

## Project Structure

```
food-storage-app/
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── index.js         # Main server entry
│   │   ├── database.js      # Database initialization
│   │   └── routes/
│   │       └── storages.js  # Storage API endpoints
│   ├── package.json
│   └── .env
└── frontend/         # React + Vite application
    ├── src/
    │   ├── App.jsx          # Main app component
    │   ├── components/      # React components
    │   ├── index.css        # Tailwind styles
    │   └── main.jsx         # React entry point
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:3001`

**Terminal 2 - Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:3000`

## API Endpoints

### Storages
- `GET /api/storages` - Get all food storages
- `GET /api/storages/:id` - Get storage details with items
- `POST /api/storages` - Create new storage
- `PUT /api/storages/:id` - Update storage
- `DELETE /api/storages/:id` - Delete storage
- `GET /api/health` - Health check

## Database

Uses SQLite with three main tables:
- **storages** - Food storage locations
- **items** - Inventory items within storages
- **categories** - Item categories (Vegetables, Fruits, etc.)

## Next Steps

1. ✅ Backend setup complete
2. ✅ Frontend setup complete
3. 📋 Add item management features
4. 📋 Implement map integration
5. 📋 Add user authentication
6. 📋 Deploy to production

## Technologies Used

**Backend:**
- Express.js - REST API framework
- SQLite - Local database
- CORS - Cross-origin support
- dotenv - Environment variables

**Frontend:**
- React 18 - UI library
- Vite - Fast bundler
- Tailwind CSS - Utility-first styling
- Axios - HTTP client (prepared for use)

## Mobile Experience

The app is designed with mobile-first responsive design:
- Optimized for small screens (phones and tablets)
- Touch-friendly buttons and inputs
- Fast loading with Vite
- Gradient backgrounds and smooth animations

## Contributing

Feel free to extend this project by:
- Adding item management features
- Implementing map views
- Adding user authentication
- Creating mobile app with React Native
- Adding notification features

## License

MIT License
