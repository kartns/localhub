# 🔧 Technology Reference

## Complete Technology Stack

### Backend Dependencies

**Core Framework:**
- `express` (^4.18.2) - Web framework
- `cors` (^2.8.5) - Cross-origin resource sharing
- `dotenv` (^16.3.1) - Environment variables

**Database:**
- `sqlite3` (^5.1.6) - SQLite database driver

**Development:**
- `nodemon` (^3.0.1) - Auto-restart on file changes

### Frontend Dependencies

**UI Library:**
- `react` (^18.2.0) - React library
- `react-dom` (^18.2.0) - React DOM rendering

**Build Tools:**
- `vite` (^5.0.8) - Fast bundler
- `@vitejs/plugin-react` (^4.2.1) - React plugin for Vite

**Styling:**
- `tailwindcss` (^3.4.1) - CSS framework
- `postcss` (^8.4.31) - CSS processing
- `autoprefixer` (^10.4.16) - CSS vendor prefixes

**HTTP Client:**
- `axios` (^1.6.2) - HTTP requests (prepared for use)

---

## Runtime Requirements

- **Node.js:** v16+ (v18 or v20 LTS recommended)
- **npm:** v8+
- **Operating System:** Windows, macOS, Linux
- **Browser:** Any modern browser (Chrome, Firefox, Safari, Edge)

---

## Development Environment

**Minimum Requirements:**
- RAM: 2GB
- Disk Space: 500MB
- Internet: For npm package downloads

**Recommended:**
- RAM: 4GB+
- Disk Space: 2GB+
- SSD for faster builds

---

## Package.json Files

### Backend (backend/package.json)
```json
{
  "name": "food-storage-backend",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "sqlite3": "^5.1.6"
  }
}
```

### Frontend (frontend/package.json)
```json
{
  "name": "food-storage-frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## Configuration Files

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
```

### Frontend (vite.config.js)
```javascript
{
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}
```

### Frontend (tailwind.config.js)
```javascript
{
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#f59e0b'
      }
    }
  }
}
```

---

## Database Schema

### Storages Table
```sql
CREATE TABLE storages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  latitude REAL,
  longitude REAL,
  address TEXT,
  type TEXT DEFAULT 'storage',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Items Table
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storage_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  expiration_date DATE,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (storage_id) REFERENCES storages(id) ON DELETE CASCADE
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT
);
```

**Default Categories:**
- Vegetables (🥬)
- Fruits (🍎)
- Grains (🌾)
- Dairy (🧀)
- Proteins (🥚)
- Other (📦)

---

## Build & Run Commands

### Backend
```bash
# Install dependencies
npm install

# Run in development (auto-restart on file changes)
npm run dev

# Run in production
npm start
```

### Frontend
```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Ports

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Proxy:** Frontend proxies /api to backend

---

## File Sizes (Approximate)

| Component | Size |
|-----------|------|
| Backend src/ | ~5KB |
| Frontend src/ | ~15KB |
| node_modules (backend) | ~200MB |
| node_modules (frontend) | ~400MB |
| SQLite database | ~10KB (grows with data) |

---

## JavaScript/ES6 Features Used

✅ ES Modules (`import`/`export`)  
✅ Arrow Functions  
✅ Async/Await  
✅ Template Literals  
✅ Destructuring  
✅ Spread Operator  
✅ Promises  
✅ React Hooks (useState, useEffect)  
✅ JSX  

---

## CSS Features

✅ Tailwind CSS utility classes  
✅ Responsive design (mobile-first)  
✅ Flexbox layouts  
✅ Grid layouts  
✅ Gradients  
✅ Transitions & animations  
✅ Shadow effects  

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

(Vite targets modern browsers only)

---

## Future Upgrade Options

### Database
- SQLite → PostgreSQL (for server deployment)
- SQLite → MongoDB (for NoSQL)

### Backend
- Express → Fastify, Hono, or Deno
- Add authentication (JWT, OAuth)
- Add validation library (Zod, Joi)

### Frontend
- React → Vue or Svelte
- Add state management (Redux, Zustand)
- Add routing (React Router)
- Add testing (Jest, Vitest)

### Deployment
- Backend → Vercel, Railway, Heroku
- Frontend → Netlify, Vercel
- Database → MongoDB Atlas, AWS RDS

---

## Version History

- **v1.0.0** - Initial release with storage management
- Future: Items management, map integration, authentication

---

## License

MIT License - Free to use and modify

---

## References

- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Express.js: https://expressjs.com
- SQLite: https://www.sqlite.org
- Node.js: https://nodejs.org

---

Last Updated: December 5, 2025
