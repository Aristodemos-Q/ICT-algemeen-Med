# Caching Implementation

This document explains how caching is implemented and used in the fieldlab-tatasteel project.

## Overview

We've implemented an in-memory caching system to improve API response times and reduce database load for frequently accessed data. The caching system uses a TTL (Time To Live) approach where cached items expire after a specified time period.

## Cache Architecture

Our caching system consists of several layers:

1. **Low-level cache utility**: `src/lib/cache.ts` - The core caching mechanism
2. **Cache initialization**: `src/lib/init-cache.ts` - HTTP response caching for API routes
3. **Cache Manager**: `src/lib/cache-manager.ts` - Business-logic aware cache invalidation
4. **Database integration**: Automatic cache invalidation in the DatabaseHelper class
5. **Service layer**: Caching frequently accessed data in service methods

## Core Cache Utility

The cache utility is located at `src/lib/cache.ts` and provides:

- A simple in-memory Map-based store
- Automatic TTL expiration of cached items
- Helper functions for common caching operations

### Basic Usage

```typescript
import { cache } from '@/lib/cache';

// Set a value with a TTL (Time To Live) in seconds
cache.set('my-key', myData, 60);  // Cache for 60 seconds

// Get a value
const cachedValue = cache.get('my-key');

// Check if a key exists
if (cache.has('my-key')) {
  // Do something
}

// Delete a specific key
cache.delete('my-key');

// Delete keys by prefix
cache.deleteByPrefix('sensor:');

// Clear entire cache (use sparingly)
cache.clear();
```

### Helper Function

For convenience, there's a helper function for the common "get or compute" pattern:

```typescript
import { withCache } from '@/lib/cache';

async function fetchSensorData(id: string) {
  // This will only call the expensive function if the data is not in cache
  // or has expired
  return withCache(`sensor:${id}`, 60, async () => {
    // Expensive operation (database query, API call, etc.)
    const data = await db.query(...);
    return data;
  });
}
```

## API Response Caching

For API routes, we use the `init-cache.ts` utilities to handle HTTP response caching:

```typescript
import { CACHE_CONFIG, getCachedResponse, cacheResponse, addCacheHeaders } from '@/lib/init-cache';

export async function GET(request: NextRequest) {
  try {
    // Try to get from cache first
    const cachedResponse = getCachedResponse(request, 'api:sensors');
    if (cachedResponse) return cachedResponse;
    
    // Process the request normally if not cached
    const result = await getData();
    
    // Cache the response
    cacheResponse(request, 'api:sensors', result, CACHE_CONFIG.SENSOR_LIST_TTL);
    
    // Return response with cache headers
    const response = ApiResponse.success(result);
    return addCacheHeaders(response, CACHE_CONFIG.SENSOR_LIST_TTL);
  } catch (error) {
    return ApiResponse.error('Error message');
  }
}
```

## Caching Strategy

We use different TTL values depending on the data type and access patterns, defined in `CACHE_CONFIG`:

| Data Type | TTL | Reason |
|-----------|-----|--------|
| Sensor details | 60 seconds | Semi-static data that rarely changes |
| Sensor list | 30 seconds | May change when sensors are added/removed |
| Active alerts | 10 seconds | Need to show up quickly for monitoring |
| Historical readings | 300 seconds (5 min) | Historical data doesn't change |
| Recent readings | 30 seconds | Need fresh data but some caching helps |

## Cache Invalidation

Cache invalidation happens at several levels:

1. **Database-level**: The `DatabaseHelper` class automatically invalidates caches on create/update/delete operations
2. **Service-level**: Service methods can use the `CacheManager` to invalidate related caches
3. **API-level**: API routes can explicitly invalidate caches when handling mutations

Example in the DatabaseHelper:

```typescript
async update(id: string | number, payload: Partial<T>): Promise<T | null> {
  // Database operation
  const result = await this.query().update(data).eq('id', id).select().single();
  
  // Automatic cache invalidation
  this.invalidateCache(id);
  
  return result;
}
```

## Cache Key Structure

We use a consistent pattern for cache keys to make invalidation easier:

- Individual entities: `{entityType}:{id}`
- Entity with details: `{entityType}:{id}:details`
- Entity lists: `{entityType}:list:{filterParams}`
- API responses: `api:{endpoint}:{queryParams}`

## Future Improvements

For production deployment, we recommend:

1. **Distributed caching**: Replace the in-memory cache with Redis for multi-server setups
2. **Metrics collection**: Add cache hit/miss metrics
3. **Cache warming**: Pre-populate caches for frequently accessed data
4. **Stale-while-revalidate**: Return stale data while fetching fresh data

To implement Redis caching:
1. Add a Redis client dependency
2. Update the cache.ts implementation to use Redis
3. Adjust TTL values based on production usage patterns
