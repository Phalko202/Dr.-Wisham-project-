const STORAGE_KEY = 'labBundlesHMH';

function loadBundles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(b => b && Array.isArray(b.tests)) : [];
  } catch (_) {
    return [];
  }
}

function saveBundles(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

function generateBundleId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function renderBundles() {
  const grid = document.getElementById('packagesGrid');
  if (!grid) return;
  const bundles = window._labBundles || [];
  
  // Update stats in hero section
  updateBundleStats(bundles);
  
  if (bundles.length === 0) {
    grid.innerHTML = '<p class="empty-note">No bundles saved yet.</p>';
    return;
  }
  grid.innerHTML = bundles.map(b => bundleCard(b)).join('');
}

function updateBundleStats(bundles) {
  const bundlesCountEl = document.getElementById('bundlesCount');
  const testsCountEl = document.getElementById('testsCount');
  
  if (bundlesCountEl) {
    const count = bundles.length;
    bundlesCountEl.textContent = `${count} Bundle${count !== 1 ? 's' : ''}`;
  }
  
  if (testsCountEl) {
    const totalTests = bundles.reduce((sum, b) => sum + (b.tests?.length || 0), 0);
    testsCountEl.textContent = `${totalTests} Test${totalTests !== 1 ? 's' : ''}`;
  }
}

function bundleCard(b) {
  const count = b.tests.length;
  return `<div class="bundle-card" data-bundle-id="${b.id}">
    <div class="bundle-card-glow"></div>
    <div class="bundle-head">
      <div class="bundle-title-section">
        <div class="bundle-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 2v2H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2V2H9z" fill="currentColor" opacity="0.3"/>
            <rect x="8" y="1" width="8" height="3" rx="1" fill="currentColor"/>
            <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <strong class="bundle-name">${escapeHtml(b.name)}</strong>
          <span class="bundle-count">${count} test${count !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
    <div class="bundle-actions">
      <button class="bundle-btn apply" data-act="apply" data-id="${b.id}" title="Apply bundle to current episode">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M10.97 4.97a.75.75 0 011.071 1.05l-3.992 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 01.02-.022z"/>
        </svg>
        Apply
      </button>
      <button class="bundle-btn view-detail" data-act="viewDetail" data-id="${b.id}" title="View tests in this bundle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        View
      </button>
      <button class="bundle-btn edit" data-act="edit" data-id="${b.id}" title="Edit this bundle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.146 1.146a.5.5 0 01.708 0l2 2a.5.5 0 010 .708l-9 9a.5.5 0 01-.168.11l-3 1a.5.5 0 01-.65-.65l1-3a.5.5 0 01.11-.168l9-9z"/>
        </svg>
        Edit
      </button>
      <button class="bundle-btn delete" data-act="delete" data-id="${b.id}" title="Delete this bundle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.5 1a.5.5 0 01.5.5V2h4v-.5a.5.5 0 011 0V2h1.5a.5.5 0 010 1h-.5v10a2 2 0 01-2 2H6a2 2 0 01-2-2V3h-.5a.5.5 0 010-1H5v-.5a.5.5 0 01.5-.5zM6 3v10a1 1 0 001 1h4a1 1 0 001-1V3H6zm2.5 2a.5.5 0 01.5.5v6a.5.5 0 01-1 0v-6a.5.5 0 01.5-.5zm2 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0v-6a.5.5 0 01.5-.5z"/>
        </svg>
        Delete
      </button>
    </div>
  </div>`;
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

function handleBundleGridClick(e) {
  const btn = e.target.closest('.bundle-btn');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const act = btn.getAttribute('data-act');
  const bundles = window._labBundles || [];
  const idx = bundles.findIndex(b => b.id === id);
  if (idx === -1) return;
  const bundle = bundles[idx];

  if (act === 'view') {
    showBundleDetailsModal(bundle);
    return;
  }

  if (act === 'viewDetail') {
    showBundleDetailsModal(bundle);
    return;
  }

  if (act === 'edit') {
    editBundle(bundle);
    return;
  }

  if (act === 'delete') {
    if (!confirm(`Delete bundle "${bundle.name}"?`)) return;
    bundles.splice(idx, 1);
    saveBundles(bundles);
    window._labBundles = bundles;
    renderBundles();
    if (typeof showToast === 'function') {
      showToast(`Bundle "${bundle.name}" deleted successfully`, 'success');
    }
    return;
  }

  if (act === 'apply') {
    applyBundle(bundle);
    return;
  }
}

function viewBundleText(bundle) {
  return `${bundle.name}\n\n${bundle.tests.map(t => `${t.name || t.code || t.asnd || 'Test'}${t.asnd ? ` (ASND ${t.asnd})` : ''}`).join('\n')}`;
}

function showBundleDetailsModal(bundle) {
  const testsList = bundle.tests.map((t, idx) => `
    <div class="bundle-test-item" data-test-idx="${idx}">
      <div class="bundle-test-info">
        <div class="bundle-test-name">${escapeHtml(t.name || 'Unknown Test')}</div>
        <div class="bundle-test-meta">
          <span>Code: ${escapeHtml(t.code || 'N/A')}</span>
          <span>ASND: ${escapeHtml(t.asnd || 'N/A')}</span>
          <span>Vinavi ID: ${escapeHtml(String(t.vinaviServiceId || 'N/A'))}</span>
        </div>
      </div>
      <button class="bundle-test-remove" data-bundle-id="${bundle.id}" data-test-idx="${idx}" title="Remove test">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  `).join('');

  const overlay = document.createElement('div');
  overlay.className = 'bundle-picker-overlay';
  overlay.id = 'bundleDetailsOverlay';
  overlay.innerHTML = `
    <div class="bundle-picker-card" style="max-width: 800px;">
      <div class="bundle-picker-header">
        <h3>${escapeHtml(bundle.name)}</h3>
        <button class="bundle-picker-close" aria-label="Close">&times;</button>
      </div>
      <div class="bundle-details-content">
        <div class="bundle-details-header">
          <div class="bundle-details-count">${bundle.tests.length} test${bundle.tests.length !== 1 ? 's' : ''}</div>
          <button class="btn-edit-bundle" data-bundle-id="${bundle.id}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.854 1.146a.5.5 0 00-.708 0l-9 9a.5.5 0 00-.146.354v2a.5.5 0 00.5.5h2a.5.5 0 00.354-.146l9-9a.5.5 0 000-.708l-2-2z"/>
            </svg>
            Edit Bundle
          </button>
        </div>
        <div class="bundle-tests-list">
          ${testsList || '<p style="text-align: center; color: #9ca3af; padding: 40px;">No tests in this bundle</p>'}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.bundle-picker-close');
  const editBtn = overlay.querySelector('.btn-edit-bundle');
  const removeButtons = overlay.querySelectorAll('.bundle-test-remove');

  closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
  
  editBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    editBundle(bundle);
  });

  removeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const testIdx = parseInt(btn.getAttribute('data-test-idx'), 10);
      removeTestFromBundle(bundle.id, testIdx);
      document.body.removeChild(overlay);
      if (typeof showToast === 'function') {
        showToast('Test removed from bundle', 'success');
      }
    });
  });
}

function removeTestFromBundle(bundleId, testIdx) {
  const bundles = window._labBundles || [];
  const bundle = bundles.find(b => b.id === bundleId);
  if (!bundle) return;

  bundle.tests.splice(testIdx, 1);
  saveBundles(bundles);
  window._labBundles = bundles;
  renderBundles();
}

function editBundle(bundle) {
  // Close the bundles list modal first
  hideBundlesListModal();
  
  // Set up editing mode
  window._editingBundleId = bundle.id;
  window._pendingBundleName = bundle.name;
  window._bundleCreationTests = bundle.tests.map(t => ({ ...t }));
  
  // Flag to ignore incoming selections until sync is done
  window._ignoreBundleCatalogUpdates = true;

  // Open the bundle modal with existing tests
  const modal = document.getElementById('bundleModal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Update sidebar to show existing tests
    if (typeof updateBundleSidebar === 'function') {
      updateBundleSidebar();
    }

    // Send message to catalog to sync existing tests (use syncTests which doesn't notify back)
    const catalogFrame = document.getElementById('labCatalogFrameBundleModal');
    if (catalogFrame && catalogFrame.contentWindow) {
      setTimeout(() => {
        catalogFrame.contentWindow.postMessage({
          type: 'syncTests',
          tests: bundle.tests
        }, '*');
        console.log('[Packages] Sent syncTests to bundle modal catalog with', bundle.tests.length, 'tests');
        
        // Allow updates after sync completes
        setTimeout(() => {
          window._ignoreBundleCatalogUpdates = false;
          console.log('[Packages] Now accepting catalog updates');
        }, 400);
      }, 300);
    } else {
      window._ignoreBundleCatalogUpdates = false;
    }

    // Update save button to say "Update Bundle"
    const saveBtn = document.getElementById('saveBundleFromModal');
    if (saveBtn) {
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm3.5 5.5l-4 4a.5.5 0 01-.708 0l-2-2a.5.5 0 01.708-.708L7 10.293l3.646-3.647a.5.5 0 01.708.708z"/>
        </svg>
        Update Bundle
      `;
      saveBtn.onclick = function() {
        updateExistingBundle();
      };
    }
  }
}

function updateExistingBundle() {
  const bundleId = window._editingBundleId;
  const name = window._pendingBundleName;
  const tests = window._bundleCreationTests || [];

  if (!name) {
    if (typeof showToast === 'function') {
      showToast('Bundle name is required', 'error');
    }
    return;
  }

  if (tests.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Please select at least one test', 'error');
    }
    return;
  }

  const bundles = window._labBundles || [];
  const bundle = bundles.find(b => b.id === bundleId);
  
  if (bundle) {
    bundle.name = name;
    bundle.tests = tests.map(t => ({
      code: t.code || '',
      asnd: t.asnd || '',
      name: t.name || '',
      vinaviServiceId: t.vinaviServiceId || null
    }));

    saveBundles(bundles);
    window._labBundles = bundles;
    renderBundles();

    hideBundleModal();
    window._editingBundleId = null;
    window._pendingBundleName = '';
    window._bundleCreationTests = [];

    if (typeof showToast === 'function') {
      showToast(`Bundle "${name}" updated successfully!`, 'success');
    }

    // Reset save button
    const saveBtn = document.getElementById('saveBundleFromModal');
    if (saveBtn) {
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2v6l3-3m-3 3L5 5m3 3v6"/>
        </svg>
        Save Bundle
      `;
      saveBtn.onclick = saveCurrentBundle;
    }
  }
}

function applyBundle(bundle) {
  if (!bundle.tests.length) return;
  if (!window.currentEpisode) {
    alert('Select an episode first.');
    return;
  }
  
  // Map bundle tests to proper format
  const testsToApply = bundle.tests.map(t => ({
    code: t.code || '',
    asnd: t.asnd || '',
    name: t.name || '',
    vinaviServiceId: t.vinaviServiceId || t.id || null
  }));
  
  // Set a flag to temporarily ignore catalog messages (prevents race condition)
  window._applyingBundle = true;
  
  // Set the selected tests array
  window.selectedTests = testsToApply;
  
  // Update the cart/sidebar display
  if (typeof updateSelectedTestsDisplay === 'function') {
    updateSelectedTestsDisplay();
  }
  
  // CRITICAL: Sync with the lab catalog iframe so checkboxes are checked
  const catalogFrame = document.getElementById('labCatalogFrame');
  if (catalogFrame && catalogFrame.contentWindow) {
    try {
      catalogFrame.contentWindow.postMessage({
        type: 'syncTests',
        tests: testsToApply
      }, '*');
      console.log('[Bundle] Synced', testsToApply.length, 'tests to catalog iframe');
    } catch (err) {
      console.warn('[Bundle] Could not sync with catalog:', err);
    }
  }
  
  // Clear the flag after a short delay to allow sync to complete
  setTimeout(() => {
    window._applyingBundle = false;
    console.log('[Bundle] Apply complete, catalog sync enabled');
  }, 500);
  
  // Switch to lab order view
  if (typeof window._activateView === 'function') {
    window._activateView('labOrder');
  }
  
  // Show success toast
  if (typeof showToast === 'function') {
    showToast(`Applied bundle "${bundle.name}" with ${testsToApply.length} test(s)`, 'success');
  }
}

function openBuilder() {
  showBundleNameWizard();
}

function showBundleModal() {
  const modal = document.getElementById('bundleModal');
  if (modal) modal.classList.remove('hidden');
  
  updateBundleSidebar();
  
  const closeBtn = document.getElementById('closeBundleModal');
  const cancelBtn = document.getElementById('cancelBundleModal');
  const saveBtn = document.getElementById('saveBundleFromModal');
  const clearBtn = document.getElementById('clearBundleSelection');
  
  // Always re-wire close and cancel to use cancelBuilder (clears state properly)
  if (closeBtn) {
    closeBtn.onclick = cancelBuilder;
  }
  
  if (cancelBtn) {
    cancelBtn.onclick = cancelBuilder;
  }
  
  if (saveBtn && !saveBtn._wired) {
    saveBtn.addEventListener('click', saveCurrentBundle);
    saveBtn._wired = true;
  }
  
  if (clearBtn && !clearBtn._wired) {
    clearBtn.addEventListener('click', () => {
      window._bundleCreationTests = [];
      updateBundleSidebar();
      
      // Also clear the catalog selections
      const catalogFrame = document.getElementById('labCatalogFrameBundleModal');
      if (catalogFrame && catalogFrame.contentWindow) {
        catalogFrame.contentWindow.postMessage({
          type: 'clearSelection'
        }, '*');
      }
    });
    clearBtn._wired = true;
  }
}

function hideBundleModal() {
  const modal = document.getElementById('bundleModal');
  if (modal) modal.classList.add('hidden');
  
  // Don't reset state here - let cancel button handle it
  // This allows close button to work without losing data
}

function cancelBuilder() {
  hideBundleModal();
  window._pendingBundleName = '';
  window._bundleCreationTests = [];
  window._editingBundleId = null;
  window._ignoreBundleCatalogUpdates = false;
  
  // Clear catalog selections
  const catalogFrame = document.getElementById('labCatalogFrameBundleModal');
  if (catalogFrame && catalogFrame.contentWindow) {
    catalogFrame.contentWindow.postMessage({
      type: 'clearSelection'
    }, '*');
  }
  
  // Reset save button
  const saveBtn = document.getElementById('saveBundleFromModal');
  if (saveBtn) {
    saveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2v6l3-3m-3 3L5 5m3 3v6"/>
      </svg>
      Save Bundle
    `;
    saveBtn.onclick = saveCurrentBundle;
  }
}

function saveCurrentBundle() {
  const name = window._pendingBundleName;
  const tests = (window._bundleCreationTests || []);
  
  if (!name) {
    if (typeof showToast === 'function') {
      showToast('Bundle name is missing. Please restart the wizard.', 'error');
    } else {
      alert('Bundle name is missing. Please restart the wizard.');
    }
    return;
  }
  
  if (tests.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Please select at least one test from the catalog.', 'error');
    } else {
      alert('Please select at least one test from the catalog.');
    }
    return;
  }
  
  const bundles = window._labBundles || [];
  bundles.push({
    id: generateBundleId(),
    name,
    createdAt: Date.now(),
    tests: tests.map(t => ({
      code: t.code || '',
      asnd: t.asnd || '',
      name: t.name || '',
      vinaviServiceId: t.vinaviServiceId || null
    }))
  });
  
  window._labBundles = bundles;
  saveBundles(bundles);
  window._pendingBundleName = '';
  window._bundleCreationTests = [];
  
  hideBundleModal();
  renderBundles();
  
  if (typeof showToast === 'function') {
    showToast(`Bundle "${name}" saved with ${tests.length} test(s)!`, 'success');
  } else {
    alert(`Bundle "${name}" saved successfully!`);
  }
}

function updateBundleSidebar() {
  const countEl = document.getElementById('bundleSidebarCount');
  const bodyEl = document.getElementById('bundleSidebarBody');
  const tests = window._bundleCreationTests || [];
  
  if (countEl) {
    countEl.textContent = `${tests.length} test${tests.length !== 1 ? 's' : ''}`;
  }
  
  if (bodyEl) {
    if (tests.length === 0) {
      bodyEl.innerHTML = '<p class="sidebar-empty">No tests selected yet. Check tests from the catalog to add them.</p>';
    } else {
      bodyEl.innerHTML = tests.map((t, idx) => `
        <div class="sidebar-test-item" data-test-index="${idx}">
          <div class="sidebar-test-content">
            <div class="sidebar-test-name">${escapeHtml(t.name || t.code || 'Test')}</div>
            <div class="sidebar-test-meta">ASND: ${escapeHtml(t.asnd || 'N/A')} | ID: ${escapeHtml(String(t.vinaviServiceId || 'N/A'))}</div>
          </div>
          <button class="sidebar-test-remove" data-test-index="${idx}" title="Remove test">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      `).join('');
      
      // Add event listeners for remove buttons
      const removeButtons = bodyEl.querySelectorAll('.sidebar-test-remove');
      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const testIndex = parseInt(btn.getAttribute('data-test-index'), 10);
          removeTestFromBundleCreation(testIndex);
        });
      });
    }
  }
}

function removeTestFromBundleCreation(testIndex) {
  const tests = window._bundleCreationTests || [];
  if (testIndex >= 0 && testIndex < tests.length) {
    const removedTest = tests[testIndex];
    tests.splice(testIndex, 1);
    window._bundleCreationTests = tests;
    updateBundleSidebar();
    
    // Uncheck the test in the catalog
    const catalogFrame = document.getElementById('labCatalogFrameBundleModal');
    if (catalogFrame && catalogFrame.contentWindow) {
      catalogFrame.contentWindow.postMessage({
        type: 'uncheckTest',
        test: removedTest
      }, '*');
    }
    
    if (typeof showToast === 'function') {
      showToast('Test removed from bundle', 'success');
    }
  }
}

function initBundleUI() {
  window._labBundles = loadBundles();
  renderBundles();
  
  const openBtn = document.getElementById('openPackageBuilder');
  if (openBtn) openBtn.addEventListener('click', openBuilder);
  
  const grid = document.getElementById('packagesGrid');
  if (grid) grid.addEventListener('click', handleBundleGridClick);
  
  const viewAllBtn = document.getElementById('viewAllBundlesBtn');
  if (viewAllBtn) viewAllBtn.addEventListener('click', showBundlesListModal);
  
  const closeBundlesListBtn = document.getElementById('closeBundlesListModal');
  if (closeBundlesListBtn) closeBundlesListBtn.addEventListener('click', hideBundlesListModal);
  
  const bundlesModal = document.getElementById('bundlesListModal');
  if (bundlesModal) {
    bundlesModal.addEventListener('click', e => {
      if (e.target === bundlesModal) hideBundlesListModal();
    });
  }
  
  window.renderBundles = renderBundles;
}

function showBundlesListModal() {
  const modal = document.getElementById('bundlesListModal');
  if (modal) {
    renderBundles();
    modal.classList.remove('hidden');
  }
}

function hideBundlesListModal() {
  const modal = document.getElementById('bundlesListModal');
  if (modal) modal.classList.add('hidden');
}

function showBundleNameWizard() {
  const modal = document.getElementById('bundleNameWizard');
  const input = document.getElementById('bundleNameWizardInput');
  if (modal) {
    modal.classList.remove('hidden');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function hideBundleNameWizard() {
  const modal = document.getElementById('bundleNameWizard');
  if (modal) modal.classList.add('hidden');
}

function proceedToTestSelection() {
  const input = document.getElementById('bundleNameWizardInput');
  if (!input) return;
  
  const name = input.value.trim();
  if (!name) {
    if (typeof showToast === 'function') {
      showToast('Please enter a bundle name.', 'error');
    } else {
      alert('Please enter a bundle name.');
    }
    return;
  }
  
  window._pendingBundleName = name;
  hideBundleNameWizard();
  
  const titleSpan = document.getElementById('bundleModalTitle');
  if (titleSpan) titleSpan.textContent = name;
  
  window.selectedTests = [];
  if (typeof updateSelectedTestsDisplay === 'function') updateSelectedTestsDisplay();
  
  showBundleModal();
}

function initWizardEvents() {
  const closeBtn = document.getElementById('closeBundleNameWizard');
  const cancelBtn = document.getElementById('cancelBundleNameWizard');
  const nextBtn = document.getElementById('nextBundleNameWizard');
  const wizardInput = document.getElementById('bundleNameWizardInput');
  
  if (closeBtn) closeBtn.addEventListener('click', hideBundleNameWizard);
  if (cancelBtn) cancelBtn.addEventListener('click', hideBundleNameWizard);
  if (nextBtn) nextBtn.addEventListener('click', proceedToTestSelection);
  if (wizardInput) {
    wizardInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') proceedToTestSelection();
    });
  }
}

// Listen for test selection changes from the catalog iframe
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'testSelectionChanged') {
    // Only process from bundle modal catalog
    const bundleModalCatalog = document.getElementById('labCatalogFrameBundleModal');
    if (bundleModalCatalog && event.source === bundleModalCatalog.contentWindow) {
      // Ignore updates while syncing existing bundle
      if (window._ignoreBundleCatalogUpdates) {
        console.log('[Packages] Ignoring catalog update during sync');
        return;
      }
      
      // Update the bundle creation tests from catalog selection
      const newTests = event.data.selectedTests || [];
      window._bundleCreationTests = newTests.map(t => ({
        code: t.code || '',
        asnd: t.asnd || '',
        name: t.name || '',
        vinaviServiceId: t.vinaviServiceId || t.serviceId || null
      }));
      console.log('[Packages] Updated bundle tests from catalog:', window._bundleCreationTests.length);
      updateBundleSidebar();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initBundleUI();
  initWizardEvents();
  wireQuickActionButtons();
  wireExportImportButtons();
});

function wireQuickActionButtons() {
  // Wire up quick action buttons in the new hero section
  const quickCreateBtn = document.getElementById('quickCreateBundle');
  const quickViewBtn = document.getElementById('quickViewBundles');
  
  if (quickCreateBtn) {
    quickCreateBtn.addEventListener('click', () => {
      const openBtn = document.getElementById('openPackageBuilder');
      if (openBtn) openBtn.click();
    });
  }
  
  if (quickViewBtn) {
    quickViewBtn.addEventListener('click', () => {
      const viewBtn = document.getElementById('viewAllBundlesBtn');
      if (viewBtn) viewBtn.click();
    });
  }
}

// ========== EXPORT/IMPORT FUNCTIONS ==========

/**
 * Export all bundles to a JSON file
 */
function exportBundlesToJSON() {
  const bundles = window._labBundles || [];
  
  if (bundles.length === 0) {
    if (typeof showToast === 'function') {
      showToast('No bundles to export', 'warning');
    } else {
      alert('No bundles to export');
    }
    return;
  }
  
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    exportedFrom: 'HMH Lab Extension',
    bundleCount: bundles.length,
    bundles: bundles
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = `hmh-lab-bundles-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  if (typeof showToast === 'function') {
    showToast(`Exported ${bundles.length} bundle(s) to JSON file`, 'success');
  }
  
  console.log('[Packages] Exported', bundles.length, 'bundles to JSON');
}

/**
 * Import bundles from a JSON file
 */
function importBundlesFromJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // Validate import data
      let bundlesToImport = [];
      
      // Support both wrapped format (with version/bundleCount) and raw array
      if (importData.bundles && Array.isArray(importData.bundles)) {
        bundlesToImport = importData.bundles;
      } else if (Array.isArray(importData)) {
        bundlesToImport = importData;
      } else {
        throw new Error('Invalid bundle file format');
      }
      
      // Validate each bundle
      bundlesToImport = bundlesToImport.filter(b => {
        return b && typeof b.name === 'string' && Array.isArray(b.tests);
      });
      
      if (bundlesToImport.length === 0) {
        throw new Error('No valid bundles found in file');
      }
      
      // Show import options modal
      showImportOptionsModal(bundlesToImport);
      
    } catch (error) {
      console.error('[Packages] Import error:', error);
      if (typeof showToast === 'function') {
        showToast(`Import failed: ${error.message}`, 'error');
      } else {
        alert(`Import failed: ${error.message}`);
      }
    }
  };
  
  input.click();
}

/**
 * Show modal with import options (merge, replace, select)
 */
function showImportOptionsModal(bundlesToImport) {
  const existingBundles = window._labBundles || [];
  
  const overlay = document.createElement('div');
  overlay.className = 'bundle-picker-overlay';
  overlay.id = 'importOptionsOverlay';
  overlay.innerHTML = `
    <div class="bundle-picker-card" style="max-width: 600px;">
      <div class="bundle-picker-header">
        <h3>Import Bundles</h3>
        <button class="bundle-picker-close" aria-label="Close">&times;</button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px; padding: 16px; background: #f0f9ff; border-radius: 12px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">
            📦 Found ${bundlesToImport.length} bundle(s) in file
          </p>
          <p style="margin: 8px 0 0 0; color: #3b82f6; font-size: 14px;">
            ${bundlesToImport.map(b => b.name).join(', ')}
          </p>
        </div>
        
        ${existingBundles.length > 0 ? `
        <div style="margin-bottom: 20px; padding: 16px; background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">
            ⚠️ You have ${existingBundles.length} existing bundle(s)
          </p>
        </div>
        ` : ''}
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="importMerge" class="btn-create-bundle" style="width: 100%; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 4v12M4 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Merge (Add to existing bundles)
          </button>
          
          ${existingBundles.length > 0 ? `
          <button id="importReplace" class="btn-view-bundles" style="width: 100%; justify-content: center; background: #fee2e2; color: #991b1b; border-color: #fecaca;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4l12 12M16 4l-12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Replace (Delete existing and import)
          </button>
          ` : ''}
          
          <button id="importCancel" class="btn-view-bundles" style="width: 100%; justify-content: center;">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Wire up buttons
  const closeBtn = overlay.querySelector('.bundle-picker-close');
  const mergeBtn = overlay.querySelector('#importMerge');
  const replaceBtn = overlay.querySelector('#importReplace');
  const cancelBtn = overlay.querySelector('#importCancel');
  
  const closeModal = () => {
    overlay.remove();
  };
  
  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
  
  mergeBtn.onclick = () => {
    performImport(bundlesToImport, 'merge');
    closeModal();
  };
  
  if (replaceBtn) {
    replaceBtn.onclick = () => {
      if (confirm('This will delete all existing bundles. Are you sure?')) {
        performImport(bundlesToImport, 'replace');
        closeModal();
      }
    };
  }
}

/**
 * Actually perform the import
 */
function performImport(bundlesToImport, mode) {
  let bundles = mode === 'replace' ? [] : (window._labBundles || []);
  
  // Add new bundles with fresh IDs to avoid conflicts
  bundlesToImport.forEach(b => {
    const newBundle = {
      ...b,
      id: generateBundleId(), // Generate new ID to avoid conflicts
      importedAt: new Date().toISOString()
    };
    bundles.push(newBundle);
  });
  
  // Save and update
  saveBundles(bundles);
  window._labBundles = bundles;
  renderBundles();
  
  if (typeof showToast === 'function') {
    showToast(`Imported ${bundlesToImport.length} bundle(s) successfully!`, 'success');
  }
  
  console.log('[Packages] Imported', bundlesToImport.length, 'bundles (mode:', mode, ')');
}

/**
 * Wire up export/import buttons
 */
function wireExportImportButtons() {
  const exportBtn = document.getElementById('exportBundlesBtn');
  const importBtn = document.getElementById('importBundlesBtn');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportBundlesToJSON);
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', importBundlesFromJSON);
  }
}

// Expose functions globally for use from HTML buttons
window.exportBundlesToJSON = exportBundlesToJSON;
window.importBundlesFromJSON = importBundlesFromJSON;
