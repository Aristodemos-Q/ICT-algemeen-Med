/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

/**
 * Helper functions for cache management across related entities
 */
import { cache } from './cache';

/**
 * Cache manager provides specialized invalidation methods for different entity types
 */
export class CacheManager {
  /**
   * Invalidate user-related caches when a user is changed
   * @param userId The user ID
   */
  static invalidateUserCache(userId: string): void {
    // Direct user caches
    cache.delete(`user:${userId}`);
    cache.delete(`user:${userId}:details`);
    
    // User list caches
    cache.deleteByPrefix('users:list:');
    
    // Related training group caches (if user is a trainer)
    cache.deleteByPrefix('groups:');
  }
  
  /**
   * Invalidate training group-related caches when a group is changed
   * @param groupId The training group ID
   */
  static invalidateGroupCache(groupId: string): void {
    // Direct group caches
    cache.delete(`group:${groupId}`);
    cache.delete(`group:${groupId}:details`);
    
    // Group list caches
    cache.deleteByPrefix('groups:list:');
    
    // Related session caches
    cache.deleteByPrefix(`sessions:${groupId}:`);
    
    // Attendance caches may be affected
    cache.deleteByPrefix('attendance:');
  }
  
  /**
   * Invalidate training session-related caches when sessions change
   * @param sessionId The session ID
   * @param groupId The associated group ID (optional)
   */
  static invalidateSessionCache(sessionId: string, groupId?: string): void {
    // Direct session caches
    cache.delete(`session:${sessionId}`);
    cache.delete(`session:${sessionId}:details`);
    
    if (groupId) {
      // Sessions for specific group
      cache.deleteByPrefix(`sessions:${groupId}:`);
    } else {
      // All session caches
      cache.deleteByPrefix('sessions:');
    }
    
    // Upcoming sessions cache
    cache.deleteByPrefix('upcoming:');
    
    // May affect attendance
    cache.deleteByPrefix(`attendance:${sessionId}:`);
  }
  
  /**
   * Invalidate attendance-related caches when attendance changes
   * @param sessionId The associated session ID
   */
  static invalidateAttendanceCache(sessionId: string): void {
    // Attendance for specific session
    cache.deleteByPrefix(`attendance:${sessionId}:`);
    
    // May affect session details (attendance count)
    cache.delete(`session:${sessionId}:details`);
    
    // May affect user stats
    cache.deleteByPrefix('stats:');
  }
  
  /**
   * Invalidate all caches (use sparingly)
   */
  static invalidateAllCaches(): void {
    cache.clear();
  }
}
