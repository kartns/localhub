/**
 * OpenAPI/Swagger Documentation
 */
import swaggerJsDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LocalHub API',
      version: '1.0.0',
      description: 'Local food storage management API with comprehensive CRUD operations, authentication, and image uploads',
      contact: {
        name: 'LocalHub Team',
        url: 'https://github.com/yourusername/food-storage-app'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://localhub-api.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from login or register endpoint'
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'authToken',
          description: 'httpOnly cookie set on login/register'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'User ID' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            name: { type: 'string', description: 'User full name' },
            avatar: { type: 'string', nullable: true, description: 'Base64 encoded avatar image' },
            role: { type: 'string', enum: ['user', 'admin'], description: 'User role' },
            created_at: { type: 'string', format: 'date-time', description: 'Account creation timestamp' },
            updated_at: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Storage: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', description: 'Brand/storage name' },
            description: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            latitude: { type: 'number', nullable: true, description: 'Latitude coordinate' },
            longitude: { type: 'number', nullable: true, description: 'Longitude coordinate' },
            rawMaterial: { type: 'string', nullable: true, description: 'Raw material type' },
            image: { type: 'string', nullable: true, description: 'Uploaded image filename' },
            item_count: { type: 'integer', description: 'Number of items in this storage' },
            user_id: { type: 'integer', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Item: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            storage_id: { type: 'integer', description: 'Associated storage ID' },
            name: { type: 'string', description: 'Item name' },
            quantity: { type: 'number', nullable: true, description: 'Item quantity' },
            unit: { type: 'string', nullable: true, description: 'Measurement unit (kg, l, pcs, etc)' },
            image: { type: 'string', nullable: true, description: 'Uploaded image filename' },
            expiration_date: { type: 'string', format: 'date', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' }
          }
        }
      }
    },
    security: [
      { BearerAuth: [] },
      { CookieAuth: [] }
    ]
  },
  apis: ['./src/routes/*.js', './src/index.js']
};

export const specs = swaggerJsDoc(options);