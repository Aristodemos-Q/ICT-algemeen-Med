/**
 * Chunk Error Handler
 * 
 * Dit script detecteert ChunkLoadErrors in de client en herlaadt de pagina automatisch
 * om het probleem op te lossen. Dit voorkomt dat gebruikers vastlopen bij chunk loading problemen.
 */

// Deze functie wordt aangeroepen bij het laden van de pagina
export function initChunkErrorHandler() {
  if (typeof window === 'undefined') return; // Server-side check

  // Bewaar de originele error handler
  const originalOnError = window.onerror;

  // Vervang de error handler met onze eigen versie
  window.onerror = function(message, source, lineno, colno, error) {
    // Check of het een ChunkLoadError is
    if (
      error && 
      (
        error.name === 'ChunkLoadError' || 
        (message && typeof message === 'string' && message.includes('ChunkLoadError')) ||
        (error.message && error.message.includes('loading chunk'))
      )
    ) {
      console.warn('ChunkLoadError gedetecteerd, pagina wordt opnieuw geladen...');
      
      // Verwijder caches door een unieke queryparameter toe te voegen
      const currentUrl = window.location.href;
      const hasQuery = currentUrl.includes('?');
      const timestamp = Date.now();
      
      // Voeg timestamp toe aan URL om caching te voorkomen
      const refreshUrl = hasQuery 
        ? `${currentUrl}&_refresh=${timestamp}` 
        : `${currentUrl}?_refresh=${timestamp}`;
      
      // Herlaad de pagina
      window.location.href = refreshUrl;
      
      return true; // Voorkom dat de standaard error handler wordt aangeroepen
    }
      // Voor andere fouten, gebruik de originele error handler
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };
}
