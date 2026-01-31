# Medicine Search Fix - December 1, 2025

## Problem Identified

The medicine search was failing with **406 Not Acceptable** errors because:
1. The Aasandha API (`api.aasandha.mv`) requires **authentication cookies**
2. Browser extensions cannot access cookies from different domains (CORS policy)
3. Direct fetch from `dashboard.js` doesn't have the authenticated session

## Solution Implemented

### Content Script Bridge Architecture

Instead of calling the API directly from the extension, we now use the **content script** (`content.js`) which runs in the **Vinavi page context** and has access to the authenticated session.

### How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│ dashboard.js│ ------> │  content.js  │ ------> │ Aasandha API    │
│  (Extension)│ Message │ (Page Context│  Fetch  │ (Authenticated) │
│             │ Passing │  with cookies)│         │                 │
└─────────────┘         └──────────────┘         └─────────────────┘
```

### Implementation Details

#### 1. Content Script Functions (`content.js`)

Added two new functions that run in the Vinavi page context:

```javascript
// Search medicines using authenticated session
async function searchMedicinesInPage(query) {
  const response = await fetch(`https://api.aasandha.mv/medicines?filter[query]=${query}`, {
    credentials: 'include',  // Includes cookies
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Get medicine details
async function getMedicineDetailsInPage(medicineId) {
  const response = await fetch(`https://api.aasandha.mv/medicines/${medicineId}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}
```

#### 2. Message Listener (`content.js`)

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchMedicines') {
    searchMedicinesInPage(request.query)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open
  }
  
  if (request.action === 'getMedicineDetails') {
    getMedicineDetailsInPage(request.medicineId)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
```

#### 3. Dashboard Functions (`dashboard.js`)

Updated to use message passing:

```javascript
async function searchMedicines(query) {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'searchMedicines',
        query: query.trim()
      }, (response) => {
        if (response && response.success) {
          resolve(response.data || []);
        } else {
          resolve([]);
        }
      });
    });
  });
}
```

## Other Fixes

### 1. ✅ Urinalysis Spelling
- Already correct in `lab-catalog.js` line 30: `'Urinalysis'`
- Displays properly in the catalog

### 2. ✅ 3x3 Grid Layout
- Already implemented in `lab-catalog.html` line 278:
  ```css
  .tests-grid {
    column-count: 3;
    column-gap: 16px;
    column-fill: balance;
  }
  ```
- Tests display vertically in 3 columns
- Responsive: 2 columns on medium screens, 1 column on mobile

## Testing

To test the medicine search:

1. **Open Vinavi Portal** in a browser tab
2. **Log in** to your account
3. **Open the extension** (click the extension icon)
4. **Navigate to "Clinical Sets"**
5. **Click "Create New Set"**
6. **Go to "Medications" tab**
7. **Type in search** (e.g., "fexo", "paracetamol")

### Expected Behavior

- Search results appear after 500ms delay (debounced)
- Shows medicine name, generic name, strength, and form
- Click to select and view full details
- No authentication errors

### Troubleshooting

If search still doesn't work:

1. **Check Console** for errors (`F12` → Console)
2. **Verify you're logged in** to Vinavi portal
3. **Reload the Vinavi tab** after installing extension
4. **Check Network tab** to see if requests have cookies

## Technical Notes

- Uses Chrome Extension Message Passing API
- Content script has same-origin access to Aasandha API
- Maintains session cookies automatically
- No CORS issues since fetch happens in page context
- Fully backward compatible with existing features
