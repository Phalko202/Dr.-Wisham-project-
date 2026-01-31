// Vinavi Universal Helper - background service worker
// Kept minimal; the popup opens extension pages directly.

chrome.runtime.onInstalled.addListener(() => {
  // no-op
});

// Optional: store auth token / last selected labs for cross-page use
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request?.action === 'STORE_AUTH_TOKEN' && typeof request.token === 'string') {
      chrome.storage.local.set({ vinavi_auth_token: request.token });
      sendResponse?.({ ok: true });
      return;
    }

    if (request?.action === 'LAB_TESTS_SELECTED' && Array.isArray(request.tests)) {
      chrome.storage.local.set({ last_selected_lab_tests: request.tests });
      sendResponse?.({ ok: true });
      return;
    }
  } catch (e) {
    // ignore
  }
});
