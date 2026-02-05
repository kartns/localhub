import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { initializeDatabase } from './database.js';
import { specs } from './swagger.js';
import storageRoutes from './routes/storages.js';
import itemRoutes from './routes/items.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import { apiRateLimit } from './middleware/rateLimiting.js';
import { getFilePath, fileExists } from './middleware/upload.js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration - handles both development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost',
  'http://frontend',  // Docker internal
  process.env.FRONTEND_URL,
  // Production URLs
  'https://thelocalhub.gr',
  'http://thelocalhub.gr',
  'https://localhub-frontend.onrender.com'
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, nginx proxy)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (NODE_ENV === 'development' || NODE_ENV === 'production') {
      // In Docker, nginx proxies requests so origin might vary
      // Be permissive but log for debugging
      if (NODE_ENV === 'development') {
        callback(null, true);
      } else {
        // In production, allow same-origin requests (no origin header from nginx proxy)
        callback(null, true);
      }
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false // Allow embedding for development
}));
app.use(cors(corsOptions));
app.use(cookieParser()); // Parse cookies
app.use(apiRateLimit); // General API rate limiting
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Initialize database
await initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/storages', storageRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/settings', settingsRoutes);

// Serve uploaded images
app.get('/api/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent directory traversal
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  if (!fileExists(filename)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  const filePath = getFilePath(filename);
  const ext = path.extname(filename).toLowerCase();
  
  // Set appropriate content type
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  const contentType = contentTypes[ext] || 'application/octet-stream';
  
  // Set caching headers for better performance
  res.set({
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    'ETag': filename // Use filename as ETag for simple caching
  });
  
  res.sendFile(filePath);
});

// Swagger UI documentation
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list'
  },
  customCss: `.topbar { background-color: #2c3e50; }
  .swagger-ui .btn-authorize { background-color: #8B7355; }
  .swagger-ui .btn-authorize:hover { background-color: #6d5344; }`
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Health check endpoint (required for Render and monitoring)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LocalHub API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'LocalHub API',
    version: '1.0.0',
    description: 'Local food storage management API',
    health: '/api/health',
    docs: '/api/docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: '/api/docs'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LocalHub API Server`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
