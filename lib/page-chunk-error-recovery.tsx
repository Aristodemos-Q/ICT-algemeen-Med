/**
 * Automatische herstelfunctie voor chunk loading errors
 * 
 * Deze functie wordt uitgevoerd op client-side en detecteert 
 * specifieke webpack ChunkLoadError problemen die kunnen optreden
 * bij het navigeren tussen pagina's of het dynamisch laden van componenten.
 */

'use client';

import { useEffect } from 'react';
import { clearWebpackChunksCache } from './clear-webpack-cache';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Hook om ChunkLoadErrors op te vangen en automatisch te herstellen
 */
export function useChunkErrorRecovery() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Chunk error recovery voor specifieke webpack errors
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error || {};
      const errorMessage = error.message || event.message || '';
      
      // Controleer of het een ChunkLoadError is
      const isChunkLoadError = 
        error.name === 'ChunkLoadError' || 
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('loading chunk') ||
        errorMessage.includes('failed to load script') ||
        errorMessage.includes('Loading CSS chunk');
        
      if (isChunkLoadError) {
        console.warn('ChunkLoadError gedetecteerd, bezig met herstellen...');
        
        // Voorkom default browser error handling
        event.preventDefault();
        
        // Clear cache en herlaad de huidige route
        clearWebpackChunksCache();
        
        // Voeg een timestamp parameter toe om caching te voorkomen
        const timestamp = Date.now();
        const refreshParams = new URLSearchParams(window.location.search);
        refreshParams.set('_refresh', timestamp.toString());
        
        // Pagina herladen met schone cache
        const newUrl = `${pathname}?${refreshParams.toString()}`;
        router.replace(newUrl);
        
        return true;
      }
      
      return false;
    };
    
    // Luister naar globale errors
    window.addEventListener('error', handleChunkError);
    
    // Luister naar unhandled promise rejections (async chunk errors)
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      if (error && (
        error.name === 'ChunkLoadError' || 
        (error.message && error.message.includes('loading chunk'))
      )) {
        // Voorkom default browser error handling
        event.preventDefault();
        
        // Clear cache en herlaad
        clearWebpackChunksCache();
        router.refresh();
      }
    });
    
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError as any);
    };
  }, [pathname, router]);
}

/**
 * Component om op pagina niveau ChunkLoadErrors op te vangen
 */
export default function PageChunkErrorRecovery({ children }: { children: React.ReactNode }) {
  useChunkErrorRecovery();
  
  return <>{children}</>;
}
