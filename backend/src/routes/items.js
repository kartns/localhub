import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateItemInput } from '../middleware/validation.js';
import { adminRateLimit } from '../middleware/rateLimiting.js';
import { uploadSingleImage, handleUploadError, deleteUploadedFile } from '../middleware/upload.js';

const router = express.Router();

// Get all items for a storage
router.get('/storage/:storageId', async (req, res) => {
  try {
    const db = getDatabase();
    const items = await db.all(
      'SELECT * FROM items WHERE storage_id = ? ORDER BY name',
      [req.params.storageId]
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const item = await db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new item (admin only)
router.post('/', adminRateLimit, authenticateToken, requireAdmin, uploadSingleImage, handleUploadError, async (req, res) => {
  try {
    const { storage_id, name, quantity, unit, expiration_date } = req.body;
    
    // Validate required fields manually since multer changes body parsing
    if (!storage_id || !name || typeof name !== 'string' || name.trim().length === 0) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({ error: 'Storage ID and item name are required' });
    }
    
    const imagePath = req.file ? req.file.filename : null;
    
    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO items (storage_id, name, quantity, unit, image, expiration_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [storage_id, name.trim(), quantity || 0, unit || null, imagePath, expiration_date || null]
    );

    const item = await db.get('SELECT * FROM items WHERE id = ?', [result.id]);
    res.status(201).json(item);
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.filename);
    res.status(500).json({ error: error.message });
  }
});

// Update item (admin only)
router.put('/:id', authenticateToken, requireAdmin, uploadSingleImage, handleUploadError, async (req, res) => {
  try {
    const { name, quantity, unit, expiration_date } = req.body;
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    const db = getDatabase();
    
    // Get current item to handle image replacement
    const currentItem = await db.get('SELECT image FROM items WHERE id = ?', [req.params.id]);
    if (!currentItem) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Determine new image path
    let newImagePath = currentItem.image;
    if (req.file) {
      // Delete old image if it exists
      if (currentItem.image) {
        deleteUploadedFile(currentItem.image);
      }
      newImagePath = req.file.filename;
    }
    
    await db.run(
      `UPDATE items 
       SET name = ?, quantity = ?, unit = ?, image = ?, expiration_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name.trim(), quantity || 0, unit || null, newImagePath, expiration_date || null, req.params.id]
    );

    const item = await db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    res.json(item);
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.filename);
    res.status(500).json({ error: error.message });
  }
});

// Delete item (admin only)
router.delete('/:id', adminRateLimit, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get item to delete associated image
    const item = await db.get('SELECT image FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Delete item from database
    await db.run('DELETE FROM items WHERE id = ?', [req.params.id]);
    
    // Delete associated image file
    if (item.image) {
      deleteUploadedFile(item.image);
    }
    
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
