import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

// Get all storages with item counts
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const storages = await db.all(`
      SELECT 
        s.*,
        COUNT(i.id) as item_count
      FROM storages s
      LEFT JOIN items i ON s.id = i.storage_id
      GROUP BY s.id
      ORDER BY s.name
    `);
    res.json(storages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get storage by ID with items
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const storage = await db.get('SELECT * FROM storages WHERE id = ?', [req.params.id]);
    
    if (!storage) {
      return res.status(404).json({ error: 'Storage not found' });
    }

    const items = await db.all(
      'SELECT * FROM items WHERE storage_id = ? ORDER BY name',
      [req.params.id]
    );

    res.json({ ...storage, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new storage
router.post('/', async (req, res) => {
  try {
    const { name, description, address, latitude, longitude, category, rawMaterial, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO storages (name, description, address, latitude, longitude, category, rawMaterial, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, address, latitude, longitude, category, rawMaterial, image]
    );

    const storage = await db.get('SELECT * FROM storages WHERE id = ?', [result.id]);
    res.status(201).json(storage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update storage
router.put('/:id', async (req, res) => {
  try {
    const { name, description, address, latitude, longitude, category, rawMaterial, image } = req.body;
    
    const db = getDatabase();
    await db.run(
      `UPDATE storages 
       SET name = ?, description = ?, address = ?, latitude = ?, longitude = ?, category = ?, rawMaterial = ?, image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, address, latitude, longitude, category, rawMaterial, image, req.params.id]
    );

    const storage = await db.get('SELECT * FROM storages WHERE id = ?', [req.params.id]);
    res.json(storage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete storage
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    await db.run('DELETE FROM storages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Storage deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
