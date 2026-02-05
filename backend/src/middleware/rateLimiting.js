/**
 * Rate limiting middleware to prevent brute-force attacks
 */

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.firstAttempt > data.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Get client identifier (IP + User-Agent for better uniqueness)
 */
function getClientId(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  return `${ip}:${userAgent.substring(0, 50)}`;
}

/**
 * Generic rate limiter
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxAttempts = 5,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = true,
    skipFailedRequests = false
  } = options;

  return (req, res, next) => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    let clientData = rateLimitStore.get(clientId);
    
    if (!clientData) {
      clientData = {
        attempts: 0,
        firstAttempt: now,
        windowMs,
        resetTime: now + windowMs
      };
      rateLimitStore.set(clientId, clientData);
    }
    
    // Reset window if expired
    if (now - clientData.firstAttempt > windowMs) {
      clientData.attempts = 0;
      clientData.firstAttempt = now;
      clientData.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (clientData.attempts >= maxAttempts) {
      const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfter
      });
    }
    
    // Increment attempts (before request to count all attempts)
    if (!skipFailedRequests) {
      clientData.attempts++;
    }
    
    // Add reset function for successful requests
    req.rateLimitReset = () => {
      if (skipSuccessfulRequests) {
        // Don't count successful requests
        if (clientData.attempts > 0) {
          clientData.attempts--;
        }
      }
    };
    
    // Add increment function for failed requests
    req.rateLimitIncrement = () => {
      if (skipFailedRequests) {
        clientData.attempts++;
      }
    };
    
    next();
  };
}

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: true,
  skipFailedRequests: true // We'll manually increment on failures
});

/**
 * General API rate limiter
 */
export const apiRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxAttempts: 100, // 100 requests per minute
  message: 'Too many API requests. Please slow down.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Strict rate limiter for admin actions
 */
export const adminRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxAttempts: 100, // 100 admin actions per minute
  message: 'Too many admin actions. Please wait a minute.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Password reset rate limiter (very strict)
 */
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts. Please try again in 1 hour.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});