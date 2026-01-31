/**
 * Patient Notes Portal - Modern Standalone Version
 * A dedicated portal for patient notes with search-first approach
 */

class PatientNotesPortal {
    constructor() {
        this.currentView = 'search'; // 'search', 'profile', 'editor'
        this.currentPatient = null;
        this.patients = [];
        this.notes = {};
        this.documents = {}; // Store imported documents per patient
        this.autoSaveTimer = null;
        this.currentFontSize = 14;
        this.init();
    }

    init() {
        this.loadData();
        this.render();
    }

    loadData() {
        try {
            // Try new format first
            let savedData = localStorage.getItem('hmh_patient_notes_v3');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.patients = data.patients || [];
                this.notes = data.notes || {};
                this.documents = data.documents || {};
            } else {
                // Try migrating from old format
                savedData = localStorage.getItem('hmh_patient_notes_v2');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    // Convert old format
                    if (data.patients) {
                        const oldPatients = typeof data.patients === 'object' ? data.patients : {};
                        Object.entries(oldPatients).forEach(([id, patient]) => {
                            this.patients.push({
                                id: id,
                                name: patient.name || 'Unknown',
                                idCard: patient.idCard || '',
                                age: patient.age || '',
                                gender: patient.gender || '',
                                createdAt: patient.createdAt || new Date().toISOString()
                            });
                            if (patient.notes) {
                                this.notes[id] = {
                                    content: patient.notes,
                                    lastEdited: patient.lastUpdated || new Date().toISOString()
                                };
                            }
                        });
                    }
                    this.saveData();
                }
            }
        } catch (e) {
            console.error('Failed to load patient notes data:', e);
            this.patients = [];
            this.notes = {};
            this.documents = {};
        }
    }

    saveData() {
        try {
            localStorage.setItem('hmh_patient_notes_v3', JSON.stringify({
                patients: this.patients,
                notes: this.notes,
                documents: this.documents,
                lastSaved: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Failed to save patient notes data:', e);
        }
    }

    render() {
        const app = document.getElementById('patient-notes-app');
        if (!app) return;

        app.innerHTML = this.getLayoutHTML();
        this.bindEvents();
        
        // Focus search input on load
        setTimeout(() => {
            const searchInput = document.getElementById('patientSearchInput');
            if (searchInput) searchInput.focus();
        }, 100);
    }

    getLayoutHTML() {
        return `
            <div class="pn-container">
                <!-- Header -->
                <header class="pn-header">
                    <div class="pn-header-left">
                        <div class="pn-logo-icon"><i class="fas fa-notes-medical"></i></div>
                        <h1 class="pn-title">Patient Notes</h1>
                        <span class="pn-subtitle">Dr. Wisham Lab Extension</span>
                    </div>
                    <div class="pn-header-right">
                        ${this.currentView === 'editor' ? `
                            <button class="pn-btn pn-btn-outline" id="backToSearchBtn">
                                <i class="fas fa-search"></i> Search Patient
                            </button>
                            <button class="pn-btn pn-btn-outline" id="viewDocumentsBtn" title="View Saved Documents">
                                <i class="fas fa-folder-open"></i> Documents
                            </button>
                        ` : `
                            <button class="pn-btn pn-btn-primary" id="addPatientBtn" title="Add New Patient">
                                <i class="fas fa-user-plus"></i> Add Patient
                            </button>
                            <button class="pn-btn pn-btn-outline" id="importDocsBtn" title="Import Word Documents">
                                <i class="fas fa-file-import"></i> Import Docs
                            </button>
                        `}
                        <button class="pn-btn pn-btn-outline" id="exportDatabaseBtn" title="Export All Patient Data">
                            <i class="fas fa-database"></i> Export DB
                        </button>
                        <button class="pn-btn pn-btn-ghost" id="managePatients" title="Manage Patients">
                            <i class="fas fa-users-cog"></i>
                        </button>
                    </div>
                </header>

                <!-- Main Content -->
                <main class="pn-main">
                    ${this.renderCurrentView()}
                </main>
            </div>

            <!-- Modals Container -->
            <div id="modalContainer"></div>
            
            <!-- Hidden file inputs -->
            <input type="file" id="importDocsInput" accept=".doc,.docx" multiple style="display:none">
        `;
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'search':
                return this.renderSearchView();
            case 'profile':
                return this.renderProfileView();
            case 'editor':
                return this.renderEditorView();
            default:
                return this.renderSearchView();
        }
    }

    renderSearchView() {
        return `
            <div class="pn-search-view">
                <div class="pn-search-container">
                    <div class="pn-search-icon-large">
                        <i class="fas fa-notes-medical"></i>
                    </div>
                    <h2 class="pn-search-title">Find a Patient</h2>
                    <p class="pn-search-subtitle">Search your saved patients by ID card number or name</p>
                    
                    <div class="pn-search-box">
                        <div class="pn-search-input-wrapper">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="patientSearchInput" 
                                   placeholder="Enter ID card number or patient name..."
                                   autocomplete="off">
                            <button class="pn-search-btn" id="searchPatientBtn">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Search Results -->
                    <div id="searchResults" class="pn-search-results"></div>

                    <!-- Recent Patients -->
                    ${this.renderRecentPatients()}
                </div>
            </div>
        `;
    }

    renderRecentPatients() {
        const recentPatients = this.patients.slice(-6).reverse();
        
        if (recentPatients.length === 0) {
            return `
                <div class="pn-recent-section">
                    <h3 class="pn-recent-title">
                        <i class="fas fa-clock"></i> Recent Patients
                    </h3>
                    <p class="pn-empty-message">No patients added yet. Search to find or add a patient.</p>
                </div>
            `;
        }

        return `
            <div class="pn-recent-section">
                <h3 class="pn-recent-title">
                    <i class="fas fa-clock"></i> Recent Patients
                </h3>
                <div class="pn-recent-grid">
                    ${recentPatients.map(patient => `
                        <div class="pn-recent-card" data-patient-id="${patient.id}">
                            <div class="pn-recent-avatar">
                                ${patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="pn-recent-info">
                                <span class="pn-recent-name">${patient.name}</span>
                                <span class="pn-recent-id">${patient.idCard || 'No ID'}</span>
                            </div>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderProfileView() {
        if (!this.currentPatient) {
            this.currentView = 'search';
            return this.renderSearchView();
        }

        const patient = this.currentPatient;
        const noteCount = this.notes[patient.id]?.content ? 1 : 0;
        const lastEdited = this.notes[patient.id]?.lastEdited;

        return `
            <div class="pn-profile-view">
                <button class="pn-back-btn" id="backToSearch">
                    <i class="fas fa-arrow-left"></i> Back to Search
                </button>

                <div class="pn-profile-card">
                    <div class="pn-profile-header">
                        <div class="pn-profile-avatar">
                            ${patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="pn-profile-info">
                            <h2 class="pn-profile-name">${patient.name}</h2>
                            <p class="pn-profile-id">
                                <i class="fas fa-id-card"></i> ${patient.idCard || 'No ID Card'}
                            </p>
                        </div>
                        <button class="pn-btn pn-btn-icon" id="editPatientBtn" title="Edit Patient">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>

                    <div class="pn-profile-details">
                        <div class="pn-detail-item">
                            <span class="pn-detail-label">Age</span>
                            <span class="pn-detail-value">${patient.age || '-'}</span>
                        </div>
                        <div class="pn-detail-item">
                            <span class="pn-detail-label">Gender</span>
                            <span class="pn-detail-value">${patient.gender || '-'}</span>
                        </div>
                        <div class="pn-detail-item">
                            <span class="pn-detail-label">Notes</span>
                            <span class="pn-detail-value">${noteCount > 0 ? 'Has notes' : 'No notes yet'}</span>
                        </div>
                        <div class="pn-detail-item">
                            <span class="pn-detail-label">Last Edited</span>
                            <span class="pn-detail-value">${lastEdited ? new Date(lastEdited).toLocaleDateString() : '-'}</span>
                        </div>
                    </div>

                    <div class="pn-profile-actions">
                        <button class="pn-btn pn-btn-primary pn-btn-large" id="openNoteBtn">
                            <i class="fas fa-file-medical"></i> Open Note
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditorView() {
        if (!this.currentPatient) {
            this.currentView = 'search';
            return this.renderSearchView();
        }

        const patient = this.currentPatient;
        const noteData = this.notes[patient.id] || { content: '' };

        return `
            <div class="pn-editor-view">
                <!-- Fixed Top Bar with Search -->
                <div class="pn-editor-topbar">
                    <div class="pn-topbar-left">
                        <div class="pn-quick-search">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="quickSearchInput" 
                                   placeholder="Search another patient..."
                                   autocomplete="off">
                            <button class="pn-quick-search-btn" id="quickSearchBtn">Go</button>
                        </div>
                    </div>
                    <div class="pn-topbar-right">
                        <button class="pn-btn pn-btn-new-consult" id="newConsultBtn" title="Add New Consultation">
                            <i class="fas fa-plus-circle"></i> New Consultation
                        </button>
                    </div>
                    <div class="pn-quick-search-results" id="quickSearchResults"></div>
                </div>

                <!-- Current Patient Info -->
                <div class="pn-editor-patient-bar">
                    <div class="pn-patient-mini">
                        <div class="pn-mini-avatar">${patient.name.charAt(0).toUpperCase()}</div>
                        <div class="pn-mini-info">
                            <span class="pn-mini-name">${patient.name}</span>
                            <span class="pn-mini-details">${patient.idCard || 'No ID'} ${patient.age ? '• ' + patient.age + ' years' : ''} ${patient.gender ? '• ' + patient.gender : ''}</span>
                        </div>
                    </div>
                    <div class="pn-auto-save-indicator" id="autoSaveIndicator">
                        <i class="fas fa-check-circle"></i> Saved
                    </div>
                </div>

                <!-- Toolbar -->
                <div class="pn-editor-toolbar">
                    <!-- Font Size Controls -->
                    <div class="pn-toolbar-group">
                        <button class="pn-tool-btn" id="fontDecreaseBtn" title="Decrease Font Size">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="pn-font-size-display" id="fontSizeDisplay">14pt</span>
                        <button class="pn-tool-btn" id="fontIncreaseBtn" title="Increase Font Size">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="pn-toolbar-divider"></div>
                    <!-- Text Formatting -->
                    <div class="pn-toolbar-group">
                        <button class="pn-tool-btn" data-command="bold" title="Bold (Ctrl+B)">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button class="pn-tool-btn" data-command="italic" title="Italic (Ctrl+I)">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button class="pn-tool-btn" data-command="underline" title="Underline (Ctrl+U)">
                            <i class="fas fa-underline"></i>
                        </button>
                        <button class="pn-tool-btn" data-command="strikeThrough" title="Strikethrough">
                            <i class="fas fa-strikethrough"></i>
                        </button>
                    </div>
                    <div class="pn-toolbar-divider"></div>
                    <!-- Text Color -->
                    <div class="pn-toolbar-group">
                        <div class="pn-color-dropdown">
                            <button class="pn-tool-btn pn-color-btn" id="textColorBtn" title="Text Color">
                                <i class="fas fa-font"></i>
                                <span class="pn-color-indicator" id="colorIndicator" style="background: #000000;"></span>
                            </button>
                            <div class="pn-color-menu" id="textColorMenu">
                                <div class="pn-color-grid">
                                    <button class="pn-color-swatch" data-color="#000000" style="background:#000000;" title="Black"></button>
                                    <button class="pn-color-swatch" data-color="#374151" style="background:#374151;" title="Dark Gray"></button>
                                    <button class="pn-color-swatch" data-color="#6b7280" style="background:#6b7280;" title="Gray"></button>
                                    <button class="pn-color-swatch" data-color="#9ca3af" style="background:#9ca3af;" title="Light Gray"></button>
                                    <button class="pn-color-swatch" data-color="#ef4444" style="background:#ef4444;" title="Red"></button>
                                    <button class="pn-color-swatch" data-color="#f97316" style="background:#f97316;" title="Orange"></button>
                                    <button class="pn-color-swatch" data-color="#eab308" style="background:#eab308;" title="Yellow"></button>
                                    <button class="pn-color-swatch" data-color="#22c55e" style="background:#22c55e;" title="Green"></button>
                                    <button class="pn-color-swatch" data-color="#3b82f6" style="background:#3b82f6;" title="Blue"></button>
                                    <button class="pn-color-swatch" data-color="#8b5cf6" style="background:#8b5cf6;" title="Purple"></button>
                                    <button class="pn-color-swatch" data-color="#ec4899" style="background:#ec4899;" title="Pink"></button>
                                    <button class="pn-color-swatch" data-color="#06b6d4" style="background:#06b6d4;" title="Cyan"></button>
                                </div>
                                <div class="pn-color-custom">
                                    <input type="color" id="customColorPicker" value="#000000">
                                    <span>Custom Color</span>
                                </div>
                            </div>
                        </div>
                        <div class="pn-color-dropdown">
                            <button class="pn-tool-btn pn-highlight-btn" id="highlightBtn" title="Highlight Color">
                                <i class="fas fa-highlighter"></i>
                                <span class="pn-color-indicator" id="highlightIndicator" style="background: #fef08a;"></span>
                            </button>
                            <div class="pn-color-menu" id="highlightMenu">
                                <div class="pn-color-grid">
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="transparent" style="background:linear-gradient(135deg, #fff 45%, #f00 50%, #fff 55%);" title="No Highlight"></button>
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="#fef08a" style="background:#fef08a;" title="Yellow"></button>
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="#bbf7d0" style="background:#bbf7d0;" title="Green"></button>
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="#bfdbfe" style="background:#bfdbfe;" title="Blue"></button>
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="#fecaca" style="background:#fecaca;" title="Red"></button>
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="#fed7aa" style="background:#fed7aa;" title="Orange"></button>
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="#e9d5ff" style="background:#e9d5ff;" title="Purple"></button>
                                    <button class="pn-color-swatch pn-highlight-swatch" data-color="#fbcfe8" style="background:#fbcfe8;" title="Pink"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pn-toolbar-divider"></div>
                    <!-- Lists & Indent -->
                    <div class="pn-toolbar-group">
                        <button class="pn-tool-btn" data-command="insertUnorderedList" title="Bullet List">
                            <i class="fas fa-list-ul"></i>
                        </button>
                        <button class="pn-tool-btn" data-command="insertOrderedList" title="Numbered List">
                            <i class="fas fa-list-ol"></i>
                        </button>
                        <button class="pn-tool-btn" id="outdentBtn" title="Move Left (Shift+Tab)">
                            <i class="fas fa-outdent"></i>
                        </button>
                        <button class="pn-tool-btn" id="indentBtn" title="Move Right (Tab)">
                            <i class="fas fa-indent"></i>
                        </button>
                    </div>
                    <div class="pn-toolbar-divider"></div>
                    <!-- Alignment -->
                    <div class="pn-toolbar-group">
                        <button class="pn-tool-btn" data-command="justifyLeft" title="Align Left">
                            <i class="fas fa-align-left"></i>
                        </button>
                        <button class="pn-tool-btn" data-command="justifyCenter" title="Align Center">
                            <i class="fas fa-align-center"></i>
                        </button>
                        <button class="pn-tool-btn" data-command="justifyRight" title="Align Right">
                            <i class="fas fa-align-right"></i>
                        </button>
                    </div>
                    <div class="pn-toolbar-divider"></div>
                    <!-- Subheadings Dropdown -->
                    <div class="pn-toolbar-group">
                        <div class="pn-subheading-dropdown">
                            <button class="pn-tool-btn pn-subheading-btn" id="subheadingBtn" title="Insert Subheading">
                                <i class="fas fa-heading"></i>
                                <i class="fas fa-caret-down" style="font-size:10px;margin-left:2px;"></i>
                            </button>
                            <div class="pn-subheading-menu" id="subheadingMenu">
                                <button class="pn-subheading-item" data-subheading="Chief Complaint"><i class="fas fa-comment-medical"></i> Chief Complaint</button>
                                <button class="pn-subheading-item" data-subheading="History"><i class="fas fa-history"></i> History</button>
                                <button class="pn-subheading-item" data-subheading="Examination"><i class="fas fa-stethoscope"></i> Examination</button>
                                <button class="pn-subheading-item" data-subheading="Diagnosis"><i class="fas fa-diagnoses"></i> Diagnosis</button>
                                <button class="pn-subheading-item" data-subheading="Treatment"><i class="fas fa-prescription"></i> Treatment</button>
                                <button class="pn-subheading-item" data-subheading="Medical Advice"><i class="fas fa-notes-medical"></i> Medical Advice</button>
                                <button class="pn-subheading-item" data-subheading="Follow Up"><i class="fas fa-calendar-check"></i> Follow Up</button>
                                <div class="pn-subheading-divider"></div>
                                <button class="pn-subheading-item" data-subheading="custom">
                                    <i class="fas fa-plus"></i> Custom...
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="pn-toolbar-spacer"></div>
                    <!-- Export & Print -->
                    <div class="pn-toolbar-group pn-toolbar-right">
                        <button class="pn-tool-btn pn-print-btn" id="printBtn" title="Print Document">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button class="pn-tool-btn pn-export-btn" id="exportWordBtn" title="Export as Word">
                            <i class="fas fa-file-word"></i> Export Word
                        </button>
                    </div>
                </div>

                <!-- Editor Area -->
                <div class="pn-editor-container">
                    <div class="pn-editor-content" 
                         id="noteEditor" 
                         contenteditable="true" 
                         placeholder="Start typing your notes here...">${this.getEditorContent(noteData)}</div>
                </div>
            </div>

            <!-- Hidden file input -->
            <input type="file" id="importFileInput" accept=".doc,.docx,.txt,.html,.rtf" style="display:none">
        `;
    }

    getLetterhead() {
        return `
            <div class="pn-letterhead" contenteditable="false">
                <svg class="pn-letterhead-logo" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
                    <!-- Arc swoosh -->
                    <path d="M25 70 Q50 10 75 70" fill="none" stroke="#707070" stroke-width="4" stroke-linecap="round"/>
                    <!-- Swoosh tail -->
                    <path d="M65 35 Q80 20 90 25" fill="none" stroke="#707070" stroke-width="3" stroke-linecap="round"/>
                    <!-- Person figure -->
                    <circle cx="50" cy="40" r="8" fill="#707070"/>
                    <path d="M50 48 L50 65 M50 55 L40 50 M50 55 L60 50 M50 65 L42 78 M50 65 L58 78" 
                          fill="none" stroke="#707070" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="pn-letterhead-slogan">Together &nbsp;&nbsp;&nbsp;&nbsp; Let's Live Healthy</div>
                <div class="pn-letterhead-name">Maldives Neuro <span>Endocrine</span></div>
                <div class="pn-letterhead-subtitle">Medical Facility</div>
            </div>
        `;
    }

    getEditorContent(noteData) {
        // If there's existing content, return it
        if (noteData.content && noteData.content.trim()) {
            // Check if content already has letterhead
            if (noteData.content.includes('pn-letterhead')) {
                return noteData.content;
            }
            // Prepend letterhead to existing content
            return this.getLetterhead() + noteData.content;
        }
        // New note - add letterhead
        return this.getLetterhead() + '<p><br></p>';
    }

    bindEvents() {
        // Search view events
        this.bindSearchEvents();
        
        // Profile view events
        this.bindProfileEvents();
        
        // Editor view events
        this.bindEditorEvents();

        // Header events
        this.bindHeaderEvents();
    }

    bindSearchEvents() {
        const searchInput = document.getElementById('patientSearchInput');
        const searchBtn = document.getElementById('searchPatientBtn');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });

            searchInput.addEventListener('input', (e) => {
                // Show local results as user types
                this.showLocalSearchResults(e.target.value);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = document.getElementById('patientSearchInput')?.value;
                this.performSearch(query);
            });
        }

        // Recent patient cards
        document.querySelectorAll('.pn-recent-card').forEach(card => {
            card.addEventListener('click', () => {
                const patientId = card.dataset.patientId;
                const patient = this.patients.find(p => p.id === patientId);
                if (patient) {
                    this.currentPatient = patient;
                    this.currentView = 'profile';
                    this.render();
                }
            });
        });
    }

    bindProfileEvents() {
        const backBtn = document.getElementById('backToSearch');
        const openNoteBtn = document.getElementById('openNoteBtn');
        const editPatientBtn = document.getElementById('editPatientBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.currentView = 'search';
                this.currentPatient = null;
                this.render();
            });
        }

        if (openNoteBtn) {
            openNoteBtn.addEventListener('click', () => {
                this.currentView = 'editor';
                this.render();
            });
        }

        if (editPatientBtn) {
            editPatientBtn.addEventListener('click', () => {
                this.showEditPatientModal();
            });
        }
    }

    bindEditorEvents() {
        const backToSearchBtn = document.getElementById('backToSearchBtn');
        const noteEditor = document.getElementById('noteEditor');
        const subheadingBtn = document.getElementById('subheadingBtn');
        const subheadingMenu = document.getElementById('subheadingMenu');
        const exportWordBtn = document.getElementById('exportWordBtn');
        const importDocBtn = document.getElementById('importDocBtn');
        const importFileInput = document.getElementById('importFileInput');
        const quickSearchInput = document.getElementById('quickSearchInput');
        const quickSearchBtn = document.getElementById('quickSearchBtn');
        const newConsultBtn = document.getElementById('newConsultBtn');
        const fontIncreaseBtn = document.getElementById('fontIncreaseBtn');
        const fontDecreaseBtn = document.getElementById('fontDecreaseBtn');
        const indentBtn = document.getElementById('indentBtn');
        const outdentBtn = document.getElementById('outdentBtn');
        const textColorBtn = document.getElementById('textColorBtn');
        const textColorMenu = document.getElementById('textColorMenu');
        const highlightBtn = document.getElementById('highlightBtn');
        const highlightMenu = document.getElementById('highlightMenu');
        const customColorPicker = document.getElementById('customColorPicker');

        // Initialize font size
        this.currentFontSize = this.currentFontSize || 14;
        this.updateFontSizeDisplay();

        // Back to search
        if (backToSearchBtn) {
            backToSearchBtn.addEventListener('click', () => {
                this.currentView = 'search';
                this.currentPatient = null;
                this.render();
            });
        }

        // New Consultation button
        if (newConsultBtn) {
            newConsultBtn.addEventListener('click', () => {
                this.insertNewConsultation();
            });
        }

        // Font size controls
        if (fontIncreaseBtn) {
            fontIncreaseBtn.addEventListener('click', () => {
                this.changeFontSize(2);
            });
        }

        if (fontDecreaseBtn) {
            fontDecreaseBtn.addEventListener('click', () => {
                this.changeFontSize(-2);
            });
        }

        // Indent controls
        if (indentBtn) {
            indentBtn.addEventListener('click', () => {
                document.execCommand('indent', false, null);
                noteEditor?.focus();
            });
        }

        if (outdentBtn) {
            outdentBtn.addEventListener('click', () => {
                document.execCommand('outdent', false, null);
                noteEditor?.focus();
            });
        }

        // Keyboard shortcuts for Tab/Shift+Tab in editor
        if (noteEditor) {
            noteEditor.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        document.execCommand('outdent', false, null);
                    } else {
                        document.execCommand('indent', false, null);
                    }
                }
            });
        }

        // Text Color dropdown
        if (textColorBtn && textColorMenu) {
            textColorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other menus
                highlightMenu?.classList.remove('show');
                subheadingMenu?.classList.remove('show');
                textColorMenu?.classList.toggle('show');
            });

            // Color swatches
            textColorMenu.querySelectorAll('.pn-color-swatch:not(.pn-highlight-swatch)').forEach(swatch => {
                swatch.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const color = swatch.dataset.color;
                    document.execCommand('foreColor', false, color);
                    document.getElementById('colorIndicator').style.background = color;
                    textColorMenu.classList.remove('show');
                    noteEditor?.focus();
                });
            });

            // Custom color picker
            if (customColorPicker) {
                customColorPicker.addEventListener('input', (e) => {
                    const color = e.target.value;
                    document.execCommand('foreColor', false, color);
                    document.getElementById('colorIndicator').style.background = color;
                });
                customColorPicker.addEventListener('change', () => {
                    textColorMenu.classList.remove('show');
                    noteEditor?.focus();
                });
            }
        }

        // Highlight Color dropdown
        if (highlightBtn && highlightMenu) {
            highlightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other menus
                textColorMenu?.classList.remove('show');
                subheadingMenu?.classList.remove('show');
                highlightMenu?.classList.toggle('show');
            });

            highlightMenu.querySelectorAll('.pn-highlight-swatch').forEach(swatch => {
                swatch.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const color = swatch.dataset.color;
                    if (color === 'transparent') {
                        document.execCommand('removeFormat', false, 'hiliteColor');
                        document.execCommand('backColor', false, 'transparent');
                    } else {
                        document.execCommand('hiliteColor', false, color);
                    }
                    document.getElementById('highlightIndicator').style.background = color === 'transparent' ? '#e5e7eb' : color;
                    highlightMenu.classList.remove('show');
                    noteEditor?.focus();
                });
            });
        }

        // Close all menus on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.pn-color-dropdown') && !e.target.closest('.pn-subheading-dropdown')) {
                textColorMenu?.classList.remove('show');
                highlightMenu?.classList.remove('show');
                subheadingMenu?.classList.remove('show');
            }
        });

        // Editor auto-save
        if (noteEditor) {
            noteEditor.addEventListener('input', () => {
                this.scheduleAutoSave();
            });

            // Focus placeholder handling
            noteEditor.addEventListener('focus', () => {
                noteEditor.classList.add('focused');
            });
            noteEditor.addEventListener('blur', () => {
                noteEditor.classList.remove('focused');
            });

            // Ctrl+A: Select only content, not letterhead
            noteEditor.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'a') {
                    e.preventDefault();
                    this.selectContentOnly();
                }
            });

            // Track selection changes to update toolbar button states
            document.addEventListener('selectionchange', () => {
                this.updateToolbarState();
            });
        }

        // Print button
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printDocument();
            });
        }

        // Toolbar buttons
        document.querySelectorAll('.pn-tool-btn[data-command]').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                document.getElementById('noteEditor')?.focus();
            });
        });

        // Subheading dropdown
        if (subheadingBtn && subheadingMenu) {
            subheadingBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other menus
                textColorMenu?.classList.remove('show');
                highlightMenu?.classList.remove('show');
                subheadingMenu?.classList.toggle('show');
            });

            document.querySelectorAll('.pn-subheading-item').forEach(item => {
                item.addEventListener('click', () => {
                    const subheading = item.dataset.subheading;
                    if (subheading === 'custom') {
                        this.showCustomSubheadingPrompt();
                    } else {
                        this.insertSubheading(subheading);
                    }
                    subheadingMenu.classList.remove('show');
                });
            });

            // Close menu on outside click
            document.addEventListener('click', () => {
                subheadingMenu.classList.remove('show');
            });
        }

        // Export
        if (exportWordBtn) {
            exportWordBtn.addEventListener('click', () => {
                this.exportAsWord();
            });
        }

        // Import
        if (importDocBtn) {
            importDocBtn.addEventListener('click', () => {
                importFileInput?.click();
            });
        }

        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.importDocument(file);
                }
                importFileInput.value = '';
            });
        }

        // Quick search in editor
        if (quickSearchInput) {
            quickSearchInput.addEventListener('input', (e) => {
                this.showQuickSearchResults(e.target.value);
            });

            quickSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performQuickSearch(e.target.value);
                }
            });

            // Hide results on blur
            quickSearchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    const results = document.getElementById('quickSearchResults');
                    if (results) results.classList.remove('show');
                }, 200);
            });
        }

        if (quickSearchBtn) {
            quickSearchBtn.addEventListener('click', () => {
                this.performQuickSearch(quickSearchInput?.value);
            });
        }
    }

    bindHeaderEvents() {
        const manageBtn = document.getElementById('managePatients');
        const exportDbBtn = document.getElementById('exportDatabaseBtn');
        const viewDocsBtn = document.getElementById('viewDocumentsBtn');
        const addPatientBtn = document.getElementById('addPatientBtn');
        const importDocsBtn = document.getElementById('importDocsBtn');
        const importDocsInput = document.getElementById('importDocsInput');
        
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                this.showPatientManagerModal();
            });
        }

        if (exportDbBtn) {
            exportDbBtn.addEventListener('click', () => {
                this.exportDatabase();
            });
        }

        if (viewDocsBtn) {
            viewDocsBtn.addEventListener('click', () => {
                this.showDocumentsModal();
            });
        }

        if (addPatientBtn) {
            addPatientBtn.addEventListener('click', () => {
                this.showAddPatientModal();
            });
        }

        if (importDocsBtn && importDocsInput) {
            importDocsBtn.addEventListener('click', () => {
                importDocsInput.click();
            });

            importDocsInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                    this.showImportPreviewModal(files);
                }
                importDocsInput.value = '';
            });
        }
    }

    showLocalSearchResults(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const searchLower = query.toLowerCase();
        const matches = this.patients.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            (p.idCard && p.idCard.toLowerCase().includes(searchLower))
        );

        if (matches.length === 0) {
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = `
            <div class="pn-local-results">
                <h4>Saved Patients</h4>
                ${matches.slice(0, 5).map(p => `
                    <div class="pn-result-item" data-patient-id="${p.id}">
                        <div class="pn-result-avatar">${p.name.charAt(0).toUpperCase()}</div>
                        <div class="pn-result-info">
                            <span class="pn-result-name">${p.name}</span>
                            <span class="pn-result-id">${p.idCard || 'No ID'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        resultsContainer.querySelectorAll('.pn-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const patientId = item.dataset.patientId;
                const patient = this.patients.find(p => p.id === patientId);
                if (patient) {
                    this.currentPatient = patient;
                    this.currentView = 'profile';
                    this.render();
                }
            });
        });
    }

    async performSearch(query) {
        if (!query || query.length < 2) return;

        const resultsContainer = document.getElementById('searchResults');

        if (!resultsContainer) return;

        // Search local patients first
        const searchLower = query.toLowerCase();
        const matches = this.patients.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            (p.idCard && p.idCard.toLowerCase().includes(searchLower))
        );

        // Exact match - go directly to profile
        const exactMatch = this.patients.find(p => 
            p.idCard === query || 
            p.name.toLowerCase() === query.toLowerCase()
        );

        if (exactMatch) {
            this.currentPatient = exactMatch;
            this.currentView = 'profile';
            this.render();
            return;
        }

        // Show partial matches if found locally
        if (matches.length > 0) {
            resultsContainer.innerHTML = `
                <div class="pn-local-results">
                    <h4><i class="fas fa-users"></i> Found ${matches.length} patient(s)</h4>
                    ${matches.slice(0, 10).map(p => `
                        <div class="pn-result-item" data-patient-id="${p.id}">
                            <div class="pn-result-avatar">${p.name.charAt(0).toUpperCase()}</div>
                            <div class="pn-result-info">
                                <span class="pn-result-name">${p.name}</span>
                                <span class="pn-result-id">${p.idCard || 'No ID'} ${p.age ? '• ' + p.age + ' years' : ''}</span>
                            </div>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    `).join('')}
                </div>
            `;

            resultsContainer.querySelectorAll('.pn-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const patientId = item.dataset.patientId;
                    const patient = this.patients.find(p => p.id === patientId);
                    if (patient) {
                        this.currentPatient = patient;
                        this.currentView = 'profile';
                        this.render();
                    }
                });
            });
        } else {
            // No local results - search Vinavi automatically
            resultsContainer.innerHTML = `
                <div class="pn-searching">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Searching Vinavi for "${query}"...</span>
                </div>
            `;

            try {
                const response = await fetch(`https://vinavi.aasandha.mv/api/patients/search/${encodeURIComponent(query)}`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && data.data && data.data.id) {
                        const patient = data.data;
                        // Show Vinavi result with Add button
                        resultsContainer.innerHTML = `
                            <div class="pn-vinavi-results">
                                <h4><i class="fas fa-cloud-download-alt"></i> Found in Vinavi</h4>
                                <div class="pn-vinavi-card">
                                    <div class="pn-vinavi-avatar">${(patient.name_en || patient.name || 'U').charAt(0).toUpperCase()}</div>
                                    <div class="pn-vinavi-info">
                                        <span class="pn-vinavi-name">${patient.name_en || patient.name || 'Unknown'}</span>
                                        <span class="pn-vinavi-id"><i class="fas fa-id-card"></i> ${patient.id_card || query}</span>
                                        <span class="pn-vinavi-meta">
                                            ${patient.gender ? `<i class="fas fa-${patient.gender === 'male' ? 'mars' : 'venus'}"></i> ${patient.gender}` : ''}
                                            ${patient.dob ? ` • ${this.calculateAge(patient.dob)} years` : ''}
                                        </span>
                                    </div>
                                    <button class="pn-btn pn-btn-success" id="addFromVinavi">
                                        <i class="fas fa-plus"></i> Add Patient
                                    </button>
                                </div>
                            </div>
                        `;

                        document.getElementById('addFromVinavi')?.addEventListener('click', () => {
                            this.addPatientFromVinaViData(patient, query);
                        });
                    } else {
                        this.showNoVinaviResults(query, resultsContainer);
                    }
                } else {
                    this.showNoVinaviResults(query, resultsContainer);
                }
            } catch (e) {
                console.error('Vinavi search error:', e);
                resultsContainer.innerHTML = `
                    <div class="pn-no-results">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Could not connect to Vinavi</h4>
                        <p>Please check your connection or add patient manually</p>
                        <button class="pn-btn pn-btn-primary" id="addManually">
                            <i class="fas fa-user-plus"></i> Add Manually
                        </button>
                    </div>
                `;

                document.getElementById('addManually')?.addEventListener('click', () => {
                    this.showManualAddModal(query);
                });
            }
        }
    }

    addPatientFromVinaViData(vinaViPatient, searchQuery) {
        const newPatient = {
            id: 'patient_' + Date.now(),
            name: vinaViPatient.name_en || vinaViPatient.name || 'Unknown',
            idCard: vinaViPatient.id_card || searchQuery,
            age: vinaViPatient.age || this.calculateAge(vinaViPatient.dob),
            gender: vinaViPatient.gender || '',
            dob: vinaViPatient.dob,
            phone: vinaViPatient.phone,
            address: vinaViPatient.permanent_address || vinaViPatient.address,
            createdAt: new Date().toISOString()
        };

        this.patients.push(newPatient);
        this.saveData();
        this.showToast(`Added ${newPatient.name} to your patients`, 'success');

        // Go directly to profile
        this.currentPatient = newPatient;
        this.currentView = 'profile';
        this.render();
    }

    showNoVinaviResults(query, container) {
        container.innerHTML = `
            <div class="pn-no-results">
                <i class="fas fa-user-slash"></i>
                <h4>Patient Not Found</h4>
                <p>No patient found for "${query}" in your saved list or Vinavi</p>
                <button class="pn-btn pn-btn-primary" id="addManuallyBtn">
                    <i class="fas fa-user-plus"></i> Add Patient Manually
                </button>
            </div>
        `;

        document.getElementById('addManuallyBtn')?.addEventListener('click', () => {
            this.showManualAddModal(query);
        });
    }

    showManualAddModal(prefillId = '') {
        // Simple manual add modal
        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal pn-modal-compact">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-user-plus"></i> Add Patient Manually</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body">
                    <div class="pn-form-group">
                        <label>Patient Name *</label>
                        <input type="text" id="manualPatientName" class="pn-input" placeholder="Enter full name" required>
                    </div>
                    <div class="pn-form-row">
                        <div class="pn-form-group">
                            <label>ID Card</label>
                            <input type="text" id="manualPatientId" class="pn-input" placeholder="A000000" value="${prefillId}">
                        </div>
                        <div class="pn-form-group">
                            <label>Gender</label>
                            <select id="manualPatientGender" class="pn-input">
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="pn-form-group">
                        <label>Age (years)</label>
                        <input type="number" id="manualPatientAge" class="pn-input" placeholder="Age">
                    </div>
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-secondary" id="cancelManualAdd">Cancel</button>
                    <button class="pn-btn pn-btn-primary" id="confirmManualAdd">
                        <i class="fas fa-plus"></i> Add Patient
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#cancelManualAdd')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Submit handler
        modal.querySelector('#confirmManualAdd')?.addEventListener('click', () => {
            const name = modal.querySelector('#manualPatientName')?.value.trim();
            const idCard = modal.querySelector('#manualPatientId')?.value.trim();
            const gender = modal.querySelector('#manualPatientGender')?.value;
            const age = modal.querySelector('#manualPatientAge')?.value;

            if (!name) {
                this.showToast('Please enter patient name', 'error');
                return;
            }

            const newPatient = {
                id: 'patient_' + Date.now(),
                name: name,
                idCard: idCard || '',
                age: age || '',
                gender: gender || '',
                createdAt: new Date().toISOString()
            };

            this.patients.push(newPatient);
            this.saveData();
            modal.remove();
            this.showToast(`Added ${newPatient.name} to your patients`, 'success');

            // Go to profile
            this.currentPatient = newPatient;
            this.currentView = 'profile';
            this.render();
        });
    }

    showVinaViResults(results, container) {
        container.innerHTML = `
            <div class="pn-vinavi-results">
                <h4><i class="fas fa-database"></i> Vinavi Results</h4>
                ${results.slice(0, 10).map(p => `
                    <div class="pn-vinavi-item" data-patient='${JSON.stringify(p).replace(/'/g, "&#39;")}'>
                        <div class="pn-result-avatar">${(p.name || 'U').charAt(0).toUpperCase()}</div>
                        <div class="pn-result-info">
                            <span class="pn-result-name">${p.name || 'Unknown'}</span>
                            <span class="pn-result-id">${p.idCardNumber || p.idCard || 'No ID'}</span>
                            ${p.age ? `<span class="pn-result-meta">${p.age} years • ${p.gender || ''}</span>` : ''}
                        </div>
                        <button class="pn-btn pn-btn-sm pn-btn-primary">Select</button>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.pn-vinavi-item').forEach(item => {
            item.addEventListener('click', () => {
                const patientData = JSON.parse(item.dataset.patient);
                this.addPatientFromVinaVi(patientData);
            });
        });
    }

    showNoResultsOptions(query, container) {
        container.innerHTML = `
            <div class="pn-no-results">
                <i class="fas fa-user-plus"></i>
                <h4>Patient Not Found</h4>
                <p>No patient found for "${query}". Would you like to add them?</p>
                <button class="pn-btn pn-btn-primary" id="addNewPatientBtn">
                    <i class="fas fa-plus"></i> Add New Patient
                </button>
            </div>
        `;

        document.getElementById('addNewPatientBtn')?.addEventListener('click', () => {
            this.showAddPatientModal(query);
        });
    }

    addPatientFromVinaVi(data) {
        const newPatient = {
            id: 'patient_' + Date.now(),
            name: data.name || 'Unknown',
            idCard: data.idCardNumber || data.idCard || '',
            age: data.age || '',
            gender: data.gender || '',
            createdAt: new Date().toISOString()
        };

        // Check if already exists
        const existing = this.patients.find(p => p.idCard === newPatient.idCard);
        if (existing) {
            this.currentPatient = existing;
        } else {
            this.patients.push(newPatient);
            this.saveData();
            this.currentPatient = newPatient;
        }

        this.currentView = 'profile';
        this.render();
    }

    showAddPatientModal(prefillQuery = '') {
        const isIdCard = /^[A-Za-z]\d{6,}$/.test(prefillQuery);
        
        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-user-plus"></i> Add New Patient</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body">
                    <div class="pn-form-group">
                        <label>Full Name *</label>
                        <input type="text" id="newPatientName" placeholder="Enter patient name" value="${!isIdCard ? prefillQuery : ''}">
                    </div>
                    <div class="pn-form-group">
                        <label>ID Card Number</label>
                        <input type="text" id="newPatientIdCard" placeholder="e.g., A123456" value="${isIdCard ? prefillQuery : ''}">
                    </div>
                    <div class="pn-form-row">
                        <div class="pn-form-group">
                            <label>Age</label>
                            <input type="number" id="newPatientAge" placeholder="Years">
                        </div>
                        <div class="pn-form-group">
                            <label>Gender</label>
                            <select id="newPatientGender">
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-outline" id="cancelAddPatient">Cancel</button>
                    <button class="pn-btn pn-btn-primary" id="confirmAddPatient">
                        <i class="fas fa-plus"></i> Add Patient
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus first input
        setTimeout(() => {
            document.getElementById('newPatientName')?.focus();
        }, 100);

        // Event handlers
        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#cancelAddPatient')?.addEventListener('click', () => modal.remove());
        
        modal.querySelector('#confirmAddPatient')?.addEventListener('click', () => {
            const name = document.getElementById('newPatientName')?.value?.trim();
            const idCard = document.getElementById('newPatientIdCard')?.value?.trim();
            const age = document.getElementById('newPatientAge')?.value?.trim();
            const gender = document.getElementById('newPatientGender')?.value;

            if (!name) {
                alert('Please enter a patient name');
                return;
            }

            const newPatient = {
                id: 'patient_' + Date.now(),
                name,
                idCard,
                age,
                gender,
                createdAt: new Date().toISOString()
            };

            this.patients.push(newPatient);
            this.saveData();
            this.currentPatient = newPatient;
            this.currentView = 'profile';
            
            modal.remove();
            this.render();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showEditPatientModal() {
        if (!this.currentPatient) return;

        const patient = this.currentPatient;
        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Patient</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body">
                    <div class="pn-form-group">
                        <label>Full Name *</label>
                        <input type="text" id="editPatientName" value="${patient.name || ''}">
                    </div>
                    <div class="pn-form-group">
                        <label>ID Card Number</label>
                        <input type="text" id="editPatientIdCard" value="${patient.idCard || ''}">
                    </div>
                    <div class="pn-form-row">
                        <div class="pn-form-group">
                            <label>Age</label>
                            <input type="number" id="editPatientAge" value="${patient.age || ''}">
                        </div>
                        <div class="pn-form-group">
                            <label>Gender</label>
                            <select id="editPatientGender">
                                <option value="">Select...</option>
                                <option value="Male" ${patient.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${patient.gender === 'Female' ? 'selected' : ''}>Female</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-danger" id="deletePatient">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <div class="pn-modal-footer-right">
                        <button class="pn-btn pn-btn-outline" id="cancelEditPatient">Cancel</button>
                        <button class="pn-btn pn-btn-primary" id="saveEditPatient">Save Changes</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#cancelEditPatient')?.addEventListener('click', () => modal.remove());

        modal.querySelector('#saveEditPatient')?.addEventListener('click', () => {
            const name = document.getElementById('editPatientName')?.value?.trim();
            if (!name) {
                alert('Please enter a patient name');
                return;
            }

            const idx = this.patients.findIndex(p => p.id === patient.id);
            if (idx !== -1) {
                this.patients[idx] = {
                    ...this.patients[idx],
                    name,
                    idCard: document.getElementById('editPatientIdCard')?.value?.trim(),
                    age: document.getElementById('editPatientAge')?.value?.trim(),
                    gender: document.getElementById('editPatientGender')?.value
                };
                this.currentPatient = this.patients[idx];
                this.saveData();
            }

            modal.remove();
            this.render();
        });

        modal.querySelector('#deletePatient')?.addEventListener('click', () => {
            if (confirm(`Delete patient "${patient.name}"? This will also delete their notes.`)) {
                this.patients = this.patients.filter(p => p.id !== patient.id);
                delete this.notes[patient.id];
                this.saveData();
                this.currentPatient = null;
                this.currentView = 'search';
                modal.remove();
                this.render();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showPatientManagerModal() {
        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal pn-modal-large">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-users-cog"></i> Manage Patients</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body">
                    ${this.patients.length === 0 ? `
                        <div class="pn-empty-state">
                            <i class="fas fa-users"></i>
                            <p>No patients added yet</p>
                        </div>
                    ` : `
                        <div class="pn-patient-list">
                            ${this.patients.map(p => `
                                <div class="pn-patient-row" data-patient-id="${p.id}">
                                    <div class="pn-patient-row-avatar">${p.name.charAt(0).toUpperCase()}</div>
                                    <div class="pn-patient-row-info">
                                        <span class="pn-patient-row-name">${p.name}</span>
                                        <span class="pn-patient-row-meta">${p.idCard || 'No ID'} ${p.age ? '• ' + p.age + ' years' : ''}</span>
                                    </div>
                                    <div class="pn-patient-row-actions">
                                        <button class="pn-btn pn-btn-sm pn-btn-outline pn-edit-patient-btn">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="pn-btn pn-btn-sm pn-btn-danger pn-delete-patient-btn">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-outline" id="closeManagerBtn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#closeManagerBtn')?.addEventListener('click', () => modal.remove());

        modal.querySelectorAll('.pn-edit-patient-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const row = btn.closest('.pn-patient-row');
                const patientId = row?.dataset.patientId;
                const patient = this.patients.find(p => p.id === patientId);
                if (patient) {
                    modal.remove();
                    this.currentPatient = patient;
                    this.showEditPatientModal();
                }
            });
        });

        modal.querySelectorAll('.pn-delete-patient-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const row = btn.closest('.pn-patient-row');
                const patientId = row?.dataset.patientId;
                const patient = this.patients.find(p => p.id === patientId);
                if (patient && confirm(`Delete patient "${patient.name}"?`)) {
                    this.patients = this.patients.filter(p => p.id !== patientId);
                    delete this.notes[patientId];
                    this.saveData();
                    row?.remove();
                    
                    if (this.patients.length === 0) {
                        modal.querySelector('.pn-modal-body').innerHTML = `
                            <div class="pn-empty-state">
                                <i class="fas fa-users"></i>
                                <p>No patients added yet</p>
                            </div>
                        `;
                    }
                }
            });
        });

        modal.querySelectorAll('.pn-patient-row').forEach(row => {
            row.addEventListener('click', () => {
                const patientId = row.dataset.patientId;
                const patient = this.patients.find(p => p.id === patientId);
                if (patient) {
                    modal.remove();
                    this.currentPatient = patient;
                    this.currentView = 'profile';
                    this.render();
                }
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Add Patient Modal - Manual entry or fetch from Vinavi
    showAddPatientModal(prefillId = '') {
        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-user-plus"></i> Add New Patient</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body">
                    <div class="pn-add-method-tabs">
                        <button class="pn-tab-btn active" data-tab="vinavi">
                            <i class="fas fa-cloud-download-alt"></i> From Vinavi
                        </button>
                        <button class="pn-tab-btn" data-tab="manual">
                            <i class="fas fa-edit"></i> Manual Entry
                        </button>
                    </div>

                    <!-- Vinavi Tab -->
                    <div class="pn-tab-content active" id="vinaViTab">
                        <div class="pn-form-group">
                            <label>Patient ID Card</label>
                            <div class="pn-vinavi-search">
                                <input type="text" id="vinaViSearchId" placeholder="Enter ID card number (e.g., A123456)" value="${prefillId}">
                                <button class="pn-btn pn-btn-primary" id="fetchVinaViBtn">
                                    <i class="fas fa-search"></i> Fetch
                                </button>
                            </div>
                        </div>
                        <div id="vinaViPatientPreview" class="pn-vinavi-preview"></div>
                    </div>

                    <!-- Manual Tab -->
                    <div class="pn-tab-content" id="manualTab">
                        <div class="pn-form-group">
                            <label>Full Name *</label>
                            <input type="text" id="manualName" placeholder="Patient full name">
                        </div>
                        <div class="pn-form-row">
                            <div class="pn-form-group">
                                <label>ID Card</label>
                                <input type="text" id="manualIdCard" placeholder="A123456">
                            </div>
                            <div class="pn-form-group">
                                <label>Age</label>
                                <input type="number" id="manualAge" placeholder="Age">
                            </div>
                        </div>
                        <div class="pn-form-row">
                            <div class="pn-form-group">
                                <label>Gender</label>
                                <select id="manualGender">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div class="pn-form-group">
                                <label>Phone</label>
                                <input type="text" id="manualPhone" placeholder="Phone number">
                            </div>
                        </div>
                        <div class="pn-form-group">
                            <label>Address</label>
                            <input type="text" id="manualAddress" placeholder="Address">
                        </div>
                    </div>
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-outline" id="cancelAddPatient">Cancel</button>
                    <button class="pn-btn pn-btn-primary" id="confirmAddPatient" disabled>
                        <i class="fas fa-plus"></i> Add Patient
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        let selectedPatientData = null;
        let activeTab = 'vinavi';

        // Tab switching
        modal.querySelectorAll('.pn-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                modal.querySelectorAll('.pn-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                modal.querySelectorAll('.pn-tab-content').forEach(c => c.classList.remove('active'));
                modal.querySelector(`#${activeTab}Tab`).classList.add('active');
                
                // Update confirm button state
                this.updateAddPatientButtonState(modal, activeTab, selectedPatientData);
            });
        });

        // Fetch from Vinavi
        const fetchBtn = modal.querySelector('#fetchVinaViBtn');
        const vinaViInput = modal.querySelector('#vinaViSearchId');
        const preview = modal.querySelector('#vinaViPatientPreview');

        fetchBtn?.addEventListener('click', async () => {
            const idCard = vinaViInput?.value.trim();
            if (!idCard) {
                this.showToast('Please enter an ID card number', 'error');
                return;
            }

            preview.innerHTML = `<div class="pn-loading"><i class="fas fa-spinner fa-spin"></i> Searching Vinavi...</div>`;

            try {
                const response = await fetch(`https://vinavi.aasandha.mv/api/patients/search/${encodeURIComponent(idCard)}`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    // API returns { data: { id, name_en, id_card, ... } }
                    if (data && data.data) {
                        const patient = data.data;
                        selectedPatientData = {
                            name: patient.name_en || patient.name,
                            idCard: patient.id_card || idCard,
                            age: patient.age || this.calculateAge(patient.dob),
                            gender: patient.gender,
                            dob: patient.dob,
                            phone: patient.phone,
                            address: patient.permanent_address || patient.address
                        };

                        preview.innerHTML = `
                            <div class="pn-patient-preview-card">
                                <div class="pn-preview-avatar">${selectedPatientData.name.charAt(0).toUpperCase()}</div>
                                <div class="pn-preview-details">
                                    <h4>${selectedPatientData.name}</h4>
                                    <p><i class="fas fa-id-card"></i> ${selectedPatientData.idCard}</p>
                                    <p><i class="fas fa-user"></i> ${selectedPatientData.age || 'N/A'} years • ${selectedPatientData.gender || 'N/A'}</p>
                                    ${selectedPatientData.phone ? `<p><i class="fas fa-phone"></i> ${selectedPatientData.phone}</p>` : ''}
                                </div>
                                <i class="fas fa-check-circle pn-preview-check"></i>
                            </div>
                        `;

                        this.updateAddPatientButtonState(modal, activeTab, selectedPatientData);
                    } else {
                        preview.innerHTML = `<div class="pn-no-results"><i class="fas fa-user-slash"></i> No patient found with ID "${idCard}"</div>`;
                        selectedPatientData = null;
                        this.updateAddPatientButtonState(modal, activeTab, null);
                    }
                } else {
                    throw new Error('Failed to fetch');
                }
            } catch (e) {
                preview.innerHTML = `<div class="pn-error"><i class="fas fa-exclamation-triangle"></i> Could not connect to Vinavi</div>`;
                selectedPatientData = null;
                this.updateAddPatientButtonState(modal, activeTab, null);
            }
        });

        // Manual input validation
        const manualInputs = modal.querySelectorAll('#manualTab input, #manualTab select');
        manualInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateAddPatientButtonState(modal, activeTab, selectedPatientData);
            });
        });

        // Confirm add patient
        modal.querySelector('#confirmAddPatient')?.addEventListener('click', () => {
            let patientData;

            if (activeTab === 'vinavi' && selectedPatientData) {
                patientData = selectedPatientData;
            } else if (activeTab === 'manual') {
                const name = modal.querySelector('#manualName')?.value.trim();
                if (!name) {
                    this.showToast('Please enter patient name', 'error');
                    return;
                }
                patientData = {
                    name: name,
                    idCard: modal.querySelector('#manualIdCard')?.value.trim() || '',
                    age: modal.querySelector('#manualAge')?.value || '',
                    gender: modal.querySelector('#manualGender')?.value || '',
                    phone: modal.querySelector('#manualPhone')?.value.trim() || '',
                    address: modal.querySelector('#manualAddress')?.value.trim() || ''
                };
            }

            if (patientData) {
                // Check if patient already exists
                const existing = this.patients.find(p => p.idCard && p.idCard === patientData.idCard);
                if (existing) {
                    if (confirm(`Patient with ID ${patientData.idCard} already exists. Open their profile?`)) {
                        modal.remove();
                        this.currentPatient = existing;
                        this.currentView = 'profile';
                        this.render();
                    }
                    return;
                }

                // Add new patient
                const newPatient = {
                    id: 'patient_' + Date.now(),
                    ...patientData,
                    createdAt: new Date().toISOString()
                };

                this.patients.push(newPatient);
                this.saveData();
                modal.remove();
                
                this.showToast(`Patient "${patientData.name}" added successfully`, 'success');
                this.currentPatient = newPatient;
                this.currentView = 'profile';
                this.render();
            }
        });

        // Close handlers
        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#cancelAddPatient')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Auto-fetch if prefillId provided
        if (prefillId) {
            setTimeout(() => fetchBtn?.click(), 100);
        }
    }

    updateAddPatientButtonState(modal, activeTab, selectedPatientData) {
        const confirmBtn = modal.querySelector('#confirmAddPatient');
        if (!confirmBtn) return;

        if (activeTab === 'vinavi') {
            confirmBtn.disabled = !selectedPatientData;
        } else {
            const name = modal.querySelector('#manualName')?.value.trim();
            confirmBtn.disabled = !name;
        }
    }

    calculateAge(dob) {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Import Documents Preview Modal
    showImportPreviewModal(files) {
        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal pn-modal-xlarge">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-file-import"></i> Import Documents (${files.length} files)</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body">
                    <div class="pn-import-instructions">
                        <i class="fas fa-info-circle"></i>
                        <p>Processing documents... The filename (ID card) will be used to find the patient in Vinavi.</p>
                    </div>
                    <div class="pn-import-list" id="importPreviewList">
                        <div class="pn-loading"><i class="fas fa-spinner fa-spin"></i> Reading documents...</div>
                    </div>
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-outline" id="cancelImport">Cancel</button>
                    <button class="pn-btn pn-btn-primary" id="confirmImportAll" disabled>
                        <i class="fas fa-check-circle"></i> Import All Approved
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const previewList = modal.querySelector('#importPreviewList');
        const confirmAllBtn = modal.querySelector('#confirmImportAll');
        let processedDocs = [];

        // Process files
        this.processImportFiles(files, previewList, processedDocs, confirmAllBtn);

        // Confirm import all
        confirmAllBtn?.addEventListener('click', () => {
            const approved = processedDocs.filter(d => d.approved);
            
            approved.forEach(doc => {
                // Add patient if not exists
                let patient = this.patients.find(p => p.idCard === doc.patientData.idCard);
                
                if (!patient) {
                    patient = {
                        id: 'patient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        ...doc.patientData,
                        createdAt: new Date().toISOString()
                    };
                    this.patients.push(patient);
                }

                // Add/append notes
                const existingNote = this.notes[patient.id];
                if (existingNote && existingNote.content) {
                    this.notes[patient.id] = {
                        content: existingNote.content + '<hr style="margin:30px 0;border:none;border-top:2px solid #e2e8f0;">' + doc.content,
                        lastEdited: new Date().toISOString()
                    };
                } else {
                    this.notes[patient.id] = {
                        content: this.getLetterhead() + doc.content,
                        lastEdited: new Date().toISOString()
                    };
                }
            });

            this.saveData();
            modal.remove();
            this.showToast(`Imported ${approved.length} document(s) successfully`, 'success');
            this.render();
        });

        // Close handlers
        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#cancelImport')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async processImportFiles(files, container, processedDocs, confirmBtn) {
        container.innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const docItem = document.createElement('div');
            docItem.className = 'pn-import-item';
            docItem.innerHTML = `
                <div class="pn-import-item-header">
                    <div class="pn-import-file-info">
                        <i class="fas fa-file-word"></i>
                        <span class="pn-import-filename">${file.name}</span>
                    </div>
                    <span class="pn-import-status"><i class="fas fa-spinner fa-spin"></i> Processing...</span>
                </div>
                <div class="pn-import-preview"></div>
            `;
            container.appendChild(docItem);

            try {
                // Extract ID from filename (remove extension)
                const idCard = file.name.replace(/\.(doc|docx)$/i, '').trim();
                
                // Read file content
                const content = await this.readDocFile(file);
                
                // Try to find patient in Vinavi
                let patientData = null;
                try {
                    const response = await fetch(`https://vinavi.aasandha.mv/api/patients/search/${encodeURIComponent(idCard)}`, {
                        credentials: 'include'
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const p = data[0];
                            patientData = {
                                name: p.name_en || p.name,
                                idCard: p.id_card || idCard,
                                age: p.age || this.calculateAge(p.dob),
                                gender: p.gender,
                                phone: p.phone,
                                address: p.permanent_address || p.address
                            };
                        }
                    }
                } catch (e) {
                    console.log('Vinavi fetch failed:', e);
                }

                // Check if patient already exists locally
                const existingPatient = this.patients.find(p => p.idCard === idCard);
                if (existingPatient && !patientData) {
                    patientData = existingPatient;
                }

                // Create preview content (first 200 chars)
                const previewText = content.replace(/<[^>]+>/g, ' ').substring(0, 200) + '...';

                const docData = {
                    file: file,
                    idCard: idCard,
                    patientData: patientData || { name: 'Unknown', idCard: idCard },
                    content: content,
                    approved: !!patientData
                };
                processedDocs.push(docData);

                docItem.innerHTML = `
                    <div class="pn-import-item-header">
                        <div class="pn-import-file-info">
                            <i class="fas fa-file-word"></i>
                            <span class="pn-import-filename">${file.name}</span>
                        </div>
                        <div class="pn-import-actions">
                            <label class="pn-import-approve">
                                <input type="checkbox" class="pn-approve-check" data-index="${i}" ${docData.approved ? 'checked' : ''}>
                                <span>Approve</span>
                            </label>
                        </div>
                    </div>
                    <div class="pn-import-preview">
                        <div class="pn-import-patient ${patientData ? 'found' : 'not-found'}">
                            ${patientData ? `
                                <div class="pn-import-patient-avatar">${patientData.name.charAt(0).toUpperCase()}</div>
                                <div class="pn-import-patient-info">
                                    <strong>${patientData.name}</strong>
                                    <span>${patientData.idCard} • ${patientData.age || 'N/A'} years • ${patientData.gender || 'N/A'}</span>
                                </div>
                                <i class="fas fa-check-circle pn-patient-found-icon"></i>
                            ` : `
                                <div class="pn-import-patient-avatar">?</div>
                                <div class="pn-import-patient-info">
                                    <strong>Patient Not Found</strong>
                                    <span>ID: ${idCard} - Enter details manually</span>
                                </div>
                                <button class="pn-btn pn-btn-sm pn-btn-outline pn-manual-entry-btn" data-index="${i}">
                                    <i class="fas fa-edit"></i> Enter
                                </button>
                            `}
                        </div>
                        <div class="pn-import-content-preview">
                            <strong>Content Preview:</strong>
                            <p>${previewText}</p>
                        </div>
                    </div>
                `;

                // Bind approve checkbox
                docItem.querySelector('.pn-approve-check')?.addEventListener('change', (e) => {
                    processedDocs[i].approved = e.target.checked;
                    this.updateImportButtonState(processedDocs, confirmBtn);
                });

                // Bind manual entry button
                docItem.querySelector('.pn-manual-entry-btn')?.addEventListener('click', () => {
                    this.showManualPatientEntryForImport(processedDocs, i, docItem, confirmBtn);
                });

            } catch (e) {
                docItem.innerHTML = `
                    <div class="pn-import-item-header">
                        <div class="pn-import-file-info">
                            <i class="fas fa-file-word"></i>
                            <span class="pn-import-filename">${file.name}</span>
                        </div>
                        <span class="pn-import-status error"><i class="fas fa-exclamation-triangle"></i> Failed to read</span>
                    </div>
                `;
            }
        }

        this.updateImportButtonState(processedDocs, confirmBtn);
    }

    async readDocFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // For .docx files, we need to parse the XML content
                    // For now, return the raw text content
                    let content = e.target.result;
                    
                    // Simple cleanup for readable content
                    if (file.name.endsWith('.docx')) {
                        // DOCX is a zip file with XML, this is a simplified extraction
                        // In production, you'd use a library like mammoth.js
                        content = `<p>${content.substring(0, 5000).replace(/[^\x20-\x7E\n]/g, ' ').trim()}</p>`;
                    } else {
                        content = `<p>${content}</p>`;
                    }
                    
                    resolve(content);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    updateImportButtonState(processedDocs, confirmBtn) {
        const approvedCount = processedDocs.filter(d => d.approved).length;
        if (confirmBtn) {
            confirmBtn.disabled = approvedCount === 0;
            confirmBtn.innerHTML = `<i class="fas fa-check-circle"></i> Import ${approvedCount > 0 ? approvedCount : 'All'} Approved`;
        }
    }

    showManualPatientEntryForImport(processedDocs, index, docItem, confirmBtn) {
        const patientCard = docItem.querySelector('.pn-import-patient');
        if (!patientCard) return;

        patientCard.innerHTML = `
            <div class="pn-mini-form">
                <input type="text" class="pn-mini-input" id="importName${index}" placeholder="Patient Name *">
                <input type="text" class="pn-mini-input" id="importAge${index}" placeholder="Age" style="width:60px;">
                <select class="pn-mini-select" id="importGender${index}">
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <button class="pn-btn pn-btn-sm pn-btn-primary pn-confirm-manual-btn">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `;

        patientCard.querySelector('.pn-confirm-manual-btn')?.addEventListener('click', () => {
            const name = docItem.querySelector(`#importName${index}`)?.value.trim();
            if (!name) {
                this.showToast('Please enter patient name', 'error');
                return;
            }

            processedDocs[index].patientData = {
                name: name,
                idCard: processedDocs[index].idCard,
                age: docItem.querySelector(`#importAge${index}`)?.value || '',
                gender: docItem.querySelector(`#importGender${index}`)?.value || ''
            };
            processedDocs[index].approved = true;

            // Update UI
            patientCard.className = 'pn-import-patient found';
            patientCard.innerHTML = `
                <div class="pn-import-patient-avatar">${name.charAt(0).toUpperCase()}</div>
                <div class="pn-import-patient-info">
                    <strong>${name}</strong>
                    <span>${processedDocs[index].idCard} • ${processedDocs[index].patientData.age || 'N/A'} years • ${processedDocs[index].patientData.gender || 'N/A'}</span>
                </div>
                <i class="fas fa-check-circle pn-patient-found-icon"></i>
            `;

            // Update checkbox
            const checkbox = docItem.querySelector('.pn-approve-check');
            if (checkbox) checkbox.checked = true;

            this.updateImportButtonState(processedDocs, confirmBtn);
        });
    }

    // Quick search in editor
    showQuickSearchResults(query) {
        const container = document.getElementById('quickSearchResults');
        if (!container) return;

        if (!query || query.length < 2) {
            container.innerHTML = '';
            container.classList.remove('show');
            return;
        }

        const searchLower = query.toLowerCase();
        const matches = this.patients.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            (p.idCard && p.idCard.toLowerCase().includes(searchLower))
        );

        if (matches.length === 0) {
            container.innerHTML = `
                <div class="pn-quick-result-item pn-add-new">
                    <i class="fas fa-plus"></i> Add "${query}" as new patient
                </div>
            `;
        } else {
            container.innerHTML = matches.slice(0, 5).map(p => `
                <div class="pn-quick-result-item" data-patient-id="${p.id}">
                    <span class="pn-quick-avatar">${p.name.charAt(0).toUpperCase()}</span>
                    <span class="pn-quick-name">${p.name}</span>
                    <span class="pn-quick-id">${p.idCard || ''}</span>
                </div>
            `).join('');
        }

        container.classList.add('show');

        container.querySelectorAll('.pn-quick-result-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('pn-add-new')) {
                    this.showAddPatientModal(query);
                } else {
                    const patientId = item.dataset.patientId;
                    const patient = this.patients.find(p => p.id === patientId);
                    if (patient) {
                        // Save current note first
                        this.saveCurrentNote();
                        this.currentPatient = patient;
                        this.render();
                    }
                }
                container.classList.remove('show');
            });
        });
    }

    async performQuickSearch(query) {
        if (!query || query.length < 2) return;

        // Save current note
        this.saveCurrentNote();

        // Check local
        const localMatch = this.patients.find(p => 
            p.idCard === query || 
            p.name.toLowerCase() === query.toLowerCase()
        );

        if (localMatch) {
            this.currentPatient = localMatch;
            this.render();
            return;
        }

        // Try Vinavi
        try {
            const response = await fetch(`https://vinavi.aasandha.mv/api/patients/search/${encodeURIComponent(query)}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    // Show first match
                    this.addPatientFromVinaVi(data[0]);
                    return;
                }
            }
        } catch (e) {
            console.log('Vinavi quick search failed:', e);
        }

        // Not found - offer to add
        this.showAddPatientModal(query);
    }

    scheduleAutoSave() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (indicator) {
            indicator.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving...';
            indicator.classList.add('saving');
        }

        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentNote();
            if (indicator) {
                indicator.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
                indicator.classList.remove('saving');
            }
        }, 1000);
    }

    saveCurrentNote() {
        if (!this.currentPatient) return;

        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        this.notes[this.currentPatient.id] = {
            content: editor.innerHTML,
            lastEdited: new Date().toISOString()
        };

        this.saveData();
    }

    insertSubheading(text) {
        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        // Create subheading with proper spacing for indented lists below
        const html = `<h3 style="color:#2563eb;margin-top:20px;margin-bottom:10px;font-weight:600;font-family:Inter,sans-serif;">${text}</h3><p style="margin-left:24px;"><br></p>`;
        
        editor.focus();
        document.execCommand('insertHTML', false, html);
    }

    // Insert new consultation with date separator
    insertNewConsultation() {
        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Count existing consultations to get the number
        const existingConsultations = editor.querySelectorAll('.consultation-separator');
        const consultationNumber = existingConsultations.length + 1;
        
        // Get ordinal suffix
        const getOrdinal = (n) => {
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        const html = `<div class="consultation-separator" contenteditable="false" style="margin:30px 0 20px 0;padding:15px 20px;background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);border-left:4px solid #2563eb;border-radius:0 8px 8px 0;box-shadow:0 2px 4px rgba(0,0,0,0.05);user-select:none;pointer-events:none;">
<div style="display:flex;justify-content:space-between;align-items:center;">
<span style="font-weight:700;font-size:16px;color:#1e40af;">📋 ${getOrdinal(consultationNumber)} Consultation</span>
<span style="font-size:13px;color:#3b82f6;font-weight:500;">${dateStr} • ${timeStr}</span>
</div>
</div><p><br></p>`;
        
        editor.focus();
        
        // Move cursor to end of content first
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        document.execCommand('insertHTML', false, html);
        this.scheduleAutoSave();
        this.showToast(`${getOrdinal(consultationNumber)} Consultation added`, 'success');
    }

    // Font size controls
    changeFontSize(delta) {
        this.currentFontSize = Math.max(10, Math.min(24, (this.currentFontSize || 14) + delta));
        this.updateFontSizeDisplay();
        
        const editor = document.getElementById('noteEditor');
        if (editor) {
            editor.style.fontSize = this.currentFontSize + 'pt';
        }
    }

    updateFontSizeDisplay() {
        const display = document.getElementById('fontSizeDisplay');
        if (display) {
            display.textContent = (this.currentFontSize || 14) + 'pt';
        }
    }

    showCustomSubheadingPrompt() {
        const text = prompt('Enter custom subheading:');
        if (text && text.trim()) {
            this.insertSubheading(text.trim());
        }
    }

    exportAsWord() {
        if (!this.currentPatient) return;

        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        const patient = this.currentPatient;
        const date = new Date().toLocaleDateString();

        // Get content without the letterhead (we'll add a proper Word-formatted letterhead)
        const editorClone = editor.cloneNode(true);
        const letterheadEl = editorClone.querySelector('.pn-letterhead');
        if (letterheadEl) {
            letterheadEl.remove();
        }
        const notesContent = editorClone.innerHTML;

        const htmlContent = `
            <!DOCTYPE html>
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word">
            <head>
                <meta charset="UTF-8">
                <title>Patient Notes - ${patient.name}</title>
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>100</w:Zoom>
                    </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    @page { margin: 1in; }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 12pt; 
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                    }
                    .letterhead {
                        text-align: center;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        border-bottom: 3px solid #dab56d;
                    }
                    .letterhead-logo {
                        font-size: 36pt;
                        color: #555;
                        margin-bottom: 5px;
                    }
                    .letterhead-slogan {
                        font-size: 9pt;
                        letter-spacing: 4px;
                        color: #666;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                    }
                    .letterhead-name {
                        font-size: 18pt;
                        font-weight: bold;
                        color: #2563eb;
                        margin-bottom: 3px;
                    }
                    .letterhead-subtitle {
                        font-size: 10pt;
                        color: #666;
                        background-color: #f0f0f0;
                        padding: 3px 15px;
                        display: inline-block;
                    }
                    .patient-box {
                        background-color: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 15px 20px;
                        margin-bottom: 25px;
                    }
                    .patient-box table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .patient-box td {
                        padding: 4px 10px;
                        font-size: 11pt;
                    }
                    .patient-box .label {
                        font-weight: bold;
                        color: #374151;
                        width: 100px;
                    }
                    .patient-box .value {
                        color: #1f2937;
                    }
                    .content { margin-top: 20px; }
                    h3 { color: #2563eb; margin-top: 16px; margin-bottom: 8px; font-size: 14pt; }
                    ul, ol { margin-left: 20px; margin-bottom: 10px; }
                    li { margin-bottom: 5px; }
                    p { margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <!-- Letterhead -->
                <div class="letterhead">
                    <div class="letterhead-logo">⚕</div>
                    <div class="letterhead-slogan">Together &nbsp;&nbsp;&nbsp;&nbsp; Let's Live Healthy</div>
                    <div class="letterhead-name">Maldives Neuro Endocrine</div>
                    <div class="letterhead-subtitle">Medical Facility</div>
                </div>

                <!-- Patient Information Box -->
                <div class="patient-box">
                    <table>
                        <tr>
                            <td class="label">Patient Name:</td>
                            <td class="value">${patient.name}</td>
                            <td class="label">Date:</td>
                            <td class="value">${date}</td>
                        </tr>
                        <tr>
                            <td class="label">ID Card:</td>
                            <td class="value">${patient.idCard || '-'}</td>
                            <td class="label">Gender:</td>
                            <td class="value">${patient.gender || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Age:</td>
                            <td class="value">${patient.age || '-'}</td>
                            <td class="label"></td>
                            <td class="value"></td>
                        </tr>
                    </table>
                </div>

                <!-- Notes Content -->
                <div class="content">
                    ${notesContent}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${patient.name.replace(/[^a-z0-9]/gi, '_')}_notes_${date.replace(/\//g, '-')}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Print document
    printDocument() {
        if (!this.currentPatient) return;

        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        const patient = this.currentPatient;
        const date = new Date().toLocaleDateString();

        // Get content without the letterhead
        const editorClone = editor.cloneNode(true);
        const letterheadEl = editorClone.querySelector('.pn-letterhead');
        if (letterheadEl) {
            letterheadEl.remove();
        }
        const notesContent = editorClone.innerHTML;

        // Create print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Patient Notes - ${patient.name}</title>
                <style>
                    @media print {
                        body { margin: 0.5in; }
                        @page { margin: 0.5in; }
                    }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 12pt; 
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .letterhead {
                        text-align: center;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        border-bottom: 3px solid #dab56d;
                    }
                    .letterhead-logo {
                        font-size: 40pt;
                        color: #555;
                        margin-bottom: 5px;
                    }
                    .letterhead-slogan {
                        font-size: 9pt;
                        letter-spacing: 4px;
                        color: #666;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                    }
                    .letterhead-name {
                        font-size: 20pt;
                        font-weight: bold;
                        color: #2563eb;
                        margin-bottom: 5px;
                    }
                    .letterhead-subtitle {
                        font-size: 10pt;
                        color: #666;
                        background: #f0f0f0;
                        padding: 4px 15px;
                        display: inline-block;
                        border-radius: 3px;
                    }
                    .patient-box {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 15px 20px;
                        margin-bottom: 25px;
                    }
                    .patient-box table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .patient-box td {
                        padding: 4px 10px;
                        font-size: 11pt;
                    }
                    .patient-box .label {
                        font-weight: bold;
                        color: #374151;
                        width: 100px;
                    }
                    .patient-box .value {
                        color: #1f2937;
                    }
                    h3 { color: #2563eb; margin-top: 20px; margin-bottom: 10px; }
                    ul, ol { margin-left: 20px; }
                </style>
            </head>
            <body>
                <!-- Letterhead -->
                <div class="letterhead">
                    <div class="letterhead-logo">⚕</div>
                    <div class="letterhead-slogan">Together &nbsp;&nbsp;&nbsp;&nbsp; Let's Live Healthy</div>
                    <div class="letterhead-name">Maldives Neuro Endocrine</div>
                    <div class="letterhead-subtitle">Medical Facility</div>
                </div>

                <!-- Patient Information Box -->
                <div class="patient-box">
                    <table>
                        <tr>
                            <td class="label">Patient Name:</td>
                            <td class="value">${patient.name}</td>
                            <td class="label">Date:</td>
                            <td class="value">${date}</td>
                        </tr>
                        <tr>
                            <td class="label">ID Card:</td>
                            <td class="value">${patient.idCard || '-'}</td>
                            <td class="label">Gender:</td>
                            <td class="value">${patient.gender || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Age:</td>
                            <td class="value">${patient.age || '-'}</td>
                            <td class="label"></td>
                            <td class="value"></td>
                        </tr>
                    </table>
                </div>

                <!-- Notes Content -->
                <div class="content">
                    ${notesContent}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    // Select only content, excluding letterhead
    selectContentOnly() {
        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        const letterhead = editor.querySelector('.pn-letterhead');
        const range = document.createRange();
        const selection = window.getSelection();

        if (letterhead && letterhead.nextSibling) {
            // Start selection after letterhead
            range.setStartAfter(letterhead);
            range.setEndAfter(editor.lastChild || letterhead);
        } else {
            // No letterhead, select all
            range.selectNodeContents(editor);
        }

        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Update toolbar button states based on current selection
    updateToolbarState() {
        const editor = document.getElementById('noteEditor');
        if (!editor || !editor.contains(document.activeElement) && document.activeElement !== editor) {
            return;
        }

        // Commands to check
        const commands = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight'];
        
        commands.forEach(command => {
            const btn = document.querySelector(`.pn-tool-btn[data-command="${command}"]`);
            if (btn) {
                const isActive = document.queryCommandState(command);
                btn.classList.toggle('active', isActive);
            }
        });
    }

    importDocument(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            let content = e.target.result;
            const fileName = file.name.toLowerCase();

            // Parse based on file type
            if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.html')) {
                content = this.parseDocContent(content);
            } else if (fileName.endsWith('.rtf')) {
                content = this.parseRtfContent(content);
            }
            // .txt files use content as-is

            const editor = document.getElementById('noteEditor');
            if (editor) {
                // Append to existing content
                if (editor.innerHTML.trim() && editor.innerHTML !== '<br>') {
                    editor.innerHTML += '<br><hr><br>' + content;
                } else {
                    editor.innerHTML = content;
                }
                this.scheduleAutoSave();
            }
        };

        reader.readAsText(file);
    }

    parseDocContent(content) {
        // Create temp element to parse HTML/Word content
        const temp = document.createElement('div');
        temp.innerHTML = content;

        // Remove Word-specific elements
        temp.querySelectorAll('style, script, meta, link, xml, o\\:*, w\\:*, m\\:*').forEach(el => el.remove());

        // Extract text with basic formatting
        let result = '';
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) result += text + ' ';
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toLowerCase();
                
                if (tag === 'p' || tag === 'div' || tag === 'br') {
                    if (result && !result.endsWith('\n')) result += '\n';
                }
                if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
                    if (result && !result.endsWith('\n')) result += '\n';
                    result += '<strong>';
                }

                node.childNodes.forEach(child => walk(child));

                if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
                    result += '</strong>\n';
                }
                if (tag === 'p' || tag === 'div') {
                    result += '\n';
                }
            }
        };

        walk(temp);

        // Convert newlines to <br> and clean up
        return result
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => `<p>${line}</p>`)
            .join('');
    }

    parseRtfContent(content) {
        // Basic RTF to text conversion
        let text = content
            .replace(/\\par[d]?/g, '\n')
            .replace(/\{\*?\\[^{}]+\}|[{}]|\\[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, '')
            .replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => `<p>${line}</p>`)
            .join('');
    }

    // Export entire patient database
    exportDatabase() {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '3.0',
            patients: this.patients,
            notes: this.notes,
            documents: this.documents
        };

        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patient_notes_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Database exported successfully!', 'success');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `pn-toast pn-toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Show documents modal for current patient
    showDocumentsModal() {
        if (!this.currentPatient) {
            this.showToast('Please select a patient first', 'error');
            return;
        }

        const patientId = this.currentPatient.id;
        const patientDocs = this.documents[patientId] || [];

        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal pn-modal-large">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-folder-open"></i> Documents - ${this.currentPatient.name}</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body">
                    <div class="pn-docs-actions">
                        <button class="pn-btn pn-btn-primary" id="importMultipleDocsBtn">
                            <i class="fas fa-file-import"></i> Import Documents
                        </button>
                        <input type="file" id="multiDocInput" multiple accept=".doc,.docx,.txt,.html,.rtf,.pdf" style="display:none">
                    </div>
                    
                    <div class="pn-docs-list" id="documentsList">
                        ${patientDocs.length === 0 ? `
                            <div class="pn-empty-state">
                                <i class="fas fa-file-medical-alt"></i>
                                <p>No documents imported yet</p>
                                <p class="pn-empty-hint">Click "Import Documents" to add files</p>
                            </div>
                        ` : patientDocs.map((doc, index) => `
                            <div class="pn-doc-item" data-doc-index="${index}">
                                <div class="pn-doc-icon">
                                    <i class="fas fa-file-${this.getDocIcon(doc.type)}"></i>
                                </div>
                                <div class="pn-doc-info">
                                    <span class="pn-doc-name">${doc.name}</span>
                                    <span class="pn-doc-meta">${doc.type.toUpperCase()} • ${this.formatFileSize(doc.size)} • ${new Date(doc.importedAt).toLocaleDateString()}</span>
                                </div>
                                <div class="pn-doc-actions">
                                    <button class="pn-btn pn-btn-sm pn-btn-outline pn-view-doc-btn" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="pn-btn pn-btn-sm pn-btn-outline pn-insert-doc-btn" title="Insert into Notes">
                                        <i class="fas fa-paste"></i>
                                    </button>
                                    <button class="pn-btn pn-btn-sm pn-btn-danger pn-delete-doc-btn" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-outline" id="closeDocsModal">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event handlers
        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#closeDocsModal')?.addEventListener('click', () => modal.remove());

        // Import multiple documents
        const importBtn = modal.querySelector('#importMultipleDocsBtn');
        const multiDocInput = modal.querySelector('#multiDocInput');

        importBtn?.addEventListener('click', () => multiDocInput?.click());

        multiDocInput?.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            for (const file of files) {
                await this.importAndSaveDocument(file, patientId);
            }

            // Refresh modal
            modal.remove();
            this.showDocumentsModal();
            this.showToast(`${files.length} document(s) imported successfully!`, 'success');
        });

        // View document
        modal.querySelectorAll('.pn-view-doc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = btn.closest('.pn-doc-item').dataset.docIndex;
                this.viewDocument(patientId, parseInt(index));
            });
        });

        // Insert document into notes
        modal.querySelectorAll('.pn-insert-doc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = btn.closest('.pn-doc-item').dataset.docIndex;
                this.insertDocumentIntoNotes(patientId, parseInt(index));
                modal.remove();
            });
        });

        // Delete document
        modal.querySelectorAll('.pn-delete-doc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = btn.closest('.pn-doc-item').dataset.docIndex;
                if (confirm('Delete this document?')) {
                    this.deleteDocument(patientId, parseInt(index));
                    modal.remove();
                    this.showDocumentsModal();
                }
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Import and save a document
    async importAndSaveDocument(file, patientId) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                const fileType = file.name.split('.').pop().toLowerCase();

                // Parse content based on type
                let parsedContent = content;
                if (fileType === 'doc' || fileType === 'docx' || fileType === 'html') {
                    parsedContent = this.parseDocContent(content);
                } else if (fileType === 'rtf') {
                    parsedContent = this.parseRtfContent(content);
                }

                // Create document entry
                const docEntry = {
                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type: fileType,
                    size: file.size,
                    importedAt: new Date().toISOString(),
                    rawContent: content,
                    parsedContent: parsedContent
                };

                // Save to documents
                if (!this.documents[patientId]) {
                    this.documents[patientId] = [];
                }
                this.documents[patientId].push(docEntry);
                this.saveData();

                resolve(docEntry);
            };

            reader.readAsText(file);
        });
    }

    // View document in modal
    viewDocument(patientId, docIndex) {
        const doc = this.documents[patientId]?.[docIndex];
        if (!doc) return;

        const modal = document.createElement('div');
        modal.className = 'pn-modal-overlay';
        modal.innerHTML = `
            <div class="pn-modal pn-modal-xlarge">
                <div class="pn-modal-header">
                    <h3><i class="fas fa-file-alt"></i> ${doc.name}</h3>
                    <button class="pn-modal-close">&times;</button>
                </div>
                <div class="pn-modal-body pn-doc-viewer">
                    <div class="pn-doc-content">${doc.parsedContent}</div>
                </div>
                <div class="pn-modal-footer">
                    <button class="pn-btn pn-btn-primary" id="insertDocBtn">
                        <i class="fas fa-paste"></i> Insert into Notes
                    </button>
                    <button class="pn-btn pn-btn-outline" id="closeViewModal">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.pn-modal-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#closeViewModal')?.addEventListener('click', () => modal.remove());
        modal.querySelector('#insertDocBtn')?.addEventListener('click', () => {
            this.insertDocumentIntoNotes(patientId, docIndex);
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Insert document content into notes
    insertDocumentIntoNotes(patientId, docIndex) {
        const doc = this.documents[patientId]?.[docIndex];
        if (!doc) return;

        const editor = document.getElementById('noteEditor');
        if (!editor) return;

        const separator = `
            <div class="doc-import-header" style="margin:20px 0 15px 0;padding:10px;background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:4px;">
                <strong style="color:#1e40af;">📄 Imported: ${doc.name}</strong>
                <span style="float:right;font-size:12px;color:#64748b;">${new Date(doc.importedAt).toLocaleDateString()}</span>
            </div>
        `;

        editor.focus();
        document.execCommand('insertHTML', false, separator + doc.parsedContent + '<p><br></p>');
        this.scheduleAutoSave();
        this.showToast('Document inserted into notes', 'success');
    }

    // Delete a document
    deleteDocument(patientId, docIndex) {
        if (this.documents[patientId]) {
            this.documents[patientId].splice(docIndex, 1);
            this.saveData();
            this.showToast('Document deleted', 'success');
        }
    }

    // Get icon for document type
    getDocIcon(type) {
        const icons = {
            'doc': 'word',
            'docx': 'word',
            'txt': 'alt',
            'html': 'code',
            'rtf': 'alt',
            'pdf': 'pdf'
        };
        return icons[type] || 'alt';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.patientNotesPortal = new PatientNotesPortal();
});
