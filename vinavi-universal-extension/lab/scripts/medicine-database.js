/**
 * HMH Medicine Database
 * Local database of commonly prescribed medications
 * Updated: December 2025
 */

const MedicineDatabase = {
  medicines: [
    // ANTIHISTAMINES - Only medicines with Vinavi IDs from Aasandha
    { id: '3636', vinaviId: '3636', vinaviCode: 'M1148', mfdaCode: 'P2264', name: 'Fexofen', generic: 'Fexofenadine', genericId: '6686', strength: '180 mg', form: 'Tablet', category: 'Antihistamine', injectable: true },
    { id: '3637', vinaviId: '3637', vinaviCode: 'M1149', mfdaCode: 'P2265', name: 'Fexofen', generic: 'Fexofenadine', genericId: '6678', strength: '120 mg', form: 'Tablet', category: 'Antihistamine', injectable: true },
    { id: '6720', vinaviId: '6720', vinaviCode: '', mfdaCode: '', name: 'Fexofenadine', generic: 'Fexofenadine', genericId: '9762', strength: '30 mg', form: 'Tablet', category: 'Antihistamine', injectable: false },
    { id: '6747', vinaviId: '6747', vinaviCode: '', mfdaCode: '', name: 'Fexofenadine', generic: 'Fexofenadine', genericId: '9762', strength: '60 mg', form: 'Tablet', category: 'Antihistamine', injectable: false },
    { id: '6678', vinaviId: '6678', vinaviCode: '', mfdaCode: '', name: 'Fexofenadine', generic: 'Fexofenadine', genericId: '6678', strength: '120 mg', form: 'Tablet', category: 'Antihistamine', injectable: false },
    { id: '6686', vinaviId: '6686', vinaviCode: '', mfdaCode: '', name: 'Fexofenadine', generic: 'Fexofenadine', genericId: '6686', strength: '180 mg', form: 'Tablet', category: 'Antihistamine', injectable: false },
    { id: '6693', vinaviId: '6693', vinaviCode: '', mfdaCode: '', name: 'Fexofenadine', generic: 'Fexofenadine', genericId: '6693', strength: '60 mg per 5 ml', form: 'Oral Liquid', category: 'Antihistamine', injectable: false },
    { id: '7271', vinaviId: '7271', vinaviCode: '', mfdaCode: '', name: 'Fexofenadine', generic: 'Fexofenadine', genericId: '7271', strength: '30 mg in 5 ml', form: 'Oral Liquid', category: 'Antihistamine', injectable: false },
    
    // SUPPLEMENTS
    { id: '6573', vinaviId: '6573', vinaviCode: '', mfdaCode: '', name: 'Ferrous Fumarate + Cyanocobalamin + Folic Acid + Ascorbic Acid + Pyridoxide Hydrochloride + Zinc Sulfate Monohydrate', generic: 'Iron Complex', strength: '350 mg + 5 mcg + 1 mg + 75 mg + 1.5 mg + 55 mg', form: 'Capsule', category: 'Supplement', injectable: false },
    
    // ANTIBIOTICS - Augmentin (Amoxicillin + Clavulanic Acid)
    { id: '2841', vinaviId: '2841', vinaviCode: 'M0163', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6449', strength: '250 mg + 125 mg', form: 'Tablet', category: 'Antibiotic', injectable: true },
    { id: '2843', vinaviId: '2843', vinaviCode: 'M0165', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6471', strength: '500 mg + 125 mg', form: 'Tablet', category: 'Antibiotic', injectable: true },
    { id: '10081', vinaviId: '10081', vinaviCode: 'HM0380', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '7298', strength: '875 mg + 125 mg', form: 'Tablet', category: 'Antibiotic', injectable: false },
    { id: '2838', vinaviId: '2838', vinaviCode: 'M0160', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6426', strength: '1000 mg + 200 mg', form: 'Injection', category: 'Antibiotic', injectable: true },
    { id: '2842', vinaviId: '2842', vinaviCode: 'M0164', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6459', strength: '500 mg + 100 mg', form: 'Injection', category: 'Antibiotic', injectable: true },
    { id: '2851', vinaviId: '2851', vinaviCode: 'M0173', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '8330', strength: '50 mg + 12.5 mg', form: 'Oral Drops', volume: '15 ml', category: 'Antibiotic', injectable: true },
    { id: '9514', vinaviId: '9514', vinaviCode: 'HM0208', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6426', strength: '1000 mg + 200 mg', form: 'Injection', category: 'Antibiotic', injectable: false },
    { id: '2839', vinaviId: '2839', vinaviCode: 'M0161', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6433', strength: '156 mg per 5 ml', form: 'Oral Liquid', category: 'Antibiotic', injectable: true },
    { id: '2840', vinaviId: '2840', vinaviCode: 'M0162', mfdaCode: '', name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6440', strength: '200 mg + 28.5 mg per 5 ml', form: 'Oral Liquid', category: 'Antibiotic', injectable: true },
    { id: '9676', vinaviId: '9676', vinaviCode: 'M3751', mfdaCode: '', name: 'Augment 1.2', generic: 'Amoxicillin + Clavulanic Acid', genericId: '6426', strength: '1000 mg + 200 mg', form: 'Injection', category: 'Antibiotic', injectable: true },
    
    // TOPICAL - Gels and Creams
    { id: '10003', vinaviId: '10003', vinaviCode: 'M3838', mfdaCode: '', name: 'Fastum Gel', generic: 'Ketoprofen + Ethanol', genericId: '9986', strength: '2.5 gm + 40 ml', form: 'Gel', volume: '10 g', category: 'Topical NSAID', injectable: true },
    { id: '10004', vinaviId: '10004', vinaviCode: 'M3839', mfdaCode: '', name: 'Fastum Gel', generic: 'Ketoprofen + Ethanol', genericId: '9986', strength: '2.5 gm + 40 ml', form: 'Gel', volume: '30 g', category: 'Topical NSAID', injectable: true },
    { id: '4888', vinaviId: '4888', vinaviCode: 'M2934', mfdaCode: '', name: 'Voltaren Emulgel', generic: 'Diclofenac Diethylammonium', genericId: '8488', strength: '1%', form: 'Gel', volume: '50 gm', category: 'Topical NSAID', injectable: true },
    { id: '3467', vinaviId: '3467', vinaviCode: 'M0935', mfdaCode: '', name: 'Voltaren Emulgel', generic: 'Diclofenac Diethylammonium', genericId: '8488', strength: '1%', form: 'Gel', volume: '20 gm', category: 'Topical NSAID', injectable: true },
    { id: '2734', vinaviId: '2734', vinaviCode: 'M0041', mfdaCode: '', name: 'Deriva Aqueous Gel', generic: 'Adapalene', genericId: '7630', strength: '1%', form: 'Gel', category: 'Dermatological', injectable: true },
    { id: '9689', vinaviId: '9689', vinaviCode: 'M3763', mfdaCode: '', name: 'Oracue Gel', generic: 'Cetalkonium Chloride + Choline Salicylate', genericId: '8548', strength: '8.7% + 0.01%', form: 'Gel (Oral)', volume: '10 gm', category: 'Oral', injectable: true },
    { id: '7489', vinaviId: '7489', vinaviCode: '', mfdaCode: '', name: 'Diclofenac Sodium', generic: 'Diclofenac Sodium', genericId: '', strength: '10 mg per g', form: 'Gel', category: 'Topical NSAID', injectable: false },
    
    // ANTIPLATELETS
    { id: '5513', vinaviId: '5513', vinaviCode: 'TM0265', mfdaCode: '', name: 'Prasugrel', generic: 'Prasugrel', genericId: '7332', strength: '10 mg', form: 'Tablet', category: 'Antiplatelet', injectable: false },
    { id: '7332', vinaviId: '7332', vinaviCode: '', mfdaCode: '', name: 'Prasugrel', generic: 'Prasugrel', genericId: '', strength: '10 mg', form: 'Tablet', category: 'Antiplatelet', injectable: false },
    
    // NASAL
    { id: '7309', vinaviId: '7309', vinaviCode: '', mfdaCode: '', name: 'Fusafungine', generic: 'Fusafungine', genericId: '', strength: '1%', form: 'Nasal Spray', category: 'Nasal', injectable: false },
    
    // DIURETICS
    { id: '9444', vinaviId: '9444', vinaviCode: 'HM0124', mfdaCode: '', name: 'Aquazide 12.5mg', generic: 'Hydrochlorothiazide', genericId: '6523', strength: '12.5 mg', form: 'Tablet', category: 'Diuretic', injectable: false },
    
    // ANTIFUNGALS
    { id: '8945', vinaviId: '8945', vinaviCode: 'M3544', mfdaCode: '', name: 'Antifungal Cream', generic: 'Miconazole', genericId: '8943', strength: '20 mg', form: 'Cream', volume: '10 g', category: 'Antifungal', injectable: true },
    { id: '3373', vinaviId: '3373', vinaviCode: 'M0814', mfdaCode: '', name: 'Surfaz Dusting Powder', generic: 'Clotrimazole', genericId: '6645', strength: '1%', form: 'Powder', category: 'Antifungal', injectable: true },
    { id: '9067', vinaviId: '9067', vinaviCode: 'M3568', mfdaCode: '', name: 'Candid Dusting Powder', generic: 'Clotrimazole', genericId: '6645', strength: '1%', form: 'Powder', volume: '100 gm', category: 'Antifungal', injectable: true },
    { id: '9068', vinaviId: '9068', vinaviCode: 'M3569', mfdaCode: '', name: 'Candid Dusting Powder', generic: 'Clotrimazole', genericId: '6645', strength: '1%', form: 'Powder', volume: '30 gm', category: 'Antifungal', injectable: true },
    
    // MISCELLANEOUS
    { id: '5510', vinaviId: '5510', vinaviCode: 'TM0262', mfdaCode: '', name: 'Potassium Permanganate', generic: 'Potassium Permanganate', genericId: '7314', strength: '250 mg', form: 'Crystals', category: 'Antiseptic', injectable: false },
    { id: '7314', vinaviId: '7314', vinaviCode: '', mfdaCode: '', name: 'Potassium Permanganate', generic: 'Potassium Permanganate', genericId: '', strength: '250 mg', form: 'Crystals', category: 'Antiseptic', injectable: false },
    
    // PREGABALIN
    { id: '9237', vinaviId: '9237', vinaviCode: 'M3677', mfdaCode: '', name: 'Pregarut 75', generic: 'Pregabalin', genericId: '9233', strength: '75 mg', form: 'Hard gelatin Capsule', category: 'Neuropathic', injectable: true },
    
    // IMMUNOGLOBULINS
    { id: '5265', vinaviId: '5265', vinaviCode: 'TM0015', mfdaCode: '', name: 'Human Anti D Immunoglobulin', generic: 'Human Anti D Immunoglobulin', genericId: '7396', strength: '300 mcg', form: 'Injection', category: 'Immunoglobulin', injectable: false },
    { id: '7396', vinaviId: '7396', vinaviCode: '', mfdaCode: '', name: 'Human Anti D Immunoglobulin', generic: 'Human Anti D Immunoglobulin', genericId: '', strength: '300 mcg', form: 'Injection', category: 'Immunoglobulin', injectable: false },
    
    // ELECTROLYTES
    { id: '7848', vinaviId: '7848', vinaviCode: '', mfdaCode: '', name: 'Potassium Magnesium Citrate', generic: 'Potassium Magnesium Citrate', genericId: '', strength: '978 mg', form: 'Capsule', category: 'Electrolyte', injectable: false },
    { id: '6090', vinaviId: '6090', vinaviCode: 'TM0657', mfdaCode: '', name: 'Potassium Magnesium Citrate', generic: 'Potassium Magnesium Citrate', genericId: '7848', strength: '978 mg', form: 'Capsule', category: 'Electrolyte', injectable: false },
    
    // RESPIRATORY - Salbutamol Combinations
    { id: '8713', vinaviId: '8713', vinaviCode: '', mfdaCode: '', name: 'Salbutamol + Guaiphenesin', generic: 'Salbutamol + Guaiphenesin', genericId: '', strength: '1mg + 50mg per 5 ml', form: 'Oral Liquid', category: 'Respiratory', injectable: false },
    { id: '6859', vinaviId: '6859', vinaviCode: '', mfdaCode: '', name: 'Salbutamol + Guaphenesin', generic: 'Salbutamol + Guaphenesin', genericId: '', strength: '1.2 mg + 50 mg per 5 ml', form: 'Oral Liquid', category: 'Respiratory', injectable: false },
    { id: '8005', vinaviId: '8005', vinaviCode: '', mfdaCode: '', name: 'Levosalbutamol Sulphate + Guaiphenesin', generic: 'Levosalbutamol Sulphate + Guaiphenesin', genericId: '', strength: '0.5mg + 50 mg in 5 ml', form: 'Oral Liquid', category: 'Respiratory', injectable: false },
    
    // INSULIN
    { id: '9298', vinaviId: '9298', vinaviCode: 'B0010', mfdaCode: '', name: 'Insulin Analogue long acting Glargine', generic: 'Insulin Glargine', genericId: '8162', strength: '100 IU per ml', form: 'Injection', volume: '3 ml', category: 'Antidiabetic', injectable: false },
    
    // OPHTHALMIC
    { id: '3441', vinaviId: '3441', vinaviCode: 'M0903', mfdaCode: '', name: 'Bion Tears Lubricating Eye Drops', generic: 'Dextran 70 + Hydroxypropyl Methylcellulose', genericId: '6396', strength: '0.1% + 0.3%', form: 'Ophthalmic Solution', category: 'Ophthalmic', injectable: true },
    
    // WOUND CARE
    { id: '7290', vinaviId: '7290', vinaviCode: '', mfdaCode: '', name: 'Amorphous Hydrogel + Colloidal Silver', generic: 'Amorphous Hydrogel + Colloidal Silver', genericId: '', strength: '32 ppm', form: 'Gel', category: 'Wound Care', injectable: false },
    { id: '6019', vinaviId: '6019', vinaviCode: 'TM0581', mfdaCode: '', name: 'Amorphous Hydrogel + Colloidal Silver', generic: 'Amorphous Hydrogel + Colloidal Silver', genericId: '7290', strength: '32 ppm', form: 'Gel', category: 'Wound Care', injectable: false },
    
    // ANTIDIABETICS - Glimepiride
    { id: '3774', vinaviId: '3774', vinaviCode: 'M1308', mfdaCode: '', name: 'Azulix', generic: 'Glimepiride', genericId: '7659', strength: '1 mg', form: 'Tablet', category: 'Antidiabetic', injectable: true },
    { id: '3775', vinaviId: '3775', vinaviCode: 'M1309', mfdaCode: '', name: 'Azulix', generic: 'Glimepiride', genericId: '7667', strength: '2 mg', form: 'Tablet', category: 'Antidiabetic', injectable: true },
    { id: '3776', vinaviId: '3776', vinaviCode: 'M1310', mfdaCode: '', name: 'Azulix', generic: 'Glimepiride', genericId: '7685', strength: '4 mg', form: 'Tablet', category: 'Antidiabetic', injectable: true },
    
    // GASTROINTESTINAL - Ispagula
    { id: '7404', vinaviId: '7404', vinaviCode: '', mfdaCode: '', name: 'Ispagula', generic: 'Ispagula', genericId: '', strength: '3.5 mg', form: 'Oral Solution (Powder)', category: 'Gastrointestinal', injectable: false },
    
    // ANTIDIABETICS - DPP-4 Inhibitors
    { id: '4767', vinaviId: '4767', vinaviCode: 'M2692', mfdaCode: '', name: 'Galvus', generic: 'Vildagliptin', genericId: '7513', strength: '50 mg', form: 'Tablet', category: 'Antidiabetic', notes: 'Doctor remarks required, has bulk medicine', injectable: true },
    
    // SUPPLEMENTS - Glucosamine
    { id: '5834', vinaviId: '5834', vinaviCode: 'M3324', mfdaCode: '', name: 'Ultra Glucosamin', generic: 'Glucosamine Sulphate', genericId: '7847', strength: '750 mg', form: 'Tablet', category: 'Supplement', injectable: true },
    
    // SUPPLEMENTS - Calcium/Magnesium/D3
    { id: '5851', vinaviId: '5851', vinaviCode: 'M3341', mfdaCode: '', name: 'Sunlife Calcium + Magnesium +D3 Sticks', generic: 'Magnesium + Calcium + Vitamin D3', genericId: '7985', strength: '300 mg + 600 mg + 5 mcg', form: 'Sachet (Stick)', volume: 'Per Sachets', category: 'Supplement', injectable: true },
    
    // IRON CHELATORS
    { id: '9211', vinaviId: '9211', vinaviCode: 'M3664', mfdaCode: '', name: 'Jadenu', generic: 'Deferasirox', genericId: '9207', strength: '90 mg', form: 'Tablet', category: 'Iron Chelator', injectable: true },
    { id: '3423', vinaviId: '3423', vinaviCode: 'M0880', mfdaCode: '', name: 'Asunra', generic: 'Deferasirox', genericId: '7018', strength: '400 mg', form: 'Tablet', category: 'Iron Chelator', injectable: true },
    { id: '3424', vinaviId: '3424', vinaviCode: 'M0881', mfdaCode: '', name: 'Asunra', generic: 'Deferasirox', genericId: '7025', strength: '100 mg', form: 'Tablet', category: 'Iron Chelator', injectable: true },
    
    // ANTIBIOTICS - Topical
    { id: '9214', vinaviId: '9214', vinaviCode: '', mfdaCode: '', name: 'Gentamicin Sulfate Equivalent To Gentamicin', generic: 'Gentamicin', genericId: '', strength: '1 mg (0.1%)', form: 'Cream', category: 'Antibiotic', injectable: false },
  ],

  /**
   * Search medicines by query - show all medicines, mark injectable ones
   */
  search(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();
    
    // Return all matching medicines
    const results = this.medicines.filter(med => {
      return med.name.toLowerCase().includes(searchTerm) ||
             med.generic.toLowerCase().includes(searchTerm) ||
             med.category.toLowerCase().includes(searchTerm) ||
             (med.vinaviCode && med.vinaviCode.toLowerCase().includes(searchTerm));
    });
    
    // Sort: injectable (with vinaviId) first, then others
    return results.sort((a, b) => {
      const aInjectable = a.vinaviId && a.vinaviId.length > 0;
      const bInjectable = b.vinaviId && b.vinaviId.length > 0;
      if (aInjectable && !bInjectable) return -1;
      if (!aInjectable && bInjectable) return 1;
      return 0;
    });
  },

  /**
   * Get medicine by Vinavi ID (for injection)
   */
  getByVinaviId(vinaviId) {
    return this.medicines.find(med => med.vinaviId === vinaviId);
  },

  /**
   * Get medicine by ID
   */
  getById(id) {
    return this.medicines.find(med => med.id === id);
  },

  /**
   * Get all medicines in a category
   */
  getByCategory(category) {
    return this.medicines.filter(med => 
      med.category.toLowerCase() === category.toLowerCase()
    );
  },

  /**
   * Get all unique categories
   */
  getCategories() {
    const categories = [...new Set(this.medicines.map(med => med.category))];
    return categories.sort();
  },

  /**
   * Import medicines from Aasandha API JSON response
   * Paste the JSON from Network tab and it will extract medicines
   */
  importFromAasandhaJSON(jsonData) {
    const imported = [];
    
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const medicines = data.data || [];
      
      medicines.forEach(med => {
        const attrs = med.attributes || {};
        
        // Skip if not prescribable or not a product
        if (attrs.is_prescribable === false || attrs.type === 'grouping') {
          return;
        }
        
        const newMed = {
          id: med.id || `MED${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
          vinaviCode: attrs.code || '',
          mfdaCode: attrs.mfda_code || '',
          name: attrs.name || '',
          generic: attrs.generic_medicine?.name || attrs.name || '',
          strength: attrs.strength || '',
          form: attrs.preparation || attrs.form || '',
          category: this.guessCategory(attrs.name, attrs.generic_medicine?.name)
        };
        
        // Check if already exists
        const exists = this.medicines.find(m => 
          m.vinaviCode === newMed.vinaviCode || 
          (m.name === newMed.name && m.strength === newMed.strength && m.form === newMed.form)
        );
        
        if (!exists) {
          this.medicines.push(newMed);
          imported.push(newMed);
        }
      });
      
      console.log(`Imported ${imported.length} new medicines`);
      return imported;
    } catch (error) {
      console.error('Failed to import medicines:', error);
      return [];
    }
  },

  /**
   * Guess category based on medicine name
   */
  guessCategory(name, genericName) {
    const searchText = `${name} ${genericName}`.toLowerCase();
    
    if (/paracetamol|ibuprofen|diclofenac|tramadol|aspirin|naproxen/.test(searchText)) return 'Analgesic';
    if (/amoxicillin|azithromycin|ciprofloxacin|cephalexin|metronidazole|doxycycline|augmentin/.test(searchText)) return 'Antibiotic';
    if (/fexofenadine|cetirizine|loratadine|chlorpheniramine/.test(searchText)) return 'Antihistamine';
    if (/amlodipine|enalapril|losartan|atenolol|bisoprolol|valsartan/.test(searchText)) return 'Antihypertensive';
    if (/metformin|glibenclamide|gliclazide|insulin/.test(searchText)) return 'Antidiabetic';
    if (/omeprazole|ranitidine|domperidone|ondansetron|loperamide|lactulose/.test(searchText)) return 'Gastrointestinal';
    if (/salbutamol|prednisolone|beclometasone|montelukast/.test(searchText)) return 'Respiratory';
    if (/folic|vitamin|calcium|iron|zinc/.test(searchText)) return 'Vitamin/Supplement';
    if (/atorvastatin|simvastatin|clopidogrel/.test(searchText)) return 'Cardiovascular';
    if (/betamethasone|hydrocortisone|fusidic|clotrimazole/.test(searchText)) return 'Dermatological';
    
    return 'General';
  },

  /**
   * Export database as JSON for backup/transfer
   */
  exportToJSON() {
    return JSON.stringify(this.medicines, null, 2);
  },

  /**
   * Import database from JSON backup
   */
  importFromJSON(jsonString) {
    try {
      const medicines = JSON.parse(jsonString);
      if (Array.isArray(medicines)) {
        this.medicines = medicines;
        console.log(`Loaded ${medicines.length} medicines from backup`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import database:', error);
      return false;
    }
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.MedicineDatabase = MedicineDatabase;
}
