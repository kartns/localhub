/**
 * Input validation and sanitization utilities
 */

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed characters for names (letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[\p{L}\s\-']+$/u;

/**
 * Sanitize string input - removes potential XSS vectors
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML but allow basic text (for descriptions)
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .substring(0, 5000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim()) && email.length <= 255;
}

/**
 * Validate name (letters, spaces, hyphens only)
 */
export function isValidName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100 && NAME_REGEX.test(trimmed);
}

/**
 * Validate password strength
 */
export function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 6 && password.length <= 128;
}

/**
 * Validate and sanitize coordinates
 */
export function isValidLatitude(lat) {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
}

export function isValidLongitude(lng) {
  const num = parseFloat(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
}

/**
 * Validate base64 image (basic check)
 */
export function isValidBase64Image(image) {
  if (!image || typeof image !== 'string') return true; // Optional field
  
  // Check if it's a valid base64 data URL
  const validPrefixes = ['data:image/jpeg', 'data:image/png', 'data:image/gif', 'data:image/webp'];
  const hasValidPrefix = validPrefixes.some(prefix => image.startsWith(prefix));
  
  if (!hasValidPrefix) return false;
  
  // Check size (50MB max when encoded)
  const maxSize = 50 * 1024 * 1024;
  if (image.length > maxSize) return false;
  
  return true;
}

/**
 * Validate integer ID
 */
export function isValidId(id) {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0;
}

/**
 * Middleware to validate storage input
 */
export function validateStorageInput(req, res, next) {
  const { name, description, address, latitude, longitude, image } = req.body;
  const errors = [];

  // Name is required
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length > 200) {
    errors.push('Name must be less than 200 characters');
  }

  // Description validation (optional)
  if (description && typeof description === 'string' && description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  // Address validation (optional)
  if (address && typeof address === 'string' && address.length > 500) {
    errors.push('Address must be less than 500 characters');
  }

  // Coordinates validation (optional but must be valid if provided)
  if (latitude !== undefined && latitude !== null && latitude !== '') {
    if (!isValidLatitude(latitude)) {
      errors.push('Invalid latitude (must be between -90 and 90)');
    }
  }
  if (longitude !== undefined && longitude !== null && longitude !== '') {
    if (!isValidLongitude(longitude)) {
      errors.push('Invalid longitude (must be between -180 and 180)');
    }
  }

  // Image validation
  if (image && !isValidBase64Image(image)) {
    errors.push('Invalid image format (must be JPEG, PNG, GIF, or WebP)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name.trim());
  req.body.description = description ? sanitizeText(description) : null;
  req.body.address = address ? sanitizeString(address.trim()) : null;

  next();
}

/**
 * Middleware to validate item input
 */
export function validateItemInput(req, res, next) {
  const { storage_id, name, quantity, unit, image } = req.body;
  const errors = [];

  // Storage ID is required
  if (!storage_id || !isValidId(storage_id)) {
    errors.push('Valid storage ID is required');
  }

  // Name is required
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Item name is required');
  } else if (name.trim().length > 200) {
    errors.push('Item name must be less than 200 characters');
  }

  // Quantity validation (optional)
  if (quantity !== undefined && quantity !== null) {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      errors.push('Quantity must be a positive number');
    }
  }

  // Unit validation (optional)
  if (unit && typeof unit === 'string' && unit.length > 50) {
    errors.push('Unit must be less than 50 characters');
  }

  // Image validation
  if (image && !isValidBase64Image(image)) {
    errors.push('Invalid image format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name.trim());
  req.body.unit = unit ? sanitizeString(unit.trim()) : null;

  next();
}

/**
 * Middleware to validate auth input
 */
export function validateRegisterInput(req, res, next) {
  const { email, password, name } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || !isValidPassword(password)) {
    errors.push('Password must be between 6 and 128 characters');
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  // Sanitize
  req.body.email = email.trim().toLowerCase();
  req.body.name = sanitizeString(name.trim());

  next();
}

export function validateLoginInput(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  req.body.email = email.trim().toLowerCase();

  next();
}
