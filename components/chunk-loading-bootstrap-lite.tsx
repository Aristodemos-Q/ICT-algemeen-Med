'use client';

import React, { useEffect, ReactNode } from 'react';

interface ChunkLoadingBootstrapLiteProps {
  children: ReactNode;
}

const ChunkLoadingBootstrapLite: React.FC<ChunkLoadingBootstrapLiteProps> = ({ children }) => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      const handleScriptError = (event: ErrorEvent) => {
        const error = event.error;
        const message = error?.message || '';
        
        if (
          error?.name === 'ChunkLoadError' || 
          message.includes('loading chunk') || 
          message.includes('failed to fetch dynamically imported module')
        ) {
          console.warn('[ChunkBootstrap] Chunk loading error detected, reloading page...');
          setTimeout(() => window.location.reload(), 1000);
        }
      };

      const handlePromiseRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason;
        const message = error?.message || '';
        
        if (
          error?.name === 'ChunkLoadError' || 
          message.includes('loading chunk') || 
          message.includes('failed to fetch dynamically imported module')
        ) {
          console.warn('[ChunkBootstrap] Chunk loading error detected in promise, reloading page...');
          setTimeout(() => window.location.reload(), 1000);
        }
      };

      // Register minimal error handlers
      window.addEventListener('error', handleScriptError);
      window.addEventListener('unhandledrejection', handlePromiseRejection);

      // Return cleanup function
      return () => {
        window.removeEventListener('error', handleScriptError);
        window.removeEventListener('unhandledrejection', handlePromiseRejection);
      };
    } catch (error) {
      console.error('[ChunkBootstrapLite] Failed to initialize chunk handling:', error);
    }
  }, []);

  return <>{children}</>;
};

export default ChunkLoadingBootstrapLite;
