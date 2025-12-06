# 🌟 The Local Hub

A modern, full-stack web application for discovering and managing local brands and their products. Built with React frontend and Node.js backend.

## ✨ Features

✅ **Brand Management** - Create, view, and delete local brand locations  
✅ **Product Catalog** - Add multiple products per brand with images  
✅ **Raw Material Tags** - Color-coded tags showing what each brand produces  
✅ **Interactive Maps** - Google Maps integration with location pins  
✅ **Image Carousel** - Hover over brand cards to see all product images  
✅ **Dual Interface** - Public browsing + Admin management  
✅ **Responsive Design** - Mobile-friendly with Tailwind CSS  
✅ **Real-time Updates** - Live data synchronization  

## Project Structure

```
localhub/
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── index.js         # Main server entry
│   │   ├── database.js      # SQLite database setup
│   │   └── routes/
│   │       ├── storages.js  # Brand CRUD operations
│   │       └── items.js     # Product CRUD operations
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

### Brands
- `GET /api/storages` - Get all brands
- `GET /api/storages/:id` - Get brand details with products
- `POST /api/storages` - Create new brand
- `PUT /api/storages/:id` - Update brand
- `DELETE /api/storages/:id` - Delete brand

### Products
- `GET /api/items/storage/:storageId` - Get all products for a brand
- `POST /api/items` - Add product to brand
- `PUT /api/items/:id` - Update product
- `DELETE /api/items/:id` - Delete product
- `GET /api/health` - Health check

## Database

Uses SQLite with three main tables:
- **storages** - Brand locations with raw material info
- **items** - Products within each brand
- **categories** - Raw material categories (Vegetables, Fruits, etc.)

## Application Routes

- `/` - Public home page (browse brands)
- `/admin` - Admin dashboard (manage brands and products)

## Key Features Implemented

1. ✅ Brand management with raw material tagging
2. ✅ Multi-product support per brand
3. ✅ Image carousel on hover
4. ✅ Google Maps integration
5. ✅ Color-coded category tags
6. ✅ Public/Admin dual interface
7. ✅ React Router navigation
8. ✅ Mobile-responsive design

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
