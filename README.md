# 🌟 The Local Hub

A modern, full-stack web application for discovering and managing local brands and their products. Built with React frontend and Node.js backend.

## ✨ Features

### Core Functionality
✅ **Storage Management** - Create, view, and delete local food storages  
✅ **Item Management** - Add multiple items per storage with image uploads  
✅ **Raw Material Tags** - Categorize items by type (Vegetables, Fruits, etc.)  
✅ **Image Support** - Full image upload and carousel viewing  
✅ **Dual Interface** - Public browsing + Admin management  
✅ **Responsive Design** - Mobile-friendly with Tailwind CSS  

### Security & API Features
✅ **User Authentication** - JWT-based login with secure httpOnly cookies  
✅ **Admin Authorization** - Role-based access control for sensitive operations  
✅ **Rate Limiting** - Multi-tier rate limiting (auth, admin, general API)  
✅ **Input Validation** - XSS protection and data validation on all inputs  
✅ **Security Headers** - Helmet.js security middleware with CSP protection  
✅ **File Upload Security** - Multer with size limits and type validation  
✅ **API Documentation** - Interactive Swagger UI with OpenAPI 3.0 specification  

## Project Structure

```
food-storage-app/
├── backend/                    # Node.js Express API Server
│   ├── src/
│   │   ├── index.js            # Main Express server with middleware
│   │   ├── database.js         # SQLite setup and queries
│   │   ├── swagger.js          # OpenAPI 3.0 specification
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT authentication middleware
│   │   │   ├── validation.js   # Input validation & XSS protection
│   │   │   ├── rateLimiting.js # Multi-tier rate limiting
│   │   │   └── upload.js       # Multer file upload configuration
│   │   └── routes/
│   │       ├── auth.js         # Authentication endpoints (register, login, profile)
│   │       ├── storages.js     # Storage CRUD operations
│   │       └── items.js        # Item CRUD operations
│   ├── package.json            # Dependencies
│   └── .env                    # Environment variables
│
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css           # Global Tailwind styles
│   │   ├── config.js           # API configuration
│   │   ├── components/         # Reusable React components
│   │   │   ├── StorageForm.jsx
│   │   │   ├── StorageList.jsx
│   │   │   ├── StorageCard.jsx
│   │   │   ├── StorageDetail.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   └── ...
│   │   ├── contexts/           # React Context API
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ...
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAccessibility.js
│   │   │   └── ...
│   │   └── pages/              # Page components
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── Documentation/
    ├── README.md               # This file
    ├── GETTING_STARTED.md      # Step-by-step setup guide
    ├── INDEX.md                # Documentation navigation
    ├── API_TESTING.md          # API endpoint testing guide
    ├── DEPLOYMENT.md           # Deployment instructions
    ├── TECH_REFERENCE.md       # Technology stack details
    ├── FINAL_CHECKLIST.md      # Delivery checklist
    ├── START_HERE.md           # Project overview
    ├── VISUAL_OVERVIEW.md      # Architecture diagrams
    └── UI_2026_ROADMAP.md      # Future features roadmap
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

### Documentation
- **`GET /api/docs`** - Interactive Swagger UI documentation
- **`GET /api/docs/swagger.json`** - OpenAPI 3.0 specification (JSON)

### Authentication
- **`POST /api/auth/register`** - Create new user account
- **`POST /api/auth/login`** - Login and receive JWT token
- **`GET /api/auth/me`** - Get current user profile (requires authentication)

### Storages (Food Storage Locations)
- **`GET /api/storages`** - Get all food storages
- **`GET /api/storages/:id`** - Get storage details with items
- **`POST /api/storages`** - Create new storage (admin only)
- **`PUT /api/storages/:id`** - Update storage (admin only)
- **`DELETE /api/storages/:id`** - Delete storage (admin only)
- **`GET /api/storages/public/:id`** - Get public storage view (no authentication)

### Items (Food Items)
- **`GET /api/items/storage/:storageId`** - Get all items in a storage
- **`POST /api/items`** - Add item to storage with image upload (admin only)
- **`PUT /api/items/:id`** - Update item (admin only)
- **`DELETE /api/items/:id`** - Delete item (admin only)

### Images
- **`GET /api/images/:filename`** - Download uploaded item image

### Health Check
- **`GET /api/health`** - Server health status

**Note:** Use the Swagger UI at `/api/docs` for interactive API testing with full documentation.

## Database

Uses SQLite with the following tables:
- **users** - User accounts for authentication
- **storages** - Food storage locations
- **items** - Food items within each storage
- **categories** - Item categorization (Vegetables, Fruits, Grains, etc.)

## Security Features

### Authentication & Authorization
- JWT (JSON Web Token) authentication with secure httpOnly cookies
- User registration and login endpoints
- Token-based authorization for admin operations
- Session management with configurable token expiration

### Input Validation & Protection
- Comprehensive input validation on all API endpoints
- XSS (Cross-Site Scripting) protection via input sanitization
- File upload validation (size limits, file type restrictions)
- SQL injection prevention through parameterized queries

### API Security
- **Helmet.js** security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **CORS** (Cross-Origin Resource Sharing) configuration
- **Rate Limiting** - Multi-tier protection:
  - Auth endpoints: 5 requests per 15 minutes
  - Admin endpoints: 50 requests per 15 minutes
  - General API: 100 requests per 15 minutes

### File Upload Security
- Multer integration with size validation (10MB max)
- File type validation (images only)
- Secure file serving with cache control headers

## Application Routes

### Public Routes
- `/` - Home page (browse storages)
- `/storages/:id` - View storage details and items
- `/login` - User login page
- `/signup` - User registration page

### Admin Routes (requires authentication)
- `/admin` - Admin dashboard
- `/admin/storages` - Manage storages
- `/admin/items` - Manage items

### User Routes
- `/profile` - User profile page

## Key Features Implemented

1. ✅ Food storage management with full CRUD operations
2. ✅ Multi-item support per storage with image uploads
3. ✅ JWT-based user authentication and authorization
4. ✅ Role-based access control (admin operations)
5. ✅ Rate limiting on API endpoints
6. ✅ Input validation with XSS protection
7. ✅ Security headers via Helmet.js
8. ✅ Interactive API documentation with Swagger UI
9. ✅ React Router navigation with lazy loading
10. ✅ Mobile-responsive design with Tailwind CSS
11. ✅ Theme switching (light/dark mode)
12. ✅ Error boundary error handling

## Quick Start

**For detailed setup instructions, see [GETTING_STARTED.md](./GETTING_STARTED.md)**

1. Install Node.js from https://nodejs.org/ (LTS version)
2. Install backend: `cd backend && npm install && npm run dev`
3. Install frontend: `cd frontend && npm install && npm run dev`
4. Open http://localhost:3000 in your browser
5. View API docs at http://localhost:3001/api/docs

## Technologies Used

**Backend:**
- Node.js - JavaScript runtime
- Express.js - REST API framework
- SQLite - Lightweight database
- Helmet.js - Security headers middleware
- Multer - File upload handling
- express-rate-limit - Rate limiting middleware
- jsonwebtoken - JWT authentication
- swagger-jsdoc & swagger-ui-express - API documentation
- dotenv - Environment variables

**Frontend:**
- React 18 - UI library
- Vite - Fast bundler and dev server
- Tailwind CSS - Utility-first styling
- Axios - HTTP client
- React Router - Client-side routing
- Context API - State management

**Security & Quality:**
- Input validation with express-validator
- DOMPurify - XSS protection
- bcryptjs - Password hashing (for future password reset)
- CORS - Cross-origin request handling

## Responsive Design

The app is designed with mobile-first responsive design:
- Optimized for small screens (phones and tablets)
- Touch-friendly buttons and inputs
- Fast loading with Vite
- Smooth animations and transitions
- Theme switching (light/dark mode)

## Deployment

This application is configured for deployment on Render.com. See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Current deployment:** The app can be deployed immediately with all security and performance features enabled.

## Testing the API

Use the **interactive Swagger UI** at `http://localhost:3001/api/docs` to test all endpoints.

For curl examples and detailed testing instructions, see [API_TESTING.md](./API_TESTING.md)

## Contributing

Feel free to extend this project by:
- Adding password reset functionality
- Implementing CSRF protection
- Adding error logging and monitoring
- Implementing database connection pooling
- Creating mobile app with React Native
- Adding real-time notifications
- Implementing advanced search and filtering

## License

MIT License
