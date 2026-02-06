import express from 'express';
import { getDatabase } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateStorageInput } from '../middleware/validation.js';
import { adminRateLimit } from '../middleware/rateLimiting.js';
import { uploadSingleImage, uploadBrandImages, handleUploadError, deleteUploadedFile } from '../middleware/upload.js';

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
 * /api/storages/nearby:
 *   get:
 *     summary: Get storages near a location
 *     tags: [Storages]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 10 }
 *         description: Search radius in km
 *     responses:
 *       200:
 *         description: List of nearby storages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Storage' }
 */
// Get nearby storages
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    const db = getDatabase();
    // Get all storages first (since SQLite doesn't have native math functions easily accessible without extensions)
    const storages = await db.all(`
      SELECT 
        s.*,
        COUNT(i.id) as item_count
      FROM storages s
      LEFT JOIN items i ON s.id = i.storage_id
      GROUP BY s.id
    `);

    // Haversine formula to calculate distance
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    const nearbyStorages = storages
      .map(storage => {
        if (!storage.latitude || !storage.longitude) return null;
        const distance = getDistance(userLat, userLng, storage.latitude, storage.longitude);
        return { ...storage, distance };
      })
      .filter(storage => storage && storage.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyStorages);
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
router.post('/', adminRateLimit, authenticateToken, requireAdmin, uploadBrandImages, handleUploadError, async (req, res) => {
  try {
    const { name, description, address, latitude, longitude, rawMaterial, phone, website, category, producerName, instagram, facebook, twitter, tiktok } = req.body;

    // Validate required fields manually since multer changes body parsing
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      // Clean up uploaded files on error
      if (req.files?.image?.[0]) deleteUploadedFile(req.files.image[0].filename);
      if (req.files?.featured_farmer_image?.[0]) deleteUploadedFile(req.files.featured_farmer_image[0].filename);
      if (req.files?.story_point1_image?.[0]) deleteUploadedFile(req.files.story_point1_image[0].filename);
      if (req.files?.story_point4_image?.[0]) deleteUploadedFile(req.files.story_point4_image[0].filename);
      return res.status(400).json({ error: 'Name is required' });
    }

    const imagePath = req.files?.image?.[0]?.filename || null;
    const farmerImagePath = req.files?.featured_farmer_image?.[0]?.filename || null;

    // Handle story_points JSON and merge with uploaded images
    let storyPointsData = null;
    if (req.body.story_points) {
      try {
        storyPointsData = typeof req.body.story_points === 'string'
          ? JSON.parse(req.body.story_points)
          : req.body.story_points;

        // Add uploaded image filenames to story_points
        if (req.files?.story_point1_image?.[0]) {
          storyPointsData.point1 = storyPointsData.point1 || {};
          storyPointsData.point1.image = req.files.story_point1_image[0].filename;
        }
        if (req.files?.story_point4_image?.[0]) {
          storyPointsData.point4 = storyPointsData.point4 || {};
          storyPointsData.point4.image = req.files.story_point4_image[0].filename;
        }

        storyPointsData = JSON.stringify(storyPointsData);
      } catch (e) {
        console.error('Error parsing story_points:', e);
        storyPointsData = null;
      }
    }

    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO storages (name, description, address, latitude, longitude, rawMaterial, phone, website, category, producer_name, instagram, facebook, twitter, tiktok, image, featured_farmer_image, story_points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), description || null, address || null, latitude || null, longitude || null, rawMaterial || null, phone || null, website || null, category || null, producerName || null, instagram || null, facebook || null, twitter || null, tiktok || null, imagePath, farmerImagePath, storyPointsData]
    );

    const storage = await db.get('SELECT * FROM storages WHERE id = ?', [result.id]);
    res.status(201).json(storage);
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files?.image?.[0]) deleteUploadedFile(req.files.image[0].filename);
    if (req.files?.featured_farmer_image?.[0]) deleteUploadedFile(req.files.featured_farmer_image[0].filename);
    if (req.files?.story_point1_image?.[0]) deleteUploadedFile(req.files.story_point1_image[0].filename);
    if (req.files?.story_point4_image?.[0]) deleteUploadedFile(req.files.story_point4_image[0].filename);
    res.status(500).json({ error: error.message });
  }
});

// Update storage (admin only)
router.put('/:id', adminRateLimit, authenticateToken, requireAdmin, uploadBrandImages, handleUploadError, async (req, res) => {
  try {
    const { name, description, address, latitude, longitude, rawMaterial, phone, website, category, producerName, instagram, facebook, twitter, tiktok } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      // Clean up uploaded files on error
      if (req.files?.image?.[0]) deleteUploadedFile(req.files.image[0].filename);
      if (req.files?.featured_farmer_image?.[0]) deleteUploadedFile(req.files.featured_farmer_image[0].filename);
      return res.status(400).json({ error: 'Name is required' });
    }

    const db = getDatabase();

    // Get current storage to handle image replacement
    const currentStorage = await db.get('SELECT image, featured_farmer_image FROM storages WHERE id = ?', [req.params.id]);
    if (!currentStorage) {
      // Clean up uploaded files on error
      if (req.files?.image?.[0]) deleteUploadedFile(req.files.image[0].filename);
      if (req.files?.featured_farmer_image?.[0]) deleteUploadedFile(req.files.featured_farmer_image[0].filename);
      return res.status(404).json({ error: 'Storage not found' });
    }

    // Handle brand image
    let newImagePath = currentStorage.image;
    if (req.files?.image?.[0]) {
      // Delete old image if it exists
      if (currentStorage.image) {
        deleteUploadedFile(currentStorage.image);
      }
      newImagePath = req.files.image[0].filename;
    }

    // Handle farmer image
    let newFarmerImagePath = currentStorage.featured_farmer_image;
    if (req.files?.featured_farmer_image?.[0]) {
      // Delete old farmer image if it exists
      if (currentStorage.featured_farmer_image) {
        deleteUploadedFile(currentStorage.featured_farmer_image);
      }
      newFarmerImagePath = req.files.featured_farmer_image[0].filename;
    }

    // Handle story_points JSON and merge with uploaded images
    let storyPointsData = null;
    if (req.body.story_points) {
      try {
        storyPointsData = typeof req.body.story_points === 'string'
          ? JSON.parse(req.body.story_points)
          : req.body.story_points;

        // Add uploaded image filenames to story_points
        if (req.files?.story_point1_image?.[0]) {
          storyPointsData.point1 = storyPointsData.point1 || {};
          storyPointsData.point1.image = req.files.story_point1_image[0].filename;
        }
        if (req.files?.story_point4_image?.[0]) {
          storyPointsData.point4 = storyPointsData.point4 || {};
          storyPointsData.point4.image = req.files.story_point4_image[0].filename;
        }

        storyPointsData = JSON.stringify(storyPointsData);
      } catch (e) {
        console.error('Error parsing story_points:', e);
        storyPointsData = null;
      }
    }

    await db.run(
      `UPDATE storages 
       SET name = ?, description = ?, address = ?, latitude = ?, longitude = ?, rawMaterial = ?, phone = ?, website = ?, category = ?, producer_name = ?, instagram = ?, facebook = ?, twitter = ?, tiktok = ?, image = ?, featured_farmer_image = ?, story_points = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name.trim(), description || null, address || null, latitude || null, longitude || null, rawMaterial || null, phone || null, website || null, category || null, producerName || null, instagram || null, facebook || null, twitter || null, tiktok || null, newImagePath, newFarmerImagePath, storyPointsData, req.params.id]
    );

    const storage = await db.get('SELECT * FROM storages WHERE id = ?', [req.params.id]);
    res.json(storage);
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files?.image?.[0]) deleteUploadedFile(req.files.image[0].filename);
    if (req.files?.featured_farmer_image?.[0]) deleteUploadedFile(req.files.featured_farmer_image[0].filename);
    if (req.files?.story_point1_image?.[0]) deleteUploadedFile(req.files.story_point1_image[0].filename);
    if (req.files?.story_point4_image?.[0]) deleteUploadedFile(req.files.story_point4_image[0].filename);
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
