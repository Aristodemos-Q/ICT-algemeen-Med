/**
 * Deze functie handmatig de webpack chunks cache schoon in de browser.
 * Het kan helpen bij het oplossen van ChunkLoadError problemen.
 */
export function clearWebpackChunksCache() {
  if (typeof window === 'undefined') return;

  // Zoek alle bestaande webpack chunk script tags
  const chunkScripts = document.querySelectorAll('script[src*="webpack"]');
  
  // Verwijder elk script element om ze opnieuw te kunnen laden
  chunkScripts.forEach(script => {
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  });
  
  // Verwijder webpack chunkcache uit localStorage als die bestaat
  try {
    const localStorageKeys = Object.keys(localStorage);
    const webpackCacheKeys = localStorageKeys.filter(key => 
      key.startsWith('webpack') || key.includes('_N_E') || key.includes('next-')
    );
    
    webpackCacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.warn('Kon localStorage niet schoonmaken:', e);
  }
  
  // Ook sessionstorage schoonmaken voor webpack gerelateerde items
  try {
    const sessionStorageKeys = Object.keys(sessionStorage);
    const webpackCacheKeys = sessionStorageKeys.filter(key => 
      key.startsWith('webpack') || key.includes('_N_E') || key.includes('next-')
    );
    
    webpackCacheKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
  } catch (e) {
    console.warn('Kon sessionStorage niet schoonmaken:', e);
  }
}
