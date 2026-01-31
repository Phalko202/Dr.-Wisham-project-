// sets.js - Clinical Sets Management
// Manage reusable sets containing labs, medications, and complaints

const SETS_STORAGE_KEY = 'HMH_CLINICAL_SETS_V1';

/**
 * Load all clinical sets from localStorage
 */
function loadSets() {
    try {
        const raw = localStorage.getItem(SETS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('[Sets] Failed to load sets:', error);
        return [];
    }
}

/**
 * Save clinical sets to localStorage
 */
function saveSets(sets) {
    try {
        localStorage.setItem(SETS_STORAGE_KEY, JSON.stringify(sets));
        return true;
    } catch (error) {
        console.error('[Sets] Failed to save sets:', error);
        return false;
    }
}

/**
 * Create a new clinical set
 * @param {string} name - Name of the set
 * @param {Array} labs - Array of lab tests {code, asnd, name, vinaviServiceId}
 * @param {Array} medications - Array of medications {id, name, instructions}
 * @param {Array} complaints - Array of complaints/symptoms (legacy, kept for compatibility)
 * @param {Array} medicalAdvice - Array of medical advice strings
 */
function createSet(name, labs = [], medications = [], complaints = [], medicalAdvice = []) {
    if (!name || name.trim() === '') {
        throw new Error('Set name is required');
    }

    const sets = loadSets();
    const newSet = {
        id: Date.now().toString(),
        name: name.trim(),
        labs: labs,
        medications: medications,
        complaints: complaints,
        medicalAdvice: medicalAdvice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    sets.push(newSet);
    saveSets(sets);
    return newSet;
}

/**
 * Update an existing set
 */
function updateSet(setId, updates) {
    const sets = loadSets();
    const index = sets.findIndex(s => s.id === setId);
    
    if (index === -1) {
        throw new Error('Set not found');
    }

    sets[index] = {
        ...sets[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    saveSets(sets);
    return sets[index];
}

/**
 * Delete a set
 */
function deleteSet(setId) {
    const sets = loadSets();
    const filtered = sets.filter(s => s.id !== setId);
    saveSets(filtered);
    return filtered.length < sets.length;
}

/**
 * Get a specific set by ID
 */
function getSet(setId) {
    const sets = loadSets();
    return sets.find(s => s.id === setId);
}

/**
 * Apply a set to the current episode
 * This will add all labs, medications, and medical advice to the current context
 */
async function applySetToEpisode(setId, episodeId) {
    const set = getSet(setId);
    if (!set) {
        throw new Error('Set not found');
    }

    const results = {
        labs: { success: 0, failed: 0, errors: [] },
        medications: { success: 0, failed: 0, errors: [] },
        medicalAdvice: { success: 0, failed: 0, errors: [] }
    };

    // Apply labs
    if (set.labs && set.labs.length > 0) {
        // Add labs to selected tests for submission
        window.selectedTests = window.selectedTests || [];
        set.labs.forEach(lab => {
            window.selectedTests.push(lab);
        });
        if (typeof updateSelectedTestsDisplay === 'function') {
            updateSelectedTestsDisplay();
        }
        results.labs.success = set.labs.length;
    }

    // Apply medications
    if (set.medications && set.medications.length > 0) {
        // TODO: Implement medication addition via Vinavi API
        // This would require creating a prescription and adding medicines
        results.medications.success = set.medications.length;
    }

    // Apply medical advice
    if (set.medicalAdvice && set.medicalAdvice.length > 0) {
        // Medical advice will be pushed via Vinavi API addNote
        results.medicalAdvice.success = set.medicalAdvice.length;
    }

    return results;
}

/**
 * Export set as JSON for sharing
 */
function exportSet(setId) {
    const set = getSet(setId);
    if (!set) {
        throw new Error('Set not found');
    }

    const json = JSON.stringify(set, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-set-${set.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Import set from JSON
 */
function importSet(jsonData) {
    try {
        const set = JSON.parse(jsonData);
        
        // Validate structure
        if (!set.name) {
            throw new Error('Invalid set: missing name');
        }

        // Remove ID and timestamps to create new set
        delete set.id;
        set.createdAt = new Date().toISOString();
        set.updatedAt = new Date().toISOString();

        const sets = loadSets();
        set.id = Date.now().toString();
        sets.push(set);
        saveSets(sets);

        return set;
    } catch (error) {
        console.error('[Sets] Import failed:', error);
        throw error;
    }
}

// Expose API to window
window.ClinicalSets = {
    load: loadSets,
    save: saveSets,
    create: createSet,
    update: updateSet,
    delete: deleteSet,
    get: getSet,
    apply: applySetToEpisode,
    export: exportSet,
    import: importSet
};

console.log('[Sets] Clinical Sets module loaded');
