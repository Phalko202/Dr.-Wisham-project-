// api.js - API functions using existing Aasandha session

(function attachVinaviApi(globalScope) {
  async function fetchJson(url) {
    const response = await fetch(url, {
      credentials: 'include' // CRITICAL: Send cookies with request
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async function checkAuthentication() {
    try {
      const response = await fetch('https://vinavi.aasandha.mv/api/users/authenticated?include=employee,professional.service-providers,permissions,roles.permissions', {
        credentials: 'include'
      });

      if (response.ok) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return null;
    }
  }

  async function searchPatient(nationalId) {
    const url = `https://vinavi.aasandha.mv/api/patients/search/${nationalId}`;
    return fetchJson(url);
  }

  async function getPatientDetails(patientId) {
    const url = `https://vinavi.aasandha.mv/api/patients/${patientId}?include=address.island.atoll`;
    return fetchJson(url);
  }

  async function getPatientCases(patientId) {
    const url = `https://vinavi.aasandha.mv/api/patients/${patientId}/patient-cases?include=last-episode,doctor&page[size]=100&sort=-created_at`;
    return fetchJson(url);
  }

  async function getEpisodeDetails(episodeId) {
    const includeParams = 'patient,doctor,prescriptions.medicines.preferred-medicine,requested-services.service,diagnoses.icd-code,vitals,service-provider';
    const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}?include=${includeParams}`;
    return fetchJson(url);
  }

  async function addServiceToEpisode(episodeId, serviceId, diagnosisId = null, professionalId = null) {
    const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}/requested-services`;

    // Vinavi expects exact JSON:API format
    const payload = {
      data: {
        type: 'requested-services',
        attributes: {
          quantity: 1
        },
        relationships: {
          service: {
            data: {
              type: 'services',
              id: String(serviceId)
            }
          }
        }
      }
    };

    // Add diagnosis only if provided (must be proper relationship format)
    if (diagnosisId) {
      payload.data.relationships.diagnosis = {
        data: {
          type: 'diagnoses',
          id: String(diagnosisId)
        }
      };
    }

    // Add professional only if provided
    if (professionalId) {
      payload.data.relationships.professional = {
        data: {
          type: 'professionals',
          id: String(professionalId)
        }
      };
    }

    console.log('[API] Submitting service:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = JSON.stringify(errorJson, null, 2);
        console.error('[API] Service submission failed:', errorJson);
      } catch (e) {
        errorDetail = await response.text();
        console.error('[API] Service submission failed:', errorDetail);
      }
      throw new Error(`Failed to add service: ${response.status} - ${errorDetail}`);
    }

    return response.json();
  }

  async function addMultipleServices(episodeId, serviceIds, diagnosisId = null, professionalId = null, onProgress = null) {
    const results = [];
    const total = serviceIds.length;

    for (let i = 0; i < serviceIds.length; i++) {
      const serviceId = serviceIds[i];
      try {
        const result = await addServiceToEpisode(episodeId, serviceId, diagnosisId, professionalId);
        results.push({ success: true, serviceId, result });

        if (onProgress) {
          onProgress(i + 1, total);
        }
      } catch (error) {
        results.push({ success: false, serviceId, error: error.message });
      }
    }

    return results;
  }

  async function searchServices(query) {
    const url = `https://vinavi.aasandha.mv/api/services?filter[query]=${encodeURIComponent(query)}&page[size]=50`;
    return fetchJson(url);
  }

  async function getPatientImage(patientId) {
    try {
      const url = `https://vinavi.aasandha.mv/api/patients/${patientId}/image`;
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        return null;
      }

      // Return the blob URL for the image
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching patient image:', error);
      return null;
    }
  }

  async function getConsultationDetails(episodeId) {
    try {
      // Fetch consultation/clinical notes for the episode
      const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}/consultations?include=professional,consultation-type`;
      return fetchJson(url);
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      return null;
    }
  }

  async function getEpisodeNotes(episodeId) {
    try {
      // Fetch clinical notes/observations
      const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}/notes`;
      return fetchJson(url);
    } catch (error) {
      console.error('Error fetching episode notes:', error);
      return null;
    }
  }

  async function getEpisodeAttachments(episodeId) {
    try {
      // Fetch any attachments/documents for the episode
      const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}/attachments`;
      return fetchJson(url);
    } catch (error) {
      console.error('Error fetching episode attachments:', error);
      return null;
    }
  }

  async function createPrescription(episodeId) {
    const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}/prescriptions`;
    const payload = {
      data: {
        attributes: {}
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create prescription: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async function addMedicineToPrescription(prescriptionId, medicineData, diagnosisId = null) {
    const url = `https://vinavi.aasandha.mv/api/prescriptions/${prescriptionId}/medicines`;
    
    // Validate that we have a preferred medicine ID for covered medicines
    if (!medicineData.preferredMedicineId) {
      console.error('[API] addMedicineToPrescription called without preferredMedicineId:', medicineData);
      throw new Error('preferredMedicineId is required for covered medicines');
    }
    
    const payload = {
      item: medicineData.item || {},
      genericData: medicineData.genericData || null,
      data: {
        attributes: {
          instructions: medicineData.instructions || '',
          name: medicineData.name || '',
          is_doctor_remarks_required: false
        },
        relationships: {
          'preferred-medicine': {
            data: {
              id: String(medicineData.preferredMedicineId)
            }
          }
        }
      },
      diagnosis: diagnosisId ? String(diagnosisId) : null,
      isSaving: true
    };

    if (diagnosisId) {
      payload.data.relationships.diagnosis = {
        data: {
          id: String(diagnosisId)
        }
      };
    }
    
    console.log('[API] Adding covered medicine:', {
      name: medicineData.name,
      preferredMedicineId: medicineData.preferredMedicineId,
      diagnosisId
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add medicine: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Add a custom/not-covered medicine to prescription
   * These are medicines that aren't in the Vinavi database (e.g., Drez Gargle, Thumb Spica, orthotics)
   */
  async function addCustomMedicineToPrescription(prescriptionId, medicineData, diagnosisId = null) {
    const url = `https://vinavi.aasandha.mv/api/prescriptions/${prescriptionId}/medicines`;
    
    // For custom/not-covered medicines, we don't include preferred-medicine relationship
    const payload = {
      item: null,
      genericData: null,
      data: {
        attributes: {
          instructions: medicineData.instructions || '',
          name: medicineData.name || '',
          is_doctor_remarks_required: false,
          is_covered: false
        },
        relationships: {}
      },
      diagnosis: diagnosisId ? String(diagnosisId) : null,
      isSaving: true
    };

    if (diagnosisId) {
      payload.data.relationships.diagnosis = {
        data: {
          id: String(diagnosisId)
        }
      };
    }

    console.log('[API] Adding custom/not-covered medicine:', medicineData.name);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add custom medicine: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Add diagnosis (ICD code) to an episode
   */
  async function addDiagnosis(episodeId, diagnosisData) {
    const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}/diagnoses`;
    
    // Validate icdCodeId
    if (!diagnosisData.icdCodeId) {
      throw new Error('ICD code ID is required for diagnosis');
    }
    
    // Vinavi requires 'final' and 'principle' (principal) boolean attributes
    const payload = {
      data: {
        type: 'diagnoses',
        attributes: {
          notes: diagnosisData.notes || '',
          final: diagnosisData.final !== undefined ? diagnosisData.final : true,
          principle: diagnosisData.principle !== undefined ? diagnosisData.principle : false
        },
        relationships: {
          'icd-code': {
            data: {
              type: 'icd-codes',
              id: String(diagnosisData.icdCodeId)
            }
          }
        }
      }
    };

    console.log('[API] Adding diagnosis to episode', episodeId, ':', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Diagnosis add failed:', response.status, errorText);
      throw new Error(`Failed to add diagnosis: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Add medical advice/note to an episode
   */
  async function addNote(episodeId, noteData) {
    const url = `https://vinavi.aasandha.mv/api/episodes/${episodeId}/notes`;
    
    // Vinavi uses 'advice' as the note_type, not 'medical-advice'
    // And the content field should be 'notes' not 'content'
    const payload = {
      data: {
        type: 'notes',
        attributes: {
          note_type: 'advice',
          notes: noteData.content || noteData.notes || ''
        }
      }
    };

    console.log('[API] Adding note to episode', episodeId, ':', payload);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Note add failed:', response.status, errorText);
      throw new Error(`Failed to add note: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get prescription PDF from Aasandha - opens the official Vinavi print page
   */
  async function getPrescriptionPdf(prescriptionId) {
    try {
      // The Vinavi portal uses this endpoint for prescription PDF
      const pdfUrl = `https://vinavi.aasandha.mv/api/prescriptions/${prescriptionId}/pdf`;
      
      // Open the PDF in a new tab - Vinavi will handle authentication via cookies
      window.open(pdfUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Error getting prescription PDF:', error);
      return false;
    }
  }

  /**
   * Open Vinavi prescription print page (alternative method)
   */
  function openPrescriptionPrintPage(patientId, episodeId, prescriptionId) {
    // The Vinavi portal print page URL
    const printUrl = `https://vinavi.aasandha.mv/consultations/${patientId}/${episodeId}/prescriptions/${prescriptionId}/print`;
    window.open(printUrl, '_blank');
  }

  const api = {
    checkAuthentication,
    searchPatient,
    getPatientDetails,
    getPatientCases,
    getEpisodeDetails,
    addServiceToEpisode,
    addMultipleServices,
    searchServices,
    getPatientImage,
    getConsultationDetails,
    getEpisodeNotes,
    getEpisodeAttachments,
    createPrescription,
    addMedicineToPrescription,
    addCustomMedicineToPrescription,
    addDiagnosis,
    addNote,
    getPrescriptionPdf,
    openPrescriptionPrintPage
  };

  globalScope.VinaviAPI = Object.freeze(api);
})(typeof window !== 'undefined' ? window : globalThis);
