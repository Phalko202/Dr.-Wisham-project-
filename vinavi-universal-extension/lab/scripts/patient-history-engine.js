/**
 * Patient History Engine - Comprehensive Patient History Analysis
 * Fetches ALL patient episodes and builds complete medical profile
 * Learns and saves medical knowledge locally (no third-party AI - privacy first)
 */

class PatientHistoryEngine {
  constructor() {
    this.baseUrl = 'https://vinavi.aasandha.mv/api';
    this.patientHistory = null;
    this.isLoading = false;
    this.storageKey = 'hmh_patient_histories';
    this.knowledgeKey = 'hmh_medical_knowledge';
  }

  /**
   * Fetch complete patient history from ALL episodes
   * @param {string} patientId - Patient ID
   * @param {function} onProgress - Progress callback (current, total, episodeId, stage)
   */
  async fetchCompleteHistory(patientId, onProgress = null) {
    if (!patientId) {
      console.error('[HistoryEngine] No patient ID provided');
      return null;
    }

    this.isLoading = true;
    console.log('[HistoryEngine] Fetching complete history for patient:', patientId);

    try {
      // PRIORITY 1: Try to use dashboard's already-loaded cases first
      let episodes = [];
      const dashboardCases = window.currentCases || [];
      const dashboardIncluded = window.currentIncluded || [];
      
      if (dashboardCases.length > 0) {
        console.log('[HistoryEngine] Using dashboard cached cases:', dashboardCases.length);
        if (onProgress) onProgress(0, dashboardCases.length, null, 'discovered');
        
        // Extract data from dashboard cache
        episodes = await this.extractEpisodesFromDashboardCases(dashboardCases, dashboardIncluded, onProgress);
      }
      
      // PRIORITY 2: If no dashboard data, try API calls
      if (episodes.length === 0) {
        console.log('[HistoryEngine] No dashboard cache, fetching from API...');
        episodes = await this.fetchAllEpisodesDetailed(patientId, onProgress);
      }
      
      // Build comprehensive patient profile
      const profile = this.buildPatientProfile(patientId, episodes);
      
      // Save to local storage for future reference
      await this.savePatientProfile(patientId, profile);
      
      // Update medical knowledge base
      await this.updateKnowledgeBase(profile);
      
      this.patientHistory = profile;
      this.isLoading = false;
      
      console.log('[HistoryEngine] Complete history loaded:', {
        episodes: profile.episodes.length,
        uniqueDiagnoses: profile.allDiagnoses.length,
        chronicConditions: profile.chronicConditions.length,
        totalMedications: profile.allMedications.length
      });
      
      return profile;
    } catch (error) {
      console.error('[HistoryEngine] Error fetching history:', error);
      this.isLoading = false;
      return null;
    }
  }

  /**
   * Fetch a single episode with complete details
   * Useful for AI to get comprehensive data from current episode
   */
  async fetchEpisodeForAI(episodeId) {
    console.log('[HistoryEngine] Fetching episode for AI:', episodeId);
    
    try {
      const episodeData = await this.fetchSingleEpisodeDetails(episodeId);
      
      if (!episodeData) {
        console.warn('[HistoryEngine] Could not fetch episode:', episodeId);
        return null;
      }
      
      // Learn from this episode
      await this.learnFromEpisode(episodeData);
      
      return episodeData;
    } catch (error) {
      console.error('[HistoryEngine] Error fetching episode for AI:', error);
      return null;
    }
  }

  /**
   * Extract episode data from dashboard's cached cases
   * This uses window.currentCases and window.currentIncluded which are already loaded
   * Much faster than making API calls since data is already in memory
   */
  async extractEpisodesFromDashboardCases(cases, included, onProgress = null) {
    console.log('[HistoryEngine] Extracting from dashboard cache:', cases.length, 'cases');
    const episodes = [];
    
    // Also use current episode's detailed data if available
    const currentEpisodeIncluded = window.currentEpisodeIncluded || [];
    const currentEpisodeId = window.currentEpisode?.id;
    
    let processed = 0;
    for (const caseItem of cases) {
      const episodeRef = caseItem.relationships?.['last-episode']?.data;
      const episodeId = episodeRef?.id;
      
      // Find the episode in included data
      const episodeData = included.find(i => i.id === episodeId && i.type === 'episodes');
      
      if (!episodeData) {
        processed++;
        if (onProgress) onProgress(processed, cases.length, episodeId, 'loading');
        continue;
      }
      
      const attrs = episodeData.attributes || {};
      const rels = episodeData.relationships || {};
      
      // Build episode object from cache
      const episode = {
        id: episodeId,
        date: attrs.created_at || attrs.date,
        chiefComplaint: attrs.chief_complaint || attrs.complaint || '',
        vitalSigns: {},
        diagnoses: [],
        medications: [],
        labTests: [],
        notes: [],
        doctorName: null
      };
      
      // Parse vitals from the episode
      if (attrs.vitals || attrs.vital_signs) {
        const vitals = attrs.vitals || attrs.vital_signs || {};
        episode.vitalSigns = {
          bloodPressure: vitals.bp || vitals.blood_pressure,
          heartRate: vitals.hr || vitals.heart_rate || vitals.pulse,
          temperature: vitals.temp || vitals.temperature,
          weight: vitals.weight,
          height: vitals.height,
          spo2: vitals.spo2 || vitals.oxygen_saturation
        };
      }
      
      // If this is the currently selected episode, use detailed included data
      if (episodeId === currentEpisodeId && currentEpisodeIncluded.length > 0) {
        // Extract diagnoses from current episode included
        const diagItems = currentEpisodeIncluded.filter(i => i.type === 'diagnoses');
        const icdItems = currentEpisodeIncluded.filter(i => i.type === 'icd-codes');
        
        diagItems.forEach(diag => {
          const icdRef = diag.relationships?.['icd-code']?.data;
          const icdData = icdRef ? icdItems.find(i => i.id === icdRef.id) : null;
          
          episode.diagnoses.push({
            code: icdData?.attributes?.code || '',
            name: icdData?.attributes?.name || diag.attributes?.name || '',
            type: diag.attributes?.diagnosis_type || 'primary'
          });
        });
        
        // Extract medications from current episode included
        const medItems = currentEpisodeIncluded.filter(i => 
          i.type === 'medicines' || i.type === 'preferred-medicines' || i.type === 'prescription-items'
        );
        medItems.forEach(med => {
          const medAttrs = med.attributes || {};
          episode.medications.push({
            name: medAttrs.name || medAttrs.medicine_name || '',
            genericName: medAttrs.generic_name || '',
            strength: medAttrs.strength || '',
            dosage: medAttrs.dosage || medAttrs.dose || '',
            frequency: medAttrs.frequency || '',
            duration: medAttrs.duration || ''
          });
        });
        
        // Extract notes from current episode included
        const noteItems = currentEpisodeIncluded.filter(i => 
          i.type === 'notes' || i.type === 'episode-notes'
        );
        noteItems.forEach(note => {
          if (note.attributes?.note || note.attributes?.content) {
            episode.notes.push({
              type: note.attributes?.note_type || 'clinical',
              content: note.attributes?.note || note.attributes?.content || ''
            });
          }
        });
        
        // Extract doctor name
        const doctorItem = currentEpisodeIncluded.find(i => i.type === 'professionals');
        if (doctorItem) {
          episode.doctorName = doctorItem.attributes?.name || doctorItem.attributes?.full_name;
        }
      } else {
        // For non-current episodes, try to find basic info from case's included data
        // Get diagnoses from case relationships
        const diagRefs = rels['diagnoses']?.data || caseItem.relationships?.['diagnoses']?.data || [];
        (Array.isArray(diagRefs) ? diagRefs : [diagRefs]).forEach(diagRef => {
          if (!diagRef?.id) return;
          const diagInc = included.find(i => i.id === diagRef.id && i.type === 'diagnoses');
          if (diagInc) {
            const icdRef = diagInc.relationships?.['icd-code']?.data;
            const icdInc = icdRef ? included.find(i => i.id === icdRef.id && i.type === 'icd-codes') : null;
            episode.diagnoses.push({
              code: icdInc?.attributes?.code || '',
              name: icdInc?.attributes?.name || diagInc.attributes?.name || '',
              type: diagInc.attributes?.diagnosis_type || 'primary'
            });
          }
        });
        
        // Get doctor from case/episode
        const doctorRef = rels['professional']?.data || caseItem.relationships?.['professional']?.data;
        if (doctorRef?.id) {
          const doctorInc = included.find(i => i.id === doctorRef.id && i.type === 'professionals');
          if (doctorInc) {
            episode.doctorName = doctorInc.attributes?.name || doctorInc.attributes?.full_name;
          }
        }
      }
      
      episodes.push(episode);
      processed++;
      if (onProgress) onProgress(processed, cases.length, episodeId, 'loading');
    }
    
    if (onProgress) onProgress(episodes.length, cases.length, null, 'complete');
    console.log('[HistoryEngine] Extracted episodes from cache:', episodes.length);
    
    return episodes;
  }

  /**
   * Learn patterns from a single episode
   */
  async learnFromEpisode(episode) {
    const knowledge = await this.loadKnowledgeBase();
    
    // Learn diagnosis-to-test patterns
    episode.diagnoses?.forEach(diag => {
      const icdCode = diag.code;
      if (!icdCode) return;
      
      // Record tests ordered for this diagnosis
      episode.labTests?.forEach(test => {
        if (!knowledge.conditionTests[icdCode]) {
          knowledge.conditionTests[icdCode] = {
            name: diag.name,
            tests: [],
            occurrences: 0
          };
        }
        
        const existing = knowledge.conditionTests[icdCode].tests.find(t => 
          t.name.toLowerCase() === test.name.toLowerCase()
        );
        
        if (existing) {
          existing.count++;
        } else {
          knowledge.conditionTests[icdCode].tests.push({
            name: test.name,
            code: test.code,
            count: 1
          });
        }
        knowledge.conditionTests[icdCode].occurrences++;
      });
      
      // Record medications prescribed for this diagnosis
      episode.medications?.forEach(med => {
        if (!knowledge.conditionMedications[icdCode]) {
          knowledge.conditionMedications[icdCode] = {
            name: diag.name,
            medications: [],
            occurrences: 0
          };
        }
        
        const existing = knowledge.conditionMedications[icdCode].medications.find(m => 
          m.name.toLowerCase() === med.name.toLowerCase()
        );
        
        if (existing) {
          existing.count++;
        } else {
          knowledge.conditionMedications[icdCode].medications.push({
            name: med.name,
            genericName: med.genericName,
            strength: med.strength,
            count: 1
          });
        }
        knowledge.conditionMedications[icdCode].occurrences++;
      });
    });
    
    // Learn symptom-to-diagnosis patterns from complaints
    episode.complaints?.forEach(complaint => {
      const words = complaint.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      
      words.forEach(word => {
        if (!knowledge.symptomConditions[word]) {
          knowledge.symptomConditions[word] = [];
        }
        
        episode.diagnoses?.forEach(diag => {
          const existing = knowledge.symptomConditions[word].find(d => d.code === diag.code);
          if (existing) {
            existing.count++;
          } else if (diag.code) {
            knowledge.symptomConditions[word].push({
              code: diag.code,
              name: diag.name,
              count: 1
            });
          }
        });
      });
    });
    
    knowledge.patientsAnalyzed++;
    knowledge.lastUpdated = new Date().toISOString();
    
    await this.saveKnowledgeBase(knowledge);
  }

  /**
   * Fetch all episodes with full details
   * @param {string} patientId - Patient ID
   * @param {function} onProgress - Progress callback (current, total, episodeId)
   */
  async fetchAllEpisodesDetailed(patientId, onProgress = null) {
    const allEpisodes = [];
    
    // First, get patient cases to find all episodes
    const casesResponse = await fetch(
      `${this.baseUrl}/patients/${patientId}/patient-cases?include=last-episode&page[size]=50&sort=-created_at`,
      { credentials: 'include' }
    );
    
    if (!casesResponse.ok) throw new Error(`Failed to fetch cases: ${casesResponse.status}`);
    
    const casesData = await casesResponse.json();
    const cases = casesData.data || [];
    
    console.log('[HistoryEngine] Found patient cases:', cases.length);
    
    // Report total episodes found
    if (onProgress) onProgress(0, cases.length, null, 'discovered');
    
    // Fetch details for each episode
    let loaded = 0;
    for (const caseItem of cases) {
      const episodeRef = caseItem.relationships?.['last-episode']?.data;
      if (!episodeRef?.id) continue;
      
      try {
        const episodeDetails = await this.fetchSingleEpisodeDetails(episodeRef.id);
        if (episodeDetails) {
          allEpisodes.push(episodeDetails);
          loaded++;
          if (onProgress) onProgress(loaded, cases.length, episodeRef.id, 'loading');
        }
      } catch (e) {
        console.warn('[HistoryEngine] Could not fetch episode:', episodeRef.id, e);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }
    
    if (onProgress) onProgress(loaded, cases.length, null, 'complete');
    
    return allEpisodes;
  }

  /**
   * Fetch single episode with comprehensive includes
   * Uses the full Aasandha API with all patient data
   */
  async fetchSingleEpisodeDetails(episodeId) {
    // Comprehensive includes for complete patient episode data
    // Including doctor.specialities to get doctor specialty names
    const includes = [
      'patient',
      'doctor',
      'doctor.specialities',
      'prescriptions.medicines.preferred-medicine',
      'prescriptions.medicines.preferred-medicine.category',
      'prescriptions.medicines.preferred-medicine.medicine-extras',
      'prescriptions.medicines.preferred-medicine.generic-medicine',
      'prescriptions.consumables.preferred-consumable',
      'prescriptions.professional',
      'prescriptions.medicines.prescription_extras',
      'requested-services.service.service-professions',
      'requested-services.professional',
      'requested-services.documents',
      'diagnoses.icd-code',
      'diagnoses.professional',
      'vitals',
      'vitals.professional',
      'notes.professional',
      'admission',
      'requested-admission',
      'eev-referrals',
      'current-eev-referral',
      'service-provider'
    ].join(',');

    const response = await fetch(
      `${this.baseUrl}/episodes/${episodeId}?include=${includes}`,
      { credentials: 'include' }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return this.parseEpisodeData(data);
  }

  /**
   * Parse episode API response into structured format
   * Handles the comprehensive Aasandha API response
   */
  parseEpisodeData(apiResponse) {
    const episode = apiResponse.data;
    const included = apiResponse.included || [];
    const attrs = episode.attributes || {};
    
    // Build lookups for all included items
    const lookup = {};
    included.forEach(item => {
      if (!lookup[item.type]) lookup[item.type] = {};
      lookup[item.type][item.id] = item;
    });
    
    // Extract diagnoses with ICD codes - handles both embedded and referenced ICD codes
    const diagnoses = [];
    const diagRels = episode.relationships?.diagnoses?.data || [];
    diagRels.forEach(diagRef => {
      const diag = lookup['diagnoses']?.[diagRef.id];
      if (!diag) return;
      
      const diagAttrs = diag.attributes || {};
      
      // ICD code can be embedded in attributes or referenced
      let icdCode = '';
      let icdTitle = '';
      
      if (diagAttrs['icd-code']) {
        // Embedded ICD code (common in Aasandha API)
        icdCode = diagAttrs['icd-code'].code || '';
        icdTitle = diagAttrs['icd-code'].title || '';
      } else {
        // Referenced ICD code
        const icdRef = diag.relationships?.['icd-code']?.data;
        const icd = lookup['icd-codes']?.[icdRef?.id];
        icdCode = icd?.attributes?.code || '';
        icdTitle = icd?.attributes?.title || icd?.attributes?.name || '';
      }
      
      diagnoses.push({
        id: diag.id,
        code: icdCode,
        name: icdTitle,
        remarks: diagAttrs.remarks || '',
        isFinal: diagAttrs.final || false,
        isPrimary: diagAttrs.principle || diagAttrs.is_primary
      });
    });
    
    // Extract complaints, advice, and clinical details from notes
    const complaints = [];
    const medicalAdvice = [];
    const clinicalDetails = [];
    const noteRels = episode.relationships?.notes?.data || [];
    noteRels.forEach(noteRef => {
      const note = lookup['episode-notes']?.[noteRef.id] || lookup['notes']?.[noteRef.id];
      if (!note) return;
      
      const noteAttrs = note.attributes || {};
      const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase();
      const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note || '';
      
      if (content) {
        if (noteType.includes('complain') || noteType === 'complaints' || noteType === 'chief_complaint') {
          complaints.push(content);
        } else if (noteType.includes('advice')) {
          medicalAdvice.push(content);
        } else if (noteType.includes('clinical') || noteType === 'clinical-details') {
          clinicalDetails.push(content);
        }
      }
    });
    
    // Extract medications with full details
    const medications = [];
    const rxRels = episode.relationships?.prescriptions?.data || [];
    rxRels.forEach(rxRef => {
      const rx = lookup['prescriptions']?.[rxRef.id];
      if (!rx) return;
      
      const rxAttrs = rx.attributes || {};
      
      // Check for embedded prescription-medicines in attributes
      const embeddedMeds = rxAttrs['prescription-medicines'] || [];
      embeddedMeds.forEach(med => {
        const prefMed = med.preferred_medicine || {};
        const genericMed = prefMed.generic_medicine || {};
        
        medications.push({
          id: med.id,
          name: med.name || prefMed.name || '',
          genericName: genericMed.name || med.generic_name || '',
          brand: prefMed.name || '',
          strength: prefMed.strength || '',
          preparation: prefMed.preparation || '',
          instructions: med.instructions || '',
          durationDays: med.duration_in_days,
          quantity: med.quantity
        });
      });
      
      // Also check relationships for medicines
      const medRels = rx.relationships?.medicines?.data || [];
      medRels.forEach(medRef => {
        const med = lookup['prescription-medicines']?.[medRef.id] || lookup['medicines']?.[medRef.id];
        if (!med) return;
        
        const medAttrs = med.attributes || {};
        
        // Check for embedded preferred_medicine
        const prefMedEmbed = medAttrs.preferred_medicine || {};
        const genericMedEmbed = prefMedEmbed.generic_medicine || {};
        
        // Skip if already added from embedded data
        if (embeddedMeds.some(em => em.id === med.id)) return;
        
        medications.push({
          id: med.id,
          name: medAttrs.name || prefMedEmbed.name || '',
          genericName: genericMedEmbed.name || medAttrs.generic_name || '',
          brand: prefMedEmbed.name || '',
          strength: prefMedEmbed.strength || medAttrs.strength || '',
          preparation: prefMedEmbed.preparation || medAttrs.preparation || '',
          instructions: medAttrs.instructions || '',
          durationDays: medAttrs.duration_in_days,
          quantity: medAttrs.quantity
        });
      });
    });
    
    // Extract vitals
    const vitals = {};
    const vitalRels = episode.relationships?.vitals?.data || [];
    vitalRels.forEach(vRef => {
      const vital = lookup['vitals']?.[vRef.id];
      if (!vital) return;
      
      const vAttrs = vital.attributes || {};
      const vType = vAttrs.type || vAttrs.vital_type;
      if (vType) {
        vitals[vType] = vAttrs.value;
      }
    });
    
    // Extract doctor info with full details
    const doctorRef = episode.relationships?.doctor?.data;
    const doctor = lookup['professionals']?.[doctorRef?.id];
    const doctorAttrs = doctor?.attributes || {};
    
    // Get doctor's specialities from included data
    const specialities = included.filter(inc => inc.type === 'specialities') || [];
    const doctorSpecialities = specialities.map(s => s.attributes?.name || s.attributes?.title).filter(Boolean);
    const doctorSpecialty = doctorSpecialities.length > 0 
      ? doctorSpecialities.join(', ')
      : (doctorAttrs.specialty || doctorAttrs['specialty-name'] || doctorAttrs.professional_type || '');
    
    // Extract service provider info
    const spRef = episode.relationships?.['service-provider']?.data;
    const serviceProvider = lookup['service-providers']?.[spRef?.id];
    const spAttrs = serviceProvider?.attributes || {};
    
    // Extract lab tests / requested services
    const labTests = [];
    const svcRels = episode.relationships?.['requested-services']?.data || [];
    svcRels.forEach(svcRef => {
      const svc = lookup['requested-services']?.[svcRef.id];
      if (!svc) return;
      
      const svcAttrs = svc.attributes || {};
      const serviceRef = svc.relationships?.service?.data;
      const service = lookup['services']?.[serviceRef?.id];
      
      labTests.push({
        id: svc.id,
        name: service?.attributes?.name || svcAttrs.service_name || '',
        code: service?.attributes?.code || '',
        status: svcAttrs.status,
        transactionMade: svcAttrs.transaction_made
      });
    });
    
    // Extract patient info
    const patientRef = episode.relationships?.patient?.data;
    const patient = lookup['patients']?.[patientRef?.id];
    const patientAttrs = patient?.attributes || {};
    
    return {
      id: episode.id,
      date: attrs.created_at || attrs.visited_on,
      visitedOn: attrs.visited_on,
      status: attrs.status,
      patientType: attrs.patient_type,
      isErEpisode: attrs.is_er_episode,
      memoNumber: attrs.memo_number,
      
      // Patient info
      patient: {
        id: patientRef?.id,
        name: patientAttrs.patient_name || '',
        nationalId: patientAttrs.national_identification || '',
        birthDate: patientAttrs.birth_date,
        gender: patientAttrs.gender,
        phone: patientAttrs.phone
      },
      
      // Doctor info
      doctor: {
        id: doctorRef?.id,
        name: doctorAttrs.fullname || doctorAttrs.name || 'Unknown Doctor',
        specialty: doctorSpecialty,
        registrationNumber: doctorAttrs.registration_number
      },
      
      // Service provider / facility
      facility: {
        id: spRef?.id,
        name: spAttrs.name || '',
        type: spAttrs.type
      },
      
      // Clinical data
      diagnoses,
      complaints,
      medicalAdvice,
      clinicalDetails,
      medications,
      vitals,
      labTests
    };
  }

  /**
   * Build comprehensive patient profile from all episodes
   */
  buildPatientProfile(patientId, episodes) {
    const profile = {
      patientId,
      lastUpdated: new Date().toISOString(),
      episodes: episodes,
      
      // Aggregated data
      allDiagnoses: [],
      allComplaints: [],
      allMedications: [],
      allLabTests: [],
      
      // Analyzed data
      chronicConditions: [],
      recurrentConditions: [],
      medicationHistory: [],
      doctorsVisited: [],
      
      // Statistics
      totalEpisodes: episodes.length,
      dateRange: { from: null, to: null }
    };
    
    // Aggregate all data
    const diagnosisCounts = {};
    const complaintKeywords = {};
    const medicationSet = new Set();
    const doctorSet = new Set();
    
    episodes.forEach(ep => {
      // Track diagnoses
      ep.diagnoses.forEach(d => {
        const key = d.code || d.name;
        if (!key) return;
        
        if (!diagnosisCounts[key]) {
          diagnosisCounts[key] = {
            code: d.code,
            name: d.name,
            count: 0,
            dates: [],
            isPrimary: false
          };
        }
        diagnosisCounts[key].count++;
        diagnosisCounts[key].dates.push(ep.date);
        if (d.isPrimary) diagnosisCounts[key].isPrimary = true;
        
        profile.allDiagnoses.push({
          ...d,
          episodeId: ep.id,
          episodeDate: ep.date
        });
      });
      
      // Track complaints
      ep.complaints.forEach(c => {
        profile.allComplaints.push({
          content: c,
          episodeId: ep.id,
          episodeDate: ep.date
        });
        
        // Extract keywords for pattern analysis
        const words = c.toLowerCase().split(/\s+/);
        words.forEach(w => {
          if (w.length > 3) {
            complaintKeywords[w] = (complaintKeywords[w] || 0) + 1;
          }
        });
      });
      
      // Track medications
      ep.medications.forEach(m => {
        const medKey = m.name.toLowerCase();
        if (!medicationSet.has(medKey)) {
          medicationSet.add(medKey);
          profile.allMedications.push(m);
        }
        profile.medicationHistory.push({
          ...m,
          episodeId: ep.id,
          episodeDate: ep.date
        });
      });
      
      // Track lab tests
      ep.labTests.forEach(t => {
        profile.allLabTests.push({
          ...t,
          episodeId: ep.id,
          episodeDate: ep.date
        });
      });
      
      // Track doctors
      if (ep.doctor?.name && !doctorSet.has(ep.doctor.name)) {
        doctorSet.add(ep.doctor.name);
        profile.doctorsVisited.push(ep.doctor);
      }
    });
    
    // Identify chronic conditions (diagnosed multiple times or in chronic ICD categories)
    const chronicCodes = ['E11', 'I10', 'I11', 'J45', 'M79', 'E78', 'N18', 'F32', 'K21'];
    
    Object.values(diagnosisCounts).forEach(d => {
      const isRecurrent = d.count >= 2;
      const isChronicCode = chronicCodes.some(cc => d.code?.startsWith(cc));
      const isChronicName = this.isChronicCondition(d.name);
      
      if (isRecurrent) {
        profile.recurrentConditions.push({
          ...d,
          timesOccurred: d.count
        });
      }
      
      if (isChronicCode || isChronicName || d.count >= 3) {
        profile.chronicConditions.push({
          ...d,
          confidence: isChronicCode ? 'high' : (isChronicName ? 'medium' : 'pattern-based')
        });
      }
    });
    
    // Calculate date range
    if (episodes.length > 0) {
      const dates = episodes.map(e => new Date(e.date)).sort((a, b) => a - b);
      profile.dateRange.from = dates[0].toISOString();
      profile.dateRange.to = dates[dates.length - 1].toISOString();
    }
    
    return profile;
  }

  /**
   * Check if a condition name suggests chronic disease
   */
  isChronicCondition(name) {
    if (!name) return false;
    const lower = name.toLowerCase();
    const chronicKeywords = [
      'chronic', 'diabetes', 'hypertension', 'asthma', 'copd', 'arthritis',
      'thyroid', 'kidney disease', 'heart failure', 'epilepsy', 'depression',
      'anxiety', 'dyslipidemia', 'obesity', 'gout', 'osteoporosis', 'ckd',
      'dm ', 'htn', 'essential hypertension', 'type 2', 'type 1'
    ];
    return chronicKeywords.some(kw => lower.includes(kw));
  }

  /**
   * Save patient profile to local storage
   */
  async savePatientProfile(patientId, profile) {
    try {
      // Use Chrome storage if available, otherwise localStorage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const data = await this.getChromeStorage(this.storageKey);
        const histories = data || {};
        histories[patientId] = {
          ...profile,
          savedAt: new Date().toISOString()
        };
        await this.setChromeStorage(this.storageKey, histories);
      } else {
        const histories = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        histories[patientId] = profile;
        localStorage.setItem(this.storageKey, JSON.stringify(histories));
      }
      console.log('[HistoryEngine] Patient profile saved');
    } catch (e) {
      console.warn('[HistoryEngine] Could not save profile:', e);
    }
  }

  /**
   * Load saved patient profile
   */
  async loadPatientProfile(patientId) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const data = await this.getChromeStorage(this.storageKey);
        return data?.[patientId] || null;
      } else {
        const histories = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return histories[patientId] || null;
      }
    } catch (e) {
      return null;
    }
  }

  /**
   * Update the medical knowledge base with learnings
   */
  async updateKnowledgeBase(profile) {
    try {
      const knowledge = await this.loadKnowledgeBase();
      
      // Learn condition-to-test mappings from this patient's history
      profile.allDiagnoses.forEach(d => {
        const code = d.code;
        if (!code) return;
        
        // Find tests ordered in the same episode
        const episodeTests = profile.allLabTests.filter(t => t.episodeId === d.episodeId);
        if (episodeTests.length > 0) {
          if (!knowledge.conditionTests[code]) {
            knowledge.conditionTests[code] = {
              name: d.name,
              tests: [],
              occurrences: 0
            };
          }
          
          episodeTests.forEach(t => {
            const existing = knowledge.conditionTests[code].tests.find(
              x => x.name.toLowerCase() === t.name.toLowerCase()
            );
            if (existing) {
              existing.count++;
            } else {
              knowledge.conditionTests[code].tests.push({
                name: t.name,
                code: t.code,
                count: 1
              });
            }
          });
          knowledge.conditionTests[code].occurrences++;
        }
      });
      
      // Learn medication patterns
      profile.medicationHistory.forEach(m => {
        const episode = profile.episodes.find(e => e.id === m.episodeId);
        if (!episode) return;
        
        episode.diagnoses.forEach(d => {
          const code = d.code;
          if (!code) return;
          
          if (!knowledge.conditionMedications[code]) {
            knowledge.conditionMedications[code] = {
              name: d.name,
              medications: []
            };
          }
          
          const existing = knowledge.conditionMedications[code].medications.find(
            x => x.name.toLowerCase() === m.name.toLowerCase()
          );
          if (existing) {
            existing.count++;
          } else {
            knowledge.conditionMedications[code].medications.push({
              name: m.name,
              genericName: m.genericName,
              count: 1
            });
          }
        });
      });
      
      // Update statistics
      knowledge.patientsAnalyzed = (knowledge.patientsAnalyzed || 0) + 1;
      knowledge.lastUpdated = new Date().toISOString();
      
      await this.saveKnowledgeBase(knowledge);
      console.log('[HistoryEngine] Knowledge base updated');
      
    } catch (e) {
      console.warn('[HistoryEngine] Could not update knowledge base:', e);
    }
  }

  /**
   * Load the medical knowledge base
   */
  async loadKnowledgeBase() {
    const defaultKnowledge = {
      conditionTests: {},      // ICD code -> commonly ordered tests
      conditionMedications: {}, // ICD code -> commonly prescribed meds
      symptomConditions: {},   // symptom keywords -> possible conditions
      patientsAnalyzed: 0,
      lastUpdated: null
    };
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const data = await this.getChromeStorage(this.knowledgeKey);
        return data || defaultKnowledge;
      } else {
        const stored = localStorage.getItem(this.knowledgeKey);
        return stored ? JSON.parse(stored) : defaultKnowledge;
      }
    } catch (e) {
      return defaultKnowledge;
    }
  }

  /**
   * Save the medical knowledge base
   */
  async saveKnowledgeBase(knowledge) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await this.setChromeStorage(this.knowledgeKey, knowledge);
      } else {
        localStorage.setItem(this.knowledgeKey, JSON.stringify(knowledge));
      }
    } catch (e) {
      console.warn('[HistoryEngine] Could not save knowledge base:', e);
    }
  }

  /**
   * Get recommended tests based on learned knowledge
   */
  async getLearnedTestSuggestions(icdCode) {
    const knowledge = await this.loadKnowledgeBase();
    const data = knowledge.conditionTests[icdCode];
    
    if (!data || !data.tests.length) return [];
    
    // Sort by frequency
    return data.tests
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(t => ({
        name: t.name,
        code: t.code,
        confidence: Math.min(100, Math.round((t.count / data.occurrences) * 100)),
        reason: `Previously ordered ${t.count} times for ${data.name}`
      }));
  }

  /**
   * Get recommended medications based on learned knowledge
   */
  async getLearnedMedicationSuggestions(icdCode) {
    const knowledge = await this.loadKnowledgeBase();
    const data = knowledge.conditionMedications[icdCode];
    
    if (!data || !data.medications.length) return [];
    
    return data.medications
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Chrome storage helpers
  getChromeStorage(key) {
    return new Promise((resolve) => {
      if (chrome.storage?.local) {
        chrome.storage.local.get(key, (result) => resolve(result[key]));
      } else {
        resolve(null);
      }
    });
  }

  setChromeStorage(key, value) {
    return new Promise((resolve) => {
      if (chrome.storage?.local) {
        chrome.storage.local.set({ [key]: value }, resolve);
      } else {
        resolve();
      }
    });
  }
}


/**
 * Local Medical Knowledge - Learns from patient encounters
 * Stores patterns and medical knowledge locally in Chrome storage
 * Privacy-first: No external APIs, all data stays on device
 */
class LocalMedicalKnowledge {
  constructor() {
    this.storagePrefix = 'hmh_knowledge_';
  }

  /**
   * Get data from Chrome storage
   */
  async getFromStorage(key) {
    return new Promise((resolve) => {
      const fullKey = this.storagePrefix + key;
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(fullKey, (result) => resolve(result[fullKey]));
      } else {
        const stored = localStorage.getItem(fullKey);
        resolve(stored ? JSON.parse(stored) : null);
      }
    });
  }

  /**
   * Save data to Chrome storage
   */
  async saveToStorage(key, value) {
    return new Promise((resolve) => {
      const fullKey = this.storagePrefix + key;
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ [fullKey]: value }, resolve);
      } else {
        localStorage.setItem(fullKey, JSON.stringify(value));
        resolve();
      }
    });
  }

  /**
   * Learn from patient data - called when patient history is loaded
   */
  async learnFromPatient(patientData) {
    if (!patientData) return;

    console.log('[LocalKnowledge] Learning from patient encounter...');

    // Learn diagnosis-to-test patterns
    const diagnoses = [
      ...(patientData.diagnoses || []),
      ...(patientData.previousDiagnoses || []),
      ...(patientData.chronicConditions || [])
    ];
    
    const labTests = patientData.labTests || patientData.allLabTests || [];

    for (const diag of diagnoses) {
      const code = diag.code || diag.icdCode;
      if (code && labTests.length > 0) {
        await this.recordDiagnosisTestPattern(code, diag.name || '', labTests);
      }
    }

    // Learn medication patterns
    const medications = patientData.medications || patientData.allMedications || [];
    for (const diag of diagnoses) {
      const code = diag.code || diag.icdCode;
      if (code && medications.length > 0) {
        await this.recordDiagnosisMedicationPattern(code, diag.name || '', medications);
      }
    }

    // Learn symptom-to-condition patterns
    const complaints = patientData.complaints || patientData.allComplaints || [];
    for (const complaint of complaints) {
      if (complaint && diagnoses.length > 0) {
        await this.recordSymptomPattern(complaint, diagnoses);
      }
    }

    console.log('[LocalKnowledge] Learning complete');
  }

  /**
   * Record diagnosis to lab test pattern
   */
  async recordDiagnosisTestPattern(diagnosisCode, diagnosisName, tests) {
    const patterns = await this.getFromStorage('test_patterns') || {};
    
    if (!patterns[diagnosisCode]) {
      patterns[diagnosisCode] = {
        name: diagnosisName,
        tests: [],
        count: 0
      };
    }

    patterns[diagnosisCode].count++;
    patterns[diagnosisCode].name = diagnosisName || patterns[diagnosisCode].name;

    // Add or update test frequencies
    for (const test of tests) {
      const testName = typeof test === 'string' ? test : (test.name || test.code || '');
      if (!testName) continue;

      const existingTest = patterns[diagnosisCode].tests.find(t => 
        t.toLowerCase() === testName.toLowerCase()
      );
      
      if (!existingTest) {
        patterns[diagnosisCode].tests.push(testName);
      }
    }

    // Keep only unique tests, max 20
    patterns[diagnosisCode].tests = [...new Set(patterns[diagnosisCode].tests)].slice(0, 20);

    await this.saveToStorage('test_patterns', patterns);
  }

  /**
   * Record diagnosis to medication pattern
   */
  async recordDiagnosisMedicationPattern(diagnosisCode, diagnosisName, medications) {
    const patterns = await this.getFromStorage('medication_patterns') || {};
    
    if (!patterns[diagnosisCode]) {
      patterns[diagnosisCode] = {
        name: diagnosisName,
        medications: [],
        count: 0
      };
    }

    patterns[diagnosisCode].count++;
    patterns[diagnosisCode].name = diagnosisName || patterns[diagnosisCode].name;

    for (const med of medications) {
      const medName = typeof med === 'string' ? med : (med.name || '');
      if (!medName) continue;

      const existingMed = patterns[diagnosisCode].medications.find(m => 
        m.toLowerCase() === medName.toLowerCase()
      );
      
      if (!existingMed) {
        patterns[diagnosisCode].medications.push(medName);
      }
    }

    patterns[diagnosisCode].medications = [...new Set(patterns[diagnosisCode].medications)].slice(0, 30);

    await this.saveToStorage('medication_patterns', patterns);
  }

  /**
   * Record symptom to diagnosis pattern
   */
  async recordSymptomPattern(symptom, diagnoses) {
    const patterns = await this.getFromStorage('symptom_patterns') || {};
    const symptomKey = symptom.toLowerCase().trim();
    
    if (!patterns[symptomKey]) {
      patterns[symptomKey] = {
        diagnoses: [],
        count: 0
      };
    }

    patterns[symptomKey].count++;

    for (const diag of diagnoses) {
      const diagCode = diag.code || diag.icdCode;
      const diagName = diag.name || '';
      if (!diagCode) continue;

      const existing = patterns[symptomKey].diagnoses.find(d => d.code === diagCode);
      if (existing) {
        existing.count++;
      } else {
        patterns[symptomKey].diagnoses.push({
          code: diagCode,
          name: diagName,
          count: 1
        });
      }
    }

    // Sort by frequency and limit
    patterns[symptomKey].diagnoses = patterns[symptomKey].diagnoses
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    await this.saveToStorage('symptom_patterns', patterns);
  }

  /**
   * Get tests commonly ordered for a diagnosis (learned)
   */
  async getTestsForDiagnosis(diagnosisCode) {
    const patterns = await this.getFromStorage('test_patterns') || {};
    return patterns[diagnosisCode]?.tests || [];
  }

  /**
   * Get medications commonly prescribed for a diagnosis (learned)
   */
  async getMedicationsForDiagnosis(diagnosisCode) {
    const patterns = await this.getFromStorage('medication_patterns') || {};
    return patterns[diagnosisCode]?.medications || [];
  }

  /**
   * Get possible diagnoses for symptoms (learned)
   */
  async getDiagnosesForSymptom(symptom) {
    const patterns = await this.getFromStorage('symptom_patterns') || {};
    return patterns[symptom.toLowerCase()]?.diagnoses || [];
  }

  /**
   * Get medicine knowledge (stored information about a medicine)
   */
  async getMedicineKnowledge(medicineName) {
    const medicines = await this.getFromStorage('medicines') || {};
    return medicines[medicineName.toLowerCase()] || null;
  }

  /**
   * Record medicine information
   */
  async recordMedicineInfo(medicineName, info) {
    const medicines = await this.getFromStorage('medicines') || {};
    medicines[medicineName.toLowerCase()] = {
      ...medicines[medicineName.toLowerCase()],
      ...info,
      lastUpdated: Date.now()
    };
    await this.saveToStorage('medicines', medicines);
  }

  /**
   * Get all learned statistics
   */
  async getStats() {
    const testPatterns = await this.getFromStorage('test_patterns') || {};
    const medPatterns = await this.getFromStorage('medication_patterns') || {};
    const symptomPatterns = await this.getFromStorage('symptom_patterns') || {};
    const medicines = await this.getFromStorage('medicines') || {};

    return {
      diagnosisTestPatterns: Object.keys(testPatterns).length,
      diagnosisMedPatterns: Object.keys(medPatterns).length,
      symptomPatterns: Object.keys(symptomPatterns).length,
      knownMedicines: Object.keys(medicines).length
    };
  }

  /**
   * Clear all learned data
   */
  async clearAllData() {
    await this.saveToStorage('test_patterns', {});
    await this.saveToStorage('medication_patterns', {});
    await this.saveToStorage('symptom_patterns', {});
    await this.saveToStorage('medicines', {});
    await this.saveToStorage('conditions', {});
    console.log('[LocalKnowledge] All learned data cleared');
  }
}


// Export for use
if (typeof window !== 'undefined') {
  window.PatientHistoryEngine = PatientHistoryEngine;
  window.LocalMedicalKnowledge = LocalMedicalKnowledge;
}
