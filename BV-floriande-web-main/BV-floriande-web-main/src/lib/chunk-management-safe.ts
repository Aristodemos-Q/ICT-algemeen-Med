/**
 * Safe Chunk Management Loader
 * 
 * This module provides a webpack-safe way to initialize chunk management
 * without causing module resolution conflicts during compilation.
 */

'use client';

// Define types without importing conflicting modules
interface ChunkManagementAPI {
  initErrorHandler: () => void;
  clearWebpackCache: () => void;
  serviceWorker: {
    isSupported: boolean;
    clearCache: () => Promise<boolean>;
  };
  errorReporter: {
    reportError: (error: Error) => void;
    isReady: boolean;
  };
}

// Create a safe chunk management API that loads modules dynamically
export const createChunkManagement = (): ChunkManagementAPI => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return {
      initErrorHandler: () => {},
      clearWebpackCache: () => {},
      serviceWorker: {
        isSupported: false,
        clearCache: async () => false,
      },
      errorReporter: {
        reportError: () => {},
        isReady: false,
      },
    };
  }

  let chunkErrorHandler: any = null;
  let chunkServiceWorker: any = null;
  let chunkErrorReporter: any = null;
  let clearWebpackCache: any = null;
  // Dynamic loader function that avoids webpack conflicts
  const loadChunkModules = async () => {
    try {
      // Load modules individually with error handling for each
      try {
        const { initChunkErrorHandler } = await import('./chunk-error-handler');
        chunkErrorHandler = initChunkErrorHandler;
        console.log('[ChunkManagement] Error handler module loaded');
      } catch (error) {
        console.warn('[ChunkManagement] Failed to load error handler module:', error);
      }
        try {
        const chunkServiceWorkerModule = await import('./chunk-service-worker');
        chunkServiceWorker = chunkServiceWorkerModule.chunkServiceWorker;
        console.log('[ChunkManagement] Service worker module loaded');
      } catch (error) {
        console.warn('[ChunkManagement] Failed to load service worker module:', error);
      }
      
      try {
        const { chunkErrorReporter: reporter } = await import('./chunk-error-reporter');
        chunkErrorReporter = reporter;
        console.log('[ChunkManagement] Error reporter module loaded');
      } catch (error) {
        console.warn('[ChunkManagement] Failed to load error reporter module:', error);
      }
      
      try {
        const { clearWebpackChunksCache } = await import('./clear-webpack-cache');
        clearWebpackCache = clearWebpackChunksCache;
        console.log('[ChunkManagement] Webpack cache module loaded');
      } catch (error) {
        console.warn('[ChunkManagement] Failed to load webpack cache module:', error);
      }

      console.log('[ChunkManagement] All modules loaded successfully');
    } catch (error) {
      console.warn('[ChunkManagement] Failed to load chunk modules:', error);
    }
  };

  // Initialize modules on first access
  let initPromise: Promise<void> | null = null;
  const ensureLoaded = () => {
    if (!initPromise) {
      initPromise = loadChunkModules();
    }
    return initPromise;
  };

  return {
    initErrorHandler: () => {
      ensureLoaded().then(() => {
        if (chunkErrorHandler) {
          chunkErrorHandler();
          console.log('[ChunkManagement] Error handler initialized');
        }
      }).catch(error => {
        console.warn('[ChunkManagement] Error handler init failed:', error);
      });
    },

    clearWebpackCache: () => {
      ensureLoaded().then(() => {
        if (clearWebpackCache) {
          clearWebpackCache();
          console.log('[ChunkManagement] Webpack cache cleared');
        }
      }).catch(error => {
        console.warn('[ChunkManagement] Cache clear failed:', error);
      });
    },

    serviceWorker: {
      isSupported: 'serviceWorker' in navigator,
      clearCache: async () => {
        await ensureLoaded();
        if (chunkServiceWorker && typeof chunkServiceWorker.clearCache === 'function') {
          return chunkServiceWorker.clearCache();
        }
        return false;
      },
    },

    errorReporter: {
      reportError: (error: Error) => {
        ensureLoaded().then(() => {
          if (chunkErrorReporter && typeof chunkErrorReporter.reportError === 'function') {
            chunkErrorReporter.reportError(error);
          }
        }).catch(err => {
          console.warn('[ChunkManagement] Error reporting failed:', err);
        });
      },
      isReady: chunkErrorReporter !== null,
    },
  };
};

// Create singleton instance
let chunkManagementInstance: ChunkManagementAPI | null = null;

export const getChunkManagement = (): ChunkManagementAPI => {
  if (!chunkManagementInstance) {
    chunkManagementInstance = createChunkManagement();
  }
  return chunkManagementInstance;
};

// Helper function for easy initialization
export const initChunkManagementSafe = () => {
  if (typeof window === 'undefined') return;
  
  const chunkMgmt = getChunkManagement();
  
  // Initialize error handler
  chunkMgmt.initErrorHandler();
  
  console.log('[ChunkManagement] Safe initialization completed');
};
