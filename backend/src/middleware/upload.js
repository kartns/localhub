/**
 * File upload middleware using multer
 */
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

/**
 * File filter for image uploads only
 */
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Allow only specific image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

/**
 * Multer configuration
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2 // Allow two files for brand image + farmer image
  },
  fileFilter: fileFilter
});

/**
 * Single image upload middleware
 */
export const uploadSingleImage = upload.single('image');

/**
 * Multiple image upload middleware for brand and farmer images
 */
export const uploadBrandImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'featured_farmer_image', maxCount: 1 }
]);

/**
 * Error handling middleware for multer errors
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Only one file allowed.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field. Use "image" field name.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  next();
};

/**
 * Delete uploaded file helper
 */
export const deleteUploadedFile = (filename) => {
  if (!filename) return;
  
  const filePath = path.join(uploadsDir, filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    }
  });
};

/**
 * Check if file exists
 */
export const fileExists = (filename) => {
  if (!filename) return false;
  const filePath = path.join(uploadsDir, filename);
  return fs.existsSync(filePath);
};

/**
 * Get file path
 */
export const getFilePath = (filename) => {
  return path.join(uploadsDir, filename);
};