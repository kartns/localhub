import express from 'express';
import { getDatabase } from '../database.js';

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

// Create new item
router.post('/', async (req, res) => {
  try {
    const { storage_id, name, category, quantity, unit, image, expiration_date } = req.body;
    
    if (!storage_id || !name) {
      return res.status(400).json({ error: 'Storage ID and name are required' });
    }

    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO items (storage_id, name, category, quantity, unit, image, expiration_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [storage_id, name, category, quantity || 0, unit, image, expiration_date]
    );

    const item = await db.get('SELECT * FROM items WHERE id = ?', [result.id]);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const { name, category, quantity, unit, image, expiration_date } = req.body;
    
    const db = getDatabase();
    await db.run(
      `UPDATE items 
       SET name = ?, category = ?, quantity = ?, unit = ?, image = ?, expiration_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, category, quantity, unit, image, expiration_date, req.params.id]
    );

    const item = await db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    await db.run('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
