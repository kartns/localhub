import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateItemInput } from '../middleware/validation.js';
import { adminRateLimit } from '../middleware/rateLimiting.js';

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
router.post('/', adminRateLimit, authenticateToken, requireAdmin, validateItemInput, async (req, res) => {
  try {
    const { storage_id, name, quantity, unit, image, expiration_date } = req.body;
    
    // Validation now handled by middleware
    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO items (storage_id, name, quantity, unit, image, expiration_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [storage_id, name, quantity || 0, unit, image, expiration_date]
    );

    const item = await db.get('SELECT * FROM items WHERE id = ?', [result.id]);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, quantity, unit, image, expiration_date } = req.body;
    
    const db = getDatabase();
    await db.run(
      `UPDATE items 
       SET name = ?, quantity = ?, unit = ?, image = ?, expiration_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, quantity, unit, image, expiration_date, req.params.id]
    );

    const item = await db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item (admin only)
router.delete('/:id', adminRateLimit, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    await db.run('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
