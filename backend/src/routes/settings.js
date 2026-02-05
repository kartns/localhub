import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Get a setting value
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting value
 */
router.get('/:key', async (req, res) => {
  try {
    const db = getDatabase();
    const { key } = req.params;
    
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', [key]);
    
    if (!setting) {
      return res.json({ key, value: null });
    }
    
    // Try to parse JSON value
    let value = setting.value;
    try {
      value = JSON.parse(setting.value);
    } catch (e) {
      // Keep as string if not valid JSON
    }
    
    res.json({ key, value });
  } catch (error) {
    console.error('Error getting setting:', error);
    res.status(500).json({ error: 'Failed to get setting' });
  }
});

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     summary: Update a setting value (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: any
 *     responses:
 *       200:
 *         description: Setting updated
 */
router.put('/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { key } = req.params;
    let { value } = req.body;
    
    // Stringify objects/arrays
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    } else if (typeof value !== 'string') {
      value = String(value);
    }
    
    // Upsert the setting
    await db.run(
      `INSERT INTO settings (key, value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
      [key, value, value]
    );
    
    res.json({ key, value: req.body.value, message: 'Setting updated' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
