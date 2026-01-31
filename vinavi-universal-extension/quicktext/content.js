// Vinavi Quick Text - Universal Content Script
// Works on ANY website, ANY input field

(function() {
  'use strict';

  console.log('🚀 Vinavi Quick Text: Starting...');

  // Main template storage - populated from chrome.storage
  let TEMPLATES = {};
  let customTemplates = {};
  let activeElement = null;
  let currentPopup = null;
  let currentSuggestions = null;
  let lastShortcutInfo = null;

  function slugifyId(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'field';
  }

  // IMPORTANT: mainLabels templates previously used repeating ids like "field_0" per section.
  // That causes value collisions (HB/NS1 both read the same key). This makes a unique key per field.
  function makeMainLabelValueKey(mainLabelName, field, mainIndex, fieldIndex) {
    const rawId = field && typeof field.id === 'string' ? field.id : '';
    const isGenericId = /^field_\d+$/i.test(rawId);
    const base = (!isGenericId && rawId) ? rawId : (field?.label || field?.name || 'field');
    return `${slugifyId(mainLabelName)}__${slugifyId(base)}__${mainIndex}_${fieldIndex}`;
  }

  // ============ TEMPLATE LOADING ============
  
  function loadBuiltinTemplates() {
    // Built-in templates are now empty - all templates come from chrome.storage
    if (typeof VINAVI_TEMPLATES !== 'undefined' && Object.keys(VINAVI_TEMPLATES).length > 0) {
      TEMPLATES = { ...VINAVI_TEMPLATES };
      console.log('✓ Built-in templates loaded:', Object.keys(TEMPLATES).length);
      return true;
    }
    console.log('ℹ️ No built-in templates (user-created templates will be loaded from storage)');
    return true; // Return true to proceed with loading custom templates
  }

  async function loadCustomTemplates() {
    try {
      console.log('🔄 Loading custom templates from chrome.storage...');
      console.log('   chrome defined:', typeof chrome !== 'undefined');
      console.log('   chrome.storage defined:', typeof chrome !== 'undefined' && !!chrome.storage);
      console.log('   chrome.storage.local defined:', typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local);
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(['customTemplates']);
        console.log('📦 Storage result:', JSON.stringify(result, null, 2));
        
        if (result.customTemplates && Object.keys(result.customTemplates).length > 0) {
          customTemplates = result.customTemplates;
          console.log('📦 Found', Object.keys(customTemplates).length, 'custom templates:', Object.keys(customTemplates));
          
          for (const [key, template] of Object.entries(customTemplates)) {
            console.log('  Adding template with key:', key);
            
            // Validate template structure
            if (!template || typeof template !== 'object') {
              console.error('❌ Invalid template for key:', key);
              continue;
            }
            
            // Old structure: template.fields with format function
            if (template.fields && Array.isArray(template.fields)) {
              template.format = createFormatFunction(template);
              console.log('  ✓ Old structure (fields):', template.fields.length, 'fields');
            }
            // New structure: template.mainLabels
            else if (template.mainLabels && Array.isArray(template.mainLabels)) {
              console.log('  ✓ New structure (mainLabels):', template.mainLabels.length, 'main labels');
            } else {
              console.warn('  ⚠️ Unknown template structure for:', key);
            }
            
            TEMPLATES[key] = template;
            console.log('  ✓ TEMPLATES now has:', Object.keys(TEMPLATES).length, 'templates');
          }
          console.log('✓ Custom templates loaded. TEMPLATES keys:', Object.keys(TEMPLATES));
        } else {
          console.log('📦 No custom templates found in storage (storage is empty or has no customTemplates key)');
        }
      } else {
        console.log('⚠️ chrome.storage.local not available - extension context may not be ready');
      }
    } catch (e) {
      console.error('❌ Error loading custom templates:', e);
      console.error('   Error stack:', e.stack);
    }
  }

  function createFormatFunction(template) {
    return function(values) {
      let result = `${template.title.toUpperCase()}:\n`;
      template.fields.forEach(field => {
        const value = values[field.id];
        const hasValue = value !== undefined && value !== null && value !== '' && value !== false;

        if (field.type === 'checkbox') {
          if (value === true || value === 'true') {
            result += `• ${field.label}: Yes\n`;
          }
          return;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            result += `• ${field.label}: ${value.join(', ')}\n`;
          }
          return;
        }

        if (hasValue) {
          const displayValue = field.unit ? `${value} ${field.unit}` : value;
          if (String(displayValue).trim()) {
            result += `• ${field.label}: ${displayValue}\n`;
          }
        }
      });
      return result.trim();
    };
  }

  // ============ THEME SUPPORT ============
  let currentTheme = 'default';
  
  async function loadTheme() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['vinaviTheme']);
        if (result.vinaviTheme) {
          currentTheme = result.vinaviTheme;
          console.log('🎨 Theme loaded:', currentTheme);
        }
      }
    } catch (e) {
      console.log('Could not load theme:', e);
    }
  }
  
  // Load theme on start
  loadTheme();
  
  // Listen for theme changes
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.vinaviTheme) {
        currentTheme = changes.vinaviTheme.newValue || 'default';
        console.log('🎨 Theme changed to:', currentTheme);
      }
    });
  }

  // Initialize templates - always load custom templates
  loadBuiltinTemplates(); // Load any built-in templates first
  
  // Load custom templates immediately and also with retries
  (async function initTemplates() {
    await loadCustomTemplates();
    console.log('📋 After initial load, TEMPLATES:', Object.keys(TEMPLATES));
    
    // Retry after delays to handle any race conditions
    setTimeout(async () => {
      await loadCustomTemplates();
      console.log('🔄 After 500ms retry, TEMPLATES:', Object.keys(TEMPLATES));
    }, 500);
    
    setTimeout(async () => {
      await loadCustomTemplates();
      console.log('🔄 After 1500ms retry, TEMPLATES:', Object.keys(TEMPLATES));
    }, 1500);
  })();

  // Listen for template updates
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.customTemplates) {
        console.log('🔄 Templates changed in storage, reloading...');
        loadCustomTemplates();
      }
    });
  }
  
  // Utility: Clean corrupted templates
  async function cleanCorruptedTemplates() {
    try {
      const result = await chrome.storage.local.get(['customTemplates']);
      if (result.customTemplates) {
        const cleaned = {};
        let removedCount = 0;
        
        for (const [key, template] of Object.entries(result.customTemplates)) {
          // Validate: must have either fields or mainLabels
          if (template && (
            (template.fields && Array.isArray(template.fields)) ||
            (template.mainLabels && Array.isArray(template.mainLabels))
          )) {
            cleaned[key] = template;
          } else {
            console.warn('🗑️ Removing corrupted template:', key);
            removedCount++;
          }
        }
        
        if (removedCount > 0) {
          await chrome.storage.local.set({ customTemplates: cleaned });
          console.log('✓ Cleaned', removedCount, 'corrupted templates');
          loadCustomTemplates();
        }
      }
    } catch (e) {
      console.error('Error cleaning templates:', e);
    }
  }
  
  // Run cleanup on load
  setTimeout(() => cleanCorruptedTemplates(), 1000);

  // ============ UNIVERSAL INPUT DETECTION ============

  // Get text from ANY element
  function getText(el) {
    if (!el) return '';
    if (el.isContentEditable || el.contentEditable === 'true') {
      return el.innerText || el.textContent || '';
    }
    if (el.value !== undefined) {
      return el.value;
    }
    return el.innerText || el.textContent || '';
  }

  // Set text in ANY element - SIMPLIFIED for Angular Material
  async function setText(el, text) {
    if (!el) {
      console.error('❌ setText: No element provided');
      return false;
    }

    // Resolve wrapper elements to an actual input/textarea when possible
    const resolved = findInputElement(el);
    if (resolved) {
      el = resolved;
    }
    
    console.log('📝 setText called');
    console.log('   Element:', el.tagName, el.type || '', el.className?.substring(0, 50));
    console.log('   Text to insert (length):', text.length);
    console.log('   Text preview:', text.substring(0, 100));
    
    try {
      // Focus the element
      el.focus();
      el.click(); // Some frameworks need click event
      
      // For TEXTAREA or INPUT
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        console.log('   Method 1: Trying execCommand (insertText)...');
        
        // Select all existing content first
        el.select();
        
        // Try execCommand - simulates user typing
        let success = document.execCommand('insertText', false, text);
        console.log('   execCommand result:', success);
        
        if (!success || el.value !== text) {
          console.log('   Method 2: Direct value assignment with events...');
          
          // Get native value setter to bypass framework interceptors
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 
            'value'
          )?.set;
          const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 
            'value'
          )?.set;
          
          const setter = el.tagName === 'TEXTAREA' ? nativeTextAreaValueSetter : nativeInputValueSetter;
          
          if (setter) {
            setter.call(el, text);
            console.log('   Native setter used');
          } else {
            el.value = text;
            console.log('   Direct value assignment');
          }
          
          // Fire comprehensive event sequence for Angular
          const events = [
            new Event('input', { bubbles: true, cancelable: true, composed: true }),
            new InputEvent('input', { 
              bubbles: true, 
              cancelable: true, 
              composed: true,
              inputType: 'insertText',
              data: text 
            }),
            new Event('change', { bubbles: true, cancelable: true }),
            new Event('blur', { bubbles: true }),
          ];
          
          events.forEach(event => {
            el.dispatchEvent(event);
            console.log('   Dispatched:', event.type);
          });
          
          // Force Angular change detection with blur/focus cycle
          el.blur();
          await new Promise(resolve => setTimeout(resolve, 50));
          el.focus();
        }
        
        // Final verification
        let finalValue = el.value;
        console.log('   Final value matches:', finalValue === text);
        console.log('   Final value length:', finalValue.length, 'expected:', text.length);
        
        if (finalValue !== text) {
          console.warn('   ⚠️ Value mismatch detected!');
          console.log('   Expected:', text.substring(0, 50));
          console.log('   Got:', finalValue.substring(0, 50));
          
          // Last resort: Force value and trigger more events
          try {
            const nativeSetter = (el.tagName === 'TEXTAREA'
              ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
              : Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set);
            if (nativeSetter) nativeSetter.call(el, text);
            else el.value = text;
          } catch (_) {
            el.value = text;
          }
          el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
          el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          finalValue = el.value;
        }

        return finalValue === text;
      }
      
      // For contenteditable
      if (el.isContentEditable || el.contentEditable === 'true') {
        console.log('   Using contenteditable method');
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
        const after = getText(el);
        return after === text || after.includes(text.substring(0, Math.min(20, text.length)));
      }
      
      // Fallback
      console.log('   Using fallback method');
      el.value = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return getText(el) === text;
      
    } catch (error) {
      console.error('❌ setText error:', error);
      return false;
    }
  }

  // Get cursor position from ANY element
  function getCursorPos(el) {
    if (!el) return 0;
    
    // For input/textarea
    if (el.selectionStart !== undefined) {
      return el.selectionStart;
    }
    
    // For contenteditable
    try {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        return preRange.toString().length;
      }
    } catch (e) {}
    
    // Fallback: return end of text
    return getText(el).length;
  }

  // Check if element can receive text input
  function isInputElement(el) {
    if (!el || !el.tagName) return false;
    
    const tag = el.tagName.toLowerCase();
    
    // Standard inputs
    if (tag === 'textarea') return true;
    if (tag === 'input') {
      const type = (el.type || 'text').toLowerCase();
      return ['text', 'search', 'url', 'tel', 'email', 'password', 'number'].includes(type);
    }
    
    // Contenteditable elements
    if (el.isContentEditable) return true;
    if (el.contentEditable === 'true') return true;
    
    // Role-based detection (some frameworks put role="textbox" on wrapper DIVs)
    if (el.getAttribute('role') === 'textbox') {
      if (el.isContentEditable || el.contentEditable === 'true') return true;
      return false;
    }
    
    // Check parent for contenteditable
    let parent = el.parentElement;
    while (parent) {
      if (parent.isContentEditable || parent.contentEditable === 'true') return true;
      parent = parent.parentElement;
    }
    
    return false;
  }

  // Find the actual input element (might be nested)
  function findInputElement(el) {
    if (!el) return null;

    // If role=textbox is on a wrapper element, prefer the real input/textarea inside it.
    if (el.getAttribute && el.getAttribute('role') === 'textbox' &&
        el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' &&
        !(el.isContentEditable || el.contentEditable === 'true')) {
      const inner = el.querySelector && el.querySelector('textarea, input');
      if (inner) return inner;
    }
    
    // Check self first
    if (isInputElement(el)) return el;
    
    // Check children
    const direct = el.querySelectorAll('textarea, input, [contenteditable="true"]');
    if (direct.length > 0) return direct[0];

    // As a last resort, consider role=textbox descendants, but resolve them to inner inputs if needed.
    const roleTextboxes = el.querySelectorAll('[role="textbox"]');
    for (let i = 0; i < roleTextboxes.length; i++) {
      const candidate = roleTextboxes[i];
      if (candidate.tagName === 'INPUT' || candidate.tagName === 'TEXTAREA') return candidate;
      if (candidate.isContentEditable || candidate.contentEditable === 'true') return candidate;
      const inner = candidate.querySelector && candidate.querySelector('textarea, input');
      if (inner) return inner;
    }
    
    // Check parent
    let parent = el.parentElement;
    while (parent) {
      if (parent.getAttribute && parent.getAttribute('role') === 'textbox' &&
          parent.tagName !== 'INPUT' && parent.tagName !== 'TEXTAREA' &&
          !(parent.isContentEditable || parent.contentEditable === 'true')) {
        const inner = parent.querySelector && parent.querySelector('textarea, input');
        if (inner) return inner;
      }
      if (isInputElement(parent)) return parent;
      parent = parent.parentElement;
    }
    
    return null;
  }

  // ============ SHORTCUT DETECTION ============

  function findShortcut(text, cursorPos) {
    const beforeCursor = text.substring(0, cursorPos);
    const match = beforeCursor.match(/\/([a-zA-Z0-9]*)$/);
    
    if (match) {
      return {
        full: match[0],
        shortcut: match[0].toLowerCase(),
        start: beforeCursor.length - match[0].length,
        end: cursorPos
      };
    }
    return null;
  }

  function findMatches(shortcut) {
    const matches = [];
    // Normalize the search term (remove leading slash if present)
    let searchTerm = shortcut.toLowerCase();
    if (searchTerm.startsWith('/')) {
      searchTerm = searchTerm.substring(1);
    }
    
    console.log('🔎 Finding matches for:', searchTerm, '| Available keys:', Object.keys(TEMPLATES));
    
    for (const [key, template] of Object.entries(TEMPLATES)) {
      // Normalize the key (remove leading slash if present)
      let keyNormalized = key.toLowerCase();
      if (keyNormalized.startsWith('/')) {
        keyNormalized = keyNormalized.substring(1);
      }
      
      // Match if key starts with search term, or contains it
      if (keyNormalized.startsWith(searchTerm) || keyNormalized.includes(searchTerm)) {
        console.log('  ✓ Match found:', key);
        matches.push({ key, template });
      }
    }
    
    return matches;
  }

  // ============ UI - SUGGESTIONS DROPDOWN ============

  function showSuggestions(element, matches, shortcutInfo) {
    hideSuggestions();
    
    if (matches.length === 0) return;
    
    lastShortcutInfo = shortcutInfo;
    activeElement = element;
    
    const rect = element.getBoundingClientRect();
    
    const container = document.createElement('div');
    container.className = 'vinavi-suggestions';
    container.setAttribute('data-vinavi', 'true');
    
    // Apply theme to suggestions
    if (currentTheme && currentTheme !== 'default') {
      container.setAttribute('data-theme', currentTheme);
    }
    
    let html = '<div class="vinavi-suggestions-header">⚡ Quick Templates</div>';
    
    matches.forEach((m, i) => {
      html += `
        <div class="vinavi-suggestion-item ${i === 0 ? 'selected' : ''}" data-key="${m.key}">
          <span class="vinavi-suggestion-icon">${m.template.icon || '📋'}</span>
          <div class="vinavi-suggestion-text">
            <div class="vinavi-suggestion-title">${m.template.title}</div>
            <div class="vinavi-suggestion-shortcut">${m.key}</div>
          </div>
          <span class="vinavi-suggestion-kbd">↵</span>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Position it
    container.style.cssText = `
      position: fixed !important;
      left: ${rect.left}px !important;
      top: ${rect.bottom + 5}px !important;
      z-index: 2147483647 !important;
    `;
    
    // Add click handlers
    container.querySelectorAll('.vinavi-suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectTemplate(item.dataset.key);
      });
      item.addEventListener('mouseenter', () => {
        container.querySelectorAll('.vinavi-suggestion-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
    
    document.body.appendChild(container);
    currentSuggestions = container;
    
    // Adjust position if off-screen
    setTimeout(() => {
      const r = container.getBoundingClientRect();
      if (r.right > window.innerWidth) {
        container.style.left = (window.innerWidth - r.width - 10) + 'px';
      }
      if (r.bottom > window.innerHeight) {
        container.style.top = (rect.top - r.height - 5) + 'px';
      }
    }, 0);
    
    console.log('📋 Showing', matches.length, 'suggestions for:', shortcutInfo.shortcut);
  }

  function hideSuggestions() {
    if (currentSuggestions) {
      currentSuggestions.remove();
      currentSuggestions = null;
    }
  }

  function selectTemplate(key) {
    hideSuggestions();
    const template = TEMPLATES[key];
    console.log('🎯 Selecting template:', key);
    console.log('   Template data:', JSON.stringify(template, null, 2));
    console.log('   Active element at selection:', activeElement);
    
    // CRITICAL: Store backup of activeElement before popup opens
    const savedActiveElement = activeElement;
    const savedShortcutInfo = lastShortcutInfo ? { ...lastShortcutInfo } : null;
    
    if (!template) {
      console.error('❌ Template not found:', key);
      showToast('⚠️ Template not found');
      return;
    }
    
    if (typeof template !== 'object') {
      console.error('❌ Template is not an object:', key, typeof template);
      showToast('⚠️ Invalid template');
      return;
    }
    
    // Restore in case they were lost
    if (!activeElement && savedActiveElement) {
      activeElement = savedActiveElement;
      console.log('   Restored activeElement from backup');
    }
    if (!lastShortcutInfo && savedShortcutInfo) {
      lastShortcutInfo = savedShortcutInfo;
      console.log('   Restored lastShortcutInfo from backup');
    }
    
    showPopup(template, key);
  }

  // ============ UI - POPUP FORM ============

  function showPopup(template, key) {
    try {
      closePopup();
      
      console.log('🎨 Showing popup for template:', key);
      console.log('   Template object:', template);
      console.log('   Has mainLabels:', 'mainLabels' in template);
      console.log('   mainLabels value:', template.mainLabels);
      console.log('   mainLabels type:', typeof template.mainLabels);
      console.log('   mainLabels is array:', Array.isArray(template.mainLabels));
      
      // Validate template
      if (!template || typeof template !== 'object') {
        console.error('❌ Invalid template:', key, template);
        showToast('⚠️ Error loading template');
        return;
      }
      
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'vinavi-popup-overlay';
      overlay.setAttribute('data-vinavi', 'true');
      overlay.addEventListener('click', closePopup);
      
      // Popup
      const popup = document.createElement('div');
      popup.className = 'vinavi-popup';
      popup.setAttribute('data-vinavi', 'true');
      
      // Apply theme
      if (currentTheme && currentTheme !== 'default') {
        popup.setAttribute('data-theme', currentTheme);
      }
      
      let fieldsHtml = '';
      let hasRenderedFields = false;
      
      // Handle new mainLabels structure OR old fields structure
      if (template.mainLabels !== undefined && template.mainLabels !== null) {
        console.log('📊 Processing mainLabels...');
        
        // Ensure it's an array
        if (!Array.isArray(template.mainLabels)) {
          console.error('❌ mainLabels is not an array:', typeof template.mainLabels, template.mainLabels);
          showToast('⚠️ Template structure error');
          return;
        }
        
        if (template.mainLabels.length === 0) {
          console.warn('⚠️ mainLabels array is empty');
        } else {
          // New structure: mainLabels → subLabels
          console.log('  Rendering', template.mainLabels.length, 'main labels');
          
          // Check if using column layout
          const useColumnLayout = template.layout === 'columns-2' || template.layout === 'columns-3';
          
          for (let idx = 0; idx < template.mainLabels.length; idx++) {
            const mainLabel = template.mainLabels[idx];
            console.log('    Main label', idx, ':', mainLabel);
            
            if (!mainLabel || typeof mainLabel !== 'object') {
              console.warn('    ⚠️ Skipping invalid main label at index', idx);
              continue;
            }
            
            if (!mainLabel.name) {
              console.warn('    ⚠️ Main label has no name');
              continue;
            }
            
            // Start section container for column layouts
            if (useColumnLayout) {
              fieldsHtml += `<div class="vinavi-mainlabel-section">`;
            }
            
            // Main label header
            fieldsHtml += `
              <div class="vinavi-mainlabel-header">
                <span class="vinavi-mainlabel-text">${mainLabel.name}</span>
              </div>
            `;
            
            // Fields container
            if (useColumnLayout) {
              fieldsHtml += `<div class="vinavi-mainlabel-fields">`;
            }
            
            // Render each sub label as a field
            if (mainLabel.subLabels && Array.isArray(mainLabel.subLabels) && mainLabel.subLabels.length > 0) {
              console.log('      Rendering', mainLabel.subLabels.length, 'sub labels');
              for (let i = 0; i < mainLabel.subLabels.length; i++) {
                const field = mainLabel.subLabels[i];
                const fieldId = makeMainLabelValueKey(mainLabel.name, field, idx, i);
                fieldsHtml += renderField(field, { fieldId });
                hasRenderedFields = true;
              }
            } else {
              console.warn('      ⚠️ No sub labels for main label:', mainLabel.name);
            }
            
            // Close containers
            if (useColumnLayout) {
              fieldsHtml += `</div></div>`; // Close vinavi-mainlabel-fields and vinavi-mainlabel-section
            }
          }
        }
      } else if (template.fields && Array.isArray(template.fields)) {
        // Old structure: fields array with optional subLabel grouping
        console.log('  Rendering old structure with', template.fields.length, 'fields');
        const grouped = {};
        const noSubLabel = [];
        
        for (let i = 0; i < template.fields.length; i++) {
          const field = template.fields[i];
          if (field.subLabel) {
            if (!grouped[field.subLabel]) {
              grouped[field.subLabel] = [];
            }
            grouped[field.subLabel].push(field);
          } else {
            noSubLabel.push(field);
          }
        }
        
        // Render fields without subLabel first
        const allFields = [...noSubLabel];
        
        // Then add grouped fields with headers
        Object.keys(grouped).forEach(subLabel => {
          allFields.push({ isSubLabel: true, text: subLabel });
          allFields.push(...grouped[subLabel]);
        });
        
        for (let i = 0; i < allFields.length; i++) {
          const field = allFields[i];
          // Render sub label as section header
          if (field.isSubLabel) {
            fieldsHtml += `
              <div class="vinavi-sublabel-header">
                <span class="vinavi-sublabel-text">${field.text}</span>
              </div>
            `;
          } else {
            fieldsHtml += renderField(field);
            hasRenderedFields = true;
          }
        }
      } else {
        // No valid template structure
        console.error('❌ Template has no valid fields or mainLabels:', template);
        fieldsHtml = '<div style="padding: 20px; text-align: center; color: #ef4444;">⚠️ Template structure error. Please recreate this template.</div>';
      }
      
      if (!hasRenderedFields && !fieldsHtml.includes('error')) {
        console.warn('⚠️ No fields rendered for template');
        fieldsHtml = '<div style="padding: 20px; text-align: center; color: #64748b;">No fields configured</div>';
      }
      
      // Determine layout class
      const layout = template.layout || 'single';
      const popupWidth = template.popupWidth || 'normal';
      let layoutClass = '';
      if (layout === 'columns-2') layoutClass = 'vinavi-layout-2col';
      if (layout === 'columns-3') layoutClass = 'vinavi-layout-3col';
      
      // Determine popup width
      let popupMinWidth = '700px';
      let popupMaxWidth = '850px';
      if (popupWidth === 'wide') {
        popupMinWidth = '900px';
        popupMaxWidth = '1000px';
      } else if (popupWidth === 'extra-wide') {
        popupMinWidth = '1100px';
        popupMaxWidth = '1200px';
      }
      
      popup.innerHTML = `
      <div class="vinavi-popup-header">
        <span class="vinavi-popup-icon">${template.icon}</span>
        <span class="vinavi-popup-title">${template.title}</span>
        <button class="vinavi-popup-close">×</button>
      </div>
      <div class="vinavi-popup-body">
        <div class="vinavi-fields-grid ${layoutClass}">${fieldsHtml}</div>
      </div>
      <div class="vinavi-popup-footer">
        <button class="vinavi-btn vinavi-btn-secondary" id="vinavi-cancel">Cancel</button>
        <button class="vinavi-btn vinavi-btn-primary" id="vinavi-insert">Apply</button>
      </div>
    `;
    
    popup.style.cssText = `
      position: fixed !important;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 2147483647 !important;
      min-width: ${popupMinWidth} !important;
      max-width: ${popupMaxWidth} !important;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    currentPopup = { popup, overlay, template, key };
    
    // Event listeners
    popup.querySelector('.vinavi-popup-close').addEventListener('click', closePopup);
    popup.querySelector('#vinavi-cancel').addEventListener('click', closePopup);
    popup.querySelector('#vinavi-insert').addEventListener('click', insertText);
    
    // Medication option button click handlers
    popup.querySelectorAll('.vinavi-med-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const container = btn.closest('.vinavi-med-options');
        const hiddenInput = container.nextElementSibling;
        
        // Remove selected from all buttons in this group
        container.querySelectorAll('.vinavi-med-option').forEach(b => b.classList.remove('selected'));
        
        // Add selected to clicked button
        btn.classList.add('selected');
        
        // Update hidden input value
        if (hiddenInput && hiddenInput.classList.contains('vinavi-med-value')) {
          hiddenInput.value = btn.dataset.value;
        }
      });
    });
    
    // Focus first field
    const firstField = popup.querySelector('select, input');
    if (firstField) firstField.focus();
    
    // Enter to submit
    popup.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        insertText();
      }
      if (e.key === 'Escape') closePopup();
    });
    
    } catch (error) {
      console.error('❌ Error in showPopup:', error);
      console.error('   Stack:', error.stack);
      showToast('⚠️ Error showing template popup');
      closePopup();
    }
  }
  
  // Helper function to render a field
  function renderField(field, ctx) {
    console.log('    renderField called with:', field);
    let html = '';
    const width = field.width || 'half';
    const widthClass = width === 'full' ? 'vinavi-field-full' : '';
    const fieldId = (ctx && ctx.fieldId) ? ctx.fieldId : (field.id || field.label.replace(/\s+/g, '-').toLowerCase());
    
    if (field.type === 'select' || field.type === 'medication') {
      console.log('      Rendering select/medication with options:', field.options);
      if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
        console.warn('      ⚠️ No options for select/medication field!');
        html = `
          <div class="vinavi-field-group ${widthClass}">
            <label class="vinavi-field-label">${field.type === 'medication' ? '💊 Select Dosage' : field.label}</label>
            <div style="padding: 10px; background: #fee2e2; border-radius: 8px; color: #b91c1c;">No options configured</div>
          </div>
        `;
        return html;
      }
      
      // Medication type: render as vertical clickable buttons
      if (field.type === 'medication') {
        const buttonsHtml = field.options.map((opt, idx) => `
          <button type="button" class="vinavi-med-option ${idx === 0 ? 'selected' : ''}" data-value="${opt}">
            <span class="vinavi-med-radio"></span>
            <span class="vinavi-med-text">${opt}</span>
          </button>
        `).join('');
        html = `
          <div class="vinavi-field-group vinavi-field-full">
            <label class="vinavi-field-label">💊 Select Dosage</label>
            <div class="vinavi-med-options" data-id="${fieldId}">${buttonsHtml}</div>
            <input type="hidden" class="vinavi-med-value" data-id="${fieldId}" value="${field.options[0] || ''}">
          </div>
        `;
        return html;
      }
      
      const opts = field.options.map(o => 
        `<option value="${o}" ${o === field.default ? 'selected' : ''}>${o}</option>`
      ).join('');
      const label = field.label;
      html = `
        <div class="vinavi-field-group ${widthClass}">
          <label class="vinavi-field-label">${label}</label>
          <select class="vinavi-field-select" data-id="${fieldId}">${opts}</select>
        </div>
      `;
    } else if (field.type === 'multiselect') {
      const optionsHtml = field.options.map((opt, idx) => `
        <label class="vinavi-multiselect-option">
          <input type="checkbox" class="vinavi-multiselect-checkbox" data-id="${fieldId}" data-value="${opt}">
          <span class="vinavi-multiselect-label">${opt}</span>
        </label>
      `).join('');
      html = `
        <div class="vinavi-field-group ${widthClass}">
          <label class="vinavi-field-label">${field.label}</label>
          <div class="vinavi-multiselect-container">${optionsHtml}</div>
        </div>
      `;
    } else if (field.type === 'advice') {
      const optionsHtml = (field.options || []).map((opt) => `
        <label class="vinavi-multiselect-option">
          <input type="checkbox" class="vinavi-multiselect-checkbox" data-id="${fieldId}" data-value="${opt}">
          <span class="vinavi-multiselect-label">${opt}</span>
        </label>
      `).join('');
      html = `
        <div class="vinavi-field-group vinavi-field-full">
          <label class="vinavi-field-label">${field.label}</label>
          <div class="vinavi-multiselect-container">${optionsHtml}</div>
        </div>
      `;
    } else if (field.type === 'number') {
      html = `
        <div class="vinavi-field-group ${widthClass}">
          <label class="vinavi-field-label">${field.label}</label>
          <div class="vinavi-number-wrapper">
            <input type="text" inputmode="decimal" class="vinavi-field-input" data-id="${fieldId}" 
                   placeholder="${field.placeholder || ''}" value="${field.default || ''}">
            ${field.unit ? `<span class="vinavi-number-unit">${field.unit}</span>` : ''}
          </div>
        </div>
      `;
    } else if (field.type === 'text') {
      if (width === 'full') {
        html = `
          <div class="vinavi-field-group ${widthClass}">
            <label class="vinavi-field-label">${field.label}</label>
            <textarea class="vinavi-field-textarea" data-id="${fieldId}" 
                      placeholder="${field.placeholder || ''}">${field.default || ''}</textarea>
          </div>
        `;
      } else {
        html = `
          <div class="vinavi-field-group ${widthClass}">
            <label class="vinavi-field-label">${field.label}</label>
            <input type="text" class="vinavi-field-input" data-id="${fieldId}" 
                   placeholder="${field.placeholder || ''}" value="${field.default || ''}">
          </div>
        `;
      }
    } else if (field.type === 'checkbox') {
      html = `
        <div class="vinavi-field-group">
          <label class="vinavi-checkbox-wrapper">
            <input type="checkbox" class="vinavi-checkbox" data-id="${fieldId}" ${field.default ? 'checked' : ''}>
            <span class="vinavi-checkbox-label">${field.label}</span>
          </label>
        </div>
      `;
    }
    
    return html;
  }

  function closePopup() {
    if (currentPopup) {
      currentPopup.popup.remove();
      currentPopup.overlay.remove();
      currentPopup = null;
    }
  }

  async function insertText() {
    if (!currentPopup) {
      console.error('❌ insertText: No popup');
      return;
    }
    
    // CRITICAL: Validate activeElement
    if (!activeElement) {
      console.error('❌ insertText: No activeElement! Trying to recover...');
      // Try to find the focused element or last active element
      const focusedEl = document.activeElement;
      if (focusedEl && isInputElement(focusedEl)) {
        activeElement = focusedEl;
        console.log('   Recovered from document.activeElement');
      } else {
        // Try to find any visible input/textarea in the page
        const inputs = document.querySelectorAll('textarea:not([data-vinavi]), input[type="text"]:not([data-vinavi]), [contenteditable="true"]:not([data-vinavi])');
        for (let i = 0; i < inputs.length; i++) {
          const rect = inputs[i].getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            activeElement = inputs[i];
            console.log('   Recovered first visible input:', activeElement);
            break;
          }
        }
      }
      
      if (!activeElement) {
        showToast('⚠️ Could not find input field');
        closePopup();
        return;
      }
    }
    
    console.log('📝 insertText: Active element is:', activeElement.tagName, activeElement.className);
    
    const { template } = currentPopup;
    const values = {};
    
    console.log('📝 Inserting text for template:', template);
    console.log('   Active element:', activeElement);
    
    // Gather values from all fields
    currentPopup.popup.querySelectorAll('[data-id]').forEach(el => {
      const fieldId = el.dataset.id;
      
      // Skip medication option buttons (we use the hidden input instead)
      if (el.classList.contains('vinavi-med-option') || el.classList.contains('vinavi-med-options')) {
        return;
      }
      
      if (el.classList.contains('vinavi-multiselect-checkbox')) {
        // For multi-select, collect all checked values
        if (!Array.isArray(values[fieldId])) values[fieldId] = [];
        if (el.checked) {
          values[fieldId].push(el.dataset.value);
        }
      } else if (el.classList.contains('vinavi-med-value')) {
        // Medication hidden input - just get the value
        values[fieldId] = el.value;
      } else {
        values[fieldId] = el.type === 'checkbox' ? el.checked : el.value;
      }
    });
    
    console.log('   Collected values:', values);
    
    // Format text based on template structure
    let formatted = '';
    if (template.format && typeof template.format === 'function') {
      // Old structure with custom format function
      console.log('   Using format function');
      formatted = template.format(values);
    } else if (template.mainLabels && Array.isArray(template.mainLabels)) {
      // New structure with mainLabels
      console.log('   Using mainLabels structure');
      const lines = [];
      template.mainLabels.forEach((mainLabel, mainIndex) => {
        if (!mainLabel || !mainLabel.name) return;
        
        const sectionLines = [];
        let hasAnyContent = false;
        let hasNonAdviceContent = false;
        const adviceLabels = new Set();

        if (mainLabel.subLabels && Array.isArray(mainLabel.subLabels)) {
          mainLabel.subLabels.forEach((field, fieldIndex) => {
            if (!field || !field.label) return;

            const fieldId = makeMainLabelValueKey(mainLabel.name, field, mainIndex, fieldIndex);
            const value = values[fieldId];

            console.log(`     Field ${field.label} (${fieldId}):`, value, 'type:', typeof value, 'isArray:', Array.isArray(value));

            if (value === undefined || value === '' || value === false) return;

            if (field.type === 'medication') {
              if (value && String(value).trim()) {
                hasAnyContent = true;
                sectionLines.push(String(value).trim());
              }
              return;
            }

            if (field.type === 'advice') {
              adviceLabels.add(String(field.label || '').trim());
              const arr = Array.isArray(value) ? value : [value];
              const selected = arr.map(v => String(v || '').trim()).filter(Boolean);
              if (selected.length > 0) {
                hasAnyContent = true;
                selected.forEach(item => {
                  const parts = String(item).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                  if (parts.length === 0) return;
                  sectionLines.push(`  • ${parts[0]}`);
                  for (let i = 1; i < parts.length; i++) {
                    sectionLines.push(`    ${parts[i]}`);
                  }
                });
              }
              return;
            }

            if (Array.isArray(value)) {
              console.log('     Multi-select array:', value);
              const selected = value.map(v => String(v || '').trim()).filter(Boolean);
              if (selected.length > 0) {
                hasAnyContent = true;
                hasNonAdviceContent = true;
                sectionLines.push(`  ${field.label}: ${selected.join(', ')}`);
              }
              return;
            }

            if (field.type === 'checkbox') {
              if (value === true || value === 'true') {
                hasAnyContent = true;
                hasNonAdviceContent = true;
                sectionLines.push(`  ${field.label}: Yes`);
              }
              return;
            }

            // Text, number, select
            const displayValue = (field.type === 'number' && field.unit) ? `${value} ${field.unit}` : value;
            if (displayValue && String(displayValue).trim()) {
              hasAnyContent = true;
              hasNonAdviceContent = true;
              sectionLines.push(`  ${field.label}: ${String(displayValue).trim()}`);
            }
          });
        }

        // Defensive: remove any old-style advice headers like "hydration:" if they slip in
        if (adviceLabels.size > 0) {
          for (let i = sectionLines.length - 1; i >= 0; i--) {
            const trimmed = String(sectionLines[i] || '').trim();
            for (const label of adviceLabels) {
              if (label && trimmed === label + ':') {
                sectionLines.splice(i, 1);
                break;
              }
            }
          }
        }

        if (!hasAnyContent) {
          return; // skip header and any blank line
        }

        // Only print main label header when non-advice content was actually emitted
        if (hasNonAdviceContent) {
          lines.push(mainLabel.name + ':');
        }

        lines.push(...sectionLines);
        lines.push(''); // Blank line between printed main labels
      });
      formatted = lines.join('\n').trim();
    } else {
      console.error('❌ No valid format method or mainLabels found');
      formatted = 'Error: Invalid template structure';
    }
    
    console.log('   Formatted text:', formatted);
    console.log('   Formatted text length:', formatted.length);
    
    // Check if we have any text to insert
    if (!formatted || formatted.trim().length === 0) {
      console.error('❌ No text to insert! Formatted text is empty.');
      showToast('⚠️ No values filled in');
      closePopup();
      return;
    }
    
    // Focus the element first
    activeElement.focus();
    
    const currentText = getText(activeElement);
    console.log('   Current text:', currentText);
    console.log('   Current text length:', currentText.length);
    
    let newText;
    if (lastShortcutInfo && lastShortcutInfo.start !== undefined) {
      console.log('   Replacing shortcut from', lastShortcutInfo.start, 'to', lastShortcutInfo.end);
      newText = currentText.substring(0, lastShortcutInfo.start) + 
                formatted + 
                currentText.substring(lastShortcutInfo.end);
    } else {
      console.log('   No shortcut info, replacing all or appending');
      // If current text is just the shortcut or empty, just use formatted
      if (currentText.match(/^\/\w+$/)) {
        newText = formatted;
      } else {
        newText = currentText + '\n' + formatted;
      }
    }
    
    console.log('   New text to insert:', newText);
    console.log('   New text length:', newText.length);
    
    // Store reference before closing popup (resolve to actual input/textarea if needed)
    const targetElement = findInputElement(activeElement) || activeElement;
    
    // Close popup BEFORE inserting so focus returns to input
    closePopup();
    
    // Small delay to let focus return
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Focus the target again
    targetElement.focus();
    
    // Attempt to set text
    const success = await setText(targetElement, newText);
    
    if (success) {
      showToast('✓ Text inserted!');
    } else {
      showToast('⚠️ Insertion may have failed');
    }
    
    // Verify it worked
    setTimeout(() => {
      const verifyText = getText(targetElement);
      console.log('   Verification - text after insert:', verifyText.substring(0, 100));
      if (verifyText.includes(formatted.substring(0, 20)) || verifyText === newText) {
        console.log('   ✓ Text insertion verified!');
      } else {
        console.warn('   ⚠️ Text may not have inserted correctly');
        console.log('   Expected to contain:', formatted.substring(0, 50));
        console.log('   Got:', verifyText.substring(0, 50));
        
        // Try one more time with direct assignment
        console.log('   Retrying with direct assignment...');
        if (targetElement.value !== undefined) {
          targetElement.value = newText;
          targetElement.dispatchEvent(new Event('input', { bubbles: true }));
          targetElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }, 200);
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'vinavi-toast';
    toast.setAttribute('data-vinavi', 'true');
    toast.innerHTML = `<span class="vinavi-toast-icon">✓</span>${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ============ EVENT HANDLERS ============

  let textChangeTimeout = null;
  
  function handleTextChange(e) {
    if (e.target && e.target.closest && e.target.closest('[data-vinavi="true"]')) {
      return;
    }

    const el = findInputElement(e.target);
    if (!el) {
      return;
    }
    
    // Debounce to prevent rapid-fire calls
    clearTimeout(textChangeTimeout);
    textChangeTimeout = setTimeout(() => {
      console.log('✓ Input detected:', el.tagName, el.type || 'contenteditable');
      
      activeElement = el;
      
      const text = getText(el);
      const cursor = getCursorPos(el);
      const shortcut = findShortcut(text, cursor);
      
      console.log('📝 Text:', text.substring(Math.max(0, cursor - 20), cursor + 20));
      console.log('📍 Cursor:', cursor);
      
      // Require at least 3 characters (e.g., /oe) before showing suggestions
      if (shortcut && shortcut.shortcut.length >= 3) {
        console.log('🔍 Found shortcut:', shortcut.shortcut);
        console.log('📦 TEMPLATES object has keys:', Object.keys(TEMPLATES));
        const matches = findMatches(shortcut.shortcut);
        console.log('📋 Matches:', matches.length);
        if (matches.length > 0) {
          showSuggestions(el, matches, shortcut);
          return;
        } else {
          console.log('⚠️ No matches found. Template keys:', Object.keys(TEMPLATES).join(', '));
        }
      }
      
      hideSuggestions();
    }, 50);
  }

  function handleKeyDown(e) {
    // Navigate suggestions
    if (currentSuggestions) {
      const items = currentSuggestions.querySelectorAll('.vinavi-suggestion-item');
      const current = currentSuggestions.querySelector('.vinavi-suggestion-item.selected');
      const currentIdx = Array.from(items).indexOf(current);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items.forEach(i => i.classList.remove('selected'));
        items[(currentIdx + 1) % items.length].classList.add('selected');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items.forEach(i => i.classList.remove('selected'));
        items[(currentIdx - 1 + items.length) % items.length].classList.add('selected');
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (current) {
          e.preventDefault();
          e.stopPropagation();
          selectTemplate(current.dataset.key);
        }
      } else if (e.key === 'Escape') {
        hideSuggestions();
      }
    }
    
    // Close popup on Escape
    if (currentPopup && e.key === 'Escape') {
      closePopup();
    }
  }

  function handleClick(e) {
    // Close suggestions if clicking outside
    if (currentSuggestions && !currentSuggestions.contains(e.target)) {
      hideSuggestions();
    }
  }

  function handleFocus(e) {
    if (e.target && e.target.closest && e.target.closest('[data-vinavi="true"]')) {
      return;
    }

    const el = findInputElement(e.target);
    if (el) {
      activeElement = el;
    }
  }

  // ============ INITIALIZE ============

  function init() {
    // Use capture phase for better event interception
    document.addEventListener('input', handleTextChange, true);
    document.addEventListener('keyup', handleTextChange, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('focusin', handleFocus, true);
    
    // Also monitor for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Attach listeners to new input elements
            const inputs = node.querySelectorAll ? 
              node.querySelectorAll('input, textarea, [contenteditable="true"]') : [];
            inputs.forEach(input => {
              input.addEventListener('input', handleTextChange, true);
              input.addEventListener('keyup', handleTextChange, true);
            });
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('✅ Vinavi Quick Text: Ready! Type / in any text field.');
    console.log('📋 Available templates:', Object.keys(TEMPLATES).join(', ') || '(none yet - loading from storage...)');
  }

  // Expose debug function to window for testing
  window.vinaviDebug = async function() {
    console.log('=== VINAVI DEBUG ===');
    console.log('TEMPLATES:', TEMPLATES);
    console.log('TEMPLATES keys:', Object.keys(TEMPLATES));
    console.log('customTemplates:', customTemplates);
    
    // Check chrome.storage directly
    if (chrome && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(['customTemplates']);
      console.log('Direct storage read:', result);
    }
    console.log('===================');
  };

  // Start when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
