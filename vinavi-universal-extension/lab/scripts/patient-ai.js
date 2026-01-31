/**
 * Patient AI Assistant - Internal Rule-Based Medical AI
 * Built-in medical knowledge and pattern recognition
 * Now with local learning from patient encounters
 * No external APIs - completely self-contained
 */

class PatientAI {
  constructor() {
    this.patientData = null;
    this.conversationHistory = [];
    this.medicalKnowledge = new MedicalKnowledgeBase();
    // Initialize local learning system if available
    this.localKnowledge = typeof LocalMedicalKnowledge !== 'undefined' 
      ? new LocalMedicalKnowledge() 
      : null;
    this.learnedPatterns = null;
  }

  /**
   * Set current patient data for analysis
   */
  async setPatientData(data) {
    this.patientData = data;
    this.conversationHistory = [];
    console.log('[PatientAI] Patient data loaded:', data?.name || 'Unknown');
    
    // Load learned patterns if local knowledge is available
    if (this.localKnowledge) {
      await this.loadLearnedPatterns();
    }
  }

  /**
   * Load learned patterns from local storage
   */
  async loadLearnedPatterns() {
    if (!this.localKnowledge) return;
    
    try {
      this.learnedPatterns = {
        conditions: await this.localKnowledge.getFromStorage('conditions') || {},
        medicines: await this.localKnowledge.getFromStorage('medicines') || {},
        testPatterns: await this.localKnowledge.getFromStorage('test_patterns') || {}
      };
      console.log('[PatientAI] Loaded learned patterns:', {
        conditions: Object.keys(this.learnedPatterns.conditions).length,
        medicines: Object.keys(this.learnedPatterns.medicines).length,
        testPatterns: Object.keys(this.learnedPatterns.testPatterns).length
      });
    } catch (error) {
      console.error('[PatientAI] Error loading learned patterns:', error);
    }
  }

  /**
   * Learn from current patient encounter
   */
  async learnFromCurrentPatient() {
    if (!this.localKnowledge || !this.patientData) return;
    
    try {
      await this.localKnowledge.learnFromPatient(this.patientData);
      console.log('[PatientAI] Learned from current patient encounter');
    } catch (error) {
      console.error('[PatientAI] Error learning from patient:', error);
    }
  }

  /**
   * Process user query and generate intelligent response
   */
  async processQuery(query) {
    try {
      const normalizedQuery = query.toLowerCase().trim();
      
      // Add to conversation history
      this.conversationHistory.push({ role: 'user', message: query, timestamp: Date.now() });

      // Analyze query intent
      const intent = this.detectIntent(normalizedQuery);
      let response = '';

      switch (intent.type) {
        case 'comorbidities':
          response = this.analyzeComorbidities();
          break;
        case 'medications':
          response = this.analyzeMedications();
          break;
        case 'lab_history':
          response = this.analyzeLabHistory();
          break;
        case 'doctors':
          response = this.analyzeDoctorVisits();
          break;
        case 'allergies':
          response = this.analyzeAllergies();
          break;
        case 'vitals':
          response = this.analyzeVitals();
          break;
        case 'diagnosis':
          response = this.analyzeDiagnosis();
          break;
        case 'common_diagnoses':
          response = this.analyzeCommonDiagnoses();
          break;
        case 'recommendations':
          response = this.generateRecommendations();
          break;
        case 'summary':
          response = this.generatePatientSummary();
          break;
        case 'risk_assessment':
          response = this.assessRisks();
          break;
        case 'drug_interactions':
          response = this.checkDrugInteractions();
          break;
        case 'lab_suggestions':
          response = this.suggestLabTests();
          break;
        case 'help':
          response = this.getHelpMessage();
          break;
        case 'greeting':
          response = this.getGreeting();
          break;
        default:
          response = this.handleUnknownQuery(normalizedQuery);
      }

      // Add response to history
      this.conversationHistory.push({ role: 'assistant', message: response, timestamp: Date.now() });

      return response;
    } catch (error) {
      console.error('[PatientAI] Error processing query:', error);
      return `⚠️ I encountered an error processing your request.\n\n**Error Details:** ${error.message}\n\nPlease try asking in a different way.`;
    }
  }

  /**
   * Detect the intent of user query using keyword matching
   */
  detectIntent(query) {
    const intents = [
      {
        type: 'comorbidities',
        keywords: ['comorbid', 'condition', 'disease', 'chronic', 'suffering', 'have', 'history of', 'medical history', 'health condition', 'illnesses']
      },
      {
        type: 'medications',
        keywords: ['medicine', 'medication', 'drug', 'prescription', 'prescribed', 'taking', 'treatment', 'dose', 'dosage', 'tablets', 'pills']
      },
      {
        type: 'lab_history',
        keywords: ['lab', 'test', 'investigation', 'blood', 'urine', 'result', 'report', 'cbc', 'rft', 'lft', 'previous test', 'test history']
      },
      {
        type: 'doctors',
        keywords: ['doctor', 'physician', 'specialist', 'visit', 'consultation', 'seen by', 'treated by', 'consultant', 'attending']
      },
      {
        type: 'allergies',
        keywords: ['allergy', 'allergic', 'reaction', 'sensitive', 'intolerance', 'adverse reaction']
      },
      {
        type: 'vitals',
        keywords: ['vital', 'blood pressure', 'bp', 'pulse', 'temperature', 'heart rate', 'respiratory', 'oxygen', 'spo2', 'weight', 'height', 'bmi']
      },
      {
        type: 'diagnosis',
        keywords: ['diagnosis', 'diagnosed', 'finding', 'assessment', 'impression', 'what is wrong', 'problem']
      },
      {
        type: 'common_diagnoses',
        keywords: ['common diagnoses', 'common diagnosis', 'frequent diagnoses', 'most diagnosed', 'recurring diagnoses', 'frequent conditions', 'diagnoses history']
      },
      {
        type: 'recommendations',
        keywords: ['recommend', 'suggest', 'advice', 'should', 'what can', 'next step', 'plan']
      },
      {
        type: 'summary',
        keywords: ['summary', 'summarize', 'overview', 'brief', 'tell me about', 'patient info', 'all about', 'who is', 'patient name', 'patient details', 'who']
      },
      {
        type: 'risk_assessment',
        keywords: ['risk', 'danger', 'warning', 'concern', 'worry', 'red flag', 'critical']
      },
      {
        type: 'drug_interactions',
        keywords: ['interaction', 'interact', 'contraindication', 'safe together', 'combine', 'mix']
      },
      {
        type: 'lab_suggestions',
        keywords: ['which test', 'what test', 'suggest test', 'order test', 'need test', 'tests for', 'investigate']
      },
      {
        type: 'help',
        keywords: ['help', 'how to', 'what can you', 'commands', 'options', 'features']
      },
      {
        type: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
      }
    ];

    for (const intent of intents) {
      for (const keyword of intent.keywords) {
        if (query.includes(keyword)) {
          return { type: intent.type, keyword };
        }
      }
    }

    return { type: 'unknown' };
  }

  /**
   * Analyze patient comorbidities
   */
  analyzeComorbidities() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const conditions = this.patientData.conditions || [];
    const diagnoses = this.patientData.diagnoses || [];
    const chronicConditions = this.patientData.chronicConditions || [];
    const previousDiagnoses = this.patientData.previousDiagnoses || [];
    
    const allConditions = [...conditions, ...diagnoses.map(d => d.name || d.code).filter(Boolean)];
    
    // Add chronic conditions from history
    chronicConditions.forEach(c => {
      const name = c.name || c.code;
      if (name && !allConditions.includes(name)) {
        allConditions.push(name);
      }
    });
    
    if (allConditions.length === 0 && previousDiagnoses.length === 0) {
      return "📋 No comorbidities or chronic conditions found in the patient's record.\n\nThis could mean:\n• Patient has no documented chronic conditions\n• Medical history not yet entered\n• First visit patient\n\n💡 **Tip:** Click **📚 Full History** to load all episodes and find chronic conditions.";
    }

    let response = "🏥 **Patient Comorbidities & Conditions**\n\n";
    
    // Show chronic conditions first (from full history)
    if (chronicConditions.length > 0) {
      response += "🔴 **Chronic/Recurring Conditions (from history):**\n";
      chronicConditions.slice(0, 10).forEach(c => {
        response += `• **${c.code || 'Unknown'}** - ${c.name || 'Unknown condition'}`;
        if (c.count > 1) response += ` (${c.count} occurrences)`;
        response += '\n';
      });
      response += '\n';
    }
    
    // Categorize current conditions
    const categorized = this.medicalKnowledge.categorizeConditions(allConditions);
    
    for (const [category, items] of Object.entries(categorized)) {
      if (items.length > 0) {
        response += `**${category}:**\n`;
        items.forEach(item => {
          const info = this.medicalKnowledge.getConditionInfo(item);
          response += `• ${item}${info.severity ? ` (${info.severity})` : ''}\n`;
        });
        response += '\n';
      }
    }

    // Add clinical considerations
    const considerations = this.medicalKnowledge.getClinicalConsiderations(allConditions);
    if (considerations.length > 0) {
      response += "⚠️ **Clinical Considerations:**\n";
      considerations.forEach(c => response += `• ${c}\n`);
    }
    
    // Show if full history is available
    if (this.patientData.historyStats) {
      response += `\n📊 _Based on ${this.patientData.historyStats.totalEpisodes} total episodes_`;
    }

    return response;
  }

  /**
   * Analyze current medications
   */
  analyzeMedications() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const medications = this.patientData.medications || [];
    
    if (medications.length === 0) {
      return "💊 No current medications found in the patient's record.";
    }

    let response = "💊 **Current Medications**\n\n";
    
    // Categorize medications
    const categorized = this.medicalKnowledge.categorizeMedications(medications);
    
    for (const [category, meds] of Object.entries(categorized)) {
      if (meds.length > 0) {
        response += `**${category}:**\n`;
        meds.forEach(med => {
          response += `• ${med.name}`;
          if (med.dose) response += ` - ${med.dose}`;
          if (med.frequency) response += ` (${med.frequency})`;
          response += '\n';
        });
        response += '\n';
      }
    }

    // Check for important medication notes
    const notes = this.medicalKnowledge.getMedicationNotes(medications);
    if (notes.length > 0) {
      response += "📝 **Important Notes:**\n";
      notes.forEach(n => response += `• ${n}\n`);
    }

    return response;
  }

  /**
   * Analyze lab test history
   */
  analyzeLabHistory() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const labTests = this.patientData.labTests || [];
    
    if (labTests.length === 0) {
      return "🔬 No previous lab tests found in the patient's record.";
    }

    let response = "🔬 **Lab Test History**\n\n";
    
    // Group by date
    const grouped = {};
    labTests.forEach(test => {
      const date = test.date || 'Unknown Date';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(test);
    });

    for (const [date, tests] of Object.entries(grouped)) {
      response += `📅 **${date}**\n`;
      tests.forEach(test => {
        const status = this.medicalKnowledge.evaluateLabResult(test);
        const icon = status === 'normal' ? '✅' : status === 'abnormal' ? '⚠️' : '📊';
        response += `${icon} ${test.name}: ${test.value || 'Pending'}`;
        if (test.unit) response += ` ${test.unit}`;
        if (status === 'abnormal' && test.reference) response += ` (Ref: ${test.reference})`;
        response += '\n';
      });
      response += '\n';
    }

    // Highlight trends
    const trends = this.medicalKnowledge.analyzeLabTrends(labTests);
    if (trends.length > 0) {
      response += "📈 **Trends & Observations:**\n";
      trends.forEach(t => response += `• ${t}\n`);
    }

    return response;
  }

  /**
   * Analyze doctor visits
   */
  analyzeDoctorVisits() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const visits = this.patientData.visits || [];
    
    if (visits.length === 0) {
      return "👨‍⚕️ No previous consultation records found.";
    }

    let response = "👨‍⚕️ **Consultation History**\n\n";
    
    // Group by doctor/specialty
    const byDoctor = {};
    visits.forEach(visit => {
      const doctor = visit.doctor || 'Unknown';
      if (!byDoctor[doctor]) byDoctor[doctor] = [];
      byDoctor[doctor].push(visit);
    });

    for (const [doctor, doctorVisits] of Object.entries(byDoctor)) {
      response += `**Dr. ${doctor}**`;
      if (doctorVisits[0]?.specialty) response += ` (${doctorVisits[0].specialty})`;
      response += '\n';
      
      doctorVisits.forEach(visit => {
        response += `• ${visit.date || 'Date N/A'}`;
        if (visit.reason) response += ` - ${visit.reason}`;
        response += '\n';
      });
      response += '\n';
    }

    return response;
  }

  /**
   * Analyze allergies
   */
  analyzeAllergies() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const allergies = this.patientData.allergies || [];
    
    if (allergies.length === 0) {
      return "✅ No known allergies recorded.\n\n💡 Always verify with patient before prescribing new medications.";
    }

    let response = "🚨 **Known Allergies**\n\n";
    
    allergies.forEach(allergy => {
      const severity = allergy.severity || 'Unknown severity';
      const icon = severity.toLowerCase().includes('severe') ? '🔴' : 
                   severity.toLowerCase().includes('moderate') ? '🟠' : '🟡';
      
      response += `${icon} **${allergy.name}**\n`;
      response += `   Severity: ${severity}\n`;
      if (allergy.reaction) response += `   Reaction: ${allergy.reaction}\n`;
      response += '\n';
    });

    // Cross-reference with current medications
    const warnings = this.checkAllergyMedicationConflicts();
    if (warnings.length > 0) {
      response += "⚠️ **Warnings:**\n";
      warnings.forEach(w => response += `• ${w}\n`);
    }

    return response;
  }

  /**
   * Analyze vital signs
   */
  analyzeVitals() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const vitals = this.patientData.vitals || {};
    
    if (Object.keys(vitals).length === 0) {
      return "📊 No vital signs recorded for this patient.";
    }

    let response = "📊 **Vital Signs**\n\n";
    
    const vitalChecks = [
      { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', icon: '❤️' },
      { key: 'pulse', label: 'Pulse Rate', unit: 'bpm', icon: '💓' },
      { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
      { key: 'respiratoryRate', label: 'Respiratory Rate', unit: '/min', icon: '🫁' },
      { key: 'spo2', label: 'SpO2', unit: '%', icon: '🩸' },
      { key: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️' },
      { key: 'height', label: 'Height', unit: 'cm', icon: '📏' },
      { key: 'bmi', label: 'BMI', unit: 'kg/m²', icon: '📐' }
    ];

    vitalChecks.forEach(v => {
      if (vitals[v.key]) {
        const status = this.medicalKnowledge.evaluateVital(v.key, vitals[v.key]);
        const statusIcon = status === 'normal' ? '✅' : status === 'high' ? '🔺' : status === 'low' ? '🔻' : '⚠️';
        response += `${v.icon} **${v.label}:** ${vitals[v.key]} ${v.unit} ${statusIcon}\n`;
      }
    });

    // Add interpretations
    const interpretations = this.medicalKnowledge.interpretVitals(vitals);
    if (interpretations.length > 0) {
      response += "\n📋 **Interpretation:**\n";
      interpretations.forEach(i => response += `• ${i}\n`);
    }

    return response;
  }

  /**
   * Analyze diagnosis
   */
  analyzeDiagnosis() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const diagnoses = this.patientData.diagnoses || [];
    const currentDiagnosis = this.patientData.currentDiagnosis;
    
    let response = "🩺 **Diagnosis Information**\n\n";

    if (currentDiagnosis) {
      response += `**Current/Working Diagnosis:**\n`;
      response += `• ${currentDiagnosis.name || currentDiagnosis}\n`;
      if (currentDiagnosis.icd10) response += `  ICD-10: ${currentDiagnosis.icd10}\n`;
      response += '\n';
    }

    if (diagnoses.length > 0) {
      response += "**Previous Diagnoses:**\n";
      diagnoses.forEach(d => {
        response += `• ${typeof d === 'string' ? d : d.name}`;
        if (d.date) response += ` (${d.date})`;
        response += '\n';
      });
    }

    if (!currentDiagnosis && diagnoses.length === 0) {
      response += "No diagnosis information available in patient record.";
    }

    return response;
  }

  /**
   * Analyze common/frequent diagnoses from patient history
   */
  analyzeCommonDiagnoses() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    let response = "🩺 **Common Diagnoses Analysis**\n\n";

    // Get chronic conditions (diagnoses that appear >1 time)
    const chronicConditions = this.patientData.chronicConditions || [];
    const allDiagnoses = this.patientData.previousDiagnoses || this.patientData.allDiagnoses || [];
    const currentDiagnoses = this.patientData.diagnoses || [];

    // Current Visit Diagnoses
    if (currentDiagnoses.length > 0) {
      response += "**📋 Current Visit Diagnoses:**\n";
      currentDiagnoses.forEach(d => {
        const code = d.code || '';
        const name = d.name || d;
        response += `• ${code ? code + ' - ' : ''}${name}`;
        if (d.isPrimary) response += ' ⭐';
        response += '\n';
      });
      response += '\n';
    }

    // Recurring/Chronic Conditions (most important)
    if (chronicConditions.length > 0) {
      response += "**🔴 Recurring Conditions (Multiple Visits):**\n";
      chronicConditions.slice(0, 10).forEach(c => {
        response += `• **${c.code}** - ${c.name}`;
        if (c.count > 1) response += ` (${c.count} visits)`;
        if (c.lastSeen) response += ` - Last: ${c.lastSeen}`;
        response += '\n';
      });
      if (chronicConditions.length > 10) {
        response += `  ...and ${chronicConditions.length - 10} more conditions\n`;
      }
      response += '\n';
    }

    // All Unique Diagnoses from History
    if (allDiagnoses.length > 0) {
      // Group by frequency
      const diagnosisCounts = {};
      allDiagnoses.forEach(d => {
        const key = d.code || d.name;
        if (!diagnosisCounts[key]) {
          diagnosisCounts[key] = { ...d, count: 0 };
        }
        diagnosisCounts[key].count++;
      });

      // Sort by frequency
      const sorted = Object.values(diagnosisCounts).sort((a, b) => b.count - a.count);
      
      if (sorted.length > 0) {
        response += "**📊 Most Frequent Diagnoses (from all history):**\n";
        sorted.slice(0, 10).forEach((d, idx) => {
          const rank = idx + 1;
          response += `${rank}. ${d.code || ''} ${d.name || d.code}`;
          if (d.count > 1) response += ` — ${d.count} occurrences`;
          response += '\n';
        });
        if (sorted.length > 10) {
          response += `\n📌 Total unique diagnoses in history: ${sorted.length}\n`;
        }
        response += '\n';
      }
    }

    // Quick Stats
    response += "**📈 Statistics:**\n";
    response += `• Current diagnoses: ${currentDiagnoses.length}\n`;
    response += `• Recurring conditions: ${chronicConditions.length}\n`;
    response += `• Total unique diagnoses: ${allDiagnoses.length}\n`;

    // Suggest loading full history if not loaded
    if (allDiagnoses.length === 0 && chronicConditions.length === 0) {
      response += "\n💡 **Tip:** Click the 📚 Full History button to load all diagnoses from previous visits.";
    }

    return response;
  }

  /**
   * Generate recommendations based on patient data
   */
  generateRecommendations() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    let response = "💡 **Recommendations**\n\n";
    const recommendations = [];

    // Based on conditions
    const conditions = this.patientData.conditions || [];
    conditions.forEach(condition => {
      const recs = this.medicalKnowledge.getRecommendationsForCondition(condition);
      recommendations.push(...recs);
    });

    // Based on age
    if (this.patientData.age) {
      const ageRecs = this.medicalKnowledge.getAgeBasedRecommendations(this.patientData.age);
      recommendations.push(...ageRecs);
    }

    // Based on vitals
    if (this.patientData.vitals) {
      const vitalRecs = this.medicalKnowledge.getVitalBasedRecommendations(this.patientData.vitals);
      recommendations.push(...vitalRecs);
    }

    // Remove duplicates and format
    const unique = [...new Set(recommendations)];
    
    if (unique.length === 0) {
      response += "No specific recommendations at this time. Continue routine care.";
    } else {
      unique.forEach((rec, index) => {
        response += `${index + 1}. ${rec}\n`;
      });
    }

    return response;
  }

  /**
   * Generate complete patient summary
   */
  generatePatientSummary() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    let response = "📋 **Patient Summary**\n\n";

    // Demographics
    response += "**Demographics:**\n";
    response += `• Name: ${this.patientData.name || 'N/A'}\n`;
    response += `• Age: ${this.patientData.age || 'N/A'}\n`;
    response += `• Gender: ${this.patientData.gender || 'N/A'}\n`;
    response += `• ID: ${this.patientData.id || 'N/A'}\n\n`;
    
    // 🔴 Chronic Conditions (most important - from full history)
    const chronicConditions = this.patientData.chronicConditions || [];
    if (chronicConditions.length > 0) {
      response += "**🔴 Chronic/Recurring Conditions:**\n";
      chronicConditions.slice(0, 5).forEach(c => {
        response += `• **${c.code}** - ${c.name}`;
        if (c.count > 1) response += ` (${c.count} visits)`;
        response += '\n';
      });
      response += '\n';
    }

    // Current Visit - Complaints
    const complaints = this.patientData.complaints || [];
    if (complaints.length > 0) {
      response += "**📝 Chief Complaints:**\n";
      complaints.forEach(c => {
        const content = typeof c === 'string' ? c : c.content || '';
        if (content) {
          response += `• ${String(content).substring(0, 200)}${String(content).length > 200 ? '...' : ''}\n`;
        }
      });
      response += '\n';
    } else {
      // No complaints - likely a follow-up
      response += "**📝 Chief Complaints:**\n";
      response += "• Follow-up consultation (no new complaints recorded)\n\n";
    }

    // Current Diagnoses
    const diagnoses = this.patientData.diagnoses || [];
    if (diagnoses.length > 0) {
      response += "**🏥 Current Diagnoses:**\n";
      diagnoses.forEach(d => {
        const code = d.code || '';
        const name = d.name || '';
        response += `• ${code}${name ? ' - ' + name : ''}\n`;
      });
      response += '\n';
    }
    
    // Previous Diagnoses from history
    const previousDiagnoses = this.patientData.previousDiagnoses || [];
    if (previousDiagnoses.length > 0) {
      response += "**📜 Previous Diagnoses (from past visits):**\n";
      previousDiagnoses.slice(0, 5).forEach(d => {
        const code = d.code || '';
        const name = d.name || '';
        response += `• ${code}${name ? ' - ' + name : ''}\n`;
      });
      if (previousDiagnoses.length > 5) {
        response += `  ...and ${previousDiagnoses.length - 5} more from history\n`;
      }
      response += '\n';
    }

    // Medical Advice
    const advice = this.patientData.medicalAdvice || [];
    if (advice.length > 0) {
      response += "**📋 Medical Advice:**\n";
      advice.forEach(a => {
        const content = typeof a === 'string' ? a : a.content || '';
        if (content) {
          response += `• ${content}\n`;
        }
      });
      response += '\n';
    }

    // Quick stats - include previous diagnoses count
    const conditions = this.patientData.conditions || [];
    const medications = this.patientData.medications || [];
    const allergies = this.patientData.allergies || [];
    const labTests = this.patientData.labTests || [];
    const episodeHistory = this.patientData.episodeHistory || [];

    response += "**At a Glance:**\n";
    response += `• Chronic Conditions: ${conditions.length}\n`;
    response += `• Current Medications: ${medications.length}\n`;
    response += `• Known Allergies: ${allergies.length}\n`;
    response += `• Previous Lab Tests: ${labTests.length}\n`;
    if (episodeHistory.length > 0) {
      response += `• Past Episodes: ${episodeHistory.length}\n`;
    }
    response += '\n';

    // Key concerns - now includes previous diagnoses
    const concerns = this.identifyKeyConcerns();
    if (concerns.length > 0) {
      response += "⚠️ **Key Concerns:**\n";
      concerns.forEach(c => response += `• ${c}\n`);
    }

    response += "\n💬 Ask me specific questions about medications, conditions, labs, or recommendations!";

    return response;
  }

  /**
   * Assess patient risks
   */
  assessRisks() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    let response = "⚠️ **Risk Assessment**\n\n";
    const risks = [];

    // Age-based risks
    if (this.patientData.age && this.patientData.age > 65) {
      risks.push({ level: 'moderate', text: 'Elderly patient - consider polypharmacy risks and fall precautions' });
    }

    // Condition-based risks
    const conditions = this.patientData.conditions || [];
    conditions.forEach(c => {
      const condRisks = this.medicalKnowledge.getConditionRisks(c);
      risks.push(...condRisks);
    });

    // Medication-based risks
    const medications = this.patientData.medications || [];
    if (medications.length > 5) {
      risks.push({ level: 'moderate', text: 'Polypharmacy detected - increased risk of drug interactions and adverse effects' });
    }

    // Vital-based risks
    if (this.patientData.vitals) {
      const vitalRisks = this.medicalKnowledge.getVitalRisks(this.patientData.vitals);
      risks.push(...vitalRisks);
    }

    if (risks.length === 0) {
      response += "✅ No significant risk factors identified based on available data.\n";
      response += "\n💡 This assessment is based on loaded patient data only.";
    } else {
      // Sort by severity
      const high = risks.filter(r => r.level === 'high');
      const moderate = risks.filter(r => r.level === 'moderate');
      const low = risks.filter(r => r.level === 'low');

      if (high.length > 0) {
        response += "🔴 **High Risk:**\n";
        high.forEach(r => response += `• ${r.text}\n`);
        response += '\n';
      }

      if (moderate.length > 0) {
        response += "🟠 **Moderate Risk:**\n";
        moderate.forEach(r => response += `• ${r.text}\n`);
        response += '\n';
      }

      if (low.length > 0) {
        response += "🟡 **Low Risk:**\n";
        low.forEach(r => response += `• ${r.text}\n`);
      }
    }

    return response;
  }

  /**
   * Check for drug interactions
   */
  checkDrugInteractions() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    const medications = this.patientData.medications || [];
    
    if (medications.length < 2) {
      return "💊 Less than 2 medications - no interaction check needed.";
    }

    const interactions = this.medicalKnowledge.checkInteractions(medications);

    let response = "💊 **Drug Interaction Check**\n\n";
    response += `Analyzing ${medications.length} medications...\n\n`;

    if (interactions.length === 0) {
      response += "✅ No significant drug interactions detected.";
    } else {
      const severe = interactions.filter(i => i.severity === 'severe');
      const moderate = interactions.filter(i => i.severity === 'moderate');
      const mild = interactions.filter(i => i.severity === 'mild');

      if (severe.length > 0) {
        response += "🔴 **Severe Interactions:**\n";
        severe.forEach(i => response += `• ${i.drug1} + ${i.drug2}: ${i.description}\n`);
        response += '\n';
      }

      if (moderate.length > 0) {
        response += "🟠 **Moderate Interactions:**\n";
        moderate.forEach(i => response += `• ${i.drug1} + ${i.drug2}: ${i.description}\n`);
        response += '\n';
      }

      if (mild.length > 0) {
        response += "🟡 **Mild Interactions:**\n";
        mild.forEach(i => response += `• ${i.drug1} + ${i.drug2}: ${i.description}\n`);
      }
    }

    return response;
  }

  /**
   * Suggest appropriate lab tests based on patient's complaints, diagnoses, and conditions
   */
  suggestLabTests() {
    if (!this.patientData) {
      return "⚠️ No patient data loaded. Please search for a patient first.";
    }

    let response = "🔬 **Suggested Lab Tests**\n\n";
    const suggestions = [];
    const reasons = new Map();

    // Based on complaints (most important for current visit)
    const complaints = this.patientData.complaints || [];
    if (complaints.length > 0) {
      response += "**Based on Chief Complaints:**\n";
      const complaintAnalysis = this.medicalKnowledge.analyzeComplaints(complaints);
      
      complaintAnalysis.suggestedTests.forEach(test => {
        if (!reasons.has(test)) {
          reasons.set(test, []);
        }
        reasons.get(test).push('Chief complaint');
        suggestions.push({ name: test, reason: 'Chief complaint' });
      });

      if (complaintAnalysis.possibleConditions.length > 0) {
        response += `\n*Possible conditions to consider:* ${complaintAnalysis.possibleConditions.slice(0, 4).join(', ')}\n`;
      }
      if (complaintAnalysis.urgency !== 'routine') {
        response += `⚠️ **Urgency:** ${complaintAnalysis.urgency.toUpperCase()}\n`;
      }
      response += '\n';
    } else {
      // No complaints - this is likely a follow-up
      response += "**ℹ️ This appears to be a follow-up consultation.**\n";
      response += "_Suggesting tests based on previous diagnoses and medical history._\n\n";
    }
    
    // === LEARNED PATTERNS FROM LOCAL KNOWLEDGE ===
    // This is where AI gets smarter over time!
    if (this.learnedPatterns && Object.keys(this.learnedPatterns.testPatterns).length > 0) {
      const diagnoses = [
        ...(this.patientData.diagnoses || []),
        ...(this.patientData.previousDiagnoses || []),
        ...(this.patientData.chronicConditions || [])
      ];
      
      diagnoses.forEach(diag => {
        const code = diag.code || diag.icdCode || '';
        if (code && this.learnedPatterns.testPatterns[code]) {
          const pattern = this.learnedPatterns.testPatterns[code];
          if (pattern.tests && pattern.tests.length > 0) {
            pattern.tests.forEach(test => {
              if (!reasons.has(test)) {
                reasons.set(test, []);
              }
              reasons.get(test).push(`Learned pattern (${pattern.count || 1}x seen): ${diag.name || code}`);
            });
          }
        }
      });
    }

    // Based on current diagnoses (ICD codes)
    const diagnoses = this.patientData.diagnoses || [];
    if (diagnoses.length > 0) {
      diagnoses.forEach(diag => {
        const code = diag.code || '';
        const icdInfo = this.medicalKnowledge.getConditionFromICD(code);
        if (icdInfo && icdInfo.complaints) {
          icdInfo.complaints.forEach(complaint => {
            const tests = this.medicalKnowledge.getTestsForComplaint(complaint);
            tests.forEach(t => {
              if (!reasons.has(t.name)) {
                reasons.set(t.name, []);
              }
              reasons.get(t.name).push(`Current Diagnosis: ${icdInfo.name}`);
              suggestions.push(t);
            });
          });
        }
      });
    }
    
    // Based on previous diagnoses from history (very important for follow-ups!)
    const previousDiagnoses = this.patientData.previousDiagnoses || [];
    if (previousDiagnoses.length > 0) {
      previousDiagnoses.forEach(diag => {
        const code = diag.code || '';
        const name = diag.name || '';
        const icdInfo = this.medicalKnowledge.getConditionFromICD(code);
        if (icdInfo && icdInfo.complaints) {
          icdInfo.complaints.forEach(complaint => {
            const tests = this.medicalKnowledge.getTestsForComplaint(complaint);
            tests.forEach(t => {
              if (!reasons.has(t.name)) {
                reasons.set(t.name, []);
              }
              reasons.get(t.name).push(`Previous Diagnosis: ${icdInfo.name || name}`);
              suggestions.push(t);
            });
          });
        }
        // Also try keyword-based matching for previous diagnoses
        if (name) {
          const lowerName = name.toLowerCase();
          // Common condition keywords to test mappings
          if (lowerName.includes('diabetes') || lowerName.includes('dm ')) {
            const diabetesTests = ['HbA1c', 'FBS', 'PPBS', 'RFT', 'Lipid Profile'];
            diabetesTests.forEach(t => {
              if (!reasons.has(t)) reasons.set(t, []);
              reasons.get(t).push(`Previous Diagnosis: ${name}`);
            });
          } else if (lowerName.includes('hypertension') || lowerName.includes('htn')) {
            const htnTests = ['RFT', 'Lipid Profile', 'ECG'];
            htnTests.forEach(t => {
              if (!reasons.has(t)) reasons.set(t, []);
              reasons.get(t).push(`Previous Diagnosis: ${name}`);
            });
          } else if (lowerName.includes('thyroid') || lowerName.includes('hypothyroid')) {
            const thyroidTests = ['TSH', 'T3', 'T4', 'Thyroid Profile'];
            thyroidTests.forEach(t => {
              if (!reasons.has(t)) reasons.set(t, []);
              reasons.get(t).push(`Previous Diagnosis: ${name}`);
            });
          } else if (lowerName.includes('anemia') || lowerName.includes('anaemia')) {
            const anemiaTests = ['CBC', 'Iron Studies', 'Vitamin B12', 'Folate'];
            anemiaTests.forEach(t => {
              if (!reasons.has(t)) reasons.set(t, []);
              reasons.get(t).push(`Previous Diagnosis: ${name}`);
            });
          } else if (lowerName.includes('liver') || lowerName.includes('hepatic')) {
            const liverTests = ['LFT', 'GGT', 'Hepatitis Profile'];
            liverTests.forEach(t => {
              if (!reasons.has(t)) reasons.set(t, []);
              reasons.get(t).push(`Previous Diagnosis: ${name}`);
            });
          } else if (lowerName.includes('kidney') || lowerName.includes('renal') || lowerName.includes('ckd')) {
            const renalTests = ['RFT', 'Urine Routine', 'Creatinine', 'BUN'];
            renalTests.forEach(t => {
              if (!reasons.has(t)) reasons.set(t, []);
              reasons.get(t).push(`Previous Diagnosis: ${name}`);
            });
          }
        }
      });
    }

    // Based on chronic conditions
    const conditions = this.patientData.conditions || [];
    conditions.forEach(condition => {
      const tests = this.medicalKnowledge.getTestsForCondition(condition);
      tests.forEach(t => {
        if (!reasons.has(t.name)) {
          reasons.set(t.name, []);
        }
        reasons.get(t.name).push(`Condition: ${condition}`);
        suggestions.push(t);
      });
    });

    // Based on medications (monitoring)
    const medications = this.patientData.medications || [];
    medications.forEach(med => {
      const tests = this.medicalKnowledge.getMonitoringTests(med);
      tests.forEach(t => {
        if (!reasons.has(t.name)) {
          reasons.set(t.name, []);
        }
        reasons.get(t.name).push(`Monitoring: ${med.name || med}`);
        suggestions.push(t);
      });
    });

    // Based on age
    if (this.patientData.age) {
      const ageTests = this.medicalKnowledge.getAgeBasedTests(this.patientData.age, this.patientData.gender);
      ageTests.forEach(t => {
        if (!reasons.has(t.name)) {
          reasons.set(t.name, []);
        }
        reasons.get(t.name).push('Age-appropriate screening');
        suggestions.push(t);
      });
    }

    // Consolidate and display
    if (reasons.size === 0) {
      response += "No specific tests recommended based on current data.\n\n";
      response += "**Routine Tests to Consider:**\n";
      response += "• CBC (Complete Blood Count)\n";
      response += "• RBS (Random Blood Sugar)\n";
      response += "• Lipid Profile\n";
      response += "• RFT (Renal Function Test)\n";
    } else {
      response += "**Recommended Tests:**\n";
      for (const [test, reasonList] of reasons.entries()) {
        const uniqueReasons = [...new Set(reasonList)];
        response += `• **${test}**\n`;
        response += `  _${uniqueReasons.join(', ')}_\n`;
      }
    }

    return response;
  }

  /**
   * Get help message
   */
  getHelpMessage() {
    return `🤖 **HMH Patient AI Assistant**

I can help you analyze patient information. Here's what you can ask me:

**📋 Patient Information:**
• "What comorbidities does this patient have?"
• "Show me the patient summary"
• "What conditions does the patient have?"

**💊 Medications:**
• "What medications is the patient taking?"
• "Check for drug interactions"
• "Any medication concerns?"

**🔬 Lab Tests:**
• "Show previous lab results"
• "What tests should I order?"
• "Any abnormal lab values?"

**👨‍⚕️ Clinical:**
• "Which doctors has the patient seen?"
• "What are the patient's allergies?"
• "Show vital signs"
• "What are the risk factors?"
• "Give me recommendations"

**📊 Analysis:**
• "Assess patient risks"
• "Show diagnosis history"

💡 **Tip:** First load a patient by searching their ID, then ask me questions!`;
  }

  /**
   * Get greeting response
   */
  getGreeting() {
    const greetings = [
      "Hello! 👋 I'm your HMH Patient AI Assistant.",
      "Hi there! 🏥 Ready to help you with patient analysis.",
      "Hello! 👨‍⚕️ How can I assist you today?"
    ];
    
    let response = greetings[Math.floor(Math.random() * greetings.length)];
    
    if (this.patientData) {
      response += `\n\nCurrently loaded: **${this.patientData.name || 'Patient ' + this.patientData.id}**`;
      response += "\n\nAsk me anything about this patient's history, medications, or conditions!";
    } else {
      response += "\n\nNo patient loaded yet. Search for a patient ID to get started.";
    }
    
    return response;
  }

  /**
   * Handle unknown queries
   */
  handleUnknownQuery(query) {
    // Try to provide a helpful response even for unknown queries
    if (query.length < 3) {
      return "I didn't quite understand that. Could you please be more specific? Type 'help' to see what I can do.";
    }

    // Check if it might be about specific data
    if (this.patientData) {
      return `I'm not sure about "${query}". Here's what I can help with:\n\n` +
             "• **Conditions** - Ask about comorbidities or medical history\n" +
             "• **Medications** - Current prescriptions and interactions\n" +
             "• **Labs** - Previous test results and suggestions\n" +
             "• **Summary** - Complete patient overview\n\n" +
             "Try asking: 'What conditions does the patient have?'";
    } else {
      return "No patient data is loaded. Please search for a patient ID first, then ask me questions about their medical history.";
    }
  }

  /**
   * Check allergy-medication conflicts
   */
  checkAllergyMedicationConflicts() {
    const warnings = [];
    const allergies = this.patientData?.allergies || [];
    const medications = this.patientData?.medications || [];

    allergies.forEach(allergy => {
      medications.forEach(med => {
        if (this.medicalKnowledge.isAllergyConflict(allergy, med)) {
          warnings.push(`${med.name} may conflict with ${allergy.name} allergy`);
        }
      });
    });

    return warnings;
  }

  /**
   * Identify key concerns for summary
   */
  identifyKeyConcerns() {
    const concerns = [];

    // Check allergies
    if ((this.patientData?.allergies || []).length > 0) {
      concerns.push(`${this.patientData.allergies.length} known allergies - verify before prescribing`);
    }

    // Check multiple medications
    const meds = this.patientData?.medications || [];
    if (meds.length > 5) {
      concerns.push('Multiple medications - review for polypharmacy');
    }

    // Check chronic conditions
    const conditions = this.patientData?.conditions || [];
    const chronic = conditions.filter(c => this.medicalKnowledge.isChronic(c));
    if (chronic.length > 0) {
      concerns.push(`${chronic.length} chronic conditions requiring ongoing management`);
    }
    
    // Check previous diagnoses for important conditions
    const previousDiagnoses = this.patientData?.previousDiagnoses || [];
    if (previousDiagnoses.length > 0) {
      const importantConditions = [];
      previousDiagnoses.forEach(d => {
        const name = (d.name || '').toLowerCase();
        if (name.includes('diabetes') || name.includes('dm ')) {
          importantConditions.push('Diabetes');
        } else if (name.includes('hypertension') || name.includes('htn')) {
          importantConditions.push('Hypertension');
        } else if (name.includes('ckd') || name.includes('kidney')) {
          importantConditions.push('CKD');
        } else if (name.includes('heart') || name.includes('cardiac')) {
          importantConditions.push('Cardiac');
        }
      });
      const unique = [...new Set(importantConditions)];
      if (unique.length > 0) {
        concerns.push(`Previous: ${unique.join(', ')} - monitor ongoing`);
      }
    }
    
    // Check if this is a follow-up with no new complaints
    const complaints = this.patientData?.complaints || [];
    if (complaints.length === 0 && previousDiagnoses.length > 0) {
      concerns.push('Follow-up visit - consider checking progress of previous conditions');
    }
    
    // Check episode history for frequent visits
    const episodeHistory = this.patientData?.episodeHistory || [];
    if (episodeHistory.length > 10) {
      concerns.push(`${episodeHistory.length} previous visits - frequent healthcare utilization`);
    }

    return concerns;
  }
}

/**
 * Medical Knowledge Base - Contains built-in medical knowledge
 */
class MedicalKnowledgeBase {
  constructor() {
    this.initializeKnowledge();
  }

  initializeKnowledge() {
    // Condition categories
    this.conditionCategories = {
      'Cardiovascular': ['hypertension', 'heart failure', 'cad', 'coronary artery disease', 'arrhythmia', 'atrial fibrillation', 'ihd', 'mi', 'angina'],
      'Endocrine': ['diabetes', 'diabetes mellitus', 'dm', 'thyroid', 'hypothyroidism', 'hyperthyroidism', 'pcos'],
      'Respiratory': ['asthma', 'copd', 'bronchitis', 'pneumonia', 'tb', 'tuberculosis'],
      'Renal': ['ckd', 'chronic kidney disease', 'renal failure', 'nephropathy'],
      'Gastrointestinal': ['gerd', 'ibs', 'ulcer', 'gastritis', 'hepatitis', 'cirrhosis'],
      'Neurological': ['epilepsy', 'migraine', 'stroke', 'parkinson', 'dementia'],
      'Musculoskeletal': ['arthritis', 'osteoporosis', 'gout', 'rheumatoid'],
      'Psychiatric': ['depression', 'anxiety', 'bipolar', 'schizophrenia'],
      'Infectious': ['hiv', 'hepatitis b', 'hepatitis c'],
      'Other': []
    };

    // Medication categories
    this.medicationCategories = {
      'Antihypertensives': ['amlodipine', 'lisinopril', 'losartan', 'atenolol', 'metoprolol', 'enalapril', 'ramipril', 'valsartan', 'hydrochlorothiazide'],
      'Antidiabetics': ['metformin', 'glimepiride', 'gliclazide', 'sitagliptin', 'insulin', 'pioglitazone', 'empagliflozin', 'dapagliflozin'],
      'Anticoagulants': ['warfarin', 'aspirin', 'clopidogrel', 'rivaroxaban', 'apixaban', 'heparin', 'enoxaparin'],
      'Antibiotics': ['amoxicillin', 'azithromycin', 'ciprofloxacin', 'metronidazole', 'doxycycline', 'cephalexin', 'amoxiclav'],
      'Analgesics': ['paracetamol', 'ibuprofen', 'diclofenac', 'tramadol', 'naproxen'],
      'Statins': ['atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin'],
      'PPIs': ['omeprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole'],
      'Antidepressants': ['sertraline', 'fluoxetine', 'escitalopram', 'amitriptyline', 'venlafaxine'],
      'Bronchodilators': ['salbutamol', 'ipratropium', 'tiotropium', 'formoterol', 'budesonide'],
      'Others': []
    };

    // Drug interactions database
    this.drugInteractions = [
      { drug1: 'warfarin', drug2: 'aspirin', severity: 'severe', description: 'Increased bleeding risk' },
      { drug1: 'metformin', drug2: 'contrast dye', severity: 'severe', description: 'Risk of lactic acidosis - hold metformin' },
      { drug1: 'ace inhibitor', drug2: 'potassium', severity: 'moderate', description: 'Risk of hyperkalemia' },
      { drug1: 'nsaid', drug2: 'ace inhibitor', severity: 'moderate', description: 'Reduced antihypertensive effect, renal risk' },
      { drug1: 'statin', drug2: 'fibrate', severity: 'moderate', description: 'Increased myopathy risk' },
      { drug1: 'ssri', drug2: 'maoi', severity: 'severe', description: 'Serotonin syndrome risk' },
      { drug1: 'methotrexate', drug2: 'nsaid', severity: 'severe', description: 'Methotrexate toxicity' },
      { drug1: 'digoxin', drug2: 'amiodarone', severity: 'severe', description: 'Digoxin toxicity' },
      { drug1: 'clopidogrel', drug2: 'omeprazole', severity: 'moderate', description: 'Reduced clopidogrel effectiveness' }
    ];

    // Vital sign ranges
    this.vitalRanges = {
      bloodPressure: { systolic: { low: 90, normal: [90, 120], high: 140 }, diastolic: { low: 60, normal: [60, 80], high: 90 } },
      pulse: { low: 60, normal: [60, 100], high: 100 },
      temperature: { low: 36, normal: [36.1, 37.2], high: 37.5 },
      respiratoryRate: { low: 12, normal: [12, 20], high: 20 },
      spo2: { low: 95, normal: [95, 100], critical: 90 }
    };

    // Lab test suggestions by condition
    this.conditionTests = {
      'diabetes': [
        { code: 'HbA1c', name: 'HbA1c', reason: 'Monitor glycemic control' },
        { code: 'FBS', name: 'Fasting Blood Sugar', reason: 'Glucose monitoring' },
        { code: 'RFT', name: 'Renal Function Test', reason: 'Check for diabetic nephropathy' },
        { code: 'Lipid', name: 'Lipid Profile', reason: 'Cardiovascular risk assessment' }
      ],
      'hypertension': [
        { code: 'RFT', name: 'Renal Function Test', reason: 'Check renal function' },
        { code: 'Electrolytes', name: 'Serum Electrolytes', reason: 'Monitor potassium levels' },
        { code: 'Lipid', name: 'Lipid Profile', reason: 'Cardiovascular risk' },
        { code: 'ECG', name: 'ECG', reason: 'Check for LVH' }
      ],
      'thyroid': [
        { code: 'TFT', name: 'Thyroid Function Test', reason: 'Monitor thyroid levels' },
        { code: 'TSH', name: 'TSH', reason: 'Primary screening' }
      ],
      'ckd': [
        { code: 'RFT', name: 'Renal Function Test', reason: 'Monitor kidney function' },
        { code: 'CBC', name: 'Complete Blood Count', reason: 'Check for anemia' },
        { code: 'Calcium', name: 'Calcium & Phosphorus', reason: 'Bone health' }
      ]
    };

    // Chronic conditions list
    this.chronicConditions = ['diabetes', 'hypertension', 'ckd', 'copd', 'asthma', 'heart failure', 'cad', 'epilepsy', 'hypothyroidism', 'rheumatoid arthritis'];

    // Comprehensive complaint-to-test mapping based on clinical presentation
    this.complaintTests = {
      // Renal/Urinary complaints
      'flank pain': {
        tests: ['Urine Analysis', 'Renal Function Test', 'Serum Calcium', 'Uric Acid', 'USG KUB'],
        conditions: ['Kidney stone (Calculus)', 'UTI', 'Pyelonephritis'],
        urgency: 'moderate'
      },
      'kidney stone': {
        tests: ['Urine Analysis', 'Renal Function Test', 'Serum Calcium', 'Serum Uric Acid', 'Serum Phosphorus', '24hr Urinary Calcium'],
        conditions: ['Nephrolithiasis', 'Hypercalcemia', 'Hyperuricemia'],
        urgency: 'moderate'
      },
      'calculus': {
        tests: ['Urine Analysis', 'Renal Function Test', 'Serum Calcium', 'Serum Uric Acid', 'Serum Phosphorus'],
        conditions: ['Nephrolithiasis', 'Ureterolithiasis'],
        urgency: 'moderate'
      },
      'urinary symptoms': {
        tests: ['Urine Analysis', 'Urine C/S', 'Renal Function Test', 'Blood Sugar'],
        conditions: ['UTI', 'Diabetes', 'Prostatitis'],
        urgency: 'routine'
      },
      'dysuria': {
        tests: ['Urine Analysis', 'Urine C/S', 'Blood Sugar'],
        conditions: ['UTI', 'Urethritis', 'Prostatitis'],
        urgency: 'routine'
      },
      'hematuria': {
        tests: ['Urine Analysis', 'Urine C/S', 'Renal Function Test', 'PT/INR', 'CBC'],
        conditions: ['UTI', 'Stone', 'Malignancy', 'Glomerulonephritis'],
        urgency: 'urgent'
      },

      // Cardiovascular complaints
      'chest pain': {
        tests: ['ECG', 'Troponin', 'CBC', 'Lipid Profile', 'Blood Sugar', 'Renal Function Test'],
        conditions: ['ACS', 'Angina', 'GERD', 'Musculoskeletal'],
        urgency: 'urgent'
      },
      'palpitations': {
        tests: ['ECG', 'CBC', 'Thyroid Function Test', 'Serum Electrolytes', 'Blood Sugar'],
        conditions: ['Arrhythmia', 'Thyroid disorder', 'Anemia', 'Anxiety'],
        urgency: 'moderate'
      },
      'hypertension': {
        tests: ['Renal Function Test', 'Serum Electrolytes', 'Lipid Profile', 'Blood Sugar', 'ECG', 'Urine Analysis'],
        conditions: ['Essential HTN', 'Secondary HTN', 'CKD'],
        urgency: 'routine'
      },
      'breathlessness': {
        tests: ['CBC', 'Chest X-Ray', 'ECG', 'BNP', 'Blood Sugar', 'Thyroid Function Test'],
        conditions: ['Heart failure', 'COPD', 'Anemia', 'Thyroid disorder'],
        urgency: 'urgent'
      },
      'edema': {
        tests: ['Renal Function Test', 'Liver Function Test', 'CBC', 'Urine Analysis', 'Serum Proteins'],
        conditions: ['Heart failure', 'CKD', 'Liver disease', 'Nephrotic syndrome'],
        urgency: 'moderate'
      },

      // Gastrointestinal complaints
      'abdominal pain': {
        tests: ['CBC', 'Liver Function Test', 'Serum Amylase', 'Lipase', 'Urine Analysis', 'Stool R/E'],
        conditions: ['Gastritis', 'Pancreatitis', 'Hepatitis', 'Appendicitis'],
        urgency: 'moderate'
      },
      'nausea': {
        tests: ['CBC', 'Liver Function Test', 'Renal Function Test', 'Serum Electrolytes', 'Blood Sugar'],
        conditions: ['Gastritis', 'Hepatitis', 'Uremia', 'DKA'],
        urgency: 'routine'
      },
      'vomiting': {
        tests: ['CBC', 'Serum Electrolytes', 'Renal Function Test', 'Blood Sugar', 'Liver Function Test'],
        conditions: ['Gastroenteritis', 'Obstruction', 'DKA', 'Uremia'],
        urgency: 'moderate'
      },
      'diarrhea': {
        tests: ['Stool R/E', 'Stool C/S', 'CBC', 'Serum Electrolytes', 'Renal Function Test'],
        conditions: ['Gastroenteritis', 'IBD', 'Malabsorption'],
        urgency: 'moderate'
      },
      'jaundice': {
        tests: ['Liver Function Test', 'CBC', 'PT/INR', 'Hepatitis Panel', 'USG Abdomen'],
        conditions: ['Hepatitis', 'Cholestasis', 'Hemolysis', 'Cirrhosis'],
        urgency: 'urgent'
      },

      // Musculoskeletal complaints
      'joint pain': {
        tests: ['CBC', 'ESR', 'CRP', 'Uric Acid', 'RA Factor', 'Anti CCP'],
        conditions: ['Arthritis', 'Gout', 'Rheumatoid arthritis', 'SLE'],
        urgency: 'routine'
      },
      'back pain': {
        tests: ['CBC', 'ESR', 'CRP', 'Serum Calcium', 'Vitamin D', 'X-Ray Spine'],
        conditions: ['Muscular strain', 'Disc disease', 'Osteoporosis', 'Malignancy'],
        urgency: 'routine'
      },
      'body ache': {
        tests: ['CBC', 'ESR', 'CRP', 'Dengue NS1/IgG/IgM', 'Blood Sugar', 'Thyroid Function Test'],
        conditions: ['Viral infection', 'Dengue', 'Hypothyroidism', 'Fibromyalgia'],
        urgency: 'routine'
      },
      'muscle weakness': {
        tests: ['CBC', 'Serum Electrolytes', 'Thyroid Function Test', 'CPK', 'Calcium', 'Vitamin D'],
        conditions: ['Electrolyte imbalance', 'Myopathy', 'Thyroid disorder'],
        urgency: 'moderate'
      },

      // Neurological complaints
      'headache': {
        tests: ['CBC', 'Blood Sugar', 'Renal Function Test', 'CT Brain'],
        conditions: ['Migraine', 'Tension headache', 'Hypertension', 'Space-occupying lesion'],
        urgency: 'routine'
      },
      'dizziness': {
        tests: ['CBC', 'Blood Sugar', 'Serum Electrolytes', 'ECG', 'Thyroid Function Test'],
        conditions: ['Anemia', 'Hypoglycemia', 'BPPV', 'Cardiac arrhythmia'],
        urgency: 'moderate'
      },
      'weakness': {
        tests: ['CBC', 'Blood Sugar', 'Serum Electrolytes', 'Thyroid Function Test', 'Renal Function Test'],
        conditions: ['Anemia', 'Diabetes', 'Electrolyte imbalance', 'Hypothyroidism'],
        urgency: 'moderate'
      },
      'numbness': {
        tests: ['Blood Sugar', 'HbA1c', 'Vitamin B12', 'Thyroid Function Test', 'Serum Electrolytes'],
        conditions: ['Diabetic neuropathy', 'B12 deficiency', 'Carpal tunnel'],
        urgency: 'routine'
      },

      // Respiratory complaints
      'cough': {
        tests: ['CBC', 'Chest X-Ray', 'Sputum AFB', 'ESR'],
        conditions: ['URTI', 'Bronchitis', 'Pneumonia', 'TB'],
        urgency: 'routine'
      },
      'fever': {
        tests: ['CBC', 'ESR', 'CRP', 'Urine Analysis', 'Blood C/S', 'Dengue NS1', 'Widal'],
        conditions: ['Infection', 'Dengue', 'Typhoid', 'UTI', 'Pneumonia'],
        urgency: 'moderate'
      },
      'sore throat': {
        tests: ['CBC', 'Throat Swab C/S', 'ASOT'],
        conditions: ['Pharyngitis', 'Tonsillitis', 'Strep throat'],
        urgency: 'routine'
      },

      // Endocrine complaints
      'weight loss': {
        tests: ['CBC', 'Blood Sugar', 'HbA1c', 'Thyroid Function Test', 'Liver Function Test', 'HIV'],
        conditions: ['Diabetes', 'Hyperthyroidism', 'Malignancy', 'TB'],
        urgency: 'moderate'
      },
      'weight gain': {
        tests: ['Blood Sugar', 'Thyroid Function Test', 'Lipid Profile', 'Cortisol'],
        conditions: ['Hypothyroidism', 'Cushing syndrome', 'PCOS'],
        urgency: 'routine'
      },
      'fatigue': {
        tests: ['CBC', 'Blood Sugar', 'Thyroid Function Test', 'Liver Function Test', 'Renal Function Test', 'Iron Studies'],
        conditions: ['Anemia', 'Hypothyroidism', 'Diabetes', 'CKD', 'Depression'],
        urgency: 'routine'
      },
      'polyuria': {
        tests: ['Blood Sugar', 'HbA1c', 'Renal Function Test', 'Urine Analysis', 'Serum Calcium'],
        conditions: ['Diabetes mellitus', 'Diabetes insipidus', 'Hypercalcemia'],
        urgency: 'moderate'
      },
      'polydipsia': {
        tests: ['Blood Sugar', 'HbA1c', 'Serum Electrolytes', 'Serum Calcium'],
        conditions: ['Diabetes mellitus', 'Diabetes insipidus'],
        urgency: 'moderate'
      },

      // Dermatological complaints
      'rash': {
        tests: ['CBC', 'ESR', 'Liver Function Test', 'ANA', 'Skin scraping'],
        conditions: ['Allergic reaction', 'Viral exanthem', 'Drug reaction', 'SLE'],
        urgency: 'routine'
      },
      'itching': {
        tests: ['CBC', 'Liver Function Test', 'Renal Function Test', 'Blood Sugar', 'Thyroid Function Test'],
        conditions: ['Allergy', 'Liver disease', 'CKD', 'Diabetes'],
        urgency: 'routine'
      },

      // Hematological complaints
      'pallor': {
        tests: ['CBC', 'Iron Studies', 'Vitamin B12', 'Folate', 'Reticulocyte Count', 'Blood Picture'],
        conditions: ['Iron deficiency anemia', 'B12 deficiency', 'Hemolytic anemia', 'Bone marrow disease'],
        urgency: 'moderate'
      },
      'bleeding': {
        tests: ['CBC', 'PT/INR', 'APTT', 'Platelet Count', 'Blood Picture'],
        conditions: ['Thrombocytopenia', 'Coagulation disorder', 'DIC'],
        urgency: 'urgent'
      },
      'bruising': {
        tests: ['CBC', 'PT/INR', 'APTT', 'Platelet Count', 'Liver Function Test'],
        conditions: ['Thrombocytopenia', 'Coagulation disorder', 'Liver disease'],
        urgency: 'moderate'
      }
    };

    // ICD code to complaint/condition mapping
    this.icdConditionMap = {
      'N20': { name: 'Calculus of kidney', complaints: ['flank pain', 'kidney stone'], category: 'Renal' },
      'N20.0': { name: 'Calculus of kidney', complaints: ['flank pain', 'kidney stone', 'hematuria'], category: 'Renal' },
      'N20.1': { name: 'Calculus of ureter', complaints: ['flank pain', 'kidney stone'], category: 'Renal' },
      'I10': { name: 'Essential hypertension', complaints: ['hypertension', 'headache'], category: 'Cardiovascular' },
      'E11': { name: 'Type 2 diabetes mellitus', complaints: ['polyuria', 'polydipsia', 'fatigue'], category: 'Endocrine' },
      'E11.9': { name: 'Type 2 diabetes mellitus without complications', complaints: ['polyuria', 'polydipsia'], category: 'Endocrine' },
      'J06': { name: 'Acute upper respiratory infection', complaints: ['cough', 'fever', 'sore throat'], category: 'Respiratory' },
      'K21': { name: 'Gastro-esophageal reflux disease', complaints: ['chest pain', 'abdominal pain'], category: 'GI' },
      'M54': { name: 'Dorsalgia', complaints: ['back pain'], category: 'Musculoskeletal' },
      'R51': { name: 'Headache', complaints: ['headache'], category: 'Neurological' },
      'N39.0': { name: 'Urinary tract infection', complaints: ['dysuria', 'urinary symptoms', 'fever'], category: 'Renal' },
      'A09': { name: 'Infectious gastroenteritis', complaints: ['diarrhea', 'vomiting', 'abdominal pain'], category: 'GI' },
      'D50': { name: 'Iron deficiency anemia', complaints: ['fatigue', 'pallor', 'weakness'], category: 'Hematological' },
      'E03': { name: 'Hypothyroidism', complaints: ['fatigue', 'weight gain', 'weakness'], category: 'Endocrine' },
      'E05': { name: 'Hyperthyroidism', complaints: ['weight loss', 'palpitations', 'tremor'], category: 'Endocrine' },
      'I25': { name: 'Chronic ischemic heart disease', complaints: ['chest pain', 'breathlessness'], category: 'Cardiovascular' },
      'I50': { name: 'Heart failure', complaints: ['breathlessness', 'edema', 'fatigue'], category: 'Cardiovascular' },
      'N18': { name: 'Chronic kidney disease', complaints: ['fatigue', 'edema', 'nausea'], category: 'Renal' }
    };
  }

  // Get tests suggested for a complaint
  getTestsForComplaint(complaint) {
    const lower = complaint.toLowerCase();
    const tests = [];
    
    for (const [key, data] of Object.entries(this.complaintTests)) {
      if (lower.includes(key) || key.includes(lower)) {
        tests.push(...data.tests.map(t => ({
          name: t,
          reason: `Relevant for ${key}`,
          conditions: data.conditions
        })));
      }
    }
    
    return tests;
  }

  // Analyze complaints and suggest comprehensive workup
  analyzeComplaints(complaints) {
    const analysis = {
      suggestedTests: [],
      possibleConditions: [],
      urgency: 'routine',
      clinicalNotes: []
    };

    complaints.forEach(complaint => {
      const content = typeof complaint === 'string' ? complaint : complaint.content || '';
      const lower = content.toLowerCase();

      for (const [key, data] of Object.entries(this.complaintTests)) {
        if (lower.includes(key)) {
          analysis.suggestedTests.push(...data.tests);
          analysis.possibleConditions.push(...data.conditions);
          if (data.urgency === 'urgent') analysis.urgency = 'urgent';
          else if (data.urgency === 'moderate' && analysis.urgency === 'routine') analysis.urgency = 'moderate';
        }
      }
    });

    // Remove duplicates
    analysis.suggestedTests = [...new Set(analysis.suggestedTests)];
    analysis.possibleConditions = [...new Set(analysis.possibleConditions)];

    return analysis;
  }

  // Get condition info from ICD code
  getConditionFromICD(code) {
    // Try exact match first
    if (this.icdConditionMap[code]) {
      return this.icdConditionMap[code];
    }
    // Try prefix match (e.g., N20.0 matches N20)
    const prefix = code.split('.')[0];
    if (this.icdConditionMap[prefix]) {
      return this.icdConditionMap[prefix];
    }
    return null;
  }

  categorizeConditions(conditions) {
    const result = {};
    for (const category of Object.keys(this.conditionCategories)) {
      result[category] = [];
    }

    conditions.forEach(condition => {
      // Handle non-string conditions safely
      const condStr = typeof condition === 'string' 
        ? condition 
        : (condition?.name || condition?.code || String(condition || ''));
      const lower = condStr.toLowerCase();
      let found = false;
      
      for (const [category, keywords] of Object.entries(this.conditionCategories)) {
        if (keywords.some(k => lower.includes(k))) {
          result[category].push(condStr);
          found = true;
          break;
        }
      }
      
      if (!found) {
        result['Other'].push(condStr);
      }
    });

    return result;
  }

  categorizeMedications(medications) {
    const result = {};
    for (const category of Object.keys(this.medicationCategories)) {
      result[category] = [];
    }

    medications.forEach(med => {
      const medName = (typeof med === 'string' ? med : med.name).toLowerCase();
      let found = false;
      
      for (const [category, drugs] of Object.entries(this.medicationCategories)) {
        if (drugs.some(d => medName.includes(d))) {
          result[category].push(typeof med === 'string' ? { name: med } : med);
          found = true;
          break;
        }
      }
      
      if (!found) {
        result['Others'].push(typeof med === 'string' ? { name: med } : med);
      }
    });

    return result;
  }

  getConditionInfo(condition) {
    // Handle non-string conditions safely
    const condStr = typeof condition === 'string' 
      ? condition 
      : (condition?.name || condition?.code || String(condition || ''));
    const lower = condStr.toLowerCase();
    const info = { severity: null };

    // Determine severity based on condition type
    if (['heart failure', 'ckd', 'copd', 'stroke', 'mi'].some(c => lower.includes(c))) {
      info.severity = 'Serious';
    } else if (['diabetes', 'hypertension', 'asthma'].some(c => lower.includes(c))) {
      info.severity = 'Chronic';
    }

    return info;
  }

  getClinicalConsiderations(conditions) {
    const considerations = [];
    // Handle non-string conditions safely
    const lower = conditions.map(c => {
      const condStr = typeof c === 'string' 
        ? c 
        : (c?.name || c?.code || String(c || ''));
      return condStr.toLowerCase();
    });

    if (lower.some(c => c.includes('diabetes'))) {
      considerations.push('Monitor blood sugar regularly, check for end-organ damage');
    }
    if (lower.some(c => c.includes('hypertension'))) {
      considerations.push('Regular BP monitoring, assess cardiovascular risk');
    }
    if (lower.some(c => c.includes('ckd') || c.includes('kidney'))) {
      considerations.push('Adjust drug doses for renal impairment, avoid nephrotoxic drugs');
    }
    if (lower.some(c => c.includes('heart failure'))) {
      considerations.push('Fluid restriction, daily weight monitoring, avoid NSAIDs');
    }

    return considerations;
  }

  getMedicationNotes(medications) {
    const notes = [];
    const medNames = medications.map(m => (typeof m === 'string' ? m : m.name).toLowerCase());

    if (medNames.some(m => m.includes('warfarin'))) {
      notes.push('Warfarin - Regular INR monitoring required');
    }
    if (medNames.some(m => m.includes('metformin'))) {
      notes.push('Metformin - Hold before contrast procedures');
    }
    if (medNames.some(m => m.includes('statin'))) {
      notes.push('Statin - Monitor for muscle pain, check LFT periodically');
    }
    if (medNames.some(m => m.includes('insulin'))) {
      notes.push('Insulin - Educate on hypoglycemia signs');
    }

    return notes;
  }

  evaluateLabResult(test) {
    // Basic evaluation - would need reference ranges for accurate assessment
    if (!test.value) return 'pending';
    if (test.status) return test.status.toLowerCase();
    return 'normal'; // Default
  }

  analyzeLabTrends(labTests) {
    // Simplified trend analysis
    return [];
  }

  evaluateVital(type, value) {
    const ranges = this.vitalRanges[type];
    if (!ranges) return 'unknown';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'unknown';

    if (type === 'bloodPressure') {
      // Handle BP format like "120/80"
      const parts = value.split('/');
      if (parts.length === 2) {
        const systolic = parseFloat(parts[0]);
        const diastolic = parseFloat(parts[1]);
        if (systolic >= 140 || diastolic >= 90) return 'high';
        if (systolic < 90 || diastolic < 60) return 'low';
        return 'normal';
      }
    }

    if (numValue < ranges.low) return 'low';
    if (numValue > ranges.high) return 'high';
    return 'normal';
  }

  interpretVitals(vitals) {
    const interpretations = [];

    if (vitals.bloodPressure) {
      const status = this.evaluateVital('bloodPressure', vitals.bloodPressure);
      if (status === 'high') interpretations.push('Elevated blood pressure - consider hypertension workup');
      if (status === 'low') interpretations.push('Low blood pressure - assess for dehydration or medication effects');
    }

    if (vitals.bmi) {
      const bmi = parseFloat(vitals.bmi);
      if (bmi >= 30) interpretations.push('BMI indicates obesity - lifestyle counseling recommended');
      else if (bmi >= 25) interpretations.push('BMI indicates overweight');
      else if (bmi < 18.5) interpretations.push('BMI indicates underweight - nutritional assessment needed');
    }

    if (vitals.spo2) {
      const spo2 = parseFloat(vitals.spo2);
      if (spo2 < 90) interpretations.push('Critical hypoxia - immediate intervention needed');
      else if (spo2 < 95) interpretations.push('Low oxygen saturation - further evaluation needed');
    }

    return interpretations;
  }

  getRecommendationsForCondition(condition) {
    if (!condition || typeof condition !== 'string') return [];
    const lower = condition.toLowerCase();
    const recommendations = [];

    if (lower.includes('diabetes')) {
      recommendations.push('Annual eye examination for diabetic retinopathy');
      recommendations.push('Annual urine albumin/creatinine ratio');
      recommendations.push('Foot examination at each visit');
    }
    if (lower.includes('hypertension')) {
      recommendations.push('Lifestyle modifications: low sodium diet, regular exercise');
      recommendations.push('Annual cardiovascular risk assessment');
    }

    return recommendations;
  }

  getAgeBasedRecommendations(age) {
    const recommendations = [];
    
    if (age >= 45) {
      recommendations.push('Consider diabetes screening if not done recently');
    }
    if (age >= 50) {
      recommendations.push('Consider colorectal cancer screening');
    }
    if (age >= 65) {
      recommendations.push('Fall risk assessment recommended');
      recommendations.push('Pneumococcal vaccination if not given');
    }

    return recommendations;
  }

  getVitalBasedRecommendations(vitals) {
    const recommendations = [];

    if (vitals.bmi && parseFloat(vitals.bmi) >= 25) {
      recommendations.push('Weight management counseling');
    }

    return recommendations;
  }

  getConditionRisks(condition) {
    if (!condition || typeof condition !== 'string') return [];
    const lower = condition.toLowerCase();
    const risks = [];

    if (lower.includes('diabetes')) {
      risks.push({ level: 'moderate', text: 'Diabetes - increased risk of cardiovascular events and infections' });
    }
    if (lower.includes('ckd')) {
      risks.push({ level: 'high', text: 'CKD - dose adjustment needed for renally cleared medications' });
    }
    if (lower.includes('heart failure')) {
      risks.push({ level: 'high', text: 'Heart failure - avoid fluid overload, monitor closely' });
    }

    return risks;
  }

  getVitalRisks(vitals) {
    const risks = [];

    if (vitals.bloodPressure) {
      const parts = vitals.bloodPressure.split('/');
      if (parts.length === 2) {
        const systolic = parseFloat(parts[0]);
        if (systolic >= 180) {
          risks.push({ level: 'high', text: 'Severely elevated blood pressure - hypertensive urgency/emergency' });
        }
      }
    }

    if (vitals.spo2 && parseFloat(vitals.spo2) < 92) {
      risks.push({ level: 'high', text: 'Significant hypoxemia - requires urgent attention' });
    }

    return risks;
  }

  checkInteractions(medications) {
    const interactions = [];
    const medNames = medications.map(m => (typeof m === 'string' ? m : m.name).toLowerCase());

    this.drugInteractions.forEach(interaction => {
      const hasDrug1 = medNames.some(m => m.includes(interaction.drug1));
      const hasDrug2 = medNames.some(m => m.includes(interaction.drug2));

      if (hasDrug1 && hasDrug2) {
        interactions.push({
          ...interaction,
          drug1: medications.find(m => (typeof m === 'string' ? m : m.name).toLowerCase().includes(interaction.drug1))?.name || interaction.drug1,
          drug2: medications.find(m => (typeof m === 'string' ? m : m.name).toLowerCase().includes(interaction.drug2))?.name || interaction.drug2
        });
      }
    });

    return interactions;
  }

  getTestsForCondition(condition) {
    if (!condition || typeof condition !== 'string') return [];
    const lower = condition.toLowerCase();
    
    for (const [key, tests] of Object.entries(this.conditionTests)) {
      if (lower.includes(key)) {
        return tests;
      }
    }
    
    return [];
  }

  getMonitoringTests(medication) {
    const medName = (typeof medication === 'string' ? medication : medication.name).toLowerCase();
    const tests = [];

    if (medName.includes('warfarin')) {
      tests.push({ code: 'INR', name: 'INR/PT', reason: 'Warfarin monitoring' });
    }
    if (medName.includes('metformin')) {
      tests.push({ code: 'RFT', name: 'Renal Function', reason: 'Metformin - monitor renal function' });
    }
    if (medName.includes('statin')) {
      tests.push({ code: 'LFT', name: 'Liver Function', reason: 'Statin monitoring' });
    }
    if (medName.includes('lithium')) {
      tests.push({ code: 'Lithium', name: 'Lithium Level', reason: 'Therapeutic monitoring' });
      tests.push({ code: 'TFT', name: 'Thyroid Function', reason: 'Lithium affects thyroid' });
    }

    return tests;
  }

  getAgeBasedTests(age, gender) {
    const tests = [];

    if (age >= 45) {
      tests.push({ code: 'FBS', name: 'Fasting Blood Sugar', reason: 'Diabetes screening' });
      tests.push({ code: 'Lipid', name: 'Lipid Profile', reason: 'Cardiovascular screening' });
    }
    if (age >= 50 && gender?.toLowerCase() === 'female') {
      tests.push({ code: 'BMD', name: 'Bone Mineral Density', reason: 'Osteoporosis screening' });
    }

    return tests;
  }

  isAllergyConflict(allergy, medication) {
    const allergyName = (typeof allergy === 'string' ? allergy : allergy.name).toLowerCase();
    const medName = (typeof medication === 'string' ? medication : medication.name).toLowerCase();

    // Penicillin allergy
    if (allergyName.includes('penicillin') && 
        ['amoxicillin', 'ampicillin', 'amoxiclav', 'augmentin', 'piperacillin'].some(p => medName.includes(p))) {
      return true;
    }

    // Sulfa allergy
    if (allergyName.includes('sulfa') && 
        ['sulfamethoxazole', 'bactrim', 'cotrimoxazole', 'sulfasalazine'].some(s => medName.includes(s))) {
      return true;
    }

    // NSAID allergy
    if (allergyName.includes('nsaid') && 
        ['ibuprofen', 'diclofenac', 'naproxen', 'aspirin', 'meloxicam'].some(n => medName.includes(n))) {
      return true;
    }

    return false;
  }

  isChronic(condition) {
    // Handle non-string conditions safely
    const condStr = typeof condition === 'string' 
      ? condition 
      : (condition?.name || condition?.code || String(condition || ''));
    const lower = condStr.toLowerCase();
    return this.chronicConditions.some(c => lower.includes(c));
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.PatientAI = PatientAI;
  window.MedicalKnowledgeBase = MedicalKnowledgeBase;
}

// Also export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PatientAI, MedicalKnowledgeBase };
}
