// routine-service-prefill.js
// Prefetch Vinavi service IDs for routine OPD/ER lab bundles and seed the local ServiceMap.
// This mirrors the behaviour of the official Aasandha extension so the lab dashboard can
// reuse the same verified service identifiers.

(function bootstrapRoutineServicePrefill() {
  const ROUTINE_SERVICE_IDS = {
    opd: ['4876', '4846', '4906', '4873', '5004', '4789', '4861', '4966', '4784', '4850', '4887'],
    er: ['4876', '4846', '4906', '5004', '4816', '4817', '4784', '4850', '4887']
  };

  const STORAGE_KEY = 'HMH_ROUTINE_SERVICE_DETAILS_V1';
  const uniqueServiceIds = Array.from(new Set([].concat(ROUTINE_SERVICE_IDS.opd, ROUTINE_SERVICE_IDS.er)));

  function notifyCatalogOfMappingUpdate() {
    try {
      const frame = document.getElementById('labCatalogFrame');
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: 'serviceMappingUpdated' }, '*');
      }
    } catch (_) {
      // Failing silently keeps the dashboard logs clean if the catalog is not mounted yet.
    }
  }

  function loadStoredDetails() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn('[RoutineMap] Failed to parse cached routine service details:', error);
      return {};
    }
  }

  function persistDetails(details) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch (error) {
      console.warn('[RoutineMap] Unable to persist routine service cache:', error);
    }
  }

  function applyMappingFromDetails(details, serviceId) {
    if (!details || !details.asnd) return;

    const mappingTarget = {
      asnd: details.asnd,
      code: details.code || null,
      name: details.name || null
    };

    if (window.ServiceMap && typeof window.ServiceMap.rememberMapping === 'function') {
      window.ServiceMap.rememberMapping(mappingTarget, serviceId);
    }

    const asndKey = `ASND:${String(details.asnd).trim().toUpperCase()}`;
    window.__STATIC_SERVICE_MAP__ = Object.assign(window.__STATIC_SERVICE_MAP__ || {}, {
      [asndKey]: String(serviceId)
    });

    // Expose hydrated mapping for other helpers (e.g., lab catalog UI updates).
    window.ROUTINE_SERVICE_MAP_BY_ASND = window.ROUTINE_SERVICE_MAP_BY_ASND || {};
    window.ROUTINE_SERVICE_MAP_BY_ASND[String(details.asnd).trim().toUpperCase()] = String(serviceId);
    window.ROUTINE_SERVICE_MAP_BY_ID = window.ROUTINE_SERVICE_MAP_BY_ID || {};
    window.ROUTINE_SERVICE_MAP_BY_ID[String(serviceId)] = {
      asnd: String(details.asnd).trim().toUpperCase(),
      code: details.code || null,
      name: details.name || null
    };

    notifyCatalogOfMappingUpdate();
  }

  async function fetchServiceDetails(serviceId) {
    const url = `https://vinavi.aasandha.mv/api/services/${serviceId}`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.api+json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    const service = json?.data;
    if (!service || !service.attributes) {
      throw new Error('Malformed service payload');
    }

    const attrs = service.attributes;
    const payload = {
      asnd: attrs.asnd_code || attrs.code || '',
      code: attrs.code || null,
      name: attrs.name || null
    };

    if (!payload.asnd) {
      console.warn(`[RoutineMap] Service ${serviceId} returned without ASND code; skipping.`);
      return null;
    }

    payload.asnd = String(payload.asnd).trim();
    return payload;
  }

  async function prefillRoutineMappings() {
    if (!window.ServiceMap || typeof window.ServiceMap.rememberMapping !== 'function') {
      console.warn('[RoutineMap] ServiceMap helper not ready; routine mappings skipped.');
      return;
    }

    const cached = loadStoredDetails();
    const updatedCache = { ...cached };

    for (const serviceId of uniqueServiceIds) {
      const cachedDetails = cached[serviceId];
      if (cachedDetails) {
        applyMappingFromDetails(cachedDetails, serviceId);
        continue;
      }

      try {
        const details = await fetchServiceDetails(serviceId);
        if (!details) continue;
        updatedCache[serviceId] = details;
        applyMappingFromDetails(details, serviceId);
        console.log(`[RoutineMap] Loaded Vinavi service ${serviceId} for ASND ${details.asnd}.`);
      } catch (error) {
        console.warn(`[RoutineMap] Failed to load service ${serviceId}:`, error);
      }
    }

    persistDetails(updatedCache);
  }

  function schedulePrefill() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', prefillRoutineMappings, { once: true });
    } else {
      // Run after the current tick so other scripts (ServiceMap) finish initializing.
      setTimeout(prefillRoutineMappings, 0);
    }
  }

  window.ROUTINE_SERVICE_IDS = ROUTINE_SERVICE_IDS;
  schedulePrefill();
})();
