/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

/**
 * Initialize and configure cache for the application
 * This ensures consistent cache behavior across API routes
 */

import { cache } from './cache';
import type { NextRequest } from 'next/server';

/**
 * Cache configuration for different endpoints
 */
export const CACHE_CONFIG = {
  SENSOR_TTL: 60, // 1 minute
  SENSOR_LIST_TTL: 30, // 30 seconds
  READINGS_TTL: 30, // 30 seconds
  HISTORICAL_READINGS_TTL: 300, // 5 minutes
  ALERTS_TTL: 10, // 10 seconds
  ALERTS_INACTIVE_TTL: 60, // 1 minute
};

/**
 * Add cache headers to NextResponse for client-side caching
 * 
 * @param response The response to add cache headers to
 * @param ttlSeconds Time to live in seconds
 */
export function addCacheHeaders(response: Response, ttlSeconds: number): Response {
  // Clone the response so we can modify the headers
  const newResponse = new Response(response.body, response);
  
  // Add cache control headers
  newResponse.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
  
  return newResponse;
}

/**
 * Get a cache key for an API request
 * 
 * @param request The NextRequest object
 * @param prefix A prefix to add to the cache key
 * @returns A unique cache key for this request
 */
export function getCacheKey(request: NextRequest, prefix: string): string {
  const url = new URL(request.url);
  return `${prefix}:${url.pathname}${url.search}`;
}

/**
 * Try to get cached response for an API request
 * 
 * @param request The NextRequest object
 * @param prefix A prefix for the cache key
 * @returns Cached response or null if not found
 */
export function getCachedResponse(request: NextRequest, prefix: string): Response | null {
  const cacheKey = getCacheKey(request, prefix);
  const cachedData = cache.get<any>(cacheKey);
  
  if (cachedData) {
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      },
    });
  }
  
  return null;
}

/**
 * Cache an API response
 * 
 * @param request The NextRequest object
 * @param prefix A prefix for the cache key
 * @param data The data to cache
 * @param ttlSeconds Time to live in seconds
 */
export function cacheResponse(request: NextRequest, prefix: string, data: any, ttlSeconds: number): void {
  const cacheKey = getCacheKey(request, prefix);
  cache.set(cacheKey, data, ttlSeconds);
}
