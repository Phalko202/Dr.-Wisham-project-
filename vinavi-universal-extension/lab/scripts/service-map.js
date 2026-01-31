// service-map.js
// Lightweight persistent mapping between catalog entries (ASND/CODE/NAME) and Vinavi service IDs.

(function(){
  const LS_PREFIX = 'HMH_VINAVI_SERVICE_MAP__';
  const memoryMap = Object.create(null);

  // Attempt to load a static JSON mapping if present (optional)
  async function loadStaticMap() {
    try {
      const res = await fetch('scripts/service-map.json', { cache: 'no-store' });
      if (!res.ok) return {};
      const json = await res.json();
      return json || {};
    } catch (_) {
      return {};
    }
  }

  function makeKeysFromTest(test){
    const keys = [];
    if (test?.asnd) keys.push('ASND:'+String(test.asnd).trim().toUpperCase());
    if (test?.code) keys.push('CODE:'+String(test.code).trim());
    if (test?.name) keys.push('NAME:'+String(test.name).trim().toLowerCase());
    return keys;
  }

  function getFromLocalStorage(key){
    try { return localStorage.getItem(LS_PREFIX+key); } catch(_) { return null; }
  }
  function setToLocalStorage(key, val){
    try { localStorage.setItem(LS_PREFIX+key, val); } catch(_) {}
  }

  function getMappedServiceId(test){
    const keys = makeKeysFromTest(test);
    for (const k of keys){
      if (memoryMap[k]) return memoryMap[k];
      const v = getFromLocalStorage(k);
      if (v){ memoryMap[k] = v; return v; }
      if (window.__STATIC_SERVICE_MAP__ && window.__STATIC_SERVICE_MAP__[k]){
        memoryMap[k] = window.__STATIC_SERVICE_MAP__[k];
        return memoryMap[k];
      }
    }
    return null;
  }

  function rememberMapping(test, serviceId){
    const keys = makeKeysFromTest(test);
    for (const k of keys){
      memoryMap[k] = String(serviceId);
      setToLocalStorage(k, String(serviceId));
    }
  }

  // Expose API
  window.ServiceMap = {
    loadStaticMap,
    getMappedServiceId,
    rememberMapping,
    makeKeysFromTest
  };

  // Preload static map in background and populate lookup tables
  loadStaticMap().then(map => { 
    window.__STATIC_SERVICE_MAP__ = map;
    
    // Also populate ROUTINE_SERVICE_MAP_BY_ASND for fast ASND lookup in catalog
    window.ROUTINE_SERVICE_MAP_BY_ASND = window.ROUTINE_SERVICE_MAP_BY_ASND || {};
    Object.keys(map).forEach(key => {
      if (key.startsWith('ASND:')) {
        const asndCode = key.replace('ASND:', '').trim().toUpperCase();
        window.ROUTINE_SERVICE_MAP_BY_ASND[asndCode] = String(map[key]);
      }
    });
    
    console.log('[ServiceMap] Loaded static service map with', Object.keys(map).length, 'entries');
    
    // Notify any iframes that the service map is ready
    const frames = document.querySelectorAll('iframe');
    frames.forEach(frame => {
      try {
        if (frame.contentWindow) {
          frame.contentWindow.postMessage({ type: 'serviceMapLoaded' }, '*');
        }
      } catch (e) {
        // Cross-origin frames will throw, ignore
      }
    });
    
    // Also try to refresh catalog if it has the function
    setTimeout(() => {
      frames.forEach(frame => {
        try {
          if (frame.contentWindow && typeof frame.contentWindow.refreshCatalogVinaviIds === 'function') {
            frame.contentWindow.refreshCatalogVinaviIds();
          }
        } catch (e) {
          // Ignore cross-origin errors
        }
      });
    }, 100);
  });
})();
