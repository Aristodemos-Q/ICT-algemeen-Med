/**
 * Chunk Service Worker
 * 
 * This module provides service worker functionality for chunk management.
 * It's used to handle and recover from chunk loading errors in the application.
 */

export const chunkServiceWorker = {
  // Register the service worker
  register: async (): Promise<ServiceWorkerRegistration | null> => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('[ChunkServiceWorker] Service workers not supported');
      return null;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[ChunkServiceWorker] Service worker registered');
      return registration;
    } catch (error) {
      console.error('[ChunkServiceWorker] Registration failed:', error);
      return null;
    }
  },
  
  // Unregister all service workers
  unregisterAll: async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      console.log('[ChunkServiceWorker] All service workers unregistered');
      return true;
    } catch (error) {
      console.error('[ChunkServiceWorker] Unregister failed:', error);
      return false;
    }
  }
};
