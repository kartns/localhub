# 🌟 The Local Hub

A modern, full-stack web application for discovering and managing local brands and their products. Built with React frontend and Node.js backend.

## ✨ Features

### Core Functionality
- **Brand Management** - Create, view, edit, and delete local producer brands
- **Product Catalog** - Add multiple products per brand with image uploads
- **Category System** - Filter by Fruits, Honey, Proteins, Herbs
- **Raw Material Tags** - Tag brands with their product types
- **GPS Proximity** - Filter brands by distance from your location
- **Favorites & Ratings** - Save favorites and rate brands (requires login)
- **Image Carousel** - Auto-rotating product images on hover
- **Responsive Design** - Mobile-friendly with Tailwind CSS

### Security Features
- **JWT Authentication** - Secure httpOnly cookies
- **Role-Based Access** - Admin-only operations
- **Rate Limiting** - Protection against abuse
- **Input Validation** - XSS protection on all inputs
- **Security Headers** - Helmet.js middleware
- **File Upload Security** - Size and type validation

## 📁 Project Structure

```
food-storage-app/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── index.js         # Express server
│   │   ├── database.js      # SQLite setup
│   │   ├── swagger.js       # API documentation
│   │   ├── middleware/      # Auth, validation, uploads
│   │   └── routes/          # API endpoints
│   ├── migrations/          # Database migrations
│   └── uploads/             # Uploaded images
│
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   └── pages/           # Page components
│   └── public/              # Static assets
│
├── README.md                # This file
├── GETTING_STARTED.md       # Setup guide
├── DOCKER.md                # Docker deployment
├── DEPLOYMENT.md            # Render deployment
├── API_TESTING.md           # API reference
└── UI_2026_ROADMAP.md       # Feature roadmap
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ (v18 or v20 LTS recommended)
- npm

### Installation

```bash
# Backend
cd backend
npm install
npm run dev
# Server runs at http://localhost:3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

**Open http://localhost:3000** to use the app.

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Step-by-step setup guide |
| [API_TESTING.md](./API_TESTING.md) | API endpoints & testing |
| [DOCKER.md](./DOCKER.md) | Docker deployment |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Render.com deployment |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get profile |

### Storages (Brands)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/storages` | List all brands |
| GET | `/api/storages/:id` | Get brand details |
| POST | `/api/storages` | Create brand (admin) |
| PUT | `/api/storages/:id` | Update brand (admin) |
| DELETE | `/api/storages/:id` | Delete brand (admin) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items/storage/:id` | List products |
| POST | `/api/items` | Add product (admin) |
| DELETE | `/api/items/:id` | Delete product (admin) |

**Interactive API docs:** http://localhost:3001/api/docs

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- SQLite database
- JWT authentication
- Multer (file uploads)
- Helmet.js (security)
- Swagger (API docs)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router v7

## 🐳 Deployment

### Docker
```bash
docker-compose up -d
```
See [DOCKER.md](./DOCKER.md) for full instructions.

### Render.com
See [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud deployment.

## 📄 License

MIT License
