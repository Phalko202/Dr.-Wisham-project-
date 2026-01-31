// Vinavi Quick Text - Dashboard JavaScript
// Modern version with improved UI

let builtinTemplates = {};
let customTemplates = {};
let editingTemplateId = null;
let fieldCounter = 0;

function slugifyId(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'field';
}

// Helper function to escape HTML
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Theme functions
function setTheme(theme) {
  document.body.className = '';
  if (theme && theme !== 'default') {
    document.body.classList.add('theme-' + theme);
  }
  try {
    localStorage.setItem('vinaviTheme', theme);
    // Also save to chrome.storage so content.js can access it
    chrome.storage.local.set({ vinaviTheme: theme });
  } catch (e) {}
}

function loadTheme() {
  try {
    // Try chrome.storage first for sync across extension
    chrome.storage.local.get(['vinaviTheme'], function(result) {
      var saved = result.vinaviTheme || localStorage.getItem('vinaviTheme');
      if (saved) {
        setTheme(saved);
        var btn = document.querySelector('.theme-btn[data-theme="' + saved + '"]');
        if (btn) {
          document.querySelectorAll('.theme-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
        }
      }
    });
  } catch (e) {
    var saved = localStorage.getItem('vinaviTheme');
    if (saved) {
      setTheme(saved);
      var btn = document.querySelector('.theme-btn[data-theme="' + saved + '"]');
      if (btn) {
        document.querySelectorAll('.theme-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      }
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  await loadTemplates();
  setupEventListeners();
  renderAllTemplates();
  updateStats();
});

// Load templates
async function loadTemplates() {
  // No built-in templates (user-created only)
  builtinTemplates = {};

  // Load custom templates from storage
  try {
    const result = await chrome.storage.local.get(['customTemplates']);
    customTemplates = result.customTemplates || {};
  } catch (e) {
    const saved = localStorage.getItem('vinaviCustomTemplates');
    customTemplates = saved ? JSON.parse(saved) : {};
  }
}

// Save custom templates
async function saveCustomTemplates() {
  try {
    await chrome.storage.local.set({ customTemplates: customTemplates });
  } catch (e) {
    localStorage.setItem('vinaviCustomTemplates', JSON.stringify(customTemplates));
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    item.addEventListener('click', function() {
      var page = this.getAttribute('data-page');
      document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
      document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
      document.getElementById('page-' + page).classList.add('active');
    });
  });

  // Create button (new UI)
  if (document.getElementById('btn-new-template')) {
    document.getElementById('btn-new-template').addEventListener('click', openCreatePage);
  }

  // Search + filter
  var searchInput = document.getElementById('search-templates');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      renderAllTemplates();
    });
  }
  var filterSelect = document.getElementById('filter-category');
  if (filterSelect) {
    filterSelect.addEventListener('change', function() {
      renderAllTemplates();
    });
  }

  // Settings actions
  var clearAllBtn = document.getElementById('clear-all-btn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function() {
      if (confirm('Delete all templates? This cannot be undone.')) {
        customTemplates = {};
        saveCustomTemplates();
        renderAllTemplates();
        updateStats();
        showToast('All templates deleted', 'success');
      }
    });
  }
  
  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var theme = this.getAttribute('data-theme');
      setTheme(theme);
      document.querySelectorAll('.theme-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });
  
  // Load saved theme
  loadTheme();

  // Create page buttons
  document.getElementById('save-template-btn').addEventListener('click', saveTemplate);
  document.getElementById('cancel-create-btn').addEventListener('click', cancelCreate);
  document.getElementById('add-mainlabel-btn').addEventListener('click', function() { addMainLabel(); });
}

// Render templates
function renderAllTemplates() {
  var container = document.getElementById('templates-container');
  if (!container) return;

  var emptyState = document.getElementById('empty-state');
  var searchValue = (document.getElementById('search-templates')?.value || '').toLowerCase();
  var categoryFilter = document.getElementById('filter-category')?.value || 'all';

  var entries = Object.keys(customTemplates).map(function(key) {
    return { key: key, template: customTemplates[key] };
  });

  var filtered = entries.filter(function(entry) {
    var t = entry.template || {};
    var title = (t.title || '').toLowerCase();
    var key = entry.key.toLowerCase();
    var category = (t.category || 'other').toLowerCase();

    var matchesSearch = !searchValue || title.includes(searchValue) || key.includes(searchValue);
    var matchesCategory = categoryFilter === 'all' || category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  container.innerHTML = filtered.map(function(entry) {
    return createTemplateCard(entry.key, entry.template, true);
  }).join('');

  if (emptyState) {
    emptyState.style.display = filtered.length > 0 ? 'none' : 'block';
  }

  attachTemplateActionListeners();
}

function createTemplateCard(key, template, isCustom) {
  // Count fields from either old structure (fields) or new structure (mainLabels)
  var fieldCount = 0;
  if (template.fields) {
    fieldCount = template.fields.length;
  } else if (template.mainLabels) {
    template.mainLabels.forEach(function(ml) {
      if (ml.subLabels) fieldCount += ml.subLabels.length;
    });
  }

  var category = (template.category || 'other').toLowerCase();
  var html = '<div class="template-card" data-key="' + key + '">';
  html += '<div class="template-header">';
  html += '<div class="template-icon">' + (template.icon || '📋') + '</div>';
  html += '<div class="template-info">';
  html += '<div class="template-title">' + template.title + '</div>';
  html += '<div class="template-shortcut">' + key + '</div>';
  html += '</div>';
  html += '</div>';
  html += '<div class="template-meta">';
  html += '<span class="template-category">' + category + '</span>';
  html += '<span>' + fieldCount + ' field' + (fieldCount !== 1 ? 's' : '') + '</span>';
  html += '</div>';
  html += '<div class="template-actions">';
  html += '<button class="template-btn" data-action="edit" data-key="' + key + '">Edit</button>';
  html += '<button class="template-btn delete" data-action="delete" data-key="' + key + '">Delete</button>';
  html += '</div>';
  html += '</div>';
  return html;
}

function attachTemplateActionListeners() {
  document.querySelectorAll('.template-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var action = this.getAttribute('data-action');
      var key = this.getAttribute('data-key');
      if (action === 'edit') editTemplate(key);
      if (action === 'delete') deleteTemplate(key);
    });
  });
}

function updateStats() {
  var builtinCount = Object.keys(builtinTemplates).length;
  var customCount = Object.keys(customTemplates).length;
  var totalEl = document.getElementById('stat-total');
  var builtinEl = document.getElementById('stat-builtin');
  var customEl = document.getElementById('stat-custom');

  if (totalEl) totalEl.textContent = builtinCount + customCount;
  if (builtinEl) builtinEl.textContent = builtinCount;
  if (customEl) customEl.textContent = customCount;

  var storageInfo = document.getElementById('storage-info');
  if (storageInfo) {
    var bytes = new Blob([JSON.stringify(customTemplates)]).size;
    var kb = (bytes / 1024).toFixed(2);
    storageInfo.textContent = 'Custom templates: ' + customCount + ' • Storage: ' + kb + ' KB';
  }
}

function openCreatePage() {
  editingTemplateId = null;
  document.getElementById('create-page-title').textContent = 'Create New Template';
  document.getElementById('template-shortcut').value = '';
  document.getElementById('template-name').value = '';
  if (document.getElementById('template-category')) {
    document.getElementById('template-category').value = 'other';
  }
  if (document.getElementById('template-layout')) {
    document.getElementById('template-layout').value = 'single';
  }
  if (document.getElementById('template-width')) {
    document.getElementById('template-width').value = 'normal';
  }
  document.getElementById('mainlabels-container').innerHTML = '';
  fieldCounter = 0;
  mainLabelCounter = 0;
  addMainLabel();
  
  document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
  document.querySelector('.nav-item[data-page="create"]').classList.add('active');
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-create').classList.add('active');
}

function cancelCreate() {
  document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
  document.querySelector('.nav-item[data-page="templates"]').classList.add('active');
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-templates').classList.add('active');
}

function editTemplate(key) {
  var template = customTemplates[key];
  if (!template) return;
  
  editingTemplateId = key;
  document.getElementById('create-page-title').textContent = 'Edit Template';
  document.getElementById('template-shortcut').value = key;
  document.getElementById('template-name').value = template.title;
  if (document.getElementById('template-category')) {
    document.getElementById('template-category').value = template.category || 'other';
  }
  
  // Load layout options
  if (document.getElementById('template-layout')) {
    document.getElementById('template-layout').value = template.layout || 'single';
  }
  if (document.getElementById('template-width')) {
    document.getElementById('template-width').value = template.popupWidth || 'normal';
  }
  
  // Clear containers
  var fieldsContainer = document.getElementById('fields-container');
  var mainLabelsContainer = document.getElementById('mainlabels-container');
  if (fieldsContainer) fieldsContainer.innerHTML = '';
  if (mainLabelsContainer) mainLabelsContainer.innerHTML = '';
  
  fieldCounter = 0;
  mainLabelCounter = 0;
  
  // New structure: mainLabels
  if (template.mainLabels && template.mainLabels.length > 0) {
    template.mainLabels.forEach(function(mainLabel) {
      addMainLabel(mainLabel);
    });
  } else if (template.fields && template.fields.length > 0) {
    // Old structure: fields (shouldn't happen with new templates)
    template.fields.forEach(function(field) { addField(field); });
  } else {
    // Empty template - add first main label
    addMainLabel();
  }
  
  document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
  document.querySelector('.nav-item[data-page="create"]').classList.add('active');
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-create').classList.add('active');
}

function deleteTemplate(key) {
  if (confirm('Delete "' + key + '"?')) {
    delete customTemplates[key];
    saveCustomTemplates();
    renderAllTemplates();
    updateStats();
    showToast('Template deleted');
  }
}

let mainLabelCounter = 0;

// Add a Main Label section (e.g., "Hemogram")
function addMainLabel(existingData) {
  mainLabelCounter++;
  var mainLabelId = 'mainlabel-' + mainLabelCounter;
  var mainLabelName = existingData ? existingData.name : '';
  
  var html = '<div class="mainlabel-section" id="' + mainLabelId + '">';
  html += '<div class="mainlabel-header">';
  html += '<span style="font-size: 20px;">📁</span>';
  html += '<input type="text" class="mainlabel-title-input" placeholder="Section Name (e.g., Hemogram, Vitals, Dengue Profile)" value="' + mainLabelName + '" data-mainlabel="' + mainLabelId + '">';
  html += '<button type="button" class="mainlabel-remove" data-mainlabel="' + mainLabelId + '" title="Delete Section">×</button>';
  html += '</div>';
  html += '<div class="mainlabel-sublabels" id="' + mainLabelId + '-sublabels"></div>';
  html += '<button type="button" class="add-sublabel-btn" data-mainlabel="' + mainLabelId + '">➕ Add Field</button>';
  html += '</div>';
  
  document.getElementById('mainlabels-container').insertAdjacentHTML('beforeend', html);
  
  // Remove main label button
  document.querySelector('.mainlabel-remove[data-mainlabel="' + mainLabelId + '"]').addEventListener('click', function() {
    if (confirm('Delete this entire section and all its fields?')) {
      document.getElementById(mainLabelId).remove();
    }
  });
  
  // Add sublabel button
  document.querySelector('.add-sublabel-btn[data-mainlabel="' + mainLabelId + '"]').addEventListener('click', function() {
    addSubLabelField(mainLabelId);
  });
  
  // Add first sublabel if new
  if (!existingData) {
    addSubLabelField(mainLabelId);
  } else if (existingData.subLabels) {
    existingData.subLabels.forEach(function(sublabel) {
      addSubLabelField(mainLabelId, sublabel);
    });
  }
}

// Add a Sub Label (field) under a main label
function addSubLabelField(mainLabelId, existingField) {
  fieldCounter++;
  var fieldId = 'field-' + fieldCounter;
  
  // Get previous field's type to copy it
  var previousType = 'text';
  var previousWidth = 'half';
  var container = document.getElementById(mainLabelId + '-sublabels');
  var previousFields = container.querySelectorAll('.sublabel-field');
  if (previousFields.length > 0 && !existingField) {
    var lastField = previousFields[previousFields.length - 1];
    previousType = lastField.querySelector('.field-type').value;
    previousWidth = lastField.querySelector('.field-width').value;
  }
  
  var type = existingField ? existingField.type : previousType;
  var label = existingField ? existingField.label : '';
  var unit = existingField ? (existingField.unit || '') : '';
  var width = existingField ? (existingField.width || 'half') : previousWidth;
  var options = existingField && existingField.options ? existingField.options : [];
  
  var fieldNum = container.querySelectorAll('.sublabel-field').length + 1;
  var typeIcons = { text: '📝', number: '🔢', select: '📋', multiselect: '☑️', advice: '💡', medication: '💊', checkbox: '✅' };
  
  var html = '<div class="sublabel-field" id="' + fieldId + '">';
  html += '<div class="sublabel-field-header">';
  html += '<span class="sublabel-field-title">' + (typeIcons[type] || '📝') + ' Field ' + fieldNum + '</span>';
  html += '<button type="button" class="sublabel-field-remove" title="Remove Field">×</button>';
  html += '</div>';
  
  // Type & Width Row FIRST (compact)
  html += '<div class="form-row" style="margin-bottom: 12px;">';
  html += '<div class="form-group" style="margin-bottom: 0;">';
  html += '<label class="form-label" style="font-size: 11px; margin-bottom: 4px;">Type</label>';
  html += '<select class="form-select field-type" style="padding: 8px 10px; font-size: 13px;">';
  html += '<option value="text"' + (type === 'text' ? ' selected' : '') + '>📝 Text</option>';
  html += '<option value="number"' + (type === 'number' ? ' selected' : '') + '>🔢 Number</option>';
  html += '<option value="select"' + (type === 'select' ? ' selected' : '') + '>📋 Dropdown</option>';
  html += '<option value="multiselect"' + (type === 'multiselect' ? ' selected' : '') + '>☑️ Multi-Select</option>';
  html += '<option value="advice"' + (type === 'advice' ? ' selected' : '') + '>💡 Advice Menu</option>';
  html += '<option value="medication"' + (type === 'medication' ? ' selected' : '') + '>💊 Medication</option>';
  html += '<option value="checkbox"' + (type === 'checkbox' ? ' selected' : '') + '>✅ Checkbox</option>';
  html += '</select>';
  html += '</div>';
  html += '<div class="form-group" style="margin-bottom: 0;">';
  html += '<label class="form-label" style="font-size: 11px; margin-bottom: 4px;">Width</label>';
  html += '<select class="form-select field-width" style="padding: 8px 10px; font-size: 13px;">';
  html += '<option value="half"' + (width === 'half' ? ' selected' : '') + '>Half</option>';
  html += '<option value="full"' + (width === 'full' ? ' selected' : '') + '>Full</option>';
  html += '</select>';
  html += '</div>';
  html += '</div>';
  
  // Field Label (hidden for medication type)
  html += '<div class="form-group field-label-group" style="display:' + (type === 'medication' ? 'none' : 'block') + '; margin-bottom: 10px;">';
  html += '<label class="form-label" style="font-size: 11px; margin-bottom: 4px;">Label</label>';
  html += '<input type="text" class="form-input field-label" placeholder="e.g., RBC, BP, Temp" value="' + label + '" style="padding: 8px 12px; font-size: 13px;">';
  html += '</div>';
  
  // Visual indicator for medication type (compact)
  html += '<div class="form-group medication-indicator" style="display:' + (type === 'medication' ? 'block' : 'none') + '; margin-bottom: 10px; padding: 8px; font-size: 12px;">';
  html += '<span>💊 Medication mode - label hidden in output</span>';
  html += '</div>';
  
  // Unit (for number type)
  html += '<div class="form-group field-unit-group" style="display:' + (type === 'number' ? 'block' : 'none') + '; margin-bottom: 10px;">';
  html += '<label class="form-label" style="font-size: 11px; margin-bottom: 4px;">Unit</label>';
  html += '<input type="text" class="form-input field-unit" placeholder="mg/dL, bpm, mmHg" value="' + unit + '" style="padding: 8px 12px; font-size: 13px;">';
  html += '</div>';
  
  // Options for select/multiselect/medication (compact)
  var showOptions = (type === 'select' || type === 'multiselect' || type === 'advice' || type === 'medication');
  html += '<div class="form-group field-options-group" style="display:' + (showOptions ? 'block' : 'none') + '; margin-bottom: 0;">';
  html += '<label class="form-label" style="font-size: 11px; margin-bottom: 4px;">Options</label>';
  html += '<div class="options-container" id="opts-' + fieldId + '" style="min-height: 28px; padding: 6px;">';
  if (options.length > 0) {
    options.forEach(function(opt) {
      html += '<span class="option-tag">' + escapeHtml(opt) + '<button type="button" class="option-remove">×</button></span>';
    });
  }
  html += '</div>';
  html += '<div class="add-option-row" style="gap: 6px;">';
  html += '<textarea class="option-input" placeholder="Add option... (Enter = add, Ctrl+Enter = new line)" rows="2" style="padding: 8px 10px; font-size: 13px; resize: vertical;"></textarea>';
  html += '<button type="button" class="btn btn-primary add-option-btn" style="padding: 8px 12px; font-size: 12px; white-space: nowrap;">+</button>';
  html += '</div>';
  html += '</div>';
  
  html += '</div>';
  
  container.insertAdjacentHTML('beforeend', html);
  
  var fieldElem = document.getElementById(fieldId);
  
  // Remove field button
  fieldElem.querySelector('.sublabel-field-remove').addEventListener('click', function() {
    fieldElem.remove();
  });
  
  // Type change event
  fieldElem.querySelector('.field-type').addEventListener('change', function() {
    var t = this.value;
    var icons = { text: '📝', number: '🔢', select: '📋', multiselect: '☑️', advice: '💡', medication: '💊', checkbox: '✅' };
    fieldElem.querySelector('.sublabel-field-title').innerHTML = (icons[t] || '📝') + ' Field';
    fieldElem.querySelector('.field-options-group').style.display = (t === 'select' || t === 'multiselect' || t === 'advice' || t === 'medication') ? 'block' : 'none';
    fieldElem.querySelector('.field-unit-group').style.display = t === 'number' ? 'block' : 'none';
    fieldElem.querySelector('.field-label-group').style.display = (t === 'medication') ? 'none' : 'block';
    fieldElem.querySelector('.medication-indicator').style.display = (t === 'medication') ? 'block' : 'none';
  });
  
  // Add option button
  var addBtn = fieldElem.querySelector('.add-option-btn');
  var optInput = fieldElem.querySelector('.option-input');
  var optsContainer = document.getElementById('opts-' + fieldId);
  
  function addOption() {
    var val = optInput.value.trim();
    if (val) {
      var tag = document.createElement('span');
      tag.className = 'option-tag';
      tag.innerHTML = escapeHtml(val) + '<button type="button" class="option-remove">×</button>';
      tag.querySelector('.option-remove').addEventListener('click', function() { tag.remove(); });
      optsContainer.appendChild(tag);
      optInput.value = '';
      optInput.focus();
    }
  }
  
  addBtn.addEventListener('click', addOption);

  // Enter adds option; Ctrl+Enter inserts newline
  optInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      if (e.ctrlKey) {
        // Insert newline at cursor
        e.preventDefault();
        const start = optInput.selectionStart || 0;
        const end = optInput.selectionEnd || 0;
        const val = optInput.value;
        optInput.value = val.slice(0, start) + "\n" + val.slice(end);
        const pos = start + 1;
        optInput.selectionStart = pos;
        optInput.selectionEnd = pos;
        return;
      }
      e.preventDefault();
      addOption();
    }
  });
  
  // Attach remove listeners to existing option tags
  fieldElem.querySelectorAll('.option-remove').forEach(function(btn) {
    btn.addEventListener('click', function() { btn.parentElement.remove(); });
  });
  
  // Remove existing options
  fieldElem.querySelectorAll('.option-remove').forEach(function(btn) {
    btn.addEventListener('click', function() { btn.parentElement.remove(); });
  });
}

function collectMainLabels() {
  var mainLabels = [];
  var sections = document.querySelectorAll('.mainlabel-section');
  console.log('📊 Collecting from', sections.length, 'main label sections');

  var usedIds = {};
  
  document.querySelectorAll('.mainlabel-section').forEach(function(section, mainIndex) {
    var mainLabelName = section.querySelector('.mainlabel-title-input').value.trim();
    if (!mainLabelName) {
      console.log('⚠️ Skipping main label with empty name');
      return;
    }
    
    var subLabels = [];
    section.querySelectorAll('.sublabel-field').forEach(function(field, fieldIndex) {
      var label = field.querySelector('.field-label').value.trim();
      var type = field.querySelector('.field-type').value;
      var width = field.querySelector('.field-width').value;
      
      // Medication type doesn't require a label since it's hidden in output
      if (!label && type !== 'medication') return;
      
      var base = (label || (type === 'medication' ? 'medication' : 'field'));
      var candidate = slugifyId(mainLabelName) + '__' + slugifyId(base) + '__' + mainIndex + '_' + fieldIndex;
      var uniqueId = candidate;
      var n = 1;
      while (usedIds[uniqueId]) {
        uniqueId = candidate + '_' + n;
        n++;
      }
      usedIds[uniqueId] = true;

      var sublabel = {
        id: uniqueId,
        label: label || 'Medication',  // Default label for medication type
        type: type,
        width: width
      };
      
      if (type === 'select' || type === 'multiselect' || type === 'advice' || type === 'medication') {
        var opts = [];
        field.querySelectorAll('.option-tag').forEach(function(tag) {
          // Get only the text content, excluding the remove button
          var tagText = tag.childNodes[0].textContent.trim();
          if (tagText) opts.push(tagText);
        });
        console.log('    Options collected for ' + type + ':', opts);
        sublabel.options = opts;
        sublabel.default = (type === 'multiselect' || type === 'advice') ? [] : (opts[0] || '');
      } else if (type === 'number') {
        sublabel.unit = field.querySelector('.field-unit').value.trim() || '';
        sublabel.default = '';
      } else {
        sublabel.default = type === 'checkbox' ? false : '';
      }
      
      subLabels.push(sublabel);
    });
    
    mainLabels.push({
      name: mainLabelName,
      subLabels: subLabels
    });
    
    console.log('✓ Main label "' + mainLabelName + '" with', subLabels.length, 'sub labels');
  });
  
  console.log('📦 Total main labels collected:', mainLabels.length);
  return mainLabels;
}

function saveTemplate() {
  var shortcut = document.getElementById('template-shortcut').value.trim().toLowerCase();
  var name = document.getElementById('template-name').value.trim();
  
  if (!shortcut || !name) {
    showToast('Please fill shortcut and name', 'error');
    return;
  }
  
  if (!shortcut.startsWith('/')) {
    shortcut = '/' + shortcut;
  }
  
  if (shortcut.indexOf(' ') !== -1) {
    showToast('Shortcut cannot have spaces', 'error');
    return;
  }
  
  var mainLabels = collectMainLabels();
  
  if (mainLabels.length === 0) {
    showToast('Please add at least one main label with sub labels', 'error');
    return;
  }
  
  // Check if any main label has sub labels
  var hasSubLabels = false;
  for (var i = 0; i < mainLabels.length; i++) {
    if (mainLabels[i].subLabels && mainLabels[i].subLabels.length > 0) {
      hasSubLabels = true;
      break;
    }
  }
  
  if (!hasSubLabels) {
    showToast('Please add at least one field to your main labels', 'error');
    return;
  }
  
  if (editingTemplateId !== shortcut && (builtinTemplates[shortcut] || customTemplates[shortcut])) {
    showToast('Shortcut already exists', 'error');
    return;
  }
  
  // Get layout options
  var layout = document.getElementById('template-layout') ? document.getElementById('template-layout').value : 'single';
  var popupWidth = document.getElementById('template-width') ? document.getElementById('template-width').value : 'normal';
  var category = document.getElementById('template-category') ? document.getElementById('template-category').value : 'other';
  
  var template = {
    title: name,
    icon: '📋',
    mainLabels: mainLabels,
    layout: layout,
    popupWidth: popupWidth,
    category: category
  };
  
  if (editingTemplateId && editingTemplateId !== shortcut) {
    delete customTemplates[editingTemplateId];
  }
  
  customTemplates[shortcut] = template;
  saveCustomTemplates();
  
  // Reset editing state
  editingTemplateId = null;
  
  document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
  document.querySelector('.nav-item[data-page="templates"]').classList.add('active');
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-templates').classList.add('active');
  
  renderAllTemplates();
  updateStats();
  showToast('Template "' + shortcut + '" saved!');
}

function showToast(message, type) {
  var toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + (type || '') + ' show';
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}
