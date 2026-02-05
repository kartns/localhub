import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateStorageInput } from '../middleware/validation.js';
import { adminRateLimit } from '../middleware/rateLimiting.js';
import { uploadSingleImage, handleUploadError, deleteUploadedFile } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/storages:
 *   get:
 *     summary: Get all storages/brands with item counts
 *     tags: [Storages]
 *     responses:
 *       200:
 *         description: List of all storages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Storage' }
 */
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

/**
 * @swagger
 * /api/storages/{id}:
 *   get:
 *     summary: Get storage by ID with all items
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Storage with items
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - { $ref: '#/components/schemas/Storage' }
 *                 - type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Item' }
 *       404:
 *         description: Storage not found
 */
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

/**
 * @swagger
 * /api/storages:
 *   post:
 *     summary: Create a new storage/brand (admin only)
 *     tags: [Storages]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Local Farm Brand
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               rawMaterial:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Storage created successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Storage' }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
// Create new storage (admin only)
router.post('/', adminRateLimit, authenticateToken, requireAdmin, uploadSingleImage, handleUploadError, async (req, res) => {
  try {
    const { name, description, address, latitude, longitude, rawMaterial, phone, website, category } = req.body;
    
    // Validate required fields manually since multer changes body parsing
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const imagePath = req.file ? req.file.filename : null;
    
    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO storages (name, description, address, latitude, longitude, rawMaterial, phone, website, category, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), description || null, address || null, latitude || null, longitude || null, rawMaterial || null, phone || null, website || null, category || 'other', imagePath]
    );

    const storage = await db.get('SELECT * FROM storages WHERE id = ?', [result.id]);
    res.status(201).json(storage);
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.filename);
    res.status(500).json({ error: error.message });
  }
});

// Update storage (admin only)
router.put('/:id', adminRateLimit, authenticateToken, requireAdmin, uploadSingleImage, handleUploadError, async (req, res) => {
  try {
    const { name, description, address, latitude, longitude, rawMaterial, phone, website, category } = req.body;
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const db = getDatabase();
    
    // Get current storage to handle image replacement
    const currentStorage = await db.get('SELECT image FROM storages WHERE id = ?', [req.params.id]);
    if (!currentStorage) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(404).json({ error: 'Storage not found' });
    }
    
    // Determine new image path
    let newImagePath = currentStorage.image;
    if (req.file) {
      // Delete old image if it exists
      if (currentStorage.image) {
        deleteUploadedFile(currentStorage.image);
      }
      newImagePath = req.file.filename;
    }
    
    await db.run(
      `UPDATE storages 
       SET name = ?, description = ?, address = ?, latitude = ?, longitude = ?, rawMaterial = ?, phone = ?, website = ?, category = ?, image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name.trim(), description || null, address || null, latitude || null, longitude || null, rawMaterial || null, phone || null, website || null, category || 'other', newImagePath, req.params.id]
    );

    const storage = await db.get('SELECT * FROM storages WHERE id = ?', [req.params.id]);
    res.json(storage);
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.filename);
    res.status(500).json({ error: error.message });
  }
});

// Delete storage (admin only)
router.delete('/:id', adminRateLimit, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get storage to delete associated image
    const storage = await db.get('SELECT image FROM storages WHERE id = ?', [req.params.id]);
    if (!storage) {
      return res.status(404).json({ error: 'Storage not found' });
    }
    
    // Delete storage from database
    await db.run('DELETE FROM storages WHERE id = ?', [req.params.id]);
    
    // Delete associated image file
    if (storage.image) {
      deleteUploadedFile(storage.image);
    }
    
    res.json({ message: 'Storage deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
