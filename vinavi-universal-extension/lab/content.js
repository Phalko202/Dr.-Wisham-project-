// Content Script for Vinavi Pages
// This script runs on Vinavi portal pages to integrate lab ordering functionality

console.log('HMH Lab Extension: Content script loaded');

let __hmhInitialized = false;

function ensureInitialized() {
  if (__hmhInitialized) return;
  __hmhInitialized = true;
  try {
    initializeIntegration();
  } catch (e) {
    console.error('[HMH Extension] init failed:', e);
  }
}

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'VINAVI_PAGE_DETECTED') {
    console.log('Vinavi page detected, initializing integration...');
    ensureInitialized();
  }
  
  // Handle medicine search requests (uses authenticated session)
  if (request.action === 'searchMedicines') {
    searchMedicinesInPage(request.query)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  // Handle medicine details requests
  if (request.action === 'getMedicineDetails') {
    getMedicineDetailsInPage(request.medicineId)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  return true;
});

// Auto-init when loaded on Vinavi pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ensureInitialized(), { once: true });
} else {
  ensureInitialized();
}

// Initialize integration on Vinavi pages
function initializeIntegration() {
  // Detect auth token from page if available
  detectAuthToken();
  
  // Listen for lab order submissions
  interceptLabOrderForm();
  
  // Inject enhancements into ADVICE section
  injectAdviceEnhancements();
  
  // Listen for fullscreen catalog requests from iframe
  listenForFullscreenCatalogRequests();
}

// Listen for fullscreen catalog requests from lab-catalog iframe
function listenForFullscreenCatalogRequests() {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'openFullscreenCatalog') {
      const preselectedTests = event.data.preselectedTests || [];
      openFullscreenCatalog(preselectedTests);
    }
  });
}

// Open the fullscreen lab catalog
function openFullscreenCatalog(preselectedTests = []) {
  // Try to get episode/diagnosis IDs from current page
  const url = window.location.href;
  let episodeId = null;
  let diagnosisId = null;
  
  // Extract from URL
  const episodeMatch = url.match(/episodes\/(\d+)/i);
  if (episodeMatch) episodeId = episodeMatch[1];
  
  const diagMatch = url.match(/diagnosis[_-]?id[=\/](\d+)/i);
  if (diagMatch) diagnosisId = diagMatch[1];
  
  // Check if fullscreen catalog is available
  if (window.fullscreenLabCatalog) {
    window.fullscreenLabCatalog.open({
      episodeId: episodeId,
      diagnosisId: diagnosisId,
      preselected: preselectedTests,
      onConfirm: (selectedTests) => {
        console.log('[HMH Extension] Tests selected from fullscreen:', selectedTests);
        handleSelectedTests(selectedTests, episodeId, diagnosisId);
      }
    });
  } else {
    console.error('[HMH Extension] Fullscreen catalog not loaded');
    showNotification('Lab catalog loading, please try again...', 'info');
  }
}

// Handle selected tests from fullscreen catalog
function handleSelectedTests(tests, episodeId, diagnosisId) {
  if (!tests || tests.length === 0) {
    showNotification('No tests selected', 'info');
    return;
  }
  
  // Show notification
  showNotification(`${tests.length} lab test(s) selected`, 'success');
  
  // Try to auto-fill into the page form
  autoFillLabTests(tests);
  
  // Also send to background for potential API submission
  chrome.runtime.sendMessage({
    action: 'LAB_TESTS_SELECTED',
    tests: tests,
    episodeId: episodeId,
    diagnosisId: diagnosisId
  });
  
  // Also notify the lab-catalog iframe to sync selection
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    try {
      iframe.contentWindow.postMessage({
        type: 'syncTests',
        tests: tests
      }, '*');
    } catch (e) {
      // Ignore cross-origin errors
    }
  });
}

// Add floating button for quick lab test ordering - DISABLED
function addQuickAccessButton() {
  // Button disabled - not needed
  return;
}

// Detect and store authentication token from Vinavi page
function detectAuthToken() {
  // Method 1: Check localStorage
  const token = localStorage.getItem('vinavi_auth_token') || 
                localStorage.getItem('auth_token') ||
                localStorage.getItem('access_token');

  if (token) {
    chrome.runtime.sendMessage({
      action: 'STORE_AUTH_TOKEN',
      token: token
    });
    return;
  }

  // Method 2: Check sessionStorage
  const sessionToken = sessionStorage.getItem('vinavi_auth_token') || 
                       sessionStorage.getItem('auth_token');

  if (sessionToken) {
    chrome.runtime.sendMessage({
      action: 'STORE_AUTH_TOKEN',
      token: sessionToken
    });
    return;
  }

  // Method 3: Check for auth header in fetch requests (intercept)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options] = args;
    
    if (options && options.headers) {
      const authHeader = options.headers['Authorization'] || 
                        options.headers['authorization'];
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        chrome.runtime.sendMessage({
          action: 'STORE_AUTH_TOKEN',
          token: token
        });
      }
    }
    
    return originalFetch.apply(this, args);
  };
}

// Intercept existing lab order forms and enhance them
function interceptLabOrderForm() {
  // Look for lab order forms or buttons on the page
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Check if it's a lab order form or contains lab-related elements
          const labForms = node.querySelectorAll('form[action*="lab"], [data-type="lab-order"]');
          labForms.forEach(form => enhanceLabForm(form));
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also check existing forms on page load
  const existingForms = document.querySelectorAll('form[action*="lab"], [data-type="lab-order"]');
  existingForms.forEach(form => enhanceLabForm(form));
}

// Enhance existing lab forms with HMH catalog
function enhanceLabForm(form) {
  if (form.dataset.hmhEnhanced) return; // Already enhanced
  
  form.dataset.hmhEnhanced = 'true';

  // Add button to open HMH catalog
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hmh-catalog-btn';
  button.textContent = '📋 Browse HMH Lab Catalog';
  button.style.cssText = `
    margin: 8px 0;
    padding: 10px 16px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  `;

  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'OPEN_LAB_CATALOG' });
  });

  form.insertBefore(button, form.firstChild);
}

// Listen for lab test selections from extension
window.addEventListener('message', (event) => {
  if (event.data.type === 'HMH_LAB_TESTS_SELECTED') {
    const tests = event.data.tests;
    console.log('Lab tests selected:', tests);
    
    // Auto-fill the Vinavi form with selected tests
    autoFillLabTests(tests);
  }
});

// Auto-fill lab test selections into Vinavi forms
function autoFillLabTests(tests) {
  // Find lab test input fields (implementation depends on Vinavi's form structure)
  const testInputs = document.querySelectorAll('[name*="lab_test"], [data-test-code]');
  
  tests.forEach((test, index) => {
    if (testInputs[index]) {
      testInputs[index].value = test.code || test.asnd || test.name;
    }
  });

  // Show notification
  showNotification(`${tests.length} lab tests added`, 'success');
}

// Show notification on page
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = 'hmh-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : '#2563eb'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeIntegration);
} else {
  initializeIntegration();
}

/**
 * Search medicines using the page's authenticated session
 */
async function searchMedicinesInPage(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const searchUrl = `https://api.aasandha.mv/medicines?filter[query]=${encodeURIComponent(query.trim())}&page[size]=50`;
    const response = await fetch(searchUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('[Vinavi Extension] Medicine search failed:', error);
    throw error;
  }
}

/**
 * Get medicine details using the page's authenticated session
 */
async function getMedicineDetailsInPage(medicineId) {
  try {
    const url = `https://api.aasandha.mv/medicines/${medicineId}`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('[Vinavi Extension] Get medicine details failed:', error);
    throw error;
  }
}

/**
 * Inject enhancements into the ADVICE section
 */
function injectAdviceEnhancements() {
  // Wait for page to load and look for ADVICE section
  const observer = new MutationObserver((mutations, obs) => {
    // Look for ADVICE tab or section
    const adviceButton = findAdviceSection();
    
    if (adviceButton) {
      console.log('[HMH Extension] ADVICE section found, injecting enhancements...');
      enhanceAdviceSection(adviceButton);
      // Don't disconnect - keep watching for dynamic content
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also try immediately
  const adviceButton = findAdviceSection();
  if (adviceButton) {
    enhanceAdviceSection(adviceButton);
  }
}

/**
 * Find the ADVICE section/tab on the page
 */
function findAdviceSection() {
  // Try multiple selectors to find ADVICE tab/section
  const selectors = [
    '[data-tab="advice"]',
    '[data-section="advice"]',
    'button:contains("ADVICE")',
    'a:contains("ADVICE")',
    '.tab-button:contains("ADVICE")',
    '[role="tab"]:contains("ADVICE")'
  ];
  
  // Look for text content "ADVICE"
  const allButtons = document.querySelectorAll('button, a, div[role="tab"], [class*="tab"]');
  for (const button of allButtons) {
    const text = button.textContent.trim().toUpperCase();
    if (text === 'ADVICE' || text.includes('ADVICE')) {
      return button;
    }
  }
  
  return null;
}

/**
 * Enhance the ADVICE section with HMH features
 */
function enhanceAdviceSection(adviceTab) {
  // Mark as enhanced to avoid duplicate injection
  if (adviceTab.dataset.hmhEnhanced) return;
  adviceTab.dataset.hmhEnhanced = 'true';
  
  // Add click listener to inject content when ADVICE tab is opened
  adviceTab.addEventListener('click', () => {
    setTimeout(() => {
      injectAdviceContent();
    }, 500); // Wait for tab content to load
  });
  
  // If ADVICE section is already visible, inject now
  if (adviceTab.classList.contains('active') || adviceTab.getAttribute('aria-selected') === 'true') {
    setTimeout(() => {
      injectAdviceContent();
    }, 300);
  }
}

/**
 * Inject HMH content into the ADVICE section
 */
function injectAdviceContent() {
  // Look for ADVICE content area (textarea, input, or content div)
  const adviceTextarea = document.querySelector('textarea[name*="advice"], textarea[id*="advice"], textarea[placeholder*="advice"]');
  const adviceContainer = document.querySelector('[data-section-content="advice"], .advice-content, #advice-content');
  
  const targetElement = adviceTextarea || adviceContainer;
  
  if (!targetElement) {
    console.log('[HMH Extension] ADVICE content area not found');
    return;
  }
  
  // Check if already injected
  if (document.getElementById('hmh-advice-enhancements')) {
    return;
  }
  
  // Create enhancement panel
  const enhancementPanel = document.createElement('div');
  enhancementPanel.id = 'hmh-advice-enhancements';
  enhancementPanel.style.cssText = `
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border: 2px solid #3b82f6;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  `;
  
  enhancementPanel.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <div style="width: 36px; height: 36px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"/>
        </svg>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 14px; color: #1e40af; margin-bottom: 2px;">HMH Quick Medical Advice</div>
        <div style="font-size: 12px; color: #3b82f6;">Select from common advice templates or use Clinical Sets</div>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
      <button class="hmh-advice-btn" data-advice="rest" style="padding: 10px 14px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left; color: #374151;">
        🛏️ Rest & Hydration
      </button>
      <button class="hmh-advice-btn" data-advice="medication" style="padding: 10px 14px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left; color: #374151;">
        💊 Medication Adherence
      </button>
      <button class="hmh-advice-btn" data-advice="followup" style="padding: 10px 14px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left; color: #374151;">
        📅 Follow-up Required
      </button>
      <button class="hmh-advice-btn" data-advice="diet" style="padding: 10px 14px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left; color: #374151;">
        🥗 Diet & Lifestyle
      </button>
      <button class="hmh-advice-btn" data-advice="warning" style="padding: 10px 14px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left; color: #374151;">
        ⚠️ Warning Signs
      </button>
      <button class="hmh-advice-btn" data-advice="sets" style="padding: 10px 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: 2px solid #2563eb; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left; color: white;">
        📋 Clinical Sets
      </button>
    </div>
  `;
  
  // Insert before the textarea/content area
  targetElement.parentNode.insertBefore(enhancementPanel, targetElement);
  
  // Add click handlers
  enhancementPanel.querySelectorAll('.hmh-advice-btn').forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
      if (!e.target.style.background.includes('gradient')) {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.background = '#f0f9ff';
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
      }
    });
    
    btn.addEventListener('mouseleave', (e) => {
      if (!e.target.style.background.includes('gradient')) {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.background = 'white';
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }
    });
    
    btn.addEventListener('click', () => {
      const adviceType = btn.dataset.advice;
      insertAdviceTemplate(adviceType, adviceTextarea);
    });
  });
  
  console.log('[HMH Extension] ADVICE enhancements injected successfully');
}

/**
 * Insert advice template into textarea
 */
function insertAdviceTemplate(type, textarea) {
  if (!textarea) return;
  
  const templates = {
    rest: `• Take adequate rest and avoid strenuous activities
• Stay well hydrated - drink at least 8 glasses of water daily
• Get sufficient sleep (7-8 hours)
• Avoid alcohol and smoking`,
    
    medication: `• Take all prescribed medications as directed
• Complete the full course of antibiotics (if prescribed)
• Take medications with food if specified
• Do not skip doses
• Report any side effects immediately`,
    
    followup: `• Follow up in clinic after 3-5 days
• Return immediately if symptoms worsen
• Book appointment for review of test results
• Monitor symptoms and keep a diary if needed`,
    
    diet: `• Follow a balanced, nutritious diet
• Avoid oily, spicy, and processed foods
• Eat small, frequent meals
• Include fresh fruits and vegetables
• Limit caffeine and sugar intake`,
    
    warning: `⚠️ SEEK IMMEDIATE MEDICAL ATTENTION IF:
• High fever above 39°C (102°F)
• Severe or worsening pain
• Difficulty breathing
• Persistent vomiting or diarrhea
• Loss of consciousness or confusion
• Chest pain or palpitations`,
    
    sets: '' // Will open Clinical Sets dialog
  };
  
  if (type === 'sets') {
    // Open Clinical Sets from extension
    chrome.runtime.sendMessage({ action: 'OPEN_CLINICAL_SETS' });
    showNotification('Opening Clinical Sets...', 'info');
    return;
  }
  
  const template = templates[type];
  if (!template) return;
  
  // Append to existing content or replace
  const currentValue = textarea.value.trim();
  if (currentValue) {
    textarea.value = currentValue + '\n\n' + template;
  } else {
    textarea.value = template;
  }
  
  // Trigger input event for any listeners
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
  
  showNotification('Advice template inserted', 'success');
}
