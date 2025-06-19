/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { NextRequest } from 'next/server';
import { createLogger } from './logger';

const logger = createLogger('rate-limiter');

// In-memory store for rate limiting
// In production, you'd use Redis or a similar store for distributed environments
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  // Maximum number of requests allowed in the time window
  maxRequests: number;
  // Time window in seconds
  windowSizeInSeconds: number;
  // Identifier function to get the key for rate limiting (default: IP address)
  identifierFn?: (req: NextRequest) => string;
}

/**
 * Check if a request should be rate limited
 * @returns true if request is allowed, false if it should be blocked
 */
export function checkRateLimit(
  req: NextRequest, 
  options: RateLimitOptions
): { success: boolean; remaining: number; resetAt: Date } {
  const { maxRequests, windowSizeInSeconds, identifierFn } = options;
    // Get identifier (default to IP or headers if not provided)
  const identifier = identifierFn
    ? identifierFn(req)
    : (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1');
    
  const now = Date.now();
  
  // Get current rate limit data for this identifier
  const currentLimit = rateLimitStore.get(identifier);
  
  // If no record exists or the reset time has passed, create a new one
  if (!currentLimit || currentLimit.resetTime < now) {
    const newLimit = {
      count: 1,
      resetTime: now + (windowSizeInSeconds * 1000)
    };
    rateLimitStore.set(identifier, newLimit);
    
    return { 
      success: true, 
      remaining: maxRequests - 1,
      resetAt: new Date(newLimit.resetTime)
    };
  }
  
  // Check if they've hit the limit
  if (currentLimit.count >= maxRequests) {
    logger.debug(`Rate limit exceeded for ${identifier}`);
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(currentLimit.resetTime)
    };
  }
  
  // Increment the counter
  currentLimit.count += 1;
  rateLimitStore.set(identifier, currentLimit);
  
  return {
    success: true,
    remaining: maxRequests - currentLimit.count,
    resetAt: new Date(currentLimit.resetTime)
  };
}

/**
 * Cleanup old entries from the rate limit store
 * Should be called periodically (e.g., via a cron job)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  logger.debug(`Cleaned up rate limit store. Current size: ${rateLimitStore.size}`);
}

// Set up automatic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
