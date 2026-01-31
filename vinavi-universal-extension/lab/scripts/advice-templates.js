/**
 * Medical Advice Templates Database
 * Organized by medical specialty with common advice templates
 */

const MEDICAL_ADVICE_TEMPLATES = {
    // Nephrology
    nephrology: {
        name: 'Nephrology',
        icon: '🫀',
        color: '#e74c3c',
        templates: [
            'Increase fluid intake to 2-3 liters per day',
            'Reduce salt/sodium intake',
            'Monitor blood pressure daily',
            'Avoid NSAIDs and nephrotoxic medications',
            'Follow low potassium diet',
            'Follow low phosphorus diet',
            'Limit protein intake as advised',
            'Track daily urine output',
            'Weigh yourself daily - report sudden weight gain',
            'Elevate legs to reduce swelling',
            'Follow dialysis schedule strictly',
            'Take phosphate binders with meals'
        ]
    },

    // Cardiology
    cardiology: {
        name: 'Cardiology',
        icon: '❤️',
        color: '#c0392b',
        templates: [
            'Follow low sodium diet (less than 2g/day)',
            'Monitor blood pressure twice daily',
            'Limit fluid intake to 1.5-2 liters/day',
            'Take medications at the same time daily',
            'Weigh yourself daily - report gain of 1kg+ in 24hrs',
            'Avoid strenuous physical activity',
            'Light walking 15-30 minutes daily as tolerated',
            'Quit smoking immediately',
            'Limit alcohol consumption',
            'Sleep with head elevated if short of breath',
            'Report chest pain or palpitations immediately',
            'Wear compression stockings as prescribed',
            'Avoid standing for prolonged periods'
        ]
    },

    // Endocrinology/Diabetes
    endocrinology: {
        name: 'Endocrinology',
        icon: '🩺',
        color: '#8e44ad',
        templates: [
            'Monitor blood glucose before meals and at bedtime',
            'Follow diabetic diet plan strictly',
            'Take insulin/medications as prescribed',
            'Check feet daily for wounds or infections',
            'Exercise regularly - 30 minutes daily',
            'Carry fast-acting sugar for hypoglycemia',
            'Maintain healthy body weight',
            'Regular eye check-ups every 6 months',
            'Keep HbA1c below 7%',
            'Wear diabetic-friendly footwear',
            'Stay hydrated - drink 8 glasses of water daily',
            'Avoid skipping meals',
            'Take thyroid medication on empty stomach'
        ]
    },

    // Pulmonology
    pulmonology: {
        name: 'Pulmonology',
        icon: '🫁',
        color: '#3498db',
        templates: [
            'Use inhaler as prescribed - proper technique important',
            'Quit smoking immediately',
            'Avoid dust, smoke, and air pollutants',
            'Keep rescue inhaler accessible at all times',
            'Practice breathing exercises daily',
            'Use nebulizer as prescribed',
            'Sleep with head elevated',
            'Avoid cold air exposure',
            'Get annual flu vaccination',
            'Get pneumococcal vaccination',
            'Use peak flow meter daily',
            'Avoid allergens and triggers',
            'Stay in air-conditioned environment during high pollution'
        ]
    },

    // Gastroenterology
    gastroenterology: {
        name: 'Gastroenterology',
        icon: '🫃',
        color: '#27ae60',
        templates: [
            'Follow prescribed diet strictly',
            'Eat small, frequent meals',
            'Avoid spicy, oily, and fried foods',
            'Do not lie down immediately after eating',
            'Avoid alcohol and carbonated beverages',
            'Increase fiber intake gradually',
            'Stay hydrated - drink plenty of water',
            'Take medications before/after meals as directed',
            'Avoid late night eating',
            'Chew food thoroughly',
            'Manage stress - practice relaxation techniques',
            'Avoid NSAIDs - use only if prescribed',
            'Sleep with head elevated for acid reflux',
            'Probiotics may help - as advised'
        ]
    },

    // Neurology
    neurology: {
        name: 'Neurology',
        icon: '🧠',
        color: '#9b59b6',
        templates: [
            'Take medications at the same time daily',
            'Do not stop medications suddenly',
            'Get adequate sleep - 7-8 hours',
            'Avoid alcohol consumption',
            'Avoid driving if seizures are not controlled',
            'Keep seizure diary - note triggers and events',
            'Avoid flashing lights if photosensitive',
            'Wear medical alert bracelet',
            'Stress management important',
            'Physical therapy as advised',
            'Cognitive exercises for memory',
            'Fall prevention measures at home'
        ]
    },

    // General Medicine
    general: {
        name: 'General Medicine',
        icon: '⚕️',
        color: '#16a085',
        templates: [
            'Complete the full course of antibiotics',
            'Rest adequately',
            'Stay well hydrated',
            'Eat a balanced diet',
            'Take medications as prescribed',
            'Follow up if symptoms worsen',
            'Return if fever persists beyond 3 days',
            'Avoid self-medication',
            'Wash hands frequently',
            'Get adequate sleep - 7-8 hours',
            'Light activity as tolerated',
            'Paracetamol for fever - as directed',
            'Avoid crowded places if infectious',
            'Maintain personal hygiene'
        ]
    },

    // Dermatology
    dermatology: {
        name: 'Dermatology',
        icon: '🧴',
        color: '#e67e22',
        templates: [
            'Apply topical medication as directed',
            'Keep affected area clean and dry',
            'Avoid scratching',
            'Use mild, fragrance-free soap',
            'Moisturize regularly',
            'Avoid hot showers - use lukewarm water',
            'Use sunscreen SPF 30+ daily',
            'Avoid direct sun exposure 10am-4pm',
            'Wear loose, cotton clothing',
            'Avoid known allergens and irritants',
            'Complete antifungal course as prescribed',
            'Change bandages daily',
            'Keep nails short to prevent scratching',
            'Identify and avoid triggers'
        ]
    },

    // Infectious Disease
    infectious: {
        name: 'Infectious Disease',
        icon: '🦠',
        color: '#1abc9c',
        templates: [
            'Complete full course of antibiotics/antivirals',
            'Isolate from family members if contagious',
            'Use separate utensils and towels',
            'Wash hands frequently with soap',
            'Wear mask if respiratory infection',
            'Dispose of tissues properly',
            'Disinfect frequently touched surfaces',
            'Monitor temperature twice daily',
            'Stay hydrated - drink plenty of fluids',
            'Rest and avoid work/school until cleared',
            'Report if symptoms worsen',
            'Vaccination as advised',
            'Sexual contacts to be informed if applicable'
        ]
    },

    // Psychiatry
    psychiatry: {
        name: 'Psychiatry',
        icon: '🧘',
        color: '#34495e',
        templates: [
            'Take medications regularly - do not skip doses',
            'Do not stop medications suddenly',
            'Maintain regular sleep schedule',
            'Avoid alcohol and recreational drugs',
            'Practice stress management techniques',
            'Regular exercise - 30 minutes daily',
            'Maintain social connections',
            'Contact doctor if suicidal thoughts occur',
            'Avoid caffeine in the evening',
            'Practice mindfulness or meditation',
            'Maintain a mood diary',
            'Engage in enjoyable activities daily',
            'Seek support from family and friends'
        ]
    },

    // Obstetrics & Gynecology
    obgyn: {
        name: 'OB/GYN',
        icon: '🤰',
        color: '#fd79a8',
        templates: [
            'Take prenatal vitamins daily',
            'Folic acid supplementation as prescribed',
            'Avoid alcohol and smoking',
            'Attend all prenatal checkups',
            'Report any bleeding or unusual symptoms',
            'Avoid heavy lifting',
            'Moderate exercise as approved',
            'Healthy balanced diet',
            'Stay hydrated',
            'Avoid raw/undercooked foods',
            'Count fetal movements daily after 28 weeks',
            'Sleep on left side in third trimester',
            'Avoid certain medications - check before taking any',
            'Report decreased fetal movement immediately'
        ]
    },

    // Pediatrics
    pediatrics: {
        name: 'Pediatrics',
        icon: '👶',
        color: '#00cec9',
        templates: [
            'Ensure child completes full course of medication',
            'Keep child well hydrated',
            'Give medications as per weight-based dosing',
            'Monitor temperature regularly',
            'Report if child becomes lethargic or inconsolable',
            'Maintain vaccination schedule',
            'Follow up if symptoms persist beyond 48 hours',
            'Avoid giving adult medications',
            'Keep away from other children if contagious',
            'Encourage rest and quiet activities',
            'Maintain proper hygiene',
            'Age-appropriate diet as tolerated',
            'ORS for dehydration as directed',
            'Paracetamol for fever - dose as per weight'
        ]
    },

    // Ophthalmology
    ophthalmology: {
        name: 'Ophthalmology',
        icon: '👁️',
        color: '#6c5ce7',
        templates: [
            'Apply eye drops as prescribed',
            'Do not touch or rub eyes',
            'Wash hands before applying eye medications',
            'Use separate towel for affected eye',
            'Wear dark glasses in bright light',
            'Avoid swimming and dust exposure',
            'Do not share eye cosmetics',
            'Rest eyes - limit screen time',
            'Follow 20-20-20 rule for screen use',
            'Warm compress as directed',
            'Report vision changes immediately',
            'Avoid contact lens use until cleared',
            'Protect eyes from injury'
        ]
    },

    // ENT
    ent: {
        name: 'ENT',
        icon: '👂',
        color: '#a29bfe',
        templates: [
            'Complete course of antibiotics as prescribed',
            'Avoid cold foods and drinks',
            'Gargle with warm salt water',
            'Steam inhalation twice daily',
            'Use nasal drops/spray as directed',
            'Avoid picking nose',
            'Keep ear dry - no water entry',
            'Avoid loud noise exposure',
            'Avoid air travel if advised',
            'Do not insert objects in ear',
            'Voice rest if advised',
            'Avoid smoking and smoke exposure',
            'Stay hydrated',
            'Humidify room air if dry'
        ]
    }
};

/**
 * Get all specialty categories
 */
function getAdviceSpecialties() {
    return Object.keys(MEDICAL_ADVICE_TEMPLATES).map(key => ({
        id: key,
        ...MEDICAL_ADVICE_TEMPLATES[key],
        templateCount: MEDICAL_ADVICE_TEMPLATES[key].templates.length
    }));
}

/**
 * Get templates for a specific specialty
 */
function getTemplatesForSpecialty(specialtyId) {
    const specialty = MEDICAL_ADVICE_TEMPLATES[specialtyId];
    return specialty ? specialty.templates : [];
}

/**
 * Search templates across all specialties
 */
function searchAdviceTemplates(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    Object.entries(MEDICAL_ADVICE_TEMPLATES).forEach(([key, specialty]) => {
        specialty.templates.forEach(template => {
            if (template.toLowerCase().includes(lowerQuery)) {
                results.push({
                    specialtyId: key,
                    specialtyName: specialty.name,
                    icon: specialty.icon,
                    color: specialty.color,
                    template: template
                });
            }
        });
    });
    
    return results;
}

// Export for use in other modules
window.AdviceTemplates = {
    data: MEDICAL_ADVICE_TEMPLATES,
    getSpecialties: getAdviceSpecialties,
    getTemplates: getTemplatesForSpecialty,
    search: searchAdviceTemplates
};
