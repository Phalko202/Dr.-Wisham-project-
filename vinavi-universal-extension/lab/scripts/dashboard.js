// dashboard.js - HMH Lab Dashboard (like aasandha-extension)

/**
 * Format date to dd/mm/yy
 */
function formatDateShort(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

/**
 * Format date with day name: "Sunday 12th Dec 2025"
 */
function formatDateLong(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const ordinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    return `${dayName} ${ordinal(day)} ${month} ${year}`;
}

/**
 * Format note date - shows relative time and absolute date like Vinavi
 * "10 hours ago\n09 Dec 2025 17:06"
 */
function formatNoteDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Relative time
    let relative = '';
    if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        relative = diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        relative = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
        relative = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else {
        relative = `${Math.floor(diffDays / 7)} weeks ago`;
    }
    
    // Absolute date
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    
    return `${relative}<br>${day} ${month} ${year} ${hours}:${mins}`;
}

function getVinaviApi() {
    if (window.VinaviAPI) {
        return window.VinaviAPI;
    }
    console.error('VinaviAPI helper is not available on window');
    return null;
}

/**
 * Check if user is authenticated with Vinavi
 */
async function checkAuthentication() {
    const api = getVinaviApi();
    if (api && typeof api.checkAuthentication === 'function') {
        return api.checkAuthentication();
    }

    try {
        // Include specialities to get doctor specialty name
        const response = await fetch('https://vinavi.aasandha.mv/api/users/authenticated?include=employee,professional.service-providers,professional.specialities,permissions,roles.permissions', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return null;
    }
}

/**
 * Fetch a professional's specialities by their ID
 * This is useful for getting doctor specialty names
 * Note: This endpoint may return 403 if user lacks permission - that's normal
 */
async function fetchProfessionalSpecialities(professionalId) {
    if (!professionalId) return [];
    
    try {
        const response = await fetch(
            `https://vinavi.aasandha.mv/api/professionals/${professionalId}?include=specialities`,
            { credentials: 'include' }
        );
        
        // Silently return empty if unauthorized - this is expected for some users
        if (!response.ok) return [];
        
        const data = await response.json();
        const specialities = data.included?.filter(inc => inc.type === 'specialities') || [];
        
        return specialities.map(s => ({
            id: s.id,
            name: s.attributes?.name || s.attributes?.title || '',
            code: s.attributes?.code || ''
        })).filter(s => s.name);
    } catch (error) {
        // Silently fail - specialty fetching is optional
        return [];
    }
}

/**
 * Cache for doctor specialties to avoid repeated API calls
 */
const doctorSpecialtyCache = {};

/**
 * Get doctor specialty with caching
 */
async function getDoctorSpecialty(professionalId) {
    if (!professionalId) return null;
    
    // Check cache first
    if (doctorSpecialtyCache[professionalId]) {
        return doctorSpecialtyCache[professionalId];
    }
    
    const specialities = await fetchProfessionalSpecialities(professionalId);
    const specialty = specialities.length > 0 ? specialities[0].name : null;
    
    // Cache the result
    doctorSpecialtyCache[professionalId] = specialty;
    
    return specialty;
}

/**
 * Show login screen
 */
function showLoginScreen() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        document.body.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <h1>HMH Lab Dashboard</h1>
                    <p>You need to be logged in to Aasandha Vinavi to use this extension.</p>
                    <p>Please click the button below to login.</p>
                    <button class="login-btn" id="loginBtn">Login with Aasandha</button>
                </div>
            </div>
        `;
    } else {
        mainContent.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <h1>HMH Lab Dashboard</h1>
                    <p>You need to be logged in to Aasandha Vinavi to use this extension.</p>
                    <p>Please click the button below to login.</p>
                    <button class="login-btn" id="loginBtn">Login with Aasandha</button>
                </div>
            </div>
        `;
    }
    
    setTimeout(() => {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.open('https://auth.aasandha.mv/auth/login', '_blank');
                loginBtn.textContent = 'After logging in, click the extension icon again';
                loginBtn.disabled = true;
            });
        }
    }, 100);
}

/**
 * Display user info in header
 */
function displayUserInfo(userData) {
    const userName = document.getElementById('userName');
    const userSpecialty = document.getElementById('userSpecialty');
    const userRole = document.getElementById('userRole');
    const userInfoCard = document.getElementById('userInfoCard');
    
    if (userName) {
        const professional = userData.included?.find(inc => inc.type === 'professionals');
        const employee = userData.included?.find(inc => inc.type === 'employees');
        
        // Look for specialities in included data
        const specialities = userData.included?.filter(inc => inc.type === 'specialities') || [];
        const specialityNames = specialities.map(s => s.attributes?.name || s.attributes?.title).filter(Boolean);
        
        // Store for later use
        window._currentUserData = userData;
        window._currentProfessional = professional;
        window._currentEmployee = employee;
        window._currentSpecialities = specialities;
        
        const fullName = professional?.attributes.fullname || userData.data.attributes.full_name || 'Doctor';
        
        // Get specialty from multiple possible sources
        let specialty = '';
        if (specialityNames.length > 0) {
            specialty = specialityNames.join(', ');
        } else {
            specialty = professional?.attributes['specialty-name'] || professional?.attributes.specialty || '';
        }
        
        const regCode = professional?.attributes['registration-code'] || professional?.attributes.registration_number || '';
        
        userName.textContent = fullName;
        
        if (userSpecialty) {
            if (specialty && regCode) {
                userSpecialty.textContent = `${specialty} • Reg: ${regCode}`;
            } else if (specialty) {
                userSpecialty.textContent = specialty;
            } else if (regCode) {
                userSpecialty.textContent = `Reg: ${regCode}`;
            } else {
                userSpecialty.textContent = '';
            }
        }
        
        if (userRole) {
            userRole.textContent = professional?.attributes['professional-type'] || 'Doctor';
        }
        
        // Add click handler to show full details
        if (userInfoCard && !userInfoCard._detailsWired) {
            userInfoCard.addEventListener('click', () => showDoctorDetailsModal(professional, employee, userData, specialities));
            userInfoCard._detailsWired = true;
        }
    }
}

/**
 * Show doctor details modal with all information from Aasandha
 */
function showDoctorDetailsModal(professional, employee, userData, specialities = []) {
    if (!professional && !userData) {
        alert('Professional data not available');
        return;
    }
    
    const attrs = professional?.attributes || {};
    const empAttrs = employee?.attributes || {};
    const userAttrs = userData?.data?.attributes || {};
    
    // Get specialities (from param or from included data)
    const specs = specialities.length > 0 
        ? specialities 
        : (userData?.included?.filter(inc => inc.type === 'specialities') || []);
    const specialityNames = specs.map(s => s.attributes?.name || s.attributes?.title).filter(Boolean);
    const specialtyDisplay = specialityNames.length > 0 
        ? specialityNames.join(', ') 
        : (attrs['specialty-name'] || attrs.specialty || 'Not specified');
    
    // Get service provider info from included data
    const serviceProvider = userData?.included?.find(inc => inc.type === 'service-providers');
    const spAttrs = serviceProvider?.attributes || {};
    
    // Get role info
    const role = userData?.included?.find(inc => inc.type === 'roles');
    const roleAttrs = role?.attributes || {};
    
    // Format dates nicely
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };
    
    // Check expiration status
    const isExpired = attrs.expiration_date ? new Date(attrs.expiration_date) < new Date() : false;
    const expirationStatus = isExpired ? 
        '<span style="color: #ef4444; font-weight: 600;">⚠️ Expired</span>' : 
        `<span style="color: #10b981;">${formatDate(attrs.expiration_date)}</span>`;
    
    const detailsHTML = `
        <div class="doctor-details-modal-overlay" id="doctorDetailsOverlay">
            <div class="doctor-details-modal">
                <div class="doctor-details-header">
                    <h2>Doctor Profile</h2>
                    <button class="modal-close-btn" id="closeDoctorDetailsBtn">&times;</button>
                </div>
                <div class="doctor-details-body">
                    <div class="doctor-profile-grid">
                        <div class="detail-section">
                            <h3><span class="section-icon">👤</span> Personal Information</h3>
                            <div class="detail-row"><strong>Full Name:</strong> <span>${attrs.fullname || userAttrs.full_name || 'N/A'}</span></div>
                            <div class="detail-row"><strong>NIC:</strong> <span>${empAttrs.nic || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Date of Birth:</strong> <span>${empAttrs.dob || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Gender:</strong> <span style="text-transform: capitalize;">${attrs.gender || empAttrs.gender || 'N/A'}</span></div>
                        </div>
                        
                        <div class="detail-section">
                            <h3><span class="section-icon">🩺</span> Professional Information</h3>
                            <div class="detail-row"><strong>Specialty:</strong> <span class="highlight-specialty" style="color: #8b5cf6; font-weight: 600;">${specialtyDisplay}</span></div>
                            <div class="detail-row"><strong>Professional Type:</strong> <span style="text-transform: capitalize;">${attrs.professional_type || attrs['professional-type'] || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Registration Number:</strong> <span class="highlight-code">${attrs.registration_number || attrs['registration-code'] || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Registration Date:</strong> <span>${formatDate(attrs.registration_date || attrs['registered-date'])}</span></div>
                            <div class="detail-row"><strong>Expiration Date:</strong> ${expirationStatus}</div>
                            <div class="detail-row"><strong>Professional ID:</strong> <span>${professional?.id || 'N/A'}</span></div>
                        </div>
                        
                        <div class="detail-section">
                            <h3><span class="section-icon">📞</span> Contact Information</h3>
                            <div class="detail-row"><strong>Phone:</strong> <span>${attrs.mobile || empAttrs['contact-number'] || userAttrs.phone || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Email:</strong> <span>${attrs.email_address || userAttrs.email || empAttrs.email || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Address:</strong> <span>${empAttrs.address || 'N/A'}</span></div>
                        </div>
                        
                        <div class="detail-section">
                            <h3><span class="section-icon">🏥</span> Service Provider</h3>
                            <div class="detail-row"><strong>Facility:</strong> <span class="highlight-facility">${spAttrs.name || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Facility Type:</strong> <span style="text-transform: capitalize;">${spAttrs.type || spAttrs.service_provider_type || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Status:</strong> <span style="color: ${spAttrs.professional_status === 'approved' ? '#10b981' : '#f59e0b'}; font-weight: 600; text-transform: capitalize;">${spAttrs.professional_status || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Empanelled:</strong> <span>${spAttrs.is_empanelled ? '✅ Yes' : '❌ No'}</span></div>
                            <div class="detail-row"><strong>GOPD Enabled:</strong> <span>${spAttrs.gopd ? '✅ Yes' : '❌ No'}</span></div>
                        </div>
                        
                        <div class="detail-section">
                            <h3><span class="section-icon">⚙️</span> System Information</h3>
                            <div class="detail-row"><strong>User ID:</strong> <span>${userData?.data?.id || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Employee ID:</strong> <span>${employee?.id || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Role:</strong> <span style="text-transform: capitalize;">${roleAttrs.name || 'N/A'}</span></div>
                            <div class="detail-row"><strong>Account Status:</strong> <span style="color: ${userAttrs.is_active ? '#10b981' : '#ef4444'}; font-weight: 600;">${userAttrs.is_active ? '✅ Active' : '❌ Inactive'}</span></div>
                            <div class="detail-row"><strong>User Level:</strong> <span>${userAttrs.level || 'N/A'}</span></div>
                        </div>
                        
                        ${attrs.qualification ? `
                        <div class="detail-section full-width">
                            <h3><span class="section-icon">🎓</span> Qualifications</h3>
                            <div class="detail-row"><span>${attrs.qualification}</span></div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', detailsHTML);
    
    // Add event listener for close button
    const closeBtn = document.getElementById('closeDoctorDetailsBtn');
    const overlay = document.getElementById('doctorDetailsOverlay');
    
    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
            overlay.remove();
        });
        
        // Also close when clicking outside the modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
}

/**
 * Initialize navigation
 */
function initializeNavigation() {
    // Remove Patient Notes nav if it exists (cleanup from old version) - multiple selector patterns
    document.querySelectorAll('.nav-item').forEach(nav => {
        const text = nav.textContent?.toLowerCase() || '';
        const view = nav.dataset?.view?.toLowerCase() || '';
        if (text.includes('patient notes') || view.includes('patientnotes') || view.includes('patient-notes')) {
            nav.remove();
        }
    });
    
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const activateView = (viewName) => {
        // Update active nav item
        navItems.forEach(nav => nav.classList.toggle('active', nav.dataset.view === viewName));
        // Update active view
        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) targetView.classList.add('active');
        
        // Hide/show header buttons - only show in patient view
        const renewRxBtn = document.getElementById('renewRxHeaderBtn');
        const clinicalSetBtn = document.getElementById('pushClinicalSetBtn');
        
        if (renewRxBtn) {
            renewRxBtn.style.display = (viewName === 'patient') ? 'flex' : 'none';
        }
        if (clinicalSetBtn) {
            clinicalSetBtn.style.display = (viewName === 'patient') ? 'flex' : 'none';
        }
        
        // Update page title
        const titles = {
            'search': 'Search Patient',
            'patient': 'Patient Details',
            'labOrder': 'Lab Order',
            'failLog': 'Failed Tests Log',
            'catalog': 'Lab Catalog',
            'settings': 'Settings',
            'packages': 'Bundles'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titles[viewName] || 'Dashboard';
        if (viewName === 'packages' && typeof window.renderBundles === 'function') {
            window.renderBundles();
        }
        if (viewName === 'failLog') {
            renderFailedTestsLog();
        }
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            
            activateView(viewName);
        });
    });

    // Back buttons
    const backToSearch = document.getElementById('backToSearch');
    if (backToSearch) backToSearch.addEventListener('click', () => activateView('search'));
    const backToPatient = document.getElementById('backToPatient');
    if (backToPatient) backToPatient.addEventListener('click', () => activateView('patient'));

    // Expose for programmatic navigation
    window._activateView = activateView;
}

/**
 * Initialize patient search
 */
function initializePatientSearch() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('patientSearchInput');
    
    if (searchButton) {
        searchButton.addEventListener('click', () => performPatientSearch());
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performPatientSearch();
            }
        });
    }
}

/**
 * Perform patient search
 */
async function performPatientSearch() {
    const searchInput = document.getElementById('patientSearchInput');
    const query = searchInput?.value?.trim();
    
    if (!query) {
        showToast('Please enter a search term', 'error');
        return;
    }
    
    console.log('Searching for:', query);
    showLoading(true);
    
    try {
        // Search patient
        const searchUrl = `https://vinavi.aasandha.mv/api/patients/search/${encodeURIComponent(query)}`;
        console.log('Search URL:', searchUrl);
        
        const searchResponse = await fetch(searchUrl, { credentials: 'include' });
        
        if (!searchResponse.ok) {
            throw new Error(`Patient not found (${searchResponse.status})`);
        }
        
        const searchData = await searchResponse.json();
        console.log('Search result:', searchData);
        
        if (!searchData.data || !searchData.data.id) {
            throw new Error('Invalid search response - no patient ID');
        }
        
        const patientId = searchData.data.id;
        console.log('Patient ID:', patientId);
        
        // Fetch patient details and cases
        const detailsUrl = `https://vinavi.aasandha.mv/api/patients/${patientId}?include=address.island.atoll`;
        const casesUrl = `https://vinavi.aasandha.mv/api/patients/${patientId}/patient-cases?include=last-episode,doctor&page[size]=100&sort=-created_at`;
        
        const [detailsResponse, casesResponse] = await Promise.all([
            fetch(detailsUrl, { credentials: 'include' }),
            fetch(casesUrl, { credentials: 'include' })
        ]);
        
        if (!detailsResponse.ok || !casesResponse.ok) {
            throw new Error('Failed to fetch patient details or cases');
        }
        
        const patientDetails = await detailsResponse.json();
        const casesData = await casesResponse.json();
        
        console.log('Patient details:', patientDetails);
        console.log('Cases:', casesData);
        
        displayPatientDetails(patientDetails.data, casesData.data, casesData.included || []);
        showLoading(false);
        
    } catch (error) {
        console.error('Search error:', error);
        showToast(`Search failed: ${error.message}`, 'error');
        showLoading(false);
    }
}

/**
 * Load patient image
 */
async function loadPatientImage(patientId) {
    try {
        const photoUrl = `https://vinavi.aasandha.mv/api/patients/${patientId}/photo`;
        const response = await fetch(photoUrl, { credentials: 'include' });
        
        if (!response.ok) {
            throw new Error('Failed to fetch photo');
        }
        
        const photoData = await response.json();
        const base64Photo = photoData.data?.attributes?.photo;
        
        const imgEl = document.getElementById('patientImage');
        const placeholderEl = document.getElementById('patientImagePlaceholder');
        
        if (base64Photo && imgEl) {
            imgEl.src = base64Photo;
            imgEl.style.display = 'block';
            if (placeholderEl) placeholderEl.style.display = 'none';
        } else {
            if (imgEl) imgEl.style.display = 'none';
            if (placeholderEl) placeholderEl.style.display = 'flex';
        }
    } catch (error) {
        console.warn('Could not load patient image:', error);
        const imgEl = document.getElementById('patientImage');
        const placeholderEl = document.getElementById('patientImagePlaceholder');
        if (imgEl) imgEl.style.display = 'none';
        if (placeholderEl) placeholderEl.style.display = 'flex';
    }
}

/**
 * Display patient details
 */
function displayPatientDetails(patient, cases, included = []) {
    // Switch to patient view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const pv = document.getElementById('patientView');
    if (pv) pv.classList.add('active');

    // Store current patient for Rx renewal and filtering
    window.currentPatient = patient;
    window.currentCases = cases;
    window.currentIncluded = included;

    // Load patient image
    loadPatientImage(patient.id);

    // Do not try to activate a non-existent nav item (no [data-view="patient"]) 
    // Fill patient header fields that already exist in the HTML
    const attrs = patient.attributes || {};
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '-'; };

    setText('patientName', attrs.patient_name || attrs.name || '-');
    setText('patientId', patient.id || '-');

    // Age / Gender
    const dob = attrs.birth_date || attrs.date_of_birth;
    let ageTxt = '-';
    try {
        if (dob) {
            const birth = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            ageTxt = `${age} yrs`;
        }
    } catch (_) {}
    setText('patientAge', [ageTxt, attrs.gender || '-'].filter(Boolean).join(' / '));

    setText('patientPhone', attrs.mobile_number || attrs.phone || '-');
    setText('patientNic', attrs.national_identification || attrs.national_id || '-');

    // Episodes count badge
    const epCount = document.getElementById('episodeCount');
    if (epCount) epCount.textContent = String(cases?.length || 0);

    // Show results filters
    const resultsFilters = document.getElementById('resultsFilters');
    if (resultsFilters) {
        resultsFilters.style.display = 'flex';
        initializeResultsFilters();
    }

    // Render episodes into the existing grid
    displayEpisodes(cases, included);
    
    // Populate doctor filter dropdown
    populateDoctorFilter(cases, included);
}

/**
 * Populate the doctor filter dropdown with unique doctors
 */
function populateDoctorFilter(cases, included = []) {
    const doctorSelect = document.getElementById('doctorFilterSelect');
    if (!doctorSelect) return;
    
    // Build doctor lookup
    const doctors = new Map();
    cases.forEach(caseItem => {
        const doctorRef = caseItem.relationships?.doctor?.data;
        if (doctorRef?.id) {
            const doctorInc = included.find(i => i.id == doctorRef.id && i.type === 'professionals');
            const name = doctorInc?.attributes?.fullname || doctorInc?.attributes?.full_name || doctorInc?.attributes?.name;
            if (name && !doctors.has(doctorRef.id)) {
                doctors.set(doctorRef.id, name);
            }
        }
    });
    
    // Build options
    doctorSelect.innerHTML = '<option value="">All Doctors</option>' + 
        Array.from(doctors.entries())
            .map(([id, name]) => `<option value="${id}">${escapeHtml(name)}</option>`)
            .join('');
}

/**
 * Initialize results filters
 */
function initializeResultsFilters() {
    // New filter elements
    const searchInput = document.getElementById('episodeSearchInput');
    const doctorSelect = document.getElementById('doctorFilterSelect');
    const dateSelect = document.getElementById('dateFilterSelect');
    const customDateRange = document.getElementById('customDateRange');
    const applyDateRangeBtn = document.getElementById('applyDateRange');
    
    // Old style filter chips (now episode-chip class)
    const filterChips = document.querySelectorAll('#resultsFilters .episode-chip');
    
    // Combined filter function
    const applyFilters = () => {
        const searchTerm = (searchInput?.value || '').toLowerCase();
        const selectedDoctorId = doctorSelect?.value || '';
        const dateFilter = dateSelect?.value || 'all';
        
        let cases = window.currentCases || [];
        const included = window.currentIncluded || [];
        const currentProfessionalId = window._currentProfessional?.id;
        
        // Get active chip filter
        const activeChip = document.querySelector('#resultsFilters .episode-chip.active');
        const chipFilter = activeChip?.getAttribute('data-filter') || 'all';
        
        // Apply chip filter first (my episodes)
        if (chipFilter === 'my' && currentProfessionalId) {
            cases = cases.filter(c => c.relationships?.doctor?.data?.id === currentProfessionalId);
        }
        
        // Apply doctor dropdown filter
        if (selectedDoctorId) {
            cases = cases.filter(c => c.relationships?.doctor?.data?.id == selectedDoctorId);
        }
        
        // Apply date filter from dropdown or chips
        const effectiveDateFilter = dateFilter !== 'all' ? dateFilter : chipFilter;
        if (effectiveDateFilter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            cases = cases.filter(c => {
                const d = new Date(c.attributes?.created_at);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
        } else if (effectiveDateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            cases = cases.filter(c => new Date(c.attributes?.created_at) >= weekAgo);
        } else if (effectiveDateFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            cases = cases.filter(c => new Date(c.attributes?.created_at) >= monthAgo);
        }
        
        // Apply search filter
        if (searchTerm) {
            cases = cases.filter(c => {
                const episode = c.relationships?.['last-episode']?.data;
                const doctorRef = c.relationships?.doctor?.data;
                const doctorInc = included.find(i => i.id == doctorRef?.id && i.type === 'professionals');
                const doctorName = (doctorInc?.attributes?.fullname || doctorInc?.attributes?.name || '').toLowerCase();
                const episodeId = String(episode?.id || '');
                const caseId = String(c.id || '');
                
                return doctorName.includes(searchTerm) || 
                       episodeId.includes(searchTerm) || 
                       caseId.includes(searchTerm);
            });
        }
        
        // Update count
        const epCount = document.getElementById('episodeCount');
        if (epCount) epCount.textContent = String(cases.length);
        
        // Display filtered episodes
        displayEpisodes(cases, included);
        
        // Show empty state if no results
        if (cases.length === 0) {
            const listContainer = document.getElementById('episodesGrid');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6b7280;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin: 0 auto 16px;">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #374151;">No episodes found</p>
                        <p style="font-size: 14px;">Try adjusting your search or filters</p>
                    </div>
                `;
            }
        }
    };
    
    // Wire up search input
    if (searchInput && !searchInput._wired) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        searchInput._wired = true;
    }
    
    // Wire up doctor filter
    if (doctorSelect && !doctorSelect._wired) {
        doctorSelect.addEventListener('change', applyFilters);
        doctorSelect._wired = true;
    }
    
    // Wire up date filter dropdown
    if (dateSelect && !dateSelect._wired) {
        dateSelect.addEventListener('change', () => {
            if (dateSelect.value === 'custom') {
                if (customDateRange) customDateRange.style.display = 'flex';
            } else {
                if (customDateRange) customDateRange.style.display = 'none';
                applyFilters();
            }
        });
        dateSelect._wired = true;
    }
    
    // Wire up custom date range
    if (applyDateRangeBtn && !applyDateRangeBtn._wired) {
        applyDateRangeBtn.addEventListener('click', () => {
            const fromDate = document.getElementById('episodeDateFrom')?.value;
            const toDate = document.getElementById('episodeDateTo')?.value;
            if (fromDate && toDate) {
                // Apply custom date filter
                let cases = window.currentCases || [];
                const from = new Date(fromDate);
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                
                cases = cases.filter(c => {
                    const d = new Date(c.attributes?.created_at);
                    return d >= from && d <= to;
                });
                
                const epCount = document.getElementById('episodeCount');
                if (epCount) epCount.textContent = String(cases.length);
                displayEpisodes(cases, window.currentIncluded || []);
            } else {
                showToast('Please select both start and end dates', 'error');
            }
        });
        applyDateRangeBtn._wired = true;
    }
    
    // Wire up filter chips
    if (filterChips.length > 0 && !filterChips[0]._filtersWired) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                // Reset other filters when using chips
                if (dateSelect) dateSelect.value = 'all';
                if (customDateRange) customDateRange.style.display = 'none';
                
                applyFilters();
            });
        });
        filterChips[0]._filtersWired = true;
    }
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Apply episode filtering
 */
function applyEpisodeFilter(filterType, dateRange = null) {
    const cases = window.currentCases || [];
    const included = window.currentIncluded || [];
    const currentProfessional = window._currentProfessional;
    const currentProfessionalId = currentProfessional?.id;
    
    let filteredCases = cases;
    
    if (filterType === 'my' && currentProfessionalId) {
        // Filter by current doctor
        filteredCases = cases.filter(c => {
            const doctorId = c.relationships?.doctor?.data?.id;
            return doctorId === currentProfessionalId;
        });
    } else if (filterType === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredCases = cases.filter(c => {
            const createdAt = c.attributes?.created_at;
            if (!createdAt) return false;
            const caseDate = new Date(createdAt);
            caseDate.setHours(0, 0, 0, 0);
            return caseDate.getTime() === today.getTime();
        });
    } else if (filterType === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredCases = cases.filter(c => {
            const createdAt = c.attributes?.created_at;
            if (!createdAt) return false;
            const caseDate = new Date(createdAt);
            return caseDate >= weekAgo;
        });
    } else if (filterType === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredCases = cases.filter(c => {
            const createdAt = c.attributes?.created_at;
            if (!createdAt) return false;
            const caseDate = new Date(createdAt);
            return caseDate >= monthAgo;
        });
    } else if (filterType === 'custom' && dateRange) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        filteredCases = cases.filter(c => {
            const createdAt = c.attributes?.created_at;
            if (!createdAt) return false;
            const caseDate = new Date(createdAt);
            return caseDate >= fromDate && caseDate <= toDate;
        });
    }
    
    // Update episode count
    const epCount = document.getElementById('episodeCount');
    if (epCount) epCount.textContent = String(filteredCases.length);
    
    // Re-render episodes with filtered list
    displayEpisodes(filteredCases, included);
    
    if (filteredCases.length === 0) {
        const listContainer = document.getElementById('episodesGrid');
        if (listContainer) {
            listContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin: 0 auto 16px;">
                        <circle cx="40" cy="40" r="35" stroke="#e5e7eb" stroke-width="2"/>
                        <path d="M40 25v20M40 55v.01" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                    <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No episodes found</p>
                    <p style="font-size: 14px;">Try adjusting your filters</p>
                </div>
            `;
        }
    }
}

/**
 * Display episodes list
 */
function displayEpisodes(cases, included = []) {
    const listContainer = document.getElementById('episodesGrid');
    if (!listContainer) return;

    if (!cases || cases.length === 0) {
        listContainer.innerHTML = '<p style="color:#6b7280;">No episodes found</p>';
        return;
    }

    // Helper to resolve included entity by type/id
    const findIncluded = (rel) => {
        if (!rel || !rel.data) return null;
        const id = rel.data.id; const type = rel.data.type;
        return (included || []).find(i => i.id == id && i.type === type) || null;
    };

    listContainer.innerHTML = cases.map(caseItem => {
        const episode = caseItem.relationships['last-episode']?.data;
        const attrs = caseItem.attributes;
        const doctorInc = findIncluded(caseItem.relationships?.doctor);
        const doctorId = doctorInc?.id || caseItem.relationships?.doctor?.data?.id;
        const doctorName = doctorInc?.attributes?.fullname || doctorInc?.attributes?.full_name || doctorInc?.attributes?.name || '-';
        
        // Try to get specialty from multiple sources, including cache
        let doctorSpecialty = doctorInc?.attributes?.specialty || 
                              doctorInc?.attributes?.designation || 
                              doctorInc?.attributes?.['specialty-name'] ||
                              (doctorId ? doctorSpecialtyCache[doctorId] : null) || '';

        const hasEpisode = !!episode?.id;
        
        // Format date nicely
        const dateFormatted = attrs.created_at ? formatDateShort(attrs.created_at) : '-';
        
        const btnHtml = hasEpisode
          ? `<button class="btn-open-episode select-episode" data-episode-id="${episode.id}">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
               </svg>
               Open Patient Episode
             </button>`
          : `<button class="btn-open-episode disabled" disabled title="No active episode found">No active episode</button>`;
        
        return `
            <div class="episode-card" data-case-id="${caseItem.id}" data-doctor-id="${doctorId || ''}" data-doctor-name="${escapeHtml(doctorName)}">
                <div class="episode-header">
                    <div class="doctor-info-section">
                        <div class="doctor-name-large">${escapeHtml(doctorName)}</div>
                        <div class="doctor-specialty-inline" data-doctor-id="${doctorId || ''}">${doctorSpecialty ? escapeHtml(doctorSpecialty) : '<span class="specialty-loading">Loading...</span>'}</div>
                    </div>
                    <span class="episode-status ${(attrs.status || 'active').toLowerCase()}">${attrs.status || 'Active'}</span>
                </div>
                <div class="episode-body">
                    <div class="episode-meta">
                        <span class="episode-date">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${dateFormatted}
                        </span>
                        ${episode ? `<span class="episode-id-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            EP-${episode.id}
                        </span>` : ''}
                    </div>
                    ${btnHtml}
                </div>
            </div>
        `;
    }).join('');
    
    // Async fetch specialties for doctors that don't have them
    setTimeout(async () => {
        const doctorElements = listContainer.querySelectorAll('.doctor-specialty-inline[data-doctor-id]');
        for (const el of doctorElements) {
            const doctorId = el.getAttribute('data-doctor-id');
            if (doctorId && el.querySelector('.specialty-loading')) {
                const specialty = await getDoctorSpecialty(doctorId);
                if (specialty) {
                    el.textContent = specialty;
                } else {
                    el.textContent = '';
                    el.style.display = 'none';
                }
            }
        }
    }, 100);

    // Delegate click handler to avoid inline events (CSP-safe)
    listContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.select-episode');
        if (!btn) return;
        const episodeId = btn.getAttribute('data-episode-id');
        if (episodeId) {
            window.selectEpisodeForLab(episodeId);
        }
    });
}

/**
 * Select episode for lab ordering
 */
window.selectEpisodeForLab = async function(episodeId) {
    showLoading(true);
    
    try {
        const includeParams = "patient,doctor,prescriptions.medicines.preferred-medicine,requested-services.service,diagnoses.icd-code,vitals,service-provider,notes.professional";
        const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}?include=${includeParams}`;
        const response = await fetch(url, { credentials: 'include' });
        
        if (!response.ok) {
            throw new Error('Failed to load episode');
        }
        
        const episodeData = await response.json();
        
        // Store current episode data
        window._currentEpisodeData = episodeData.data;
        window.currentEpisode = episodeData.data;
        
        // Store included for richer rendering
        window.currentEpisodeIncluded = episodeData.included || [];
        
        // Debug: Log the types of data we received
        console.log('[Dashboard] Episode data loaded:', {
            episodeId: episodeData.data?.id,
            includedCount: window.currentEpisodeIncluded.length,
            includedTypes: [...new Set(window.currentEpisodeIncluded.map(i => i.type))],
            notes: window.currentEpisodeIncluded.filter(i => i.type === 'notes' || i.type === 'episode-notes'),
            icdCodes: window.currentEpisodeIncluded.filter(i => i.type === 'icd-codes'),
            diagnoses: window.currentEpisodeIncluded.filter(i => i.type === 'diagnoses')
        });

        // Switch to lab order view (guard for nulls)
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const lv = document.getElementById('labOrderView');
        if (lv) lv.classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        const navLab = document.querySelector('[data-view="labOrder"]');
        if (navLab) navLab.classList.add('active');

        // Populate existing Lab Order header fields
        try {
            const findIncluded = (rel) => {
                if (!rel || !rel.data) return null;
                const id = rel.data.id; const type = rel.data.type;
                return (window.currentEpisodeIncluded || []).find(i => i.id == id && i.type === type) || null;
            };
            const ep = episodeData.data;
            const patientRel = ep.relationships?.patient;
            const doctorInc = findIncluded(ep.relationships?.doctor);
            const patientInc = findIncluded(patientRel);
            const doctorName = doctorInc?.attributes?.fullname || doctorInc?.attributes?.full_name || doctorInc?.attributes?.name || '-';
            const doctorSpecialty = doctorInc?.attributes?.specialty || doctorInc?.attributes?.designation || '';
            const patientName = patientInc?.attributes?.patient_name || patientInc?.attributes?.name || window.currentPatient?.attributes?.patient_name || window.currentPatient?.attributes?.name || '-';
            const patientId = patientRel?.data?.id || window.currentPatient?.id || '-';
            const epInfoEl = document.getElementById('orderEpisodeInfo');
            const docEl = document.getElementById('orderDoctorName');
            const patEl = document.getElementById('orderPatientName');
            if (epInfoEl) epInfoEl.textContent = `${ep.id}`;
            if (docEl) {
                docEl.innerHTML = doctorSpecialty 
                    ? `${escapeHtml(doctorName)} <span style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">(${escapeHtml(doctorSpecialty)})</span>`
                    : escapeHtml(doctorName);
            }
            if (patEl) patEl.textContent = `${patientName} (ID: ${patientId})`;

            // Summary: diagnoses, complaint, medications with modern organized layout
            const icdsList = (window.currentEpisodeIncluded || []).filter(i => i.type === 'icd-codes');
            const icds = icdsList.map(i => {
                const code = i.attributes?.code || '';
                const name = i.attributes?.name || i.attributes?.description || i.attributes?.title || '';
                return { code, name, display: name ? `${code} - ${name}` : code };
            }).filter(i => i.display);
            
            // If no ICD codes directly, try to get from diagnoses
            if (icds.length === 0) {
                const diagList = (window.currentEpisodeIncluded || []).filter(i => i.type === 'diagnoses');
                diagList.forEach(diag => {
                    const diagAttrs = diag.attributes || {};
                    const icdRef = diag.relationships?.['icd-code']?.data;
                    const icdInc = (window.currentEpisodeIncluded || []).find(i => i.id === icdRef?.id && i.type === 'icd-codes');
                    const code = icdInc?.attributes?.code || diagAttrs.code || '';
                    const name = icdInc?.attributes?.name || icdInc?.attributes?.description || diagAttrs.name || diagAttrs.description || '';
                    if (code) {
                        icds.push({ code, name, display: name ? `${code} - ${name}` : code });
                    }
                });
            }
            const meds = (window.currentEpisodeIncluded || []).filter(i => i.type === 'medicines' || i.type === 'preferred-medicines').map(i => i.attributes?.name).filter(Boolean);
            
            // Extract all note types from episode notes with professional info
            const notesData = (window.currentEpisodeIncluded || []).filter(i => i.type === 'notes' || i.type === 'episode-notes');
            const professionalsData = (window.currentEpisodeIncluded || []).filter(i => i.type === 'professionals');
            
            // Build notes by category with full details
            const notesByType = {
                complains: [],
                clinicalDetails: [],
                medicalAdvice: []
            };
            
            // Parse notes by type with professional info
            notesData.forEach(note => {
                const noteAttrs = note.attributes || {};
                const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase().replace(/-/g, '_');
                const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
                const createdAt = noteAttrs.created_at;
                
                // Get professional who added the note
                const profRef = note.relationships?.professional?.data;
                const professional = professionalsData.find(p => p.id == profRef?.id);
                const addedBy = professional?.attributes?.fullname || professional?.attributes?.name || '';
                
                if (!content) return;
                
                const noteObj = {
                    content,
                    addedBy,
                    createdAt,
                    formattedDate: createdAt ? formatNoteDate(createdAt) : ''
                };
                
                if (noteType === 'complains' || noteType === 'complaint' || noteType === 'chief_complaint') {
                    notesByType.complains.push(noteObj);
                } else if (noteType === 'clinical_details' || noteType === 'examination' || noteType === 'findings') {
                    notesByType.clinicalDetails.push(noteObj);
                } else if (noteType === 'advice' || noteType === 'medical_advice' || noteType === 'instructions') {
                    notesByType.medicalAdvice.push(noteObj);
                }
            });
            
            // Helper to render a Vinavi-style note section
            const renderNoteSection = (notes, title, icon, colorClass) => {
                if (!notes || notes.length === 0) return '';
                
                return notes.map(note => `
                    <div class="vinavi-note-card ${colorClass}">
                        <div class="vinavi-note-header">
                            <div class="vinavi-note-title">
                                <span class="vinavi-note-icon">${icon}</span>
                                <span class="vinavi-note-label">${title}</span>
                            </div>
                            ${note.formattedDate ? `<div class="vinavi-note-time">${note.formattedDate}</div>` : ''}
                        </div>
                        ${note.addedBy ? `
                        <div class="vinavi-note-author">
                            <span class="author-name">${escapeHtml(note.addedBy)}</span>
                            <span class="author-role">Added By</span>
                        </div>
                        ` : ''}
                        <div class="vinavi-note-content">
                            ${escapeHtml(note.content).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `).join('');
            };
            
            const summaryEl = document.getElementById('episodeSummary');
            if (summaryEl) {
                const diagnosisHtml = icds.length ? icds.map(d => `<span class="detail-badge icd-badge" title="${escapeHtml(d.display)}">${escapeHtml(d.display)}</span>`).join('') : '<span class="detail-none">No diagnoses recorded</span>';
                const medsHtml = meds.length ? meds.map(m => `<span class="detail-badge medication-badge">${escapeHtml(m)}</span>`).join('') : '<span class="detail-none">No medications prescribed</span>';
                
                // Render Vinavi-style notes - ORDER: Clinical, Complains, Advice
                const clinicalHtml = renderNoteSection(notesByType.clinicalDetails, 'Clinical Details / Examination', '🩺', 'note-clinical');
                const complainsHtml = renderNoteSection(notesByType.complains, 'Chief Complaint', '💬', 'note-complains');
                const adviceHtml = renderNoteSection(notesByType.medicalAdvice, 'Medical Advice', '📋', 'note-advice');
                
                // Check if there's any content to show in drawer
                const hasNotes = notesByType.clinicalDetails.length > 0 || notesByType.complains.length > 0 || notesByType.medicalAdvice.length > 0;
                
                summaryEl.innerHTML = `
                  <div class="episode-summary-modern">
                    <!-- Expand/Collapse Button -->
                    <div class="episode-drawer-toggle">
                      <button class="btn-drawer-toggle" id="toggleEpisodeDrawer">
                        <svg class="drawer-icon-expand" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                        <svg class="drawer-icon-collapse" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                        <span class="drawer-text">Expand Details</span>
                      </button>
                    </div>
                    
                    <!-- Collapsible Content Drawer -->
                    <div class="episode-drawer collapsed" id="episodeDrawerContent">
                      <!-- ORDER: Clinical Details, Complains, Advice -->
                      <div class="vinavi-notes-container">
                        ${clinicalHtml}
                        ${complainsHtml}
                        ${adviceHtml}
                      </div>
                      
                      <div class="consultation-detail-modern diagnosis-section">
                        <div class="detail-header-modern">
                          <div class="detail-icon diagnosis-icon">🏥</div>
                          <div class="detail-label-modern">Diagnosis (ICD Codes)</div>
                          ${icds.length ? `<span class="detail-count">${icds.length}</span>` : ''}
                        </div>
                        <div class="detail-content-modern diagnosis-content">
                          ${diagnosisHtml}
                        </div>
                      </div>
                      
                      <div class="consultation-detail-modern medications-section">
                        <div class="detail-header-modern">
                          <div class="detail-icon medication-icon">💊</div>
                          <div class="detail-label-modern">Medications</div>
                          ${meds.length ? `<span class="detail-count">${meds.length}</span>` : ''}
                        </div>
                        <div class="detail-content-modern medications-content">
                          ${medsHtml}
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                
                // Wire up drawer toggle
                const toggleBtn = summaryEl.querySelector('#toggleEpisodeDrawer');
                const drawerContent = summaryEl.querySelector('#episodeDrawerContent');
                if (toggleBtn && drawerContent) {
                    toggleBtn.addEventListener('click', () => {
                        const isCollapsed = drawerContent.classList.contains('collapsed');
                        drawerContent.classList.toggle('collapsed');
                        
                        const expandIcon = toggleBtn.querySelector('.drawer-icon-expand');
                        const collapseIcon = toggleBtn.querySelector('.drawer-icon-collapse');
                        const textSpan = toggleBtn.querySelector('.drawer-text');
                        
                        if (isCollapsed) {
                            expandIcon.style.display = 'none';
                            collapseIcon.style.display = 'block';
                            textSpan.textContent = 'Collapse Details';
                        } else {
                            expandIcon.style.display = 'block';
                            collapseIcon.style.display = 'none';
                            textSpan.textContent = 'Expand Details';
                        }
                    });
                }
            }
        } catch(_) {}

        // Ensure iframe is present and ready
        const frame = document.getElementById('labCatalogFrame');
        if (frame && !frame.getAttribute('src')) {
            frame.setAttribute('src', 'lab-catalog.html');
        }

        // Wire submit button
        const submitExistingBtn = document.getElementById('submitOrderButton');
        if (submitExistingBtn && !submitExistingBtn._wired) {
            submitExistingBtn.addEventListener('click', submitLabOrder);
            submitExistingBtn._wired = true;
        }
        
        // Wire clear order selection button
        const clearOrderBtn = document.getElementById('clearOrderSelection');
        if (clearOrderBtn && !clearOrderBtn._wired) {
            clearOrderBtn.addEventListener('click', () => {
                window.selectedTests = [];
                updateSelectedTestsDisplay();
            });
            clearOrderBtn._wired = true;
        }
        
        // Wire header buttons for this episode
        const renewRxBtn = document.getElementById('renewRxHeaderBtn');
        const pushSetBtn = document.getElementById('pushClinicalSetBtn');
        
        if (renewRxBtn && episodeData.data) {
            const doctorInc = (window.currentEpisodeIncluded || []).find(i => 
                i.type === 'professionals' && i.id == episodeData.data.relationships?.doctor?.data?.id
            );
            const doctorName = doctorInc?.attributes?.fullname || doctorInc?.attributes?.full_name || doctorInc?.attributes?.name || 'Unknown';
            
            const episodeDate = episodeData.data.attributes?.created_at 
                ? formatDateLong(episodeData.data.attributes.created_at)
                : '-';
            
            renewRxBtn.innerHTML = `
                <svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"currentColor\">
                  <path d=\"M8 2a6 6 0 0 0-6 6h2a4 4 0 1 1 4 4v-2l-3 3 3 3v-2a6 6 0 0 0 0-12z\"/>
                </svg>
                <div class=\"rx-btn-content\">
                    <span class=\"rx-btn-title\">Renew Rx</span>
                    <span class=\"rx-btn-episode\">Ep ${episodeData.data.id} • ${escapeHtml(doctorName)} • ${episodeDate}</span>
                </div>
            `;
            renewRxBtn.style.display = 'flex';
            if (!renewRxBtn._wired) {
                renewRxBtn.addEventListener('click', showEpisodeSelectorForRenewal);
                renewRxBtn._wired = true;
            }
        }
        
        // Show Push Clinical Set button
        if (pushSetBtn && episodeData.data) {
            pushSetBtn.style.display = 'flex';
            if (!pushSetBtn._wired) {
                pushSetBtn.addEventListener('click', showClinicalSetSelector);
                pushSetBtn._wired = true;
            }
        }

        // Listen for catalog messages
        window.addEventListener('message', handleCatalogMessage);
        showLoading(false);
        
    } catch (error) {
        console.error('Episode load error:', error);
        showToast(`Failed to load episode: ${error.message}`, 'error');
        showLoading(false);
    }
};

/**
 * Display lab order form
 */
// Removed dynamic Lab Order form builder; using static markup in dashboard.html

/**
 * Handle messages from lab catalog iframe
 */
function handleCatalogMessage(event) {
    if (event.data.type === 'testSelectionChanged') {
        // IMPORTANT: Ignore messages if we're currently applying a bundle
        // This prevents the catalog from overwriting the bundle selection
        if (window._applyingBundle) {
            console.log('[Dashboard] Ignoring testSelectionChanged - bundle apply in progress');
            return;
        }
        
        // Expect an array of { code, asnd, name }
        window.selectedTests = Array.isArray(event.data.selectedTests) ? event.data.selectedTests : [];
        updateSelectedTestsDisplay();
    } else if (event.data.type === 'submitSelected') {
        // Codes-first submit coming from catalog
        window.selectedTests = Array.isArray(event.data.selectedTests) ? event.data.selectedTests : [];
        updateSelectedTestsDisplay();
        // Trigger submit if we have an episode context
        if (window.currentEpisode && window.selectedTests.length > 0) {
            submitLabOrder();
        }
    } else if (event.data.type === 'openFullscreenCatalog') {
        // Open fullscreen catalog popup
        openFullscreenCatalogFromDashboard(event.data.preselectedTests || []);
    }
}

/**
 * Open fullscreen catalog from dashboard
 */
function openFullscreenCatalogFromDashboard(preselectedTests = []) {
    if (window.fullscreenLabCatalog) {
        // Merge existing selected tests with preselected tests
        const existingTests = window.selectedTests || [];
        const allPreselected = [...existingTests];
        
        // Add preselected tests that aren't already in the list
        preselectedTests.forEach(test => {
            const exists = allPreselected.some(t => 
                (t.code && t.code === test.code) || 
                (t.asnd && t.asnd === test.asnd) ||
                (t.name && t.name === test.name)
            );
            if (!exists) {
                allPreselected.push(test);
            }
        });
        
        console.log('[Dashboard] Opening fullscreen with', allPreselected.length, 'preselected tests');
        
        window.fullscreenLabCatalog.open({
            episodeId: window.currentEpisode?.id || null,
            diagnosisId: window.currentDiagnosis?.id || null,
            preselected: allPreselected,
            onConfirm: (selectedTests) => {
                console.log('[Dashboard] Tests selected from fullscreen:', selectedTests);
                // Update the dashboard selected tests
                window.selectedTests = selectedTests;
                updateSelectedTestsDisplay();
                
                // Sync with the catalog iframe
                const frame = document.getElementById('labCatalogFrame');
                if (frame && frame.contentWindow) {
                    frame.contentWindow.postMessage({
                        type: 'syncTests',
                        tests: selectedTests
                    }, '*');
                }
                
                showToast(`${selectedTests.length} test(s) selected`, 'success');
            }
        });
    } else {
        console.error('[Dashboard] Fullscreen catalog not available');
        showToast('Fullscreen catalog not loaded', 'error');
    }
}

/**
 * Update selected tests display
 */
function updateSelectedTestsDisplay() {
    const countEl = document.getElementById('selectedTestCount');
    const countBadge = document.getElementById('selectedCount');
    const listEl = document.getElementById('selectedTestsList');

    const selectedTests = window.selectedTests || [];

    if (countEl) countEl.textContent = selectedTests.length;
    if (countBadge) countBadge.textContent = selectedTests.length;
    const submitBtn = document.getElementById('submitOrderButton');
    if (submitBtn) submitBtn.disabled = selectedTests.length === 0;
    
    // Update order sidebar
    updateOrderSidebar();
}

function updateOrderSidebar() {
    const countEl = document.getElementById('orderSidebarCount');
    const bodyEl = document.getElementById('orderSidebarBody');
    const cartBadge = document.getElementById('cartBadge');
    const tests = window.selectedTests || [];
    
    // Update badge on floating toggle button
    if (cartBadge) {
        cartBadge.textContent = tests.length;
        cartBadge.style.display = tests.length > 0 ? 'flex' : 'none';
    }
    
    if (countEl) {
        countEl.textContent = `${tests.length} test${tests.length !== 1 ? 's' : ''}`;
    }
    
    if (bodyEl) {
        if (tests.length === 0) {
            bodyEl.innerHTML = '<p class="sidebar-empty">No tests selected yet. Check tests from the catalog to add them.</p>';
        } else {
            bodyEl.innerHTML = tests.map((t, index) => `
                <div class="sidebar-test-item">
                    <div class="sidebar-test-content">
                        <div class="sidebar-test-name">${escapeHtml(t.name || t.code || 'Test')}</div>
                        <div class="sidebar-test-meta">ASND: ${escapeHtml(t.asnd || 'N/A')} | ID: ${escapeHtml(String(t.vinaviServiceId || 'N/A'))}</div>
                    </div>
                    <button class="sidebar-test-remove" data-test-index="${index}" data-test-code="${escapeHtml(t.code || '')}" data-test-asnd="${escapeHtml(t.asnd || '')}" data-test-name="${escapeHtml(t.name || '')}" title="Remove test">&times;</button>
                </div>
            `).join('');
            
            // Wire up remove buttons
            bodyEl.querySelectorAll('.sidebar-test-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.target.getAttribute('data-test-index'), 10);
                    const removedTest = window.selectedTests[index];
                    
                    console.log('[Dashboard] Removing test at index:', index, removedTest);
                    
                    if (index >= 0 && index < window.selectedTests.length) {
                        // Remove from array
                        window.selectedTests.splice(index, 1);
                        
                        // Sync with catalog iframe FIRST - uncheck the test
                        const catalogFrame = document.getElementById('labCatalogFrame');
                        if (catalogFrame && catalogFrame.contentWindow && removedTest) {
                            try {
                                catalogFrame.contentWindow.postMessage({
                                    type: 'uncheckTest',
                                    test: removedTest
                                }, '*');
                                console.log('[Dashboard] Sent uncheckTest message to catalog');
                            } catch (err) {
                                console.warn('Could not sync test removal with catalog:', err);
                            }
                        }
                        
                        // Update display immediately
                        updateSelectedTestsDisplay();
                        console.log('[Dashboard] Sidebar updated, remaining tests:', window.selectedTests.length);
                    }
                });
            });
        }
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Show loading modal for Rx fetching
 */
function showRxLoadingModal() {
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.id = 'rxLoadingOverlay';
    overlay.innerHTML = `
        <div class="rx-loading-modal">
            <div class="rx-loading-spinner">
                <svg width="64" height="64" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#2563eb" stroke-width="4" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            </div>
            <h3>Loading Prescriptions</h3>
            <p>Fetching patient episodes and prescription history...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

/**
 * Close loading modal
 */
function closeRxLoadingModal() {
    const overlay = document.getElementById('rxLoadingOverlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

/**
 * Show prescription details modal
 */
function showPrescriptionDetailsModal(episode) {
    const included = episode.episodeData.included || [];
    const prescriptionRels = episode.episodeData.data.relationships?.prescriptions?.data || [];
    const diagnosisRels = episode.episodeData.data.relationships?.diagnoses?.data || [];
    const noteRels = episode.episodeData.data.relationships?.notes?.data || [];
    
    const doctorName = episode.doctor?.attributes?.fullname || episode.doctor?.attributes?.name || 'Unknown Doctor';
    const specialty = episode.doctor?.attributes?.specialty || episode.doctor?.attributes?.designation || '';
    const date = episode.date ? formatDateLong(episode.date) : '-';
    
    // Extract diagnoses (ICD codes)
    const diagnoses = [];
    diagnosisRels.forEach(diagRel => {
        const diagnosis = included.find(i => i.type === 'diagnoses' && i.id === diagRel.id);
        if (!diagnosis) return;
        
        const icdCodeRel = diagnosis.relationships?.['icd-code']?.data;
        const icdCode = icdCodeRel ? included.find(i => i.type === 'icd-codes' && i.id === icdCodeRel.id) : null;
        
        if (icdCode) {
            const icdAttrs = icdCode.attributes || {};
            diagnoses.push({
                code: icdAttrs.code || '',
                description: icdAttrs.name || icdAttrs.description || icdAttrs.title || '',
                notes: diagnosis.attributes?.notes || '',
                icdCodeId: icdCode.id
            });
        }
    });
    
    // Extract medical advice notes (check multiple possible note types)
    // Notes can be accessed via relationships OR directly from included array
    const medicalAdvice = [];
    
    // Method 1: Get notes from relationships
    noteRels.forEach(noteRel => {
        const note = included.find(i => i.type === 'notes' && i.id === noteRel.id);
        if (note) {
            const noteAttrs = note.attributes || {};
            const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase().replace(/-/g, '_');
            const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
            
            if (content && (noteType === 'advice' || noteType === 'medical_advice' || noteType === 'instructions')) {
                medicalAdvice.push({
                    content: content,
                    type: 'advice'
                });
            }
        }
    });
    
    // Method 2: Also check directly in included for notes
    if (medicalAdvice.length === 0) {
        const notesFromIncluded = included.filter(i => i.type === 'notes' || i.type === 'episode-notes');
        notesFromIncluded.forEach(note => {
            const noteAttrs = note.attributes || {};
            const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase().replace(/-/g, '_');
            const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
            
            if (content && (noteType === 'advice' || noteType === 'medical_advice' || noteType === 'instructions')) {
                medicalAdvice.push({
                    content: content,
                    type: 'advice'
                });
            }
        });
    }
    
    // Also extract complains/chief complaint for context
    const complaints = [];
    
    // Method 1: From relationships
    noteRels.forEach(noteRel => {
        const note = included.find(i => i.type === 'notes' && i.id === noteRel.id);
        if (note) {
            const noteAttrs = note.attributes || {};
            const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase().replace(/-/g, '_');
            const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
            
            if (content && (noteType === 'complains' || noteType === 'complaint' || noteType === 'chief_complaint')) {
                complaints.push({
                    content: content,
                    type: 'complaint'
                });
            }
        }
    });
    
    // Method 2: Directly from included
    if (complaints.length === 0) {
        const notesFromIncluded = included.filter(i => i.type === 'notes' || i.type === 'episode-notes');
        notesFromIncluded.forEach(note => {
            const noteAttrs = note.attributes || {};
            const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase().replace(/-/g, '_');
            const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
            
            if (content && (noteType === 'complains' || noteType === 'complaint' || noteType === 'chief_complaint')) {
                complaints.push({
                    content: content,
                    type: 'complaint'
                });
            }
        });
    }
    
    // Extract all medicines
    const allMedicines = [];
    prescriptionRels.forEach(prescRel => {
        const prescription = included.find(i => i.type === 'prescriptions' && i.id === prescRel.id);
        if (!prescription) return;
        
        const medicineRels = prescription.relationships?.medicines?.data || [];
        medicineRels.forEach(medRel => {
            const medicine = included.find(i => 
                (i.type === 'medicines' || i.type === 'prescription-medicines') && i.id === medRel.id
            );
            if (medicine) {
                const attrs = medicine.attributes || {};
                const preferredMed = attrs.preferred_medicine || {};
                
                // Get medicine details
                const name = attrs.name || preferredMed.name || 'Unknown Medicine';
                const strength = preferredMed.strength || '';
                const preparation = preferredMed.preparation || '';
                const instructions = attrs.instructions || '';
                
                allMedicines.push({
                    name: name,
                    strength: strength,
                    preparation: preparation,
                    instructions: instructions
                });
            }
        });
    });
    
    // Build diagnosis section HTML
    const diagnosisHtml = diagnoses.length > 0 ? `
        <div class="rx-detail-section">
            <div class="rx-detail-section-header">
                <span class="rx-detail-section-icon">🏥</span>
                <span class="rx-detail-section-title">Diagnosis (${diagnoses.length})</span>
            </div>
            <div class="rx-detail-section-content diagnosis-list">
                ${diagnoses.map(d => `
                    <div class="diagnosis-item">
                        <span class="diagnosis-code">${escapeHtml(d.code)}</span>
                        <span class="diagnosis-separator">-</span>
                        <span class="diagnosis-desc">${escapeHtml(d.description) || 'No description'}</span>
                        ${d.notes ? `<div class="diagnosis-notes">${escapeHtml(d.notes)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    // Build medical advice section HTML
    const adviceHtml = medicalAdvice.length > 0 ? `
        <div class="rx-detail-section advice-section">
            <div class="rx-detail-section-header">
                <span class="rx-detail-section-icon">📋</span>
                <span class="rx-detail-section-title">Medical Advice (${medicalAdvice.length})</span>
            </div>
            <div class="rx-detail-section-content advice-list">
                ${medicalAdvice.map(a => `
                    <div class="advice-item">${escapeHtml(a.content).replace(/\n/g, '<br>')}</div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    // Build chief complaint section HTML
    const complaintsHtml = complaints.length > 0 ? `
        <div class="rx-detail-section complaint-section">
            <div class="rx-detail-section-header">
                <span class="rx-detail-section-icon">💬</span>
                <span class="rx-detail-section-title">Chief Complaint (${complaints.length})</span>
            </div>
            <div class="rx-detail-section-content complaint-list">
                ${complaints.map(c => `
                    <div class="complaint-item">${escapeHtml(c.content).replace(/\n/g, '<br>')}</div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    // Build medicines list HTML
    const medicinesList = allMedicines.map((med, idx) => `
        <div class="rx-detail-item">
            <div class="rx-detail-number">${idx + 1}</div>
            <div class="rx-detail-info">
                <div class="rx-detail-name">${escapeHtml(med.name)}</div>
                ${med.strength || med.preparation ? `
                    <div class="rx-detail-dosage">
                        ${med.strength ? `<span class="rx-badge">${escapeHtml(med.strength)}</span>` : ''}
                        ${med.preparation ? `<span class="rx-badge">${escapeHtml(med.preparation)}</span>` : ''}
                    </div>
                ` : ''}
                ${med.instructions ? `<div class="rx-detail-instructions">📋 ${escapeHtml(med.instructions)}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 800px;">
            <div class="bundle-picker-header">
                <h3>📄 Episode Details</h3>
                <button class="bundle-picker-close" aria-label="Close">&times;</button>
            </div>
            <div class="rx-detail-content">
                <div class="rx-detail-header">
                    <div class="rx-detail-doctor">
                        <strong>${escapeHtml(doctorName)}</strong>
                        ${specialty ? `<div class="rx-detail-specialty">${escapeHtml(specialty)}</div>` : ''}
                    </div>
                    <div class="rx-detail-meta">
                        <div>📅 ${date}</div>
                        <div>🏥 Episode: ${episode.episodeId}</div>
                    </div>
                    <div class="rx-detail-counts">
                        ${diagnoses.length ? `<span class="count-badge diag">${diagnoses.length} Dx</span>` : ''}
                        ${complaints.length ? `<span class="count-badge complaint">${complaints.length} C/O</span>` : ''}
                        ${medicalAdvice.length ? `<span class="count-badge advice">${medicalAdvice.length} Adv</span>` : ''}
                        <span class="count-badge meds">${allMedicines.length} Rx</span>
                    </div>
                </div>
                
                ${complaintsHtml}
                ${diagnosisHtml}
                ${adviceHtml}
                
                <div class="rx-detail-section meds-section">
                    <div class="rx-detail-section-header">
                        <span class="rx-detail-section-icon">💊</span>
                        <span class="rx-detail-section-title">Medications (${allMedicines.length})</span>
                    </div>
                    <div class="rx-detail-medicines">
                        ${medicinesList || '<p style="color: #9ca3af; text-align: center; padding: 20px;">No medications found</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const closeBtn = overlay.querySelector('.bundle-picker-close');
    closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
}

/**
 * Submit lab order
 */
async function submitLabOrder() {
    const selectedTests = window.selectedTests || [];
    const episode = window.currentEpisode;

    if (!episode) {
        showToast('No episode selected', 'error');
        return;
    }

    if (selectedTests.length === 0) {
        showToast('Please select at least one test', 'error');
        return;
    }

    const api = getVinaviApi();
    if (!api || typeof api.addServiceToEpisode !== 'function') {
        showToast('Vinavi API module not ready', 'error');
        return;
    }

    // Try to get diagnosis ID (optional)
    const diagnosisId = (() => {
        const rel = episode.relationships?.diagnoses?.data;
        if (Array.isArray(rel) && rel.length > 0 && rel[0]?.id) {
            return rel[0].id;
        }
        const includedDiag = (window.currentEpisodeIncluded || []).find((item) => item.type === 'diagnoses' && item.id);
        return includedDiag ? includedDiag.id : null;
    })();

    console.log('[LabOrder] Episode:', episode.id, 'Diagnosis:', diagnosisId);

    const professionalId = episode.relationships?.doctor?.data?.id || null;

    // Map tests to service IDs and submit - ONLY USE ASND CODES
    const results = [];
    showLoading(true);
    
    for (const t of selectedTests) {
        try {
            console.log('[LabOrder] Processing test:', t);
            
            // ONLY use ASND code - ignore regular code field
            if (!t.asnd) {
                console.warn('[LabOrder] Test has no ASND code:', t);
                results.push({
                    ok: false,
                    name: t.name || t.code,
                    code: t.code || null,
                    asnd: t.asnd || null,
                    reason: 'No ASND code'
                });
                continue;
            }
            
            // Try to find service ID using ASND ONLY
            let sid = t.vinaviServiceId ? String(t.vinaviServiceId).trim() : null;
            
            // 1. Try cached mapping with ASND
            if (!sid && window.ServiceMap && window.ServiceMap.getMappedServiceId) {
                sid = window.ServiceMap.getMappedServiceId(t);
            }

            if (!sid) {
                const msg = `UNMAPPED: Add "ASND:${t.asnd}": "VINAVI_ID" to service-map.json after confirming in Vinavi`;
                console.error(`[LabOrder] ${msg}`, t);
                results.push({
                    ok: false,
                    name: t.name || t.asnd,
                    code: t.code || null,
                    asnd: t.asnd || null,
                    reason: 'No verified Vinavi service ID'
                });
                continue;
            }
            
            console.log('[LabOrder] Found service ID:', sid, 'for ASND:', t.asnd);
            
            // Submit to Vinavi
            const added = await api.addServiceToEpisode(episode.id, sid, diagnosisId, professionalId);
            
            // Cache mapping for next time
            if (window.ServiceMap && window.ServiceMap.rememberMapping) {
                window.ServiceMap.rememberMapping(t, sid);
            }
            
            results.push({
                ok: true,
                name: t.name || t.asnd,
                code: t.code || null,
                asnd: t.asnd || null,
                id: sid
            });
            
        } catch (e) {
            console.error('[LabOrder] Error adding service', t, e);
            // Extract actual error message from API response
            let errorMsg = e.message;
            if (errorMsg.includes('422')) {
                try {
                    const jsonMatch = errorMsg.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const errData = JSON.parse(jsonMatch[0]);
                        if (errData.errors && errData.errors[0]) {
                            errorMsg = errData.errors[0].detail || errData.errors[0].title || errorMsg;
                        }
                    }
                } catch (_) {}
            }
            results.push({
                ok: false,
                name: t.name || t.code,
                code: t.code || null,
                asnd: t.asnd || null,
                reason: errorMsg
            });
        }
    }
    
    showLoading(false);

    const ok = results.filter(r => r.ok).length;
    const fail = results.length - ok;
    const failedEntries = results.filter(r => !r.ok);

    const describeTest = (entry) => {
        const parts = [];
        if (entry.name) parts.push(entry.name);
        if (entry.code) parts.push(`#${entry.code}`);
        if (entry.asnd) parts.push(`ASND ${entry.asnd}`);
        return parts.join(' · ');
    };

    if (ok > 0 && fail === 0) {
        showToast(`Submitted ${ok} test(s) to Vinavi`, 'success');
        // Show success modal and auto-dismiss after 1.5 seconds
        const modal = document.getElementById('successModal');
        const msg = document.getElementById('successMessage');
        if (modal) {
            if (msg) msg.textContent = `Submitted ${ok} lab test(s) to episode #${episode.id}`;
            modal.classList.remove('hidden');
            
            // Auto-dismiss after 1.5 seconds
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 1500);
            
            // Still allow manual close
            const closeBtn = document.getElementById('closeSuccessModal');
            if (closeBtn && !closeBtn._wired) {
                closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
                closeBtn._wired = true;
            }
        }
        
        // Ask catalog to clear selection
        // Clear selection in all catalog iframes
        ['labCatalogFrame','labCatalogFramePackages'].forEach(fid => {
            const f = document.getElementById(fid);
            if (f && f.contentWindow) {
                f.contentWindow.postMessage({ type: 'clearSelection' }, '*');
            }
        });
    } else if (ok > 0) {
        const summary = failedEntries.map(entry => {
            const label = describeTest(entry) || 'Unknown test';
            return entry.reason ? `${label} (${entry.reason})` : label;
        }).join('; ');
        showToast(`Submitted ${ok} test(s). Unable to submit ${fail}: ${summary}`, 'info');
    } else {
        const summary = failedEntries.length
            ? failedEntries.map(entry => {
                const label = describeTest(entry) || 'Unknown test';
                return entry.reason ? `${label} (${entry.reason})` : label;
            }).join('; ')
            : 'No verified Vinavi service IDs';
        showToast(`Failed to submit any tests — ${summary}`, 'error');
    }

    // Log failures persistently
    if (failedEntries.length > 0) {
        appendFailedTestsToLog(failedEntries, episode.id);
    }
}

/**
 * Auto-search Vinavi and build mapping for ASND code
 */
async function searchServiceByQuery(asndCode) {
    const q = (asndCode || '').trim();
    if (!q) return null;
    
    try {
        // Search Vinavi services API with ASND code
        const url = `https://vinavi.aasandha.mv/api/services?filter[query]=${encodeURIComponent(q)}&page[size]=50`;
        const res = await fetch(url, { credentials: 'include' });
        
        if (!res.ok) {
            console.warn('[Search] Service search failed:', res.status);
            return null;
        }
        
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        
        if (list.length === 0) {
            console.error(`[UNMAPPED] No Vinavi service found for ASND: ${q}`);
            return null;
        }
        
        // Try to find exact match by checking service attributes
        const normalize = (s) => (s || '').toString().trim().toLowerCase();
        const qLower = normalize(q);
        
        // Look for exact ASND match in code or name fields
        let match = list.find(d => {
            const code = normalize(d.attributes?.code);
            const name = normalize(d.attributes?.name);
            return code === qLower || code.includes(qLower) || name.includes(qLower);
        });
        
        // If no exact match, use first result
        if (!match && list.length > 0) {
            match = list[0];
            console.warn(`[Search] Using first result for ${q}:`, match.attributes?.name);
        }
        
        if (match) {
            const sid = match.id;
            console.log(`[Search] Found ASND:${q} → Service ID: ${sid} (${match.attributes?.name})`);
            console.log(`[AUTO-MAP] Add to service-map.json: \"ASND:${q}\": \"${sid}\"`);
            return sid;
        }
        
        return null;
        
    } catch (error) {
        console.error('[Search] Error searching services:', error);
        return null;
    }
}

/**
 * UI Helper: Show loading
 */
function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.classList.toggle('hidden', !show);
    }
}

/**
 * UI Helper: Show toast message (small bottom-right notification)
 */
function showToast(message, type = 'error') {
    const toast = document.getElementById('errorToast');
    
    if (toast) {
        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        // Show toast with appropriate type
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        // Function to hide toast
        const hideToast = () => {
            toast.classList.add('hidden');
        };
        
        // Auto-hide after 2 seconds
        const autoHideTimer = setTimeout(hideToast, 2000);
        
        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            const closeHandler = (e) => {
                e.stopPropagation();
                clearTimeout(autoHideTimer);
                hideToast();
            };
            closeBtn.addEventListener('click', closeHandler, { once: true });
        }
    }
}

// Failure Log Management
const FAIL_LOG_STORAGE_KEY = 'failedTestLogHMH';
function loadFailedTestLog(){try{const raw=localStorage.getItem(FAIL_LOG_STORAGE_KEY);if(!raw) return [];const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed:[]}catch(_){return []}}
function saveFailedTestLog(list){try{localStorage.setItem(FAIL_LOG_STORAGE_KEY,JSON.stringify(list))}catch(_){}}
function appendFailedTestsToLog(entries, episodeId){if(!Array.isArray(entries)||entries.length===0) return; const log=loadFailedTestLog(); const now=Date.now(); entries.forEach(e=>{log.push({ts:now,episode:episodeId,testName:e.name||'',asnd:e.asnd||'',vinaviId:e.id||e.vinaviServiceId||'',reason:e.reason||'Unknown error',itemType:e.type||'Lab Test'});}); saveFailedTestLog(log); if (document.getElementById('failLogView')?.classList.contains('active')) renderFailedTestsLog();}
function renderFailedTestsLog(){const body=document.getElementById('failLogBody'); if(!body) return; const log=loadFailedTestLog().slice().sort((a,b)=>b.ts-a.ts); if(log.length===0){body.innerHTML='<tr class="empty-row"><td colspan="7">No failures recorded yet.</td></tr>'; return;} body.innerHTML=log.map(rec=>{const dt=new Date(rec.ts); const time=dt.toLocaleString(); const safe=(s)=>String(s||'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); const typeClass = (rec.itemType||'Lab Test').toLowerCase().replace(/\s+/g,'-'); return `<tr><td>${safe(time)}</td><td>${safe(rec.episode)}</td><td><span class="fail-type-badge fail-type-${typeClass}">${safe(rec.itemType||'Lab Test')}</span></td><td>${safe(rec.testName)}</td><td>${safe(rec.asnd||'-')}</td><td>${safe(rec.vinaviId||'-')}</td><td>${safe(rec.reason)}</td></tr>`;}).join('');}
function wireFailLogControls(){const refresh=document.getElementById('refreshFailLog'); if(refresh&&!refresh._wired){refresh.addEventListener('click',renderFailedTestsLog); refresh._wired=true;} const clear=document.getElementById('clearFailLog'); if(clear&&!clear._wired){clear.addEventListener('click',()=>{if(confirm('Clear all failure log entries?')){saveFailedTestLog([]); renderFailedTestsLog(); showToast('Failure log cleared','info');}}); clear._wired=true;} }

function wireRenewRxButton() {
    const btn = document.getElementById('renewRxHeaderBtn');
    if (btn && !btn._wired) {
        btn.addEventListener('click', showEpisodeSelectorForRenewal);
        btn._wired = true;
    }
}

async function showEpisodeSelectorForRenewal() {
    const currentPatient = window.currentPatient;
    const targetEpisode = window.currentEpisode;
    
    if (!currentPatient || !targetEpisode) {
        showToast('No patient or episode selected', 'error');
        return;
    }
    
    // Show loading modal instead of generic loading
    showRxLoadingModal();
    
    try {
        // Fetch all patient cases/episodes
        const casesUrl = `https://vinavi.aasandha.mv/api/patients/${currentPatient.id}/patient-cases?include=last-episode,doctor&page[size]=100&sort=-created_at`;
        const response = await fetch(casesUrl, { credentials: 'include' });
        
        if (!response.ok) {
            throw new Error('Failed to fetch episodes');
        }
        
        const casesData = await response.json();
        const cases = casesData.data || [];
        const included = casesData.included || [];
        
        // Filter episodes that have prescriptions
        const episodesWithRx = [];
        
        for (const caseItem of cases) {
            const episode = caseItem.relationships['last-episode']?.data;
            if (!episode || !episode.id) continue;
            
                // Fetch episode details to check for prescriptions (include diagnoses and notes for renewal)
            try {
                const epUrl = `https://vinavi.aasandha.mv/api/episodes/${episode.id}?include=prescriptions.medicines.preferred-medicine,doctor,diagnoses.icd-code,notes`;
                const epResponse = await fetch(epUrl, { credentials: 'include' });
                if (!epResponse.ok) continue;
                
                const epData = await epResponse.json();
                const prescriptionRels = epData.data.relationships?.prescriptions?.data || [];
                
                if (prescriptionRels.length > 0) {
                    episodesWithRx.push({
                        episodeId: episode.id,
                        caseId: caseItem.id,
                        date: caseItem.attributes.created_at,
                        doctor: included.find(i => i.id == caseItem.relationships?.doctor?.data?.id && i.type === 'professionals'),
                        prescriptionCount: prescriptionRels.length,
                        episodeData: epData
                    });
                }
            } catch (err) {
                console.warn('Could not fetch episode', episode.id, err);
            }
        }
        
        // Close loading modal
        closeRxLoadingModal();
        
        if (episodesWithRx.length === 0) {
            showToast('No previous episodes with prescriptions found', 'info');
            return;
        }
        
        // Show episode selector modal
        showEpisodeSelectorModal(episodesWithRx, targetEpisode);
        
    } catch (error) {
        closeRxLoadingModal();
        console.error('Error fetching episodes:', error);
        showToast(`Failed to load episodes: ${error.message}`, 'error');
    }
}

async function showEpisodeSelectorModal(episodes, targetEpisode) {
    // Get unique doctors for filter
    const doctors = [...new Set(episodes.map(ep => ep.doctor?.attributes?.fullname || ep.doctor?.attributes?.name || 'Unknown'))].sort();
    const doctorOptions = doctors.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    
    // Pre-fetch specialties for all doctors in background
    const doctorIds = [...new Set(episodes.map(ep => ep.doctor?.id).filter(Boolean))];
    Promise.all(doctorIds.map(id => getDoctorSpecialty(id))).catch(console.warn);
    
    const episodeList = episodes.map((ep, idx) => {
        const doctorName = ep.doctor?.attributes?.fullname || ep.doctor?.attributes?.name || 'Unknown Doctor';
        const doctorId = ep.doctor?.id;
        
        // Try to get specialty from multiple sources
        let specialty = ep.doctor?.attributes?.specialty || 
                        ep.doctor?.attributes?.designation || 
                        ep.doctor?.attributes?.['specialty-name'] ||
                        (doctorId ? doctorSpecialtyCache[doctorId] : null) || '';
        
        const date = ep.date ? formatDateLong(ep.date) : '-';
        
        // Get data from episode
        const included = ep.episodeData.included || [];
        const prescriptionRels = ep.episodeData.data.relationships?.prescriptions?.data || [];
        const diagnosisRels = ep.episodeData.data.relationships?.diagnoses?.data || [];
        
        // Extract diagnoses (ICD codes)
        const diagnoses = [];
        diagnosisRels.forEach(diagRel => {
            const diagnosis = included.find(i => i.type === 'diagnoses' && i.id === diagRel.id);
            if (!diagnosis) return;
            
            const icdCodeRel = diagnosis.relationships?.['icd-code']?.data;
            const icdCode = icdCodeRel ? included.find(i => i.type === 'icd-codes' && i.id === icdCodeRel.id) : null;
            
            if (icdCode) {
                const icdAttrs = icdCode.attributes || {};
                diagnoses.push({
                    id: diagnosis.id,
                    icdCodeId: icdCode.id,
                    code: icdAttrs.code || '',
                    description: icdAttrs.name || icdAttrs.description || icdAttrs.title || '',
                    notes: diagnosis.attributes?.notes || '',
                    final: diagnosis.attributes?.final !== undefined ? diagnosis.attributes.final : true,
                    principle: diagnosis.attributes?.principle !== undefined ? diagnosis.attributes.principle : false
                });
            }
        });
        
        // Extract medical advice notes (check multiple possible note types)
        // Notes can be accessed via relationships OR directly from included array
        const medicalAdvice = [];
        
        // Method 1: Get notes from relationships
        const noteRels = ep.episodeData.data.relationships?.notes?.data || [];
        noteRels.forEach(noteRel => {
            const note = included.find(i => i.type === 'notes' && i.id === noteRel.id);
            if (note) {
                const noteAttrs = note.attributes || {};
                const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase().replace(/-/g, '_');
                const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
                
                if (content && (noteType === 'advice' || noteType === 'medical_advice' || noteType === 'instructions')) {
                    medicalAdvice.push({
                        id: note.id,
                        content: content,
                        noteType: 'medical-advice'
                    });
                }
            }
        });
        
        // Method 2: Also check directly in included for notes (some responses don't use relationships)
        if (medicalAdvice.length === 0) {
            const notesFromIncluded = included.filter(i => i.type === 'notes' || i.type === 'episode-notes');
            notesFromIncluded.forEach(note => {
                const noteAttrs = note.attributes || {};
                const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase().replace(/-/g, '_');
                const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
                
                if (content && (noteType === 'advice' || noteType === 'medical_advice' || noteType === 'instructions')) {
                    medicalAdvice.push({
                        id: note.id,
                        content: content,
                        noteType: 'medical-advice'
                    });
                }
            });
        }
        
        // Extract medications
        const medications = [];
        
        prescriptionRels.forEach(prescRel => {
            const prescription = included.find(i => i.type === 'prescriptions' && i.id === prescRel.id);
            if (!prescription) return;
            
            const medicineRels = prescription.relationships?.medicines?.data || [];
            medicineRels.forEach(medRel => {
                const medicine = included.find(i => 
                    (i.type === 'medicines' || i.type === 'prescription-medicines') && i.id === medRel.id
                );
                if (medicine) {
                    const attrs = medicine.attributes || {};
                    const preferredMed = attrs.preferred_medicine || {};
                    
                    // Get medicine name and details
                    const name = attrs.name || preferredMed.name || 'Unknown Medicine';
                    const strength = preferredMed.strength || '';
                    const preparation = preferredMed.preparation || '';
                    const instructions = attrs.instructions || '';
                    
                    // Build display string
                    const parts = [];
                    if (strength) parts.push(strength);
                    if (preparation) parts.push(preparation);
                    if (instructions) parts.push(instructions);
                    
                    const fullDosage = parts.join(' - ');
                    const display = fullDosage ? `${name} (${fullDosage})` : name;
                    
                    medications.push({ name, dosage: fullDosage, display });
                }
            });
        });
        
        // Build diagnosis HTML
        const diagnosisHtml = diagnoses.length > 0 
            ? `<div class="rx-section-preview rx-diagnosis-preview">
                <div class="rx-section-label">🏥 Diagnosis (${diagnoses.length})</div>
                ${diagnoses.slice(0, 2).map(d => `<span class="diag-pill" title="${escapeHtml(d.code + ' - ' + d.description)}">${escapeHtml(d.code)} - ${escapeHtml(d.description.slice(0, 40))}${d.description.length > 40 ? '...' : ''}</span>`).join('')}
                ${diagnoses.length > 2 ? `<span class="diag-pill-more">+${diagnoses.length - 2} more</span>` : ''}
              </div>`
            : '';
        
        // Build medical advice HTML
        const adviceHtml = medicalAdvice.length > 0 
            ? `<div class="rx-section-preview rx-advice-preview">
                <div class="rx-section-label">📋 Medical Advice (${medicalAdvice.length})</div>
                ${medicalAdvice.slice(0, 1).map(a => `<span class="advice-snippet">${escapeHtml(a.content.slice(0, 80))}${a.content.length > 80 ? '...' : ''}</span>`).join('')}
                ${medicalAdvice.length > 1 ? `<span class="advice-pill-more">+${medicalAdvice.length - 1} more</span>` : ''}
              </div>`
            : '';
        
        // Build medications HTML
        const medsList = medications.length > 0 
            ? `<div class="rx-section-preview rx-meds-preview">
                <div class="rx-section-label">💊 Medications (${medications.length})</div>
                ${medications.slice(0, 2).map(m => `<span class="med-pill" title="${escapeHtml(m.display)}">${escapeHtml(m.display)}</span>`).join('')}
                ${medications.length > 2 ? `<span class="med-pill-more">+${medications.length - 2} more</span>` : ''}
              </div>`
            : '<div class="rx-section-preview rx-meds-preview"><span class="med-pill-empty">No medications</span></div>';
        
        // Get prescription ID for print functionality
        const prescriptionId = prescriptionRels[0]?.id || null;
        
        // Store extracted data on the episode object for later use
        ep.diagnoses = diagnoses;
        ep.medicalAdvice = medicalAdvice;
        ep.medications = medications;
        
        return `
            <div class="episode-rx-card" data-episode-idx="${idx}" data-doctor="${escapeHtml(doctorName)}" data-prescription-id="${prescriptionId || ''}">
                <div class="episode-rx-header">
                    <div>
                        <div class="episode-rx-doctor">${escapeHtml(doctorName)}</div>
                        ${specialty ? `<div class="episode-rx-specialty">${escapeHtml(specialty)}</div>` : ''}
                    </div>
                    <div class="episode-rx-badges">
                        ${diagnoses.length ? `<span class="rx-badge diag-badge" title="${diagnoses.length} diagnosis">${diagnoses.length} Dx</span>` : ''}
                        ${medicalAdvice.length ? `<span class="rx-badge advice-badge" title="${medicalAdvice.length} advice notes">${medicalAdvice.length} Adv</span>` : ''}
                        <span class="rx-badge rx-count-badge">${ep.prescriptionCount} Rx</span>
                    </div>
                </div>
                <div class="episode-rx-meta">
                    <span>📅 ${date}</span>
                    <span>🏥 Episode: ${ep.episodeId}</span>
                </div>
                ${diagnosisHtml}
                ${adviceHtml}
                ${medsList}
                <div class="episode-rx-actions">
                    <div class="push-dropdown-container" data-episode-idx="${idx}">
                        <button class="btn-push-rx" data-episode-idx="${idx}" title="Push to current episode">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 19V5M5 12l7-7 7 7"/>
                            </svg>
                            Push
                            <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                        <div class="push-dropdown-menu">
                            <button class="push-menu-item push-all" data-episode-idx="${idx}">
                                <span class="menu-icon">📦</span> Push All
                            </button>
                            <div class="push-menu-divider"></div>
                            <div class="push-menu-label">Selective Push:</div>
                            <label class="push-checkbox-item">
                                <input type="checkbox" class="push-filter-check" data-type="meds" checked>
                                <span class="checkbox-label">💊 Medications</span>
                            </label>
                            <label class="push-checkbox-item">
                                <input type="checkbox" class="push-filter-check" data-type="diagnosis" checked>
                                <span class="checkbox-label">🏥 Diagnosis</span>
                            </label>
                            <label class="push-checkbox-item">
                                <input type="checkbox" class="push-filter-check" data-type="advice" checked>
                                <span class="checkbox-label">📋 Medical Advice</span>
                            </label>
                            <button class="push-menu-item push-filtered" data-episode-idx="${idx}">
                                <span class="menu-icon">🚀</span> Push Selected
                            </button>
                        </div>
                    </div>
                    <button class="btn-meds-shortcut" data-episode-idx="${idx}" title="Quick: Push medications only">
                        💊 Meds Only
                    </button>
                    <button class="btn-save-bundle" data-episode-idx="${idx}" title="Save prescription as reusable bundle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Save Bundle
                    </button>
                    <button class="btn-view-rx" data-episode-idx="${idx}" title="View prescription details">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        Details
                    </button>
                    <button class="btn-print-rx" data-episode-idx="${idx}" data-prescription-id="${prescriptionId || ''}" data-patient-id="${window.currentPatient?.id}" data-episode-id="${ep.episodeId}" title="Print via Aasandha">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"/>
                        </svg>
                        Print
                    </button>
                    <button class="btn-vinavi-rx" data-episode-idx="${idx}" data-patient-id="${window.currentPatient?.id}" title="View on Vinavi Portal">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                        </svg>
                        Vinavi
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card rx-selector-modal">
            <div class="bundle-picker-header">
                <h3>🔄 Renew Prescription & Data</h3>
                <button class="bundle-picker-close" aria-label="Close">&times;</button>
            </div>
            <div class="rx-modal-filters">
                <input type="text" id="rxSearchInput" class="rx-search-input" placeholder="Search by episode, doctor, diagnosis, or medication...">
                <select id="rxDoctorFilter" class="rx-doctor-filter">
                    <option value="">All Doctors</option>
                    ${doctorOptions}
                </select>
            </div>
            <div class="rx-modal-info">
                <div class="rx-modal-info-icon">📋</div>
                <div class="rx-modal-info-text">
                    <strong>Push All</strong> will copy <span class="info-highlight diag">Diagnosis</span>, 
                    <span class="info-highlight advice">Medical Advice</span>, and 
                    <span class="info-highlight meds">Medications</span> to <strong>Episode ${targetEpisode.id}</strong>
                </div>
            </div>
            <div class="episode-rx-grid" id="episodeRxList">
                ${episodeList}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const closeBtn = overlay.querySelector('.bundle-picker-close');
    const searchInput = overlay.querySelector('#rxSearchInput');
    const doctorFilter = overlay.querySelector('#rxDoctorFilter');
    const episodeCards = overlay.querySelectorAll('.episode-rx-card');
    
    const closeModal = () => document.body.removeChild(overlay);
    
    // Filter function
    const filterEpisodes = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedDoctor = doctorFilter.value;
        
        episodeCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardDoctor = card.getAttribute('data-doctor');
            const matchesSearch = cardText.includes(searchTerm);
            const matchesDoctor = !selectedDoctor || cardDoctor === selectedDoctor;
            
            card.style.display = (matchesSearch && matchesDoctor) ? '' : 'none';
        });
    };
    
    searchInput.addEventListener('input', filterEpisodes);
    doctorFilter.addEventListener('change', filterEpisodes);
    closeBtn.addEventListener('click', closeModal);
    
    // View prescription buttons
    overlay.querySelectorAll('.btn-view-rx').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-episode-idx'), 10);
            const selectedEpisode = episodes[idx];
            showPrescriptionDetailsModal(selectedEpisode);
        });
    });
    
    // Print via Aasandha PDF API buttons
    overlay.querySelectorAll('.btn-print-rx').forEach(btn => {
        btn.addEventListener('click', () => {
            const prescriptionId = btn.getAttribute('data-prescription-id');
            const patientId = btn.getAttribute('data-patient-id');
            const episodeId = btn.getAttribute('data-episode-id');
            
            if (prescriptionId) {
                // Use the Aasandha prescription PDF API
                const pdfUrl = `https://vinavi.aasandha.mv/api/prescriptions/${prescriptionId}/pdf`;
                window.open(pdfUrl, '_blank');
                showToast('Opening prescription PDF...', 'success');
            } else {
                showToast('No prescription ID available for printing', 'error');
            }
        });
    });
    
    // View on Vinavi buttons
    overlay.querySelectorAll('.btn-vinavi-rx').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-episode-idx'), 10);
            const selectedEpisode = episodes[idx];
            const patientId = btn.getAttribute('data-patient-id') || window.currentPatient?.id;
            if (patientId && selectedEpisode.episodeId) {
                const vinaviUrl = `https://vinavi.aasandha.mv/#/patients/${patientId}/episodes/${selectedEpisode.episodeId}`;
                window.open(vinaviUrl, '_blank');
            } else {
                showToast('Unable to open Vinavi', 'error');
            }
        });
    });
    
    // Save as Bundle buttons
    overlay.querySelectorAll('.btn-save-bundle').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-episode-idx'), 10);
            const selectedEpisode = episodes[idx];
            savePrescriptionAsBundle(selectedEpisode);
        });
    });
    
    // Push dropdown toggle
    overlay.querySelectorAll('.btn-push-rx').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = btn.closest('.push-dropdown-container');
            const menu = container.querySelector('.push-dropdown-menu');
            // Close all other menus first
            overlay.querySelectorAll('.push-dropdown-menu.show').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            menu.classList.toggle('show');
        });
    });
    
    // Prevent checkbox clicks from closing dropdown
    overlay.querySelectorAll('.push-checkbox-item').forEach(label => {
        label.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Close dropdown when clicking outside
    overlay.addEventListener('click', (e) => {
        if (!e.target.closest('.push-dropdown-container')) {
            overlay.querySelectorAll('.push-dropdown-menu.show').forEach(m => m.classList.remove('show'));
        }
    });
    
    // Push All menu item
    overlay.querySelectorAll('.push-menu-item.push-all').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.getAttribute('data-episode-idx'), 10);
            const selectedEpisode = episodes[idx];
            closeModal();
            await renewPrescriptionsFromEpisode(selectedEpisode, targetEpisode);
        });
    });
    
    // Push Filtered (selected checkboxes)
    overlay.querySelectorAll('.push-menu-item.push-filtered').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.getAttribute('data-episode-idx'), 10);
            const selectedEpisode = episodes[idx];
            const container = btn.closest('.push-dropdown-container');
            
            // Get checked options
            const medsChecked = container.querySelector('.push-filter-check[data-type="meds"]').checked;
            const diagChecked = container.querySelector('.push-filter-check[data-type="diagnosis"]').checked;
            const adviceChecked = container.querySelector('.push-filter-check[data-type="advice"]').checked;
            
            if (!medsChecked && !diagChecked && !adviceChecked) {
                showToast('Please select at least one option to push', 'error');
                return;
            }
            
            closeModal();
            
            // Build options based on what's checked
            const options = {
                filterMeds: medsChecked,
                filterDiagnosis: diagChecked,
                filterAdvice: adviceChecked
            };
            
            await renewPrescriptionsFromEpisode(selectedEpisode, targetEpisode, options);
        });
    });
    
    // Meds shortcut button
    overlay.querySelectorAll('.btn-meds-shortcut').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.getAttribute('data-episode-idx'), 10);
            const selectedEpisode = episodes[idx];
            closeModal();
            await renewPrescriptionsFromEpisode(selectedEpisode, targetEpisode, { medsOnly: true });
        });
    });
}

/**
 * Save a prescription from Renew Rx as a reusable Clinical Bundle
 * Extracts medications and medical advice for pushing to other patients
 */
async function savePrescriptionAsBundle(sourceEpisode) {
    const sourceData = sourceEpisode.episodeData;
    const included = sourceData.included || [];
    
    // Get medical advice from pre-extracted data (stored when modal was built)
    const medicalAdvice = (sourceEpisode.medicalAdvice || []).map(a => a.content || a);
    
    // Extract full medicine data with Vinavi IDs
    const prescriptionRels = sourceData.data.relationships?.prescriptions?.data || [];
    const medications = [];
    
    prescriptionRels.forEach(prescRel => {
        const prescription = included.find(i => i.type === 'prescriptions' && i.id === prescRel.id);
        if (!prescription) return;
        
        const medicineRels = prescription.relationships?.medicines?.data || [];
        medicineRels.forEach(medRel => {
            const medicine = included.find(i => 
                (i.type === 'medicines' || i.type === 'prescription-medicines') && i.id === medRel.id
            );
            if (!medicine) return;
            
            // Get preferred-medicine relationship for Vinavi ID
            const prefMedRel = medicine.relationships?.['preferred-medicine']?.data;
            const prefMed = prefMedRel ? included.find(i => 
                i.type === 'preferred-medicines' && i.id === prefMedRel.id
            ) : null;
            
            const attrs = medicine.attributes || {};
            const prefAttrs = prefMed?.attributes || {};
            
            medications.push({
                id: prefMed?.id || prefMedRel?.id || medicine.id,
                name: attrs.name || prefAttrs.name || 'Unknown',
                instructions: attrs.instructions || '',
                strength: prefAttrs.strength || '',
                form: prefAttrs.preparation || prefAttrs.form || '',
                generic: prefAttrs['generic-name'] || '',
                vinaviId: prefMed?.id || prefMedRel?.id || null,
                vinaviCode: prefAttrs.code || '',
                preferredMedicineId: prefMed?.id || prefMedRel?.id || null,
                // Store full item for API submission
                item: prefMed || {
                    id: prefMed?.id || prefMedRel?.id,
                    type: 'preferred-medicines',
                    attributes: prefAttrs
                }
            });
        });
    });
    
    if (medications.length === 0 && medicalAdvice.length === 0) {
        showToast('No medications or medical advice found to save', 'error');
        return;
    }
    
    // Prompt for bundle name
    const doctorName = sourceEpisode.doctor?.attributes?.fullname || 
                       sourceEpisode.doctor?.attributes?.name || 'Unknown';
    const date = sourceEpisode.date ? new Date(sourceEpisode.date).toLocaleDateString() : '';
    const defaultName = `Rx from ${doctorName} (${date})`;
    
    // Build summary for prompt
    let summaryParts = [];
    if (medications.length > 0) {
        summaryParts.push(`${medications.length} medication(s)`);
    }
    if (medicalAdvice.length > 0) {
        summaryParts.push(`${medicalAdvice.length} medical advice(s)`);
    }
    
    let promptText = `Save ${summaryParts.join(' and ')} as a Clinical Bundle.\n\n`;
    
    if (medications.length > 0) {
        promptText += `Medications:\n${medications.slice(0, 5).map(m => `• ${m.name}`).join('\n')}`;
        if (medications.length > 5) promptText += `\n... and ${medications.length - 5} more`;
        promptText += '\n\n';
    }
    
    if (medicalAdvice.length > 0) {
        promptText += `Medical Advice:\n${medicalAdvice.slice(0, 3).map(a => `• ${a.substring(0, 50)}${a.length > 50 ? '...' : ''}`).join('\n')}`;
        if (medicalAdvice.length > 3) promptText += `\n... and ${medicalAdvice.length - 3} more`;
        promptText += '\n\n';
    }
    
    promptText += 'Enter bundle name:';
    
    const bundleName = prompt(promptText, defaultName);
    
    if (!bundleName || bundleName.trim() === '') {
        showToast('Bundle save cancelled', 'info');
        return;
    }
    
    try {
        // Use ClinicalSets to save (with medicalAdvice as 5th parameter)
        if (window.ClinicalSets && typeof window.ClinicalSets.create === 'function') {
            window.ClinicalSets.create(bundleName.trim(), [], medications, [], medicalAdvice);
            showToast(`✅ Saved "${bundleName}" with ${summaryParts.join(' and ')}`, 'success');
            
            // Refresh sets display if visible
            if (typeof renderSets === 'function') {
                renderSets();
            }
            if (typeof updateSetsCount === 'function') {
                updateSetsCount();
            }
        } else {
            // Fallback: use sets.js functions directly
            const sets = loadSets();
            const newSet = {
                id: Date.now().toString(),
                name: bundleName.trim(),
                labs: [],
                medications: medications,
                complaints: [],
                medicalAdvice: medicalAdvice,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'prescription-save'
            };
            sets.push(newSet);
            saveSets(sets);
            
            showToast(`✅ Saved "${bundleName}" with ${summaryParts.join(' and ')}`, 'success');
            
            // Refresh display
            if (typeof renderSets === 'function') {
                renderSets();
            }
        }
    } catch (error) {
        console.error('[SaveBundle] Failed to save bundle:', error);
        showToast('Failed to save bundle: ' + error.message, 'error');
    }
}

/**
 * Renew prescriptions from source episode to target episode
 * @param {Object} sourceEpisode - The source episode with prescription data
 * @param {Object} targetEpisode - The target episode to push data to
 * @param {Object} options - Options for selective pushing
 * @param {boolean} options.medsOnly - Push only medications (shortcut button)
 * @param {boolean} options.filterMeds - Include medications in filtered push
 * @param {boolean} options.filterDiagnosis - Include diagnosis in filtered push
 * @param {boolean} options.filterAdvice - Include medical advice in filtered push
 */
async function renewPrescriptionsFromEpisode(sourceEpisode, targetEpisode, options = {}) {
    showLoading(true);
    
    const { medsOnly, filterMeds, filterDiagnosis, filterAdvice } = options;
    
    // Determine what to push based on options
    // If medsOnly is true (shortcut button), only push meds
    // If filter options are set, use those
    // Otherwise push all
    const isFiltered = filterMeds !== undefined || filterDiagnosis !== undefined || filterAdvice !== undefined;
    const pushMeds = medsOnly || (isFiltered ? filterMeds : true);
    const pushDiagnosis = !medsOnly && (isFiltered ? filterDiagnosis : true);
    const pushAdvice = !medsOnly && (isFiltered ? filterAdvice : true);
    
    try {
        const api = getVinaviApi();
        if (!api) {
            throw new Error('Vinavi API not available');
        }
        
        const sourceData = sourceEpisode.episodeData;
        const included = sourceData.included || [];
        
        // Use pre-extracted data from the modal building phase
        const diagnoses = sourceEpisode.diagnoses || [];
        const medicalAdvice = sourceEpisode.medicalAdvice || [];
        const medications = sourceEpisode.medications || [];
        
        // Also extract full medicine data for API submission
        // Including detection of "not covered" custom medicines
        const prescriptionRels = sourceData.data.relationships?.prescriptions?.data || [];
        const allMedicines = [];
        prescriptionRels.forEach(prescRel => {
            const prescription = included.find(i => i.type === 'prescriptions' && i.id === prescRel.id);
            if (!prescription) return;
            
            const medicineRels = prescription.relationships?.medicines?.data || [];
            medicineRels.forEach(medRel => {
                const medicine = included.find(i => 
                    (i.type === 'medicines' || i.type === 'prescription-medicines') && i.id === medRel.id
                );
                if (!medicine) return;
                
                const prefMedRel = medicine.relationships?.['preferred-medicine']?.data;
                const prefMed = prefMedRel ? included.find(i => 
                    i.type === 'preferred-medicines' && i.id === prefMedRel.id
                ) : null;
                
                // Detect if this is a "not covered" / custom medicine
                // A medicine is custom ONLY if:
                // 1. is_covered is explicitly false, OR
                // 2. There is absolutely no preferred-medicine relationship
                const isCoveredAttr = medicine.attributes?.is_covered;
                const hasPreferredMedicine = prefMedRel && prefMedRel.id;
                
                // If is_covered is explicitly false, it's custom
                // If there's no preferred-medicine relationship at all, it's custom
                // Otherwise, it's a covered medicine (even if prefMed wasn't in included)
                const isCustom = isCoveredAttr === false || !hasPreferredMedicine;
                
                // Get the preferred medicine ID - use the relationship ID directly
                const preferredMedicineId = prefMedRel?.id || null;
                
                console.log('[RenewRx] Medicine detected:', {
                    name: medicine.attributes?.name,
                    isCoveredAttr,
                    hasPreferredMedicine,
                    preferredMedicineId,
                    isCustom
                });
                
                allMedicines.push({
                    name: medicine.attributes?.name || prefMed?.attributes?.name || 'Unknown',
                    instructions: medicine.attributes?.instructions || '',
                    preferredMedicineId: preferredMedicineId,
                    medicineItem: prefMed || medicine,
                    isCustom: isCustom,
                    isCovered: !isCustom
                });
            });
        });
        
        // Count covered vs not-covered medicines for info
        const coveredMeds = allMedicines.filter(m => !m.isCustom);
        const customMeds = allMedicines.filter(m => m.isCustom);
        
        // Check if there's anything to copy based on options
        const hasData = (pushDiagnosis && diagnoses.length > 0) ||
                        (pushAdvice && medicalAdvice.length > 0) ||
                        (pushMeds && allMedicines.length > 0);
        
        if (!hasData) {
            showToast('No data found to copy from selected episode', 'info');
            showLoading(false);
            return;
        }
        
        console.log('[RenewRx] Data to copy:', { 
            diagnoses: diagnoses.length, 
            medicalAdvice: medicalAdvice.length, 
            medications: allMedicines.length,
            coveredMeds: coveredMeds.length,
            customMeds: customMeds.length,
            options,
            pushMeds, pushDiagnosis, pushAdvice
        });
        
        // Build confirmation message based on what we're pushing
        let confirmParts = [];
        if (pushDiagnosis && diagnoses.length > 0) {
            confirmParts.push(`🏥 ${diagnoses.length} Diagnosis${diagnoses.length !== 1 ? 'es' : ''}`);
        }
        if (pushAdvice && medicalAdvice.length > 0) {
            confirmParts.push(`📋 ${medicalAdvice.length} Medical Advice note${medicalAdvice.length !== 1 ? 's' : ''}`);
        }
        if (pushMeds && allMedicines.length > 0) {
            let medInfo = `💊 ${allMedicines.length} Medication${allMedicines.length !== 1 ? 's' : ''}`;
            if (customMeds.length > 0) {
                medInfo += ` (${customMeds.length} not-covered)`;
            }
            confirmParts.push(medInfo);
        }
        
        const confirmMsg = `This will copy to Episode ${targetEpisode.id}:\n\n` +
            confirmParts.join('\n') + `\n\nContinue?`;
        
        if (!confirm(confirmMsg)) {
            showLoading(false);
            return;
        }
        
        let totalSuccess = 0;
        let totalFail = 0;
        
        // ============================================
        // STEP 1: Copy Diagnoses (ICD codes)
        // ============================================
        if (pushDiagnosis && diagnoses.length > 0 && api.addDiagnosis) {
            showToast('Copying diagnoses...', 'info');
            
            for (let i = 0; i < diagnoses.length; i++) {
                const diag = diagnoses[i];
                try {
                    await api.addDiagnosis(targetEpisode.id, {
                        icdCodeId: diag.icdCodeId,
                        notes: diag.notes || '',
                        final: diag.final !== undefined ? diag.final : true,
                        principle: diag.principle !== undefined ? diag.principle : false
                    });
                    totalSuccess++;
                    console.log('[RenewRx] Added diagnosis:', diag.code);
                } catch (err) {
                    console.error('[RenewRx] Failed to add diagnosis:', diag.code, err);
                    totalFail++;
                }
            }
        }
        
        // ============================================
        // STEP 2: Copy Medications (create prescription)
        // Must come after diagnosis but before medical advice
        // ============================================
        if (pushMeds && allMedicines.length > 0) {
            showToast('Creating prescription...', 'info');
            const prescriptionResult = await api.createPrescription(targetEpisode.id);
            const newPrescriptionId = prescriptionResult.data.id;
            
            console.log('[RenewRx] Created prescription:', newPrescriptionId);
            
            // Get diagnosis ID for medicine linking (from target episode or newly created)
            const diagnosisId = (() => {
                const rel = targetEpisode.relationships?.diagnoses?.data;
                if (Array.isArray(rel) && rel.length > 0 && rel[0]?.id) {
                    return rel[0].id;
                }
                const includedDiag = (window.currentEpisodeIncluded || []).find((item) => item.type === 'diagnoses' && item.id);
                return includedDiag?.id || null;
            })();
            
            for (let i = 0; i < allMedicines.length; i++) {
                const med = allMedicines[i];
                
                try {
                    // Use isCustom flag set during extraction - only truly custom meds should go through custom API
                    const isCustomMed = med.isCustom;
                    showToast(`Adding ${isCustomMed ? 'custom ' : ''}medicine ${i + 1}/${allMedicines.length}...`, 'info');
                    
                    console.log('[RenewRx] Processing medicine:', {
                        name: med.name,
                        isCustomMed,
                        preferredMedicineId: med.preferredMedicineId
                    });
                    
                    if (isCustomMed) {
                        // Use the custom medicine API for not-covered items
                        console.log('[RenewRx] Adding custom/not-covered medicine:', med.name);
                        await api.addCustomMedicineToPrescription(newPrescriptionId, {
                            name: med.name,
                            instructions: med.instructions
                        }, diagnosisId);
                    } else {
                        // Use standard medicine API for covered items
                        const medicineData = {
                            name: med.name,
                            instructions: med.instructions,
                            preferredMedicineId: med.preferredMedicineId,
                            item: med.medicineItem,
                            genericData: null
                        };
                        
                        await api.addMedicineToPrescription(newPrescriptionId, medicineData, diagnosisId);
                    }
                    totalSuccess++;
                    
                } catch (error) {
                    console.error('[RenewRx] Failed to add medicine:', med.name, error);
                    totalFail++;
                }
            }
        }
        
        // ============================================
        // STEP 3: Copy Medical Advice Notes (last)
        // ============================================
        if (pushAdvice && medicalAdvice.length > 0 && api.addNote) {
            showToast('Copying medical advice...', 'info');
            
            for (let i = 0; i < medicalAdvice.length; i++) {
                const note = medicalAdvice[i];
                try {
                    await api.addNote(targetEpisode.id, {
                        noteType: note.noteType || 'medical-advice',
                        content: note.content || ''
                    });
                    totalSuccess++;
                    console.log('[RenewRx] Added medical advice note');
                } catch (err) {
                    console.error('[RenewRx] Failed to add medical advice:', err);
                    totalFail++;
                }
            }
        }
        
        showLoading(false);
        
        // Show final results based on what was attempted
        let attemptedCount = 0;
        if (pushDiagnosis) attemptedCount += diagnoses.length;
        if (pushAdvice) attemptedCount += medicalAdvice.length;
        if (pushMeds) attemptedCount += allMedicines.length;
        
        if (totalSuccess > 0) {
            showToast(`✓ Successfully copied ${totalSuccess}/${attemptedCount} item(s) to Vinavi!`, 'success');
        }
        
        if (totalFail > 0) {
            showToast(`⚠ ${totalFail} item(s) failed to copy`, 'error');
        }
        
        // Refresh episode view
        if (window.currentEpisode && window.loadEpisode) {
            setTimeout(() => {
                window.loadEpisode(window.currentEpisode.id);
            }, 1500);
        }
        
    } catch (error) {
        showLoading(false);
        console.error('[RenewRx] Error:', error);
        showToast(`Failed to renew: ${error.message}`, 'error');
    }
}

function renewPrescription() {
    const episode = window.currentEpisode;
    const included = window.currentEpisodeIncluded || [];
    
    if (!episode) {
        showToast('No episode selected', 'error');
        return;
    }
    
    // Extract prescriptions from episode
    const prescriptionRels = episode.relationships?.prescriptions?.data || [];
    
    if (prescriptionRels.length === 0) {
        showToast('No prescriptions found in this episode', 'info');
        return;
    }
    
    // Get prescription objects from included
    const prescriptions = prescriptionRels.map(rel => {
        return included.find(i => i.type === 'prescriptions' && i.id === rel.id);
    }).filter(Boolean);
    
    if (prescriptions.length === 0) {
        showToast('No prescription details available', 'info');
        return;
    }
    
    // Extract all medicines from prescriptions
    const allMedicines = [];
    prescriptions.forEach(prescription => {
        const medicineRels = prescription.relationships?.medicines?.data || [];
        medicineRels.forEach(medRel => {
            const medicine = included.find(i => 
                (i.type === 'medicines' || i.type === 'preferred-medicines') && i.id === medRel.id
            );
            if (medicine) {
                // Get preferred medicine details if linked
                const prefMedRel = medicine.relationships?.['preferred-medicine']?.data;
                const prefMed = prefMedRel ? included.find(i => 
                    i.type === 'preferred-medicines' && i.id === prefMedRel.id
                ) : null;
                
                allMedicines.push({
                    name: medicine.attributes?.name || prefMed?.attributes?.name || 'Unknown',
                    brand: medicine.attributes?.brand || prefMed?.attributes?.brand || '',
                    dosage: medicine.attributes?.dosage || medicine.attributes?.dose || '',
                    frequency: medicine.attributes?.frequency || '',
                    duration: medicine.attributes?.duration || '',
                    instructions: medicine.attributes?.instructions || medicine.attributes?.instruction || '',
                    quantity: medicine.attributes?.quantity || 1,
                    preferredMedicineId: prefMed?.id || null
                });
            }
        });
    });
    
    if (allMedicines.length === 0) {
        showToast('No medicines found in prescriptions', 'info');
        return;
    }
    
    console.log('[RenewRx] Found medicines:', allMedicines);
    
    // Show confirmation modal with medicine list
    showRenewRxModal(allMedicines, episode);
}

function showRenewRxModal(medicines, episode) {
    const medicineList = medicines.map((med, idx) => {
        const details = [
            med.brand ? `<strong>${med.brand}</strong>` : '',
            med.dosage ? `Dosage: ${med.dosage}` : '',
            med.frequency ? `Frequency: ${med.frequency}` : '',
            med.duration ? `Duration: ${med.duration}` : '',
            med.instructions ? `Instructions: ${med.instructions}` : ''
        ].filter(Boolean).join(' • ');
        
        return `
            <div class="rx-medicine-item" data-med-idx="${idx}">
                <div class="rx-med-info">
                    <div class="rx-med-name">${escapeHtml(med.name)}</div>
                    <div class="rx-med-details">${details}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Get prescription ID for printing
    const prescriptionId = episode.relationships?.prescriptions?.data?.[0]?.id || null;
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 650px;">
            <div class="bundle-picker-header">
                <h3>Prescription Details</h3>
                <button class="bundle-picker-close" aria-label="Close">&times;</button>
            </div>
            <div style="padding: 20px; max-height: 400px; overflow-y: auto;">
                <p style="margin-bottom: 16px; color: #6b7280; font-size: 14px;">
                    Medications in Episode ${episode.id}:
                </p>
                <div class="rx-medicines-list">
                    ${medicineList}
                </div>
            </div>
            <div style="padding: 16px 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn-secondary rx-cancel">Close</button>
                ${prescriptionId ? `
                <button class="btn-primary rx-print-aasandha" style="background: #8b5cf6; display: flex; align-items: center; gap: 6px;" data-prescription-id="${prescriptionId}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"/>
                    </svg>
                    Print (Aasandha)
                </button>
                ` : ''}
                <button class="btn-success rx-confirm">Open in Vinavi</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const closeBtn = overlay.querySelector('.bundle-picker-close');
    const cancelBtn = overlay.querySelector('.rx-cancel');
    const confirmBtn = overlay.querySelector('.rx-confirm');
    const printAasandhaBtn = overlay.querySelector('.rx-print-aasandha');
    
    const closeModal = () => document.body.removeChild(overlay);
    
    // Print via Aasandha PDF API
    if (printAasandhaBtn) {
        printAasandhaBtn.addEventListener('click', () => {
            const prescId = printAasandhaBtn.getAttribute('data-prescription-id');
            if (prescId) {
                const pdfUrl = `https://vinavi.aasandha.mv/api/prescriptions/${prescId}/pdf`;
                window.open(pdfUrl, '_blank');
                showToast('Opening Aasandha prescription PDF...', 'success');
            }
        });
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', () => {
        // Open Vinavi prescription page for this episode
        const patientId = episode.relationships?.patient?.data?.id || window.currentPatient?.id;
        if (patientId && episode.id) {
            const vinaviUrl = `https://vinavi.aasandha.mv/consultations/${patientId}/${episode.id}/prescriptions`;
            window.open(vinaviUrl, '_blank');
            showToast('Opening Vinavi prescription page...', 'success');
        } else {
            showToast('Unable to open Vinavi - missing patient or episode ID', 'error');
        }
        closeModal();
    });
}

function wireBundleQuickSelect(){const btn=document.getElementById('quickBundleBtn'); if(btn&&!btn._wired){btn.addEventListener('click',()=>{const bundles=window._labBundles||[]; if(bundles.length===0){showToast('No bundles available. Create one first.','info'); return;} showBundlePickerModal();}); btn._wired=true;}}

function syncBundleTestsWithCatalog(tests) {
    const catalogFrame = document.getElementById('labCatalogFrame');
    if (!catalogFrame || !catalogFrame.contentWindow) {
        console.warn('Lab catalog iframe not found for syncing bundle tests');
        return;
    }
    
    try {
        // Send syncTests message (not checkTests) - catalog won't notify back
        catalogFrame.contentWindow.postMessage({
            type: 'syncTests',
            tests: tests
        }, '*');
        console.log('[Dashboard] Synced bundle tests with catalog:', tests.length, 'tests');
    } catch (err) {
        console.warn('Could not sync bundle tests with catalog:', err);
    }
}

function showBundlePickerModal(){
    const bundles = window._labBundles || [];
    if (bundles.length === 0) return;
    
    const html = `<div class="bundle-picker-menu">${bundles.map((b, idx) => `<button class="bundle-pick-item" data-bundle-idx="${idx}"><strong>${escapeHtml(b.name)}</strong><span class="bundle-pick-count">${b.tests.length} tests</span></button>`).join('')}</div>`;
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.innerHTML = `<div class="bundle-picker-card"><div class="bundle-picker-header"><h3>Select Bundle</h3><button class="bundle-picker-close" aria-label="Close">&times;</button></div>${html}</div>`;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.bundle-picker-close').addEventListener('click', () => document.body.removeChild(overlay));
    
    overlay.querySelectorAll('.bundle-pick-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-bundle-idx'), 10);
            const bundle = bundles[idx];
            if (!bundle) return;
            
            // Set flag to prevent catalog from overwriting our selection
            window._applyingBundle = true;
            
            // Map tests to proper format
            const testsToApply = bundle.tests.map(t => ({
                code: t.code || '',
                asnd: t.asnd || '',
                name: t.name || '',
                vinaviServiceId: t.vinaviServiceId || null
            }));
            
            // Set selected tests
            window.selectedTests = testsToApply;
            
            // Update display
            if (typeof updateSelectedTestsDisplay === 'function') {
                updateSelectedTestsDisplay();
            }
            
            // Sync with catalog (uses syncTests which doesn't notify back)
            syncBundleTestsWithCatalog(testsToApply);
            
            // Close modal
            document.body.removeChild(overlay);
            
            // Show success message
            showToast(`Applied bundle: ${bundle.name} (${testsToApply.length} tests)`, 'success');
            
            // Clear flag after delay
            setTimeout(() => {
                window._applyingBundle = false;
                console.log('[Dashboard] Bundle apply complete');
            }, 500);
        });
    });
}

/**
 * Clinical Sets Management
 */
let currentSetData = {
    name: '',
    labs: [],
    medications: [],
    complaints: []
};

let selectedMedicine = null;
let medicineSearchTimeout = null;

/**
 * Search medicines using local database - show all, mark injectable
 */
async function searchMedicines(query) {
    console.log('[MedicineSearch] Searching for:', query);
    
    if (!query || query.trim().length < 2) {
        console.log('[MedicineSearch] Query too short');
        return [];
    }
    
    // Check if MedicineDatabase exists
    if (typeof MedicineDatabase === 'undefined') {
        console.error('[MedicineSearch] MedicineDatabase not loaded!');
        return [];
    }
    
    // Use local medicine database - returns all medicines
    const results = MedicineDatabase.search(query);
    
    console.log('[MedicineSearch] Found results:', results.length);
    
    // Convert to format compatible with UI
    return results.map(med => ({
        id: med.id,              // Use regular id for display
        vinaviId: med.vinaviId,  // Vinavi medicine ID for injection (3636, 3637)
        type: 'medicines',
        injectable: med.injectable || (med.vinaviCode && med.vinaviCode.length > 0),
        attributes: {
            name: med.name,
            'generic-name': med.generic,
            generic: med.generic,
            strength: med.strength,
            form: med.form,
            'dosage-form': med.form,
            preparation: med.form,
            category: med.category,
            code: med.vinaviCode,           // M1148 or empty
            'vinavi-code': med.vinaviCode,  // M1148 or empty
            'mfda-code': med.mfdaCode        // P2264 or empty
        }
    }));
}

/**
 * Get medicine details by Vinavi ID
 */
async function getMedicineDetails(vinaviId) {
    const medicine = MedicineDatabase.getByVinaviId(vinaviId);
    
    if (!medicine) {
        throw new Error('Medicine not found');
    }
    
    // Return format compatible with UI
    return {
        id: medicine.vinaviId,
        vinaviId: medicine.vinaviId,
        type: 'medicines',
        attributes: {
            name: medicine.name,
            'generic-name': medicine.generic,
            generic: medicine.generic,
            strength: medicine.strength,
            form: medicine.form,
            'dosage-form': medicine.form,
            preparation: medicine.form,
            category: medicine.category,
            code: medicine.vinaviCode,
            'vinavi-code': medicine.vinaviCode,
            'mfda-code': medicine.mfdaCode
        }
    };
}

/**
 * Display medicine search results
 */
function displayMedicineSearchResults(medicines) {
    const resultsContainer = document.getElementById('medicineSearchResults');
    
    if (!resultsContainer) {
        console.error('[MedicineSearch] Results container not found');
        return;
    }
    
    // Make sure container is visible
    resultsContainer.style.display = 'block';
    
    console.log('[MedicineSearch] Displaying results:', medicines.length);
    
    if (!medicines || medicines.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin: 0 auto 12px;">
                    <path d="M9.88 9.88a3 3 0 104.24 4.24m4.54-7.78A8.97 8.97 0 0112 4a9 9 0 00-9 9c0 2.796 1.273 5.296 3.268 6.96M3 3l18 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p style="font-size: 14px; font-weight: 500;">No medicines found</p>
                <p style="font-size: 12px; margin-top: 4px;">Try a different search term</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = medicines.map(med => {
        const attrs = med.attributes || {};
        const code = attrs.code || attrs['vinavi-code'] || '';
        const isInjectable = med.injectable || code.startsWith('M');
        
        return `
            <div class="medicine-search-item" data-medicine-id="${escapeHtml(med.vinaviId || med.id)}" style="padding: 14px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; background: white; border: 2px solid #e5e7eb; border-radius: 8px;" onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#f0f9ff'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white'">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 3px;">${escapeHtml(attrs.name || '')}</div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">${escapeHtml(attrs['generic-name'] || attrs.generic || '')}</div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            ${attrs.strength ? `<span style="font-size: 11px; padding: 3px 8px; background: #eff6ff; color: #2563eb; border-radius: 4px; font-weight: 500;">${escapeHtml(attrs.strength)}</span>` : ''}
                            ${attrs.form ? `<span style="font-size: 11px; padding: 3px 8px; background: #f3f4f6; color: #4b5563; border-radius: 4px;">${escapeHtml(attrs.form)}</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
                        ${isInjectable ? '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; background: #10b981; color: white; border-radius: 10px; white-space: nowrap;">✓ INJ</span>' : ''}
                        ${code ? `<span style="font-size: 10px; font-weight: 600; padding: 2px 6px; background: #dbeafe; color: #1e40af; border-radius: 4px;">${escapeHtml(code)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    resultsContainer.querySelectorAll('.medicine-search-item').forEach(item => {
        item.addEventListener('click', async function() {
            const medicineId = this.dataset.medicineId;
            console.log('[MedicineSearch] Selecting medicine:', medicineId);
            await selectMedicine(medicineId);
        });
    });
}

/**
 * Select a medicine and show details for editing
 */
async function selectMedicine(medicineId) {
    try {
        const medicine = await getMedicineDetails(medicineId);
        
        // Store selected medicine
        window.selectedMedicine = medicine;
        
        // Show selected medicine in cart
        const detailsContainer = document.getElementById('selectedMedicineDetails');
        const nameEl = document.getElementById('selectedMedicineName');
        const genericEl = document.getElementById('selectedMedicineGeneric');
        const details2El = document.getElementById('selectedMedicineDetails2');
        const instructionsEl = document.getElementById('selectedMedicineInstructions');
        
        const attrs = medicine.attributes || {};
        
        if (nameEl) nameEl.textContent = attrs.name || '';
        if (genericEl) genericEl.textContent = attrs['generic-name'] || attrs.generic || '';
        if (details2El) {
            const parts = [];
            if (attrs.strength) parts.push(`💪 ${attrs.strength}`);
            if (attrs.form) parts.push(`💊 ${attrs.form}`);
            if (attrs.code) parts.push(`Code: ${attrs.code}`);
            details2El.textContent = parts.join(' • ');
        }
        if (instructionsEl) instructionsEl.value = '';
        
        detailsContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error selecting medicine:', error);
        alert('Failed to load medicine details');
    }
}

/**
 * Clear medicine selection
 */
function clearMedicineSelection() {
    window.selectedMedicine = null;
    const detailsContainer = document.getElementById('selectedMedicineDetails');
    const instructionsEl = document.getElementById('selectedMedicineInstructions');
    if (detailsContainer) detailsContainer.style.display = 'none';
    if (instructionsEl) instructionsEl.value = '';
}

/**
 * Add selected medicine to the set
 */
function addSelectedMedicineToSet() {
    if (!window.selectedMedicine) return;
    
    const instructions = document.getElementById('selectedMedicineInstructions').value.trim();
    if (!instructions) {
        showToast('Please enter dosage instructions', 'error');
        return;
    }
    
    const attrs = window.selectedMedicine.attributes || {};
    const medicineData = {
        id: window.selectedMedicine.vinaviId || window.selectedMedicine.id,
        name: attrs.name,
        generic: attrs['generic-name'] || attrs.generic,
        strength: attrs.strength,
        form: attrs.form || attrs['dosage-form'],
        instructions: instructions,
        vinaviId: window.selectedMedicine.vinaviId,
        vinaviCode: attrs.code || attrs['vinavi-code'],
        injectable: window.selectedMedicine.injectable,
        // Store the full item for proper API submission
        item: window.selectedMedicine,
        // Store generic data if available
        genericData: window.selectedMedicine.genericData || null,
        // Store preferred medicine ID
        preferredMedicineId: window.selectedMedicine.vinaviId || window.selectedMedicine.id
    };
    
    // Add to current set data
    if (!currentSetData.medications) {
        currentSetData.medications = [];
    }
    
    // Check if already added
    const exists = currentSetData.medications.find(m => m.id === medicineData.id);
    if (exists) {
        showToast('This medicine is already in the set', 'error');
        return;
    }
    
    currentSetData.medications.push(medicineData);
    
    // Clear selection and update display
    clearMedicineSelection();
    updateSetBuilderDisplay();
    
    // Show success
    showToast('✓ Medicine added to cart', 'success');
}

// Old click handler function (keeping for compatibility)
function oldMedicineItemClickHandler() {
    resultsContainer.querySelectorAll('.medicine-search-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f3f4f6';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
        });
        item.addEventListener('click', () => {
            const medicineId = item.getAttribute('data-medicine-id');
            selectMedicine(medicineId);
        });
    });
}

/**
 * Select a medicine from search results
 */
async function selectMedicine(medicineId) {
    const resultsContainer = document.getElementById('medicineSearchResults');
    const detailsContainer = document.getElementById('selectedMedicineDetails');
    const searchInput = document.getElementById('medicineSearchInput');
    
    // Hide search results
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
    
    // Show loading
    showLoading(true);
    
    try {
        const medicineData = await getMedicineDetails(medicineId);
        
        if (!medicineData) {
            throw new Error('Failed to load medicine details');
        }
        
        selectedMedicine = {
            id: medicineData.id,
            name: medicineData.attributes?.name || 'Unknown Medicine',
            genericName: medicineData.attributes?.['generic-name'] || medicineData.attributes?.generic || '',
            strength: medicineData.attributes?.strength || '',
            form: medicineData.attributes?.form || medicineData.attributes?.['dosage-form'] || '',
            genericId: medicineData.attributes?.['generic-id'] || null
        };
        
        // Display selected medicine
        if (detailsContainer) {
            const nameEl = document.getElementById('selectedMedicineName');
            const genericEl = document.getElementById('selectedMedicineGeneric');
            
            if (nameEl) {
                nameEl.textContent = selectedMedicine.name;
            }
            
            if (genericEl) {
                const details = [
                    selectedMedicine.genericName,
                    selectedMedicine.strength,
                    selectedMedicine.form
                ].filter(Boolean).join(' • ');
                genericEl.textContent = details;
            }
            
            detailsContainer.style.display = 'block';
        }
        
        // Clear search input
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Focus on instructions
        const instructionsInput = document.getElementById('selectedMedicineInstructions');
        if (instructionsInput) {
            instructionsInput.value = '';
            instructionsInput.focus();
        }
        
        showLoading(false);
        
    } catch (error) {
        console.error('[MedicineSearch] Selection failed:', error);
        showToast('Failed to load medicine details', 'error');
        showLoading(false);
    }
}

/**
 * Clear medicine selection
 */
function clearMedicineSelection() {
    selectedMedicine = null;
    const detailsContainer = document.getElementById('selectedMedicineDetails');
    if (detailsContainer) {
        detailsContainer.style.display = 'none';
    }
}

/**
 * Add selected medicine to set
 */
function addSelectedMedicineToSet() {
    if (!selectedMedicine) {
        showToast('Please select a medicine first', 'error');
        return;
    }
    
    const instructionsInput = document.getElementById('selectedMedicineInstructions');
    const instructions = instructionsInput ? instructionsInput.value.trim() : '';
    
    currentSetData.medications = currentSetData.medications || [];
    
    // Check if already added
    const exists = currentSetData.medications.some(m => m.id === selectedMedicine.id);
    if (exists) {
        showToast('This medicine is already in the set', 'info');
        return;
    }
    
    currentSetData.medications.push({
        id: selectedMedicine.id,
        name: selectedMedicine.name,
        genericName: selectedMedicine.genericName,
        strength: selectedMedicine.strength,
        form: selectedMedicine.form,
        instructions: instructions,
        genericId: selectedMedicine.genericId,
        // Store the full item for proper API submission
        item: selectedMedicine.item || selectedMedicine,
        vinaviId: selectedMedicine.id,
        preferredMedicineId: selectedMedicine.id,
        genericData: selectedMedicine.genericData || null
    });
    
    updateSetBuilderDisplay();
    clearMedicineSelection();
    showToast('Medicine added to set', 'success');
}

function renderSets() {
    const sets = window.ClinicalSets ? window.ClinicalSets.load() : [];
    const grid = document.getElementById('setsGrid');
    const countEl = document.getElementById('setsCount');
    const itemsCountEl = document.getElementById('setItemsCount');
    
    if (countEl) {
        countEl.textContent = `${sets.length} Bundle${sets.length !== 1 ? 's' : ''}`;
    }
    
    if (itemsCountEl) {
        // Count total items across all bundles
        let totalItems = 0;
        sets.forEach(set => {
            totalItems += (set.labs?.length || 0);
            totalItems += (set.medications?.length || 0);
            totalItems += (set.complaints?.length || 0);
            totalItems += (set.medicalAdvice?.length || 0);
        });
        itemsCountEl.textContent = `${totalItems} Item${totalItems !== 1 ? 's' : ''}`;
    }
    
    if (!grid) return;
    
    if (sets.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #9ca3af;">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin: 0 auto 20px;">
                    <rect x="10" y="10" width="25" height="25" rx="4" fill="#e5e7eb"/>
                    <rect x="45" y="10" width="25" height="25" rx="4" fill="#e5e7eb"/>
                    <rect x="10" y="45" width="25" height="25" rx="4" fill="#e5e7eb"/>
                    <rect x="45" y="45" width="25" height="25" rx="4" fill="#e5e7eb"/>
                </svg>
                <p style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">No Clinical Bundles Yet</p>
                <p style="font-size: 14px; margin-bottom: 20px;">Create your first bundle to streamline treatment protocols</p>
                <button onclick="openSetBuilder()" class="btn-primary">Create Your First Bundle</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = sets.map(set => {
        const labCount = set.labs?.length || 0;
        const medCount = set.medications?.length || 0;
        const adviceCount = set.medicalAdvice?.length || 0;
        
        return `
            <div class="package-card" style="position: relative; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border: 2px solid #e5e7eb; border-radius: 16px; padding: 24px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.08);" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.12)'; this.style.borderColor='#3b82f6'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.borderColor='#e5e7eb'">
                <button class="btn-delete-set" data-set-id="${set.id}" style="position: absolute; top: 16px; right: 16px; background: #fee2e2; color: #dc2626; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'" title="Delete Set">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5v6M8 5.5v6M10.5 5.5v6M3 4h10M6 4V2.5A1.5 1.5 0 017.5 1h1A1.5 1.5 0 0110 2.5V4M4.5 4v9.5A1.5 1.5 0 006 15h4a1.5 1.5 0 001.5-1.5V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                </button>
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 40px 12px 0;">${escapeHtml(set.name)}</h3>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; border-radius: 20px; font-size: 13px; font-weight: 600;">
                            🧪 ${labCount} Labs
                        </span>
                        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #065f46; border-radius: 20px; font-size: 13px; font-weight: 600;">
                            💊 ${medCount} Meds
                        </span>
                        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border-radius: 20px; font-size: 13px; font-weight: 600;">
                            📋 ${adviceCount} Advice
                        </span>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-view-set" data-set-id="${set.id}" style="flex: 1; padding: 12px 20px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#3b82f6'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#3b82f6'">View Details</button>
                    <button class="btn-apply-set" data-set-id="${set.id}" style="flex: 1; padding: 12px 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)'">Apply to Episode</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Wire up event listeners
    grid.querySelectorAll('.btn-view-set').forEach(btn => {
        btn.addEventListener('click', () => {
            const setId = btn.getAttribute('data-set-id');
            viewSetDetails(setId);
        });
    });
    
    grid.querySelectorAll('.btn-apply-set').forEach(btn => {
        btn.addEventListener('click', () => {
            const setId = btn.getAttribute('data-set-id');
            applySetQuick(setId);
        });
    });
    
    grid.querySelectorAll('.btn-delete-set').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const setId = btn.getAttribute('data-set-id');
            deleteSetWithConfirmation(setId);
        });
    });
}

function deleteSetWithConfirmation(setId) {
    const set = window.ClinicalSets.get(setId);
    if (!set) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 450px;">
            <div class="bundle-picker-header" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">
                <h3 style="color: white;">Delete Clinical Bundle</h3>
                <button class="bundle-picker-close" aria-label="Close" style="color: white; opacity: 0.9;">&times;</button>
            </div>
            <div style="padding: 32px 24px; text-align: center;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 20px;">
                    <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2" opacity="0.2" fill="#fee2e2"/>
                    <path d="M12 8v4M12 16h.01" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">Are you sure?</h3>
                <p style="color: #6b7280; margin-bottom: 24px;">Do you want to delete "<strong>${escapeHtml(set.name)}</strong>"? This action cannot be undone.</p>
                <div style="display: flex; gap: 12px;">
                    <button class="btn-cancel-delete" style="flex: 1; padding: 12px; background: white; color: #6b7280; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Cancel</button>
                    <button class="btn-confirm-delete" style="flex: 1; padding: 12px; background: #dc2626; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Delete</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.bundle-picker-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.btn-cancel-delete').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.btn-confirm-delete').addEventListener('click', () => {
        window.ClinicalSets.delete(setId);
        overlay.remove();
        showToast('Clinical bundle deleted', 'success');
        renderSets();
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

function openSetBuilder(setId = null) {
    const modal = document.getElementById('setBuilderModal');
    const titleEl = document.getElementById('setBuilderTitle');
    const iframe = document.getElementById('setLabCatalogFrame');
    
    // Flag to ignore iframe notifications until sync is complete
    window._ignoreSetBuilderIframeUpdates = false;
    
    if (setId) {
        // Editing existing set - ignore iframe updates until we sync
        window._ignoreSetBuilderIframeUpdates = true;
        
        const set = window.ClinicalSets.get(setId);
        if (set) {
            currentSetData = { ...set };
            if (titleEl) titleEl.textContent = 'Edit Clinical Bundle';
        }
        
        // Clear and populate form
        document.getElementById('setNameInput').value = currentSetData.name || '';
        updateSetBuilderDisplay();
        
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // Sync existing labs to the iframe (after a short delay to ensure iframe is ready)
        if (iframe && iframe.contentWindow && currentSetData.labs && currentSetData.labs.length > 0) {
            setTimeout(() => {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'syncTests',
                        tests: currentSetData.labs
                    }, '*');
                    console.log('[SetBuilder] Sent syncTests to iframe with', currentSetData.labs.length, 'tests');
                    
                    // Allow updates again after sync completes
                    setTimeout(() => {
                        window._ignoreSetBuilderIframeUpdates = false;
                        console.log('[SetBuilder] Now accepting iframe updates');
                    }, 300);
                } catch (err) {
                    console.warn('Could not sync labs to iframe:', err);
                    window._ignoreSetBuilderIframeUpdates = false;
                }
            }, 500);
        } else {
            // No labs to sync, allow updates immediately
            window._ignoreSetBuilderIframeUpdates = false;
        }
    } else {
        // Creating new set - show wizard to get name first
        showSetNameWizard();
    }
}

function showSetNameWizard() {
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.id = 'setNameWizard';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 520px;">
            <div class="bundle-picker-header">
                <h3>📋 Create New Clinical Bundle</h3>
                <button class="bundle-picker-close" aria-label="Close">&times;</button>
            </div>
            <div style="padding: 32px;">
                <p style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">First, let's give your clinical bundle a descriptive name. This will help you identify it later.</p>
                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-weight: 600; font-size: 14px; color: #374151; margin-bottom: 8px;">Bundle Name *</label>
                    <input 
                        type="text" 
                        id="wizardSetName" 
                        placeholder="e.g., URTI Protocol, Hypertension Workup..." 
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: all 0.2s;"
                    />
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="wizardCancelBtn" style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">Cancel</button>
                    <button id="wizardContinueBtn" style="padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">Continue</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const nameInput = overlay.querySelector('#wizardSetName');
    const continueBtn = overlay.querySelector('#wizardContinueBtn');
    const cancelBtn = overlay.querySelector('#wizardCancelBtn');
    const closeBtn = overlay.querySelector('.bundle-picker-close');
    
    // Focus input
    setTimeout(() => nameInput.focus(), 100);
    
    // Input styling on focus
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '#3b82f6';
        nameInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = '#e5e7eb';
        nameInput.style.boxShadow = 'none';
    });
    
    // Continue button handler
    const handleContinue = () => {
        const name = nameInput.value.trim();
        if (!name) {
            showToast('Please enter a set name', 'error');
            nameInput.focus();
            return;
        }
        
        // Initialize new set with name
        currentSetData = { name: name, labs: [], medications: [], complaints: [], medicalAdvice: [] };
        
        // Remove wizard
        document.body.removeChild(overlay);
        
        // Open main builder
        const modal = document.getElementById('setBuilderModal');
        const titleEl = document.getElementById('setBuilderTitle');
        
        if (titleEl) titleEl.textContent = 'Create Clinical Bundle';
        document.getElementById('setNameInput').value = name;
        updateSetBuilderDisplay();
        
        if (modal) {
            modal.classList.remove('hidden');
        }
    };
    
    continueBtn.addEventListener('click', handleContinue);
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleContinue();
    });
    
    // Cancel/close handlers
    const handleClose = () => document.body.removeChild(overlay);
    cancelBtn.addEventListener('click', handleClose);
    closeBtn.addEventListener('click', handleClose);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) handleClose();
    });
}

function closeSetBuilder() {
    const modal = document.getElementById('setBuilderModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentSetData = { name: '', labs: [], medications: [], complaints: [], medicalAdvice: [] };
    
    // Clear the medical advice textarea
    const textarea = document.getElementById('setMedicalAdviceTextarea');
    if (textarea) textarea.value = '';
}

/**
 * Initialize the advice templates and preview in the set builder
 */
function initSetBuilderAdviceTemplates() {
    // Wire up the advice template quick buttons
    document.querySelectorAll('.advice-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.getAttribute('data-template');
            const textarea = document.getElementById('setAdviceInput');
            
            if (textarea && template) {
                // Replace newline escapes with actual newlines
                const formattedTemplate = template.replace(/\\n/g, '\n');
                
                // Add template to textarea (with newline if not empty)
                const currentText = textarea.value.trim();
                if (currentText) {
                    textarea.value = currentText + '\n' + formattedTemplate;
                } else {
                    textarea.value = formattedTemplate;
                }
                
                // Update preview
                updateAdvicePreview();
                
                // Visual feedback
                btn.style.background = '#dcfce7';
                btn.style.borderColor = '#22c55e';
                setTimeout(() => {
                    btn.style.background = '#fffbeb';
                    btn.style.borderColor = '#fde68a';
                }, 300);
                
                showToast('Template added', 'success');
            }
        });
    });
    
    // Wire up advice textarea to update preview on input
    const adviceInput = document.getElementById('setAdviceInput');
    if (adviceInput) {
        adviceInput.addEventListener('input', updateAdvicePreview);
    }
}

/**
 * Update the advice preview section
 */
function updateAdvicePreview() {
    const textarea = document.getElementById('setAdviceInput');
    const countEl = document.getElementById('setAdviceCount');
    const listEl = document.getElementById('setAdviceList');
    
    if (!textarea || !listEl) return;
    
    const lines = textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (countEl) {
        countEl.textContent = lines.length;
    }
    
    if (lines.length > 0) {
        listEl.innerHTML = lines.map(line => 
            `<div style="padding: 6px 0; border-bottom: 1px dashed #fde68a;">• ${escapeHtml(line)}</div>`
        ).join('');
    } else {
        listEl.innerHTML = '<div style="color: #9ca3af; font-style: italic;">No advice added yet. Type in the box above or use a template.</div>';
    }
}

/**
 * Get medical advice from textarea as array (split by newlines)
 */
function getMedicalAdviceFromTextarea() {
    const textarea = document.getElementById('setAdviceInput');
    if (!textarea || !textarea.value.trim()) return [];
    
    // Split by newlines, trim each line, filter empty lines
    return textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

/**
 * Set medical advice textarea from array
 */
function setMedicalAdviceTextarea(adviceArray) {
    const textarea = document.getElementById('setAdviceInput');
    if (!textarea) return;
    
    if (Array.isArray(adviceArray) && adviceArray.length > 0) {
        textarea.value = adviceArray.join('\n');
    } else {
        textarea.value = '';
    }
}

function updateSetBuilderDisplay() {
    // Update labs
    const labsList = document.getElementById('setLabsList');
    const labCount = document.getElementById('setLabCount');
    if (labsList && currentSetData.labs) {
        labCount.textContent = currentSetData.labs.length;
        labsList.innerHTML = currentSetData.labs.map((lab, idx) => `
            <span class="detail-badge" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: white; border: 1px solid #e5e7eb; border-radius: 6px;">
                ${escapeHtml(lab.name || lab.asnd)}
                <button onclick="removeSetLab(${idx})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </span>
        `).join('');
    }
    
    // Update medications in side cart
    const medsList = document.getElementById('setMedicationsItems');
    const medCount = document.getElementById('setMedicationCount');
    const medCount2 = document.getElementById('setMedicationCount2');
    const emptyState = document.getElementById('medicineCartEmpty');
    
    if (medsList && currentSetData.medications) {
        const count = currentSetData.medications.length;
        if (medCount) medCount.textContent = count;
        if (medCount2) medCount2.textContent = count;
        
        if (count === 0) {
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            
            medsList.innerHTML = currentSetData.medications.map((med, idx) => {
                const details = [med.generic, med.strength, med.form].filter(Boolean).join(' • ');
                return `
                <div style="padding: 12px; background: white; border: 2px solid #d1fae5; border-radius: 8px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #065f46; font-size: 13px;">${escapeHtml(med.name)}</div>
                            ${details ? `<div style="font-size: 11px; color: #059669; margin-top: 3px;">${escapeHtml(details)}</div>` : ''}
                        </div>
                        <button onclick="removeSetMedication(${idx})" style="background: #fee2e2; border: none; color: #dc2626; cursor: pointer; padding: 4px 8px; font-size: 16px; border-radius: 4px; font-weight: 600; flex-shrink: 0;">&times;</button>
                    </div>
                    ${med.instructions ? `<div style="font-size: 11px; color: #374151; padding: 8px; background: #f0fdf4; border-radius: 4px; border-left: 2px solid #10b981; margin-top: 8px;"><strong>Instructions:</strong> ${escapeHtml(med.instructions)}</div>` : '<div style="font-size: 11px; color: #9ca3af; font-style: italic; margin-top: 4px;">No instructions</div>'}
                </div>
            `;
            }).join('');
        }
    }
    
    // Update complaints
    const complaintsList = document.getElementById('setComplaintsItems');
    const complaintCount = document.getElementById('setComplaintCount');
    if (complaintsList && currentSetData.complaints) {
        complaintCount.textContent = currentSetData.complaints.length;
        complaintsList.innerHTML = currentSetData.complaints.map((complaint, idx) => `
            <div style="padding: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #1f2937;">${escapeHtml(complaint)}</span>
                <button onclick="removeSetComplaint(${idx})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px 8px; font-size: 18px;">&times;</button>
            </div>
        `).join('');
    }
    
    // Update medical advice textarea
    setMedicalAdviceTextarea(currentSetData.medicalAdvice);
}

window.removeSetLab = function(index) {
    currentSetData.labs.splice(index, 1);
    updateSetBuilderDisplay();
};

window.removeSetMedication = function(index) {
    currentSetData.medications.splice(index, 1);
    updateSetBuilderDisplay();
};

window.removeSetComplaint = function(index) {
    currentSetData.complaints.splice(index, 1);
    updateSetBuilderDisplay();
};

function saveCurrentSet() {
    const name = document.getElementById('setNameInput').value.trim();
    
    if (!name) {
        showToast('Please enter a set name', 'error');
        return;
    }
    
    currentSetData.name = name;
    
    // Get medical advice from textarea (split by newlines)
    currentSetData.medicalAdvice = getMedicalAdviceFromTextarea();
    
    try {
        if (currentSetData.id) {
            window.ClinicalSets.update(currentSetData.id, currentSetData);
            showToast('Clinical bundle updated successfully', 'success');
        } else {
            window.ClinicalSets.create(name, currentSetData.labs, currentSetData.medications, currentSetData.complaints, currentSetData.medicalAdvice || []);
            showToast('Clinical bundle created successfully', 'success');
        }
        
        closeSetBuilder();
        renderSets();
    } catch (error) {
        showToast('Failed to save set: ' + error.message, 'error');
    }
}

function viewSetDetails(setId) {
    const set = window.ClinicalSets.get(setId);
    if (!set) return;
    
    const labsList = set.labs && set.labs.length > 0
        ? set.labs.map(l => `<li>${escapeHtml(l.name || l.asnd)}</li>`).join('')
        : '<li style="color: #9ca3af;">No labs in this set</li>';
    
    const medsList = set.medications && set.medications.length > 0
        ? set.medications.map(m => {
            const details = [m.genericName, m.strength, m.form].filter(Boolean).join(' • ');
            return `
                <li style="margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <div style="font-weight: 600; color: #1f2937;">${escapeHtml(m.name)}</div>
                    ${details ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${escapeHtml(details)}</div>` : ''}
                    ${m.instructions ? `<div style="font-size: 13px; color: #374151; margin-top: 6px;"><strong>Instructions:</strong> ${escapeHtml(m.instructions)}</div>` : ''}
                </li>
            `;
        }).join('')
        : '<li style="color: #9ca3af;">No medications in this set</li>';
    
    const complaintsList = set.complaints && set.complaints.length > 0
        ? set.complaints.map(c => `<li>${escapeHtml(c)}</li>`).join('')
        : '<li style="color: #9ca3af;">No complaints in this set</li>';
    
    const adviceList = set.medicalAdvice && set.medicalAdvice.length > 0
        ? set.medicalAdvice.map(a => `<li style="padding: 8px 12px; background: #fef9c3; border-left: 3px solid #f59e0b; border-radius: 4px; margin-bottom: 8px;">${escapeHtml(a)}</li>`).join('')
        : '<li style="color: #9ca3af;">No medical advice in this set</li>';
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 700px;">
            <div class="bundle-picker-header">
                <h3>${escapeHtml(set.name)}</h3>
                <button class="bundle-picker-close" aria-label="Close">&times;</button>
            </div>
            <div style="padding: 24px; max-height: 500px; overflow-y: auto;">
                <div style="margin-bottom: 24px;">
                    <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">🧪 Lab Tests (${set.labs?.length || 0})</h4>
                    <ul style="list-style: none; padding: 0;">${labsList}</ul>
                </div>
                <div style="margin-bottom: 24px;">
                    <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">💊 Medications (${set.medications?.length || 0})</h4>
                    <ul style="list-style: none; padding: 0;">${medsList}</ul>
                </div>
                <div>
                    <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">📋 Medical Advice (${set.medicalAdvice?.length || 0})</h4>
                    <ul style="list-style: none; padding: 0;">${adviceList}</ul>
                </div>
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn-secondary set-details-edit">Edit Set</button>
                <button class="btn-primary set-details-apply">Apply to Episode</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.bundle-picker-close').addEventListener('click', () => document.body.removeChild(overlay));
    overlay.querySelector('.set-details-edit').addEventListener('click', () => {
        document.body.removeChild(overlay);
        openSetBuilder(setId);
    });
    overlay.querySelector('.set-details-apply').addEventListener('click', () => {
        document.body.removeChild(overlay);
        applySetQuick(setId);
    });
}

function applySetQuick(setId) {
    const set = window.ClinicalSets.get(setId);
    if (!set) return;
    
    if (!window.currentEpisode) {
        showToast('Please select a patient episode first', 'error');
        return;
    }
    
    // Apply labs to selection
    if (set.labs && set.labs.length > 0) {
        window.selectedTests = window.selectedTests || [];
        set.labs.forEach(lab => {
            // Check if already selected
            const exists = window.selectedTests.some(t => t.asnd === lab.asnd);
            if (!exists) {
                window.selectedTests.push(lab);
            }
        });
        
        if (typeof updateSelectedTestsDisplay === 'function') {
            updateSelectedTestsDisplay();
        }
        
        // Sync with catalog
        const catalogFrame = document.getElementById('labCatalogFrame');
        if (catalogFrame && catalogFrame.contentWindow) {
            try {
                catalogFrame.contentWindow.postMessage({
                    type: 'checkTests',
                    tests: set.labs
                }, '*');
            } catch (err) {
                console.warn('Could not sync set labs with catalog:', err);
            }
        }
    }
    
    showToast(`Applied set: ${set.name} (${set.labs?.length || 0} labs added)`, 'success');
    
    // Switch to lab order view if not already there
    if (window._activateView) {
        window._activateView('labOrder');
    }
}

function showSetMenu(setId, buttonEl) {
    // Simple context menu
    const menu = document.createElement('div');
    menu.style.cssText = 'position: absolute; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 8px; z-index: 10000; min-width: 140px;';
    
    const rect = buttonEl.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    
    menu.innerHTML = `
        <button class="menu-item-edit" style="display: block; width: 100%; text-align: left; padding: 8px 12px; background: none; border: none; cursor: pointer; border-radius: 4px; font-size: 14px;">Edit</button>
        <button class="menu-item-delete" style="display: block; width: 100%; text-align: left; padding: 8px 12px; background: none; border: none; cursor: pointer; border-radius: 4px; color: #ef4444; font-size: 14px;">Delete</button>
    `;
    
    document.body.appendChild(menu);
    
    const closeMenu = () => document.body.removeChild(menu);
    
    menu.querySelector('.menu-item-edit').addEventListener('click', () => {
        closeMenu();
        openSetBuilder(setId);
    });
    
    menu.querySelector('.menu-item-delete').addEventListener('click', () => {
        closeMenu();
        if (confirm('Are you sure you want to delete this set?')) {
            window.ClinicalSets.delete(setId);
            renderSets();
            showToast('Set deleted successfully', 'success');
        }
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeMenu, { once: true });
    }, 100);
}

function wireSetBuilderControls() {
    // Tab switching
    document.querySelectorAll('.set-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            document.querySelectorAll('.set-tab').forEach(t => {
                t.classList.remove('active');
                t.style.borderBottomColor = 'transparent';
                t.style.color = '#6b7280';
            });
            tab.classList.add('active');
            tab.style.borderBottomColor = '#2563eb';
            tab.style.color = '#2563eb';
            
            // Show corresponding section
            document.querySelectorAll('.set-section').forEach(s => s.style.display = 'none');
            const section = document.getElementById(`set${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}Section`);
            if (section) section.style.display = 'block';
        });
    });
    
    // Close button
    const closeBtn = document.getElementById('closeSetBuilder');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSetBuilder);
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelSetBuilder');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeSetBuilder);
    }
    
    // Save button
    const saveBtn = document.getElementById('saveSetBuilder');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentSet);
    }
    
    // Medicine search input
    const medicineSearchInput = document.getElementById('medicineSearchInput');
    if (medicineSearchInput) {
        medicineSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            const spinner = document.getElementById('medicineSearchSpinner');
            const icon = document.getElementById('medicineSearchIcon');
            const resultsContainer = document.getElementById('medicineSearchResults');
            
            // Clear previous timeout
            if (medicineSearchTimeout) {
                clearTimeout(medicineSearchTimeout);
            }
            
            // Hide results if query is too short
            if (query.length < 2) {
                if (resultsContainer) resultsContainer.style.display = 'none';
                if (spinner) spinner.style.display = 'none';
                if (icon) icon.style.display = 'block';
                return;
            }
            
            // Show spinner
            if (spinner) spinner.style.display = 'block';
            if (icon) icon.style.display = 'none';
            
            // Debounce search
            medicineSearchTimeout = setTimeout(async () => {
                try {
                    const results = await searchMedicines(query);
                    displayMedicineSearchResults(results);
                } catch (error) {
                    console.error('[MedicineSearch] Search error:', error);
                } finally {
                    if (spinner) spinner.style.display = 'none';
                    if (icon) icon.style.display = 'block';
                }
            }, 500);
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            const resultsContainer = document.getElementById('medicineSearchResults');
            if (resultsContainer && 
                !medicineSearchInput.contains(e.target) && 
                !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }
    
    // Clear medicine selection button
    const clearMedicineBtn = document.getElementById('clearMedicineSelection');
    if (clearMedicineBtn) {
        clearMedicineBtn.addEventListener('click', clearMedicineSelection);
    }
    
    // Add selected medicine button
    const addSelectedMedBtn = document.getElementById('addSelectedMedicineBtn');
    if (addSelectedMedBtn) {
        addSelectedMedBtn.addEventListener('click', addSelectedMedicineToSet);
    }
    
    // Allow Enter key to add medicine
    const instructionsInput = document.getElementById('selectedMedicineInstructions');
    if (instructionsInput) {
        instructionsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addSelectedMedicineToSet();
            }
        });
    }
    
    // Add medication button (old manual method - keep as fallback)
    const addMedBtn = document.getElementById('addMedicationBtn');
    if (addMedBtn) {
        addMedBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('medicationNameInput');
            const instrInput = document.getElementById('medicationInstructionsInput');
            
            const name = nameInput.value.trim();
            const instructions = instrInput.value.trim();
            
            if (!name) {
                showToast('Please enter medication name', 'error');
                return;
            }
            
            currentSetData.medications = currentSetData.medications || [];
            currentSetData.medications.push({ name, instructions });
            
            nameInput.value = '';
            instrInput.value = '';
            
            updateSetBuilderDisplay();
        });
    }
    
    // Add complaint button
    const addComplaintBtn = document.getElementById('addComplaintBtn');
    if (addComplaintBtn) {
        addComplaintBtn.addEventListener('click', () => {
            const input = document.getElementById('complaintInput');
            const complaint = input.value.trim();
            
            if (!complaint) {
                showToast('Please enter a complaint', 'error');
                return;
            }
            
            currentSetData.complaints = currentSetData.complaints || [];
            currentSetData.complaints.push(complaint);
            
            input.value = '';
            updateSetBuilderDisplay();
        });
    }
    
    // Initialize advice templates in set builder
    initSetBuilderAdviceTemplates();
    
    // Listen for lab selection from iframe
    window.addEventListener('message', (event) => {
        if (event.data.type === 'testSelectionChanged' && event.source === document.getElementById('setLabCatalogFrame')?.contentWindow) {
            // Ignore updates while syncing existing bundle data
            if (window._ignoreSetBuilderIframeUpdates) {
                console.log('[SetBuilder] Ignoring iframe update during sync');
                return;
            }
            currentSetData.labs = event.data.selectedTests || [];
            updateSetBuilderDisplay();
        }
    });
    
    // Clinical Sets functionality removed - using Lab Bundles only
    // If you need clinical bundles with medications, restore from backup
}

/**
 * Show modal to select and apply clinical set to current episode
 */
function showClinicalSetSelector() {
    const sets = window.ClinicalSets ? window.ClinicalSets.load() : [];
    
    if (sets.length === 0) {
        showToast('No clinical bundles available. Create one first!', 'error');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 700px;">
            <div class="bundle-picker-header">
                <h3>Select Clinical Bundle to Apply</h3>
                <button class="bundle-picker-close" aria-label="Close">&times;</button>
            </div>
            <div style="padding: 24px; max-height: 500px; overflow-y: auto;">
                <p style="color: #6b7280; margin-bottom: 20px;">Choose a clinical bundle to apply to the current episode</p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${sets.map(set => {
                        const labCount = set.labs?.length || 0;
                        const medCount = set.medications?.length || 0;
                        const complaintCount = set.complaints?.length || 0;
                        const adviceCount = set.medicalAdvice?.length || 0;
                        return `
                        <button class="clinical-set-option" data-set-id="${set.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: white; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: left;" onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#f0f9ff'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white'">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 6px;">${escapeHtml(set.name)}</div>
                                <div style="display: flex; gap: 12px; font-size: 13px; color: #6b7280; flex-wrap: wrap;">
                                    <span>🧪 ${labCount} tests</span>
                                    <span>💊 ${medCount} meds</span>
                                    <span>📋 ${complaintCount} complaints</span>
                                    <span>📝 ${adviceCount} advice</span>
                                </div>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="#3b82f6">
                                <path d="M7 10l3 3 5-5"/>
                            </svg>
                        </button>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Wire up buttons
    overlay.querySelector('.bundle-picker-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    
    overlay.querySelectorAll('.clinical-set-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const setId = btn.getAttribute('data-set-id');
            overlay.remove();
            applyClinicalSetToEpisode(setId);
        });
    });
}

/**
 * Show confirmation preview before applying clinical set
 */
function applyClinicalSetToEpisode(setId) {
    const set = window.ClinicalSets ? window.ClinicalSets.get(setId) : null;
    
    if (!set) {
        showToast('Clinical bundle not found', 'error');
        return;
    }
    
    if (!window._currentEpisodeData) {
        showToast('No episode selected. Please open a patient episode first.', 'error');
        return;
    }
    
    // Get episode info
    const episodeId = window._currentEpisodeData.id;
    const patientInc = (window.currentEpisodeIncluded || []).find(i => 
        i.type === 'patients' && i.id == window._currentEpisodeData.relationships?.patient?.data?.id
    );
    const patientName = patientInc?.attributes?.patient_name || patientInc?.attributes?.name || 'Unknown Patient';
    
    // Build preview content
    const labCount = set.labs?.length || 0;
    const medCount = set.medications?.length || 0;
    const adviceCount = set.medicalAdvice?.length || 0;
    
    const labsHtml = labCount > 0 ? set.labs.map(lab => `
        <div class="preview-item lab-item">
            <div class="preview-icon">🧪</div>
            <div class="preview-details">
                <div class="preview-name">${escapeHtml(lab.testName)}</div>
                <div class="preview-meta">${lab.testCode || ''}</div>
            </div>
        </div>
    `).join('') : '<p class="preview-empty">No lab tests in this set</p>';
    
    const medsHtml = medCount > 0 ? set.medications.map(med => `
        <div class="preview-item med-item">
            <div class="preview-icon">💊</div>
            <div class="preview-details">
                <div class="preview-name">${escapeHtml(med.name)}</div>
                <div class="preview-meta">${med.strength || ''} ${med.form || ''}</div>
                ${med.instructions ? `<div class="preview-instructions">${escapeHtml(med.instructions)}</div>` : ''}
            </div>
        </div>
    `).join('') : '<p class="preview-empty">No medications in this set</p>';
    
    // Build medical advice section with templates
    const specialties = window.AdviceTemplates ? window.AdviceTemplates.getSpecialties() : [];
    const existingAdvice = set.medicalAdvice || [];
    
    const adviceTemplatesHtml = specialties.map(specialty => `
        <div class="advice-specialty-group" data-specialty="${specialty.id}">
            <button type="button" class="advice-specialty-header" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; background: ${specialty.color}15; border: 1px solid ${specialty.color}40; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <span style="font-size: 18px;">${specialty.icon}</span>
                <span style="font-weight: 600; color: ${specialty.color}; flex: 1; text-align: left;">${specialty.name}</span>
                <span style="font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 10px;">${specialty.templateCount}</span>
                <svg class="specialty-chevron" width="16" height="16" viewBox="0 0 16 16" fill="#6b7280" style="transition: transform 0.2s;">
                    <path d="M4 6l4 4 4-4"/>
                </svg>
            </button>
            <div class="advice-templates-list" style="display: none; padding: 8px 0 8px 28px; max-height: 200px; overflow-y: auto;">
                ${specialty.templates ? specialty.templates.map(template => `
                    <button type="button" class="advice-template-btn" data-template="${escapeHtml(template)}" style="display: block; width: 100%; text-align: left; padding: 8px 12px; margin: 4px 0; background: white; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; font-size: 13px; color: #374151; transition: all 0.15s;" onmouseover="this.style.background='${specialty.color}10'; this.style.borderColor='${specialty.color}'" onmouseout="this.style.background='white'; this.style.borderColor='#e5e7eb'">
                        + ${escapeHtml(template)}
                    </button>
                `).join('') : ''}
            </div>
        </div>
    `).join('');
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.id = 'clinicalSetPreviewOverlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 900px; max-height: 90vh;">
            <div class="bundle-picker-header" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white;">
                <div>
                    <h3 style="margin: 0 0 6px 0; font-size: 20px;">📦 Review Clinical Bundle</h3>
                    <p style="margin: 0; opacity: 0.9; font-size: 13px; font-weight: 500;">Episode ${episodeId} • ${escapeHtml(patientName)}</p>
                </div>
                <button class="bundle-picker-close" aria-label="Close" style="color: white; opacity: 0.9;">&times;</button>
            </div>
            <div style="padding: 24px; overflow-y: auto; max-height: calc(90vh - 180px);">
                <div class="preview-section">
                    <div class="preview-header">
                        <h4 style="margin: 0; font-size: 16px; color: #1f2937; font-weight: 600;">${escapeHtml(set.name)}</h4>
                        <div style="display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap;">
                            <span class="preview-badge lab-badge">🧪 ${labCount} Lab Test${labCount !== 1 ? 's' : ''}</span>
                            <span class="preview-badge med-badge">💊 ${medCount} Medication${medCount !== 1 ? 's' : ''}</span>
                            <span class="preview-badge advice-badge" id="adviceCountBadge">📝 <span id="adviceCountNum">${adviceCount}</span> Advice</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
                    <!-- Left Column: Labs & Meds -->
                    <div>
                        <div class="preview-section">
                            <h5 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Laboratory Tests</h5>
                            <div class="preview-list" style="max-height: 200px; overflow-y: auto;">
                                ${labsHtml}
                            </div>
                        </div>
                        
                        <div class="preview-section" style="margin-top: 20px;">
                            <h5 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Medications</h5>
                            <div class="preview-list" style="max-height: 200px; overflow-y: auto;">
                                ${medsHtml}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column: Medical Advice -->
                    <div>
                        <div class="preview-section">
                            <h5 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Medical Advice
                                <span style="font-weight: 400; font-size: 12px; text-transform: none;">(click templates to add)</span>
                            </h5>
                            
                            <!-- Selected Advice List -->
                            <div id="selectedAdviceList" style="min-height: 60px; max-height: 150px; overflow-y: auto; background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 8px; margin-bottom: 12px;">
                                ${existingAdvice.length > 0 ? existingAdvice.map((advice, idx) => `
                                    <div class="selected-advice-item" data-index="${idx}" style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 6px;">
                                        <span style="flex: 1; font-size: 13px; color: #374151;">${escapeHtml(advice)}</span>
                                        <button type="button" class="remove-advice-btn" data-index="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 16px;">&times;</button>
                                    </div>
                                `).join('') : '<p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 20px 0;">Click templates below or type custom advice</p>'}
                            </div>
                            
                            <!-- Custom Advice Input -->
                            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                                <input type="text" id="customAdviceInput" placeholder="Type custom advice..." style="flex: 1; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px;">
                                <button type="button" id="addCustomAdviceBtn" style="padding: 10px 16px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Add</button>
                            </div>
                            
                            <!-- Template Specialties -->
                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px;">
                                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; padding: 0 4px;">Quick Templates by Specialty:</div>
                                ${adviceTemplatesHtml}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="preview-warning" style="margin-top: 24px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                    <div style="display: flex; gap: 12px; align-items: start;">
                        <span style="font-size: 20px;">⚠️</span>
                        <div>
                            <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">Confirm Action</div>
                            <div style="font-size: 13px; color: #78350f;">This will add the above items to Episode ${episodeId}. Labs & medications will be pushed immediately.</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bundle-picker-footer" style="padding: 20px 24px; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn-cancel" style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">Cancel</button>
                <button class="btn-confirm-push" style="padding: 12px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">Push to Vinavi</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Track selected advice
    let selectedAdvice = [...existingAdvice];
    
    function updateAdviceDisplay() {
        const listEl = overlay.querySelector('#selectedAdviceList');
        const countEl = overlay.querySelector('#adviceCountNum');
        
        if (selectedAdvice.length === 0) {
            listEl.innerHTML = '<p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 20px 0;">Click templates below or type custom advice</p>';
        } else {
            listEl.innerHTML = selectedAdvice.map((advice, idx) => `
                <div class="selected-advice-item" data-index="${idx}" style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 6px;">
                    <span style="flex: 1; font-size: 13px; color: #374151;">${escapeHtml(advice)}</span>
                    <button type="button" class="remove-advice-btn" data-index="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 16px;">&times;</button>
                </div>
            `).join('');
            
            // Re-attach remove listeners
            listEl.querySelectorAll('.remove-advice-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.getAttribute('data-index'));
                    selectedAdvice.splice(idx, 1);
                    updateAdviceDisplay();
                });
            });
        }
        
        countEl.textContent = selectedAdvice.length;
    }
    
    // Wire up specialty toggles
    overlay.querySelectorAll('.advice-specialty-header').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.parentElement;
            const list = group.querySelector('.advice-templates-list');
            const chevron = header.querySelector('.specialty-chevron');
            
            if (list.style.display === 'none') {
                list.style.display = 'block';
                chevron.style.transform = 'rotate(180deg)';
            } else {
                list.style.display = 'none';
                chevron.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Wire up template buttons
    overlay.querySelectorAll('.advice-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.getAttribute('data-template');
            if (!selectedAdvice.includes(template)) {
                selectedAdvice.push(template);
                updateAdviceDisplay();
            } else {
                showToast('Advice already added', 'warning');
            }
        });
    });
    
    // Wire up custom advice input
    const addCustomBtn = overlay.querySelector('#addCustomAdviceBtn');
    const customInput = overlay.querySelector('#customAdviceInput');
    
    addCustomBtn.addEventListener('click', () => {
        const text = customInput.value.trim();
        if (text) {
            if (!selectedAdvice.includes(text)) {
                selectedAdvice.push(text);
                updateAdviceDisplay();
                customInput.value = '';
            } else {
                showToast('Advice already added', 'warning');
            }
        }
    });
    
    customInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomBtn.click();
        }
    });
    
    // Wire up close/cancel buttons
    overlay.querySelector('.bundle-picker-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.btn-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    
    // Wire up confirm button
    overlay.querySelector('.btn-confirm-push').addEventListener('click', () => {
        overlay.remove();
        executeClinicalSetPush(setId, selectedAdvice);
    });
    
    // Initial remove button listeners
    overlay.querySelectorAll('.remove-advice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.getAttribute('data-index'));
            selectedAdvice.splice(idx, 1);
            updateAdviceDisplay();
        });
    });
}

/**
 * Execute the actual push to Vinavi
 * @param {string} setId - Clinical set ID
 * @param {Array} selectedAdvice - Array of medical advice strings to push
 */
async function executeClinicalSetPush(setId, selectedAdvice = []) {
    const set = window.ClinicalSets ? window.ClinicalSets.get(setId) : null;
    
    if (!set || !window._currentEpisodeData) {
        showToast('Error: Missing set or episode data', 'error');
        return;
    }
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'bundle-picker-overlay';
    loadingOverlay.innerHTML = `
        <div class="rx-loading-modal">
            <div class="rx-loading-spinner">
                <svg width="64" height="64" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#2563eb" stroke-width="4" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            </div>
            <h3>Pushing to Vinavi</h3>
            <p style="color: #6b7280;">Applying "${escapeHtml(set.name)}" to episode...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    try {
        const episodeId = window._currentEpisodeData.id;
        let successCount = 0;
        let failCount = 0;
        const failedItems = []; // Collect all failed items for logging
        
        // ============================================
        // CHECK: Diagnosis required before labs/medications
        // Aasandha/Vinavi requires diagnosis first
        // ============================================
        const hasDiagnosis = (() => {
            const rel = window._currentEpisodeData?.relationships?.diagnoses?.data;
            if (Array.isArray(rel) && rel.length > 0 && rel[0]?.id) {
                return true;
            }
            const includedDiag = (window.currentEpisodeIncluded || []).find((item) => item.type === 'diagnoses' && item.id);
            return !!includedDiag;
        })();
        
        const needsDiagnosis = (set.labs && set.labs.length > 0) || (set.medications && set.medications.length > 0);
        
        if (needsDiagnosis && !hasDiagnosis) {
            loadingOverlay.remove();
            showToast('❌ Please add a diagnosis first. Aasandha requires diagnosis before adding labs or medications.', 'error');
            return;
        }
        
        // ============================================
        // STEP 1: Push lab tests
        // ============================================
        if (set.labs && set.labs.length > 0) {
            console.log('[ClinicalSet] Pushing lab tests:', set.labs);
            for (const lab of set.labs) {
                try {
                    await pushLabTestToEpisode(episodeId, lab);
                    successCount++;
                } catch (error) {
                    console.error('[ClinicalSet] Failed to push lab:', lab, error);
                    failCount++;
                    failedItems.push({
                        name: lab.testName || lab.name || 'Unknown Lab',
                        asnd: lab.asndCode || lab.code || '',
                        id: lab.vinaviServiceId || lab.id || '',
                        reason: error.message || 'Unknown error',
                        type: 'Lab Test'
                    });
                }
            }
        }
        
        // ============================================
        // STEP 2: Push medications
        // ============================================
        if (set.medications && set.medications.length > 0) {
            console.log('[ClinicalSet] Pushing medications:', set.medications);
            for (const med of set.medications) {
                try {
                    await pushMedicationToEpisode(episodeId, med);
                    successCount++;
                } catch (error) {
                    console.error('[ClinicalSet] Failed to push medication:', med, error);
                    failCount++;
                    failedItems.push({
                        name: med.name || 'Unknown Medication',
                        asnd: '',
                        id: med.preferredMedicineId || med.vinaviId || med.id || '',
                        reason: error.message || 'Unknown error',
                        type: 'Medication'
                    });
                }
            }
        }
        
        // ============================================
        // STEP 3: Push medical advice as notes (last)
        // ============================================
        if (selectedAdvice && selectedAdvice.length > 0) {
            console.log('[ClinicalSet] Pushing medical advice:', selectedAdvice);
            for (const advice of selectedAdvice) {
                try {
                    await pushAdviceNoteToEpisode(episodeId, advice);
                    successCount++;
                } catch (error) {
                    console.error('[ClinicalSet] Failed to push advice:', advice, error);
                    failCount++;
                    failedItems.push({
                        name: advice.length > 50 ? advice.substring(0, 50) + '...' : advice,
                        asnd: '',
                        id: '',
                        reason: error.message || 'Unknown error',
                        type: 'Medical Advice'
                    });
                }
            }
        }
        
        // Log all failed items to the failure log
        if (failedItems.length > 0) {
            appendFailedTestsToLog(failedItems, episodeId);
        }
        
        loadingOverlay.remove();
        
        if (failCount === 0) {
            showToast(`✅ Successfully pushed "${set.name}" to Vinavi!`, 'success');
        } else if (successCount > 0) {
            showToast(`⚠️ Partially applied: ${successCount} succeeded, ${failCount} failed. Check Failure Log for details.`, 'warning');
        } else {
            showToast(`❌ Failed to apply clinical bundle. Check Failure Log for details.`, 'error');
        }
        
        // Refresh the episode to show the new notes
        if (successCount > 0 && typeof loadEpisode === 'function') {
            setTimeout(() => loadEpisode(episodeId), 1000);
        }
        
    } catch (error) {
        console.error('[ClinicalSet] Error during push:', error);
        loadingOverlay.remove();
        showToast('Failed to push clinical bundle: ' + error.message, 'error');
    }
}

/**
 * Push medical advice as a note to the episode
 * Uses the same api.addNote() method that works for Renew Rx
 */
async function pushAdviceNoteToEpisode(episodeId, adviceText) {
    const api = getVinaviApi();
    if (!api) {
        throw new Error('Vinavi API not available');
    }
    
    if (!api.addNote || typeof api.addNote !== 'function') {
        throw new Error('Vinavi API addNote method not available');
    }
    
    console.log('[Push] Adding advice note:', adviceText);
    
    // Use the same format as Renew Rx which works
    return api.addNote(episodeId, {
        noteType: 'advice',
        content: adviceText
    });
}

/**
 * Push a lab test to Vinavi episode
 */
async function pushLabTestToEpisode(episodeId, lab) {
    const api = getVinaviApi();
    if (!api || typeof api.addServiceToEpisode !== 'function') {
        throw new Error('Vinavi API not available');
    }
    
    // Get diagnosis ID if available
    const diagnosisId = (() => {
        const rel = window._currentEpisodeData?.relationships?.diagnoses?.data;
        if (Array.isArray(rel) && rel.length > 0 && rel[0]?.id) {
            return rel[0].id;
        }
        return null;
    })();
    
    // Get professional ID
    const professionalId = window._currentEpisodeData?.relationships?.doctor?.data?.id || null;
    
    // Use the existing API method that works
    const serviceId = lab.serviceId || lab.vinaviServiceId;
    if (!serviceId) {
        throw new Error('No service ID for lab test: ' + lab.testName);
    }
    
    console.log('[Push] Adding lab test:', lab.testName, 'ServiceID:', serviceId);
    return api.addServiceToEpisode(episodeId, serviceId, diagnosisId, professionalId);
}

/**
 * Push a medication to Vinavi episode
 * Uses the same API pattern as the Rx Renewal feature which works
 * Note: Vinavi requires a diagnosis before you can create a prescription
 */
async function pushMedicationToEpisode(episodeId, med) {
    console.log('[Push] Attempting to push medication:', med, 'to episode:', episodeId);
    
    const api = getVinaviApi();
    if (!api) {
        throw new Error('Vinavi API not available');
    }
    
    // Get diagnosis ID if available - Vinavi requires diagnosis before prescription
    let diagnosisId = (() => {
        const rel = window._currentEpisodeData?.relationships?.diagnoses?.data;
        if (Array.isArray(rel) && rel.length > 0 && rel[0]?.id) {
            return rel[0].id;
        }
        // Also check included data
        const includedDiag = (window.currentEpisodeIncluded || []).find((item) => item.type === 'diagnoses' && item.id);
        return includedDiag?.id || null;
    })();
    
    // If no diagnosis exists, we need to inform the user
    if (!diagnosisId) {
        throw new Error('No diagnosis found. Vinavi requires a diagnosis before adding medications. Please add a diagnosis first.');
    }
    
    // Get or create prescription for this episode
    let prescriptionId = await getOrCreatePrescription(episodeId);
    console.log('[Push] Using prescription ID:', prescriptionId);
    
    // Build medicine data matching the format that works for Rx Renewal
    const preferredMedicineId = med.preferredMedicineId || med.vinaviId || med.id;
    
    // Build item object - use stored item or construct minimal one
    const itemObj = med.item || {
        id: preferredMedicineId,
        type: 'preferred-medicines',
        attributes: {
            name: med.name,
            strength: med.strength || '',
            preparation: med.form || med.preparation || '',
            code: med.vinaviCode || ''
        }
    };
    
    const medicineData = {
        name: med.name || '',
        instructions: med.instructions || '',
        preferredMedicineId: preferredMedicineId,
        item: itemObj,
        genericData: med.genericData || null
    };
    
    console.log('[Push] Medicine data:', medicineData);
    
    return api.addMedicineToPrescription(prescriptionId, medicineData, diagnosisId);
}

/**
 * Get existing prescription or create new one for episode
 */
async function getOrCreatePrescription(episodeId) {
    // First check if episode already has a prescription
    const episodeData = window._currentEpisodeData;
    const prescriptionRels = episodeData?.relationships?.prescriptions?.data || [];
    
    if (prescriptionRels.length > 0) {
        // Use first prescription
        console.log('[Prescription] Using existing prescription:', prescriptionRels[0].id);
        return prescriptionRels[0].id;
    }
    
    // Create new prescription using the API method
    const api = getVinaviApi();
    if (!api || typeof api.createPrescription !== 'function') {
        throw new Error('Vinavi API not available for creating prescription');
    }
    
    console.log('[Prescription] Creating new prescription for episode:', episodeId);
    const result = await api.createPrescription(episodeId);
    const newPrescriptionId = result.data?.id;
    
    if (!newPrescriptionId) {
        throw new Error('Failed to get prescription ID from response');
    }
    
    console.log('[Prescription] Created new prescription:', newPrescriptionId);
    return newPrescriptionId;
}

/**
 * Show Browse Sets Modal - Modern popup with all clinical bundles
 */
function showBrowseSetsModal() {
    const sets = window.ClinicalSets ? window.ClinicalSets.load() : [];
    
    const overlay = document.createElement('div');
    overlay.className = 'bundle-picker-overlay';
    overlay.id = 'browseSetsOverlay';
    overlay.innerHTML = `
        <div class="bundle-picker-card" style="max-width: 1000px; max-height: 90vh; width: 95vw;">
            <div class="bundle-picker-header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px 28px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                            <rect x="3" y="3" width="8" height="8" rx="1" opacity="0.5"/>
                            <rect x="13" y="3" width="8" height="8" rx="1" opacity="0.5"/>
                            <rect x="3" y="13" width="8" height="8" rx="1" opacity="0.5"/>
                            <rect x="13" y="13" width="8" height="8" rx="1" opacity="0.5"/>
                        </svg>
                    </div>
                    <div>
                        <h3 style="color: white; font-size: 22px; font-weight: 700; margin: 0;">Clinical Bundles</h3>
                        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0 0;">${sets.length} bundle${sets.length !== 1 ? 's' : ''} saved</p>
                    </div>
                </div>
                <button class="bundle-picker-close" aria-label="Close" style="color: white; opacity: 0.9; font-size: 28px;">&times;</button>
            </div>
            
            <!-- Search and Actions Bar -->
            <div style="padding: 20px 28px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px; position: relative;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%);">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                        <input type="text" id="bundleSearchInput" placeholder="Search bundles..." style="width: 100%; padding: 12px 16px 12px 44px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; transition: all 0.2s; outline: none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    <button id="createBundleFromModal" style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 5v14M5 12h14"></path>
                        </svg>
                        New Bundle
                    </button>
                </div>
            </div>
            
            <div id="bundleListContainer" style="padding: 24px 28px; overflow-y: auto; max-height: calc(90vh - 200px);">
                ${sets.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
                        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); width: 100px; height: 100px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                                <rect x="3" y="3" width="8" height="8" rx="1"/>
                                <rect x="13" y="3" width="8" height="8" rx="1"/>
                                <rect x="3" y="13" width="8" height="8" rx="1"/>
                                <rect x="13" y="13" width="8" height="8" rx="1"/>
                            </svg>
                        </div>
                        <p style="font-size: 20px; font-weight: 700; color: #374151; margin-bottom: 8px;">No Clinical Bundles Yet</p>
                        <p style="font-size: 14px; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">Create your first bundle to streamline treatment protocols. Bundles can include labs, medications, and medical advice.</p>
                        <button id="createFirstSetBtn" style="padding: 14px 28px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
                            Create Your First Bundle
                        </button>
                    </div>
                ` : `
                    <div id="bundleGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                        ${sets.map(set => {
                            const labCount = set.labs?.length || 0;
                            const medCount = set.medications?.length || 0;
                            const adviceCount = set.medicalAdvice?.length || 0;
                            const createdDate = set.createdAt ? new Date(set.createdAt).toLocaleDateString() : '';
                            
                            return `
                                <div class="browse-set-card" data-name="${escapeHtml(set.name.toLowerCase())}" style="background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 20px; transition: all 0.25s ease; position: relative; overflow: hidden;">
                                    <!-- Decorative gradient bar -->
                                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);"></div>
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px; margin-top: 8px;">
                                        <div style="flex: 1; min-width: 0;">
                                            <h4 style="font-size: 17px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(set.name)}</h4>
                                            ${createdDate ? `<p style="font-size: 12px; color: #9ca3af; margin: 0;">Created ${createdDate}</p>` : ''}
                                        </div>
                                        <button class="btn-delete-set-browse" data-set-id="${set.id}" style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; margin-left: 12px;" title="Delete Bundle">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <!-- Stats badges -->
                                    <div style="display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;">
                                        <span style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                                            ${labCount} Labs
                                        </span>
                                        <span style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #065f46; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
                                            ${medCount} Meds
                                        </span>
                                        <span style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                            ${adviceCount} Advice
                                        </span>
                                    </div>
                                    
                                    <!-- Action buttons -->
                                    <div style="display: flex; gap: 10px;">
                                        <button class="btn-edit-set-browse" data-set-id="${set.id}" style="flex: 1; padding: 11px 16px; background: white; color: #6366f1; border: 2px solid #6366f1; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                            Edit
                                        </button>
                                        <button class="btn-view-set-browse" data-set-id="${set.id}" style="flex: 1; padding: 11px 16px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(59,130,246,0.25);">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                            View
                                        </button>
                                        <button class="btn-apply-set-browse" data-set-id="${set.id}" style="flex: 1; padding: 11px 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(16,185,129,0.25);">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                <path d="M5 12l5 5L20 7"></path>
                                            </svg>
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add hover effects via JavaScript
    overlay.querySelectorAll('.browse-set-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = '#3b82f6';
            card.style.boxShadow = '0 8px 24px rgba(59,130,246,0.15)';
            card.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = '#e5e7eb';
            card.style.boxShadow = 'none';
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Add hover effects for delete buttons
    overlay.querySelectorAll('.btn-delete-set-browse').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#fee2e2';
            btn.style.borderColor = '#f87171';
            btn.style.transform = 'scale(1.08)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = '#fef2f2';
            btn.style.borderColor = '#fecaca';
            btn.style.transform = 'scale(1)';
        });
    });
    
    // Add hover effects for Edit buttons
    overlay.querySelectorAll('.btn-edit-set-browse').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#6366f1';
            btn.style.color = 'white';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'white';
            btn.style.color = '#6366f1';
        });
    });
    
    // Add hover effects for View buttons
    overlay.querySelectorAll('.btn-view-set-browse').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 4px 12px rgba(59,130,246,0.35)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 8px rgba(59,130,246,0.25)';
        });
    });
    
    // Add hover effects for Apply buttons
    overlay.querySelectorAll('.btn-apply-set-browse').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 4px 12px rgba(16,185,129,0.35)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 8px rgba(16,185,129,0.25)';
        });
    });
    
    // Search functionality
    const searchInput = overlay.querySelector('#bundleSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            overlay.querySelectorAll('.browse-set-card').forEach(card => {
                const name = card.dataset.name || '';
                card.style.display = name.includes(query) ? '' : 'none';
            });
        });
    }
    
    // Wire up close button
    overlay.querySelector('.bundle-picker-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    
    // Wire up create bundle button from modal
    const createFromModalBtn = overlay.querySelector('#createBundleFromModal');
    if (createFromModalBtn) {
        createFromModalBtn.addEventListener('click', () => {
            overlay.remove();
            openSetBuilder();
        });
    }
    
    // Wire up create first set button if it exists
    const createFirstBtn = overlay.querySelector('#createFirstSetBtn');
    if (createFirstBtn) {
        createFirstBtn.addEventListener('click', () => {
            overlay.remove();
            openSetBuilder();
        });
    }
    
    // Wire up all Edit buttons
    overlay.querySelectorAll('.btn-edit-set-browse').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const setId = btn.dataset.setId;
            overlay.remove();
            openSetBuilder(setId);
        });
    });
    
    // Wire up all View buttons
    overlay.querySelectorAll('.btn-view-set-browse').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const setId = btn.dataset.setId;
            overlay.remove(); // Close browse modal first
            viewSetDetails(setId);
        });
    });
    
    // Wire up all Apply buttons
    overlay.querySelectorAll('.btn-apply-set-browse').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const setId = btn.dataset.setId;
            overlay.remove();
            applySetQuick(setId);
        });
    });
    
    // Wire up all Delete buttons
    overlay.querySelectorAll('.btn-delete-set-browse').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const setId = btn.dataset.setId;
            deleteSetFromBrowse(setId);
        });
    });
}

/**
 * Edit set from browse modal
 */
function editSetFromBrowse(setId) {
    // Close browse modal
    const browseOverlay = document.getElementById('browseSetsOverlay');
    if (browseOverlay) browseOverlay.remove();
    
    // Open set builder for editing
    openSetBuilder(setId);
}

/**
 * Delete set from browse modal
 */
function deleteSetFromBrowse(setId) {
    deleteSetWithConfirmation(setId);
    
    // Refresh browse modal after short delay
    setTimeout(() => {
        const browseOverlay = document.getElementById('browseSetsOverlay');
        if (browseOverlay) {
            browseOverlay.remove();
            showBrowseSetsModal();
        }
    }, 500);
}

/**
 * Initialize dashboard
 */
async function initializeDashboard() {
    console.log('Initializing HMH Lab Dashboard...');
    
    // EARLY CLEANUP: Remove any Patient Notes nav items from cached HTML
    document.querySelectorAll('.nav-item, .nav-menu a, nav a').forEach(el => {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('patient notes') || text.includes('patientnotes')) {
            console.log('[Dashboard] Removing Patient Notes nav item');
            el.remove();
        }
    });
    
    // Check authentication
    const userData = await checkAuthentication();
    
    if (!userData) {
        console.log('User not authenticated');
        showLoginScreen();
        return;
    }
    
    console.log('User authenticated:', userData.data.attributes);
    
    // Display user info
    displayUserInfo(userData);
    
    // Initialize navigation
    initializeNavigation();

    // Wire fail log controls after initial DOM load
    wireFailLogControls();
    
    // Initialize patient search
    initializePatientSearch();
    
    // Wire bundle quick-select
    wireBundleQuickSelect();
    
    // Wire Sets controls
    wireSetBuilderControls();
    
    // Initialize cart drawer controls
    initializeCartDrawer();
    
    // Render sets if on sets view
    if (document.getElementById('setsView')) {
        renderSets();
    }
    
    console.log('Dashboard initialized successfully');
}

/**
 * Initialize cart sidebar (no toggle needed, always visible)
 */
function initializeCartDrawer() {
    const orderSidebar = document.getElementById('orderSidebar');
    
    // Cart is now always visible, no toggle needed
    if (orderSidebar) {
        orderSidebar.classList.add('open');
    }
    
    // Wire up clear button
    const clearBtn = document.getElementById('clearOrderSelection');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            window.selectedTests = [];
            updateSelectedTestsDisplay();
            
            // Also tell the catalog iframe to clear selections
            const catalogFrame = document.getElementById('labCatalogFrame');
            if (catalogFrame && catalogFrame.contentWindow) {
                try {
                    catalogFrame.contentWindow.postMessage({ type: 'clearAllTests' }, '*');
                } catch (err) {
                    console.warn('Could not sync clear with catalog:', err);
                }
            }
        });
    }
}

/**
 * Export all clinical sets to JSON file
 */
function exportAllClinicalSets() {
    const sets = window.ClinicalSets ? window.ClinicalSets.load() : [];
    
    if (sets.length === 0) {
        showToast('No clinical bundles to export', 'error');
        return;
    }
    
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        type: 'clinical-bundles',
        bundles: sets
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-bundles-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${sets.length} clinical bundle(s) successfully!`, 'success');
}

/**
 * Import clinical sets from JSON file
 */
function importClinicalSetsFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            let bundlesToImport = [];
            
            // Handle both formats: single bundle or export file with array
            if (data.type === 'clinical-bundles' && Array.isArray(data.bundles)) {
                bundlesToImport = data.bundles;
            } else if (data.name && (data.labs || data.medications || data.complaints || data.medicalAdvice)) {
                // Single bundle import
                bundlesToImport = [data];
            } else {
                throw new Error('Invalid file format. Expected clinical bundles export file.');
            }
            
            if (bundlesToImport.length === 0) {
                showToast('No bundles found in file', 'error');
                return;
            }
            
            // Get existing sets for duplicate name checking
            const existingSets = window.ClinicalSets ? window.ClinicalSets.load() : [];
            
            // Helper function to get unique name
            const getUniqueName = (baseName) => {
                // Collect all existing names (lowercase for comparison)
                const allNames = existingSets.map(s => s.name.toLowerCase());
                
                let name = baseName;
                let counter = 1;
                
                // Keep incrementing counter until we find a unique name
                while (allNames.includes(name.toLowerCase())) {
                    counter++;
                    name = `${baseName} (${counter})`;
                }
                
                return name;
            };
            
            let importCount = 0;
            
            for (const bundle of bundlesToImport) {
                // Get a unique name (append number if duplicate)
                const uniqueName = getUniqueName(bundle.name);
                
                // Add to existingSets array so next iteration can check against it
                existingSets.push({ name: uniqueName });
                
                // Create new bundle with unique ID and name
                try {
                    window.ClinicalSets.create(
                        uniqueName,
                        bundle.labs || [],
                        bundle.medications || [],
                        bundle.complaints || [],
                        bundle.medicalAdvice || []
                    );
                    importCount++;
                } catch (err) {
                    console.error('[Import] Failed to import bundle:', bundle.name, err);
                }
            }
            
            // Refresh the display
            renderSets();
            updateSetsCount();
            
            showToast(`Imported ${importCount} bundle(s) successfully!`, 'success');
            
        } catch (error) {
            console.error('[Import] Failed to import bundles:', error);
            showToast(`Import failed: ${error.message}`, 'error');
        }
    };
    
    input.click();
}

/**
 * Update the sets count display
 */
function updateSetsCount() {
    const sets = window.ClinicalSets ? window.ClinicalSets.load() : [];
    const countEl = document.getElementById('setsCount');
    const itemsCountEl = document.getElementById('setItemsCount');
    
    if (countEl) {
        countEl.textContent = `${sets.length} Bundle${sets.length !== 1 ? 's' : ''}`;
    }
    
    if (itemsCountEl) {
        // Count total items across all bundles
        let totalItems = 0;
        sets.forEach(set => {
            totalItems += (set.labs?.length || 0);
            totalItems += (set.medications?.length || 0);
            totalItems += (set.complaints?.length || 0);
            totalItems += (set.medicalAdvice?.length || 0);
        });
        itemsCountEl.textContent = `${totalItems} Item${totalItems !== 1 ? 's' : ''}`;
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);
