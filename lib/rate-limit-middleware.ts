/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { NextRequest } from 'next/server';
import { checkRateLimit } from './rate-limiter';
import { ApiResponse } from './api-response';
import { createLogger } from './logger';

const logger = createLogger('middleware:rate-limit');

/**
 * Middleware to enforce rate limiting on API routes
 * 
 * @param req The NextRequest object
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowSizeInSeconds Time window in seconds
 * @returns An API response if rate limit is exceeded, otherwise null
 */
export async function rateLimitMiddleware(
  req: NextRequest,
  maxRequests = 60, // Default: 60 requests
  windowSizeInSeconds = 60 // Default: per minute
) {
  // Skip rate limiting for non-production environments if needed
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_RATE_LIMIT_IN_DEV) {
    return null;
  }

  // Check if this request should be rate limited
  const result = checkRateLimit(req, {
    maxRequests,
    windowSizeInSeconds
  });
  
  // Add rate limit headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', maxRequests.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());
    // If rate limit exceeded, return 429 Too Many Requests
  if (!result.success) {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    logger.warn(`Rate limit exceeded for IP ${clientIp}`);
    
    return ApiResponse.error('Too many requests, please try again later', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': headers.get('X-RateLimit-Limit') || '',
        'X-RateLimit-Remaining': headers.get('X-RateLimit-Remaining') || '',
        'X-RateLimit-Reset': headers.get('X-RateLimit-Reset') || ''
      }
    });
  }
  
  // Request is allowed, return null to continue
  return null;
}
