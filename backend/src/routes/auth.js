import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDatabase } from '../database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { validateRegisterInput, validateLoginInput, sanitizeString } from '../middleware/validation.js';
import { authRateLimit, passwordResetRateLimit } from '../middleware/rateLimiting.js';


const router = express.Router();

// Helper function to generate secure random token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *                 token: { type: string }
 *       400:
 *         description: Validation error or email already registered
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429:
 *         description: Too many registration attempts
 */
// Register new user
router.post('/register', validateRegisterInput, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const db = getDatabase();

    // Validation now handled by middleware

    // Check if email already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      req.rateLimitIncrement(); // Count failed attempts
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email.toLowerCase(), hashedPassword, name]
    );

    // Get created user
    const user = await db.get('SELECT id, email, name, avatar, role, created_at FROM users WHERE id = ?', [result.id]);

    // Generate token
    const token = generateToken(user);

    // Set secure httpOnly cookie
    // Only use secure cookies if explicitly using HTTPS (not just production mode)
    const useSecureCookies = process.env.FORCE_HTTPS === 'true';
    res.cookie('authToken', token, {
      httpOnly: true, // Prevent XSS attacks
      secure: useSecureCookies, // HTTPS only when FORCE_HTTPS=true
      sameSite: useSecureCookies ? 'none' : 'lax', // Cross-site only for HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    req.rateLimitReset(); // Reset on successful registration

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token // Keep for backward compatibility
    });
  } catch (error) {
    req.rateLimitIncrement(); // Count server errors
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: authToken=jwt-token-here; Path=/; HttpOnly; Secure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *                 token: { type: string }
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
// Login
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    // Validation now handled by middleware

    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      req.rateLimitIncrement(); // Count failed attempts
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      req.rateLimitIncrement(); // Count failed attempts
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Set secure httpOnly cookie
    // Only use secure cookies if explicitly using HTTPS (not just production mode)
    const useSecureCookies = process.env.FORCE_HTTPS === 'true';
    res.cookie('authToken', token, {
      httpOnly: true, // Prevent XSS attacks
      secure: useSecureCookies, // HTTPS only when FORCE_HTTPS=true
      sameSite: useSecureCookies ? 'none' : 'lax', // Cross-site only for HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    req.rateLimitReset(); // Reset on successful login

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token // Keep for backward compatibility
    });
  } catch (error) {
    req.rateLimitIncrement(); // Count server errors
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, email, name, avatar, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const db = getDatabase();

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.user.id);

    await db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const user = await db.get(
      'SELECT id, email, name, avatar, role, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = getDatabase();

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current user
    const user = await db.get('SELECT password FROM users WHERE id = ?', [req.user.id]);

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user's storages (brands)
router.get('/me/storages', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const storages = await db.all(
      'SELECT * FROM storages WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(storages);
  } catch (error) {
    console.error('Get user storages error:', error);
    res.status(500).json({ error: 'Failed to get storages' });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset email sent (always returns success for security)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       429:
 *         description: Too many requests
 */
// Request password reset
router.post('/forgot-password', passwordResetRateLimit, async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDatabase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await db.get('SELECT id, email, name FROM users WHERE email = ?', [email.toLowerCase()]);

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Invalidate any existing tokens for this user
    await db.run('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?', [user.id]);

    // Store the token
    await db.run(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt.toISOString()]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // TODO: Add email sending when SMTP is configured
    console.log('Password reset requested for:', user.email);
    console.log('Reset URL:', resetUrl);

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Only include token in development for testing
      ...(process.env.NODE_ENV !== 'production' && {
        _dev_token: resetToken,
        _dev_resetUrl: resetUrl
      })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token from email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Invalid or expired token
 *       429:
 *         description: Too many requests
 */
// Reset password with token
router.post('/reset-password', passwordResetRateLimit, async (req, res) => {
  try {
    const { token, password } = req.body;
    const db = getDatabase();

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find valid token
    const resetRecord = await db.get(
      `SELECT prt.*, u.email, u.name 
       FROM password_reset_tokens prt 
       JOIN users u ON prt.user_id = u.id 
       WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > datetime('now')`,
      [token]
    );

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, resetRecord.user_id]
    );

    // Mark token as used
    await db.run('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetRecord.id]);

    // Invalidate all other reset tokens for this user
    await db.run('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?', [resetRecord.user_id]);

    console.log(`Password reset successful for user: ${resetRecord.email}`);

    res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   get:
 *     summary: Verify if a reset token is valid
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset token to verify
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid: { type: boolean }
 *                 email: { type: string }
 *       400:
 *         description: Invalid or expired token
 */
// Verify reset token (for frontend validation before showing reset form)
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;
    const db = getDatabase();

    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    const resetRecord = await db.get(
      `SELECT prt.expires_at, u.email 
       FROM password_reset_tokens prt 
       JOIN users u ON prt.user_id = u.id 
       WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > datetime('now')`,
      [token]
    );

    if (!resetRecord) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired reset token' });
    }

    // Mask email for privacy (show first 2 chars + domain)
    const [localPart, domain] = resetRecord.email.split('@');
    const maskedEmail = localPart.slice(0, 2) + '***@' + domain;

    res.json({
      valid: true,
      email: maskedEmail,
      expiresAt: resetRecord.expires_at
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ valid: false, error: 'Failed to verify token' });
  }
});

// Logout - clear the httpOnly cookie
router.post('/logout', (req, res) => {
  const useSecureCookies = process.env.FORCE_HTTPS === 'true';
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: useSecureCookies ? 'none' : 'lax',
    path: '/'
  });

  res.json({ message: 'Logged out successfully' });
});

export default router;
