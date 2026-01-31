// lab-bundles.js
// Common laboratory test bundles for quick selection / push.
// Each bundle lists tests as { code, asnd, name }. Codes should match catalog.
// Optionally include pre-mapped serviceIds to skip lookup.

(function(){
  const bundles = [
    {
      id: 'cbc',
      name: 'CBC (Complete Blood Count)',
      icon: '🩸',
      tests: [
        { code: '920', asnd: 'L0118', name: 'Complete Hemogram' },
        { code: '9558', asnd: 'L0079', name: 'Total RBC Count' },
        { code: '9577', asnd: 'L0020', name: 'Platelet Count(PLT)' },
        { code: '9463', asnd: 'L0007', name: 'ESR' }
      ]
    },
    {
      id: 'bmp',
      name: 'Basic Metabolic Panel',
      icon: '🧪',
      tests: [
        { code: '1172', asnd: 'L0055', name: 'Serum Sodium' },
        { code: '1170', asnd: 'L0056', name: 'Serum Potassium' },
        { code: '1154', asnd: 'L0057', name: 'Serum Chloride' },
        { code: '1152', asnd: 'L0038', name: 'Serum Calcium' },
        { code: '9649', asnd: 'L0290', name: 'Serum Bicarbonate' },
        { code: '1117', asnd: 'L0027', name: 'Random Blood Sugar' },
        { code: '1155', asnd: 'L0035', name: 'Serum Creatinine' },
        { code: '890',  asnd: 'L0033', name: 'Urea' }
      ]
    },
    {
      id: 'cardiac',
      name: 'Cardiac Panel',
      icon: '❤️',
      tests: [
        { code: '9725', asnd: 'L0074', name: 'CK' },
        { code: '927',  asnd: 'L0106', name: 'CK-MB' },
        { code: '9658', asnd: 'L0116', name: 'Troponin-T' },
        { code: '3982', asnd: 'L1056', name: 'D-Dimer' },
        { code: '9502', asnd: 'L0798', name: 'Myoglobin' }
      ]
    },
    {
      id: 'thyroid',
      name: 'Thyroid Panel',
      icon: '🦋',
      tests: [
        { code: '870',  asnd: 'L0142', name: 'TSH' },
        { code: '975',  asnd: 'L0257', name: 'FT4' },
        { code: '974',  asnd: 'L0258', name: 'Free T3' },
        { code: '1194', asnd: 'L0141', name: 'T4' },
        { code: '1192', asnd: 'L0140', name: 'T3' }
      ]
    },
    {
      id: 'lipid',
      name: 'Lipid Profile Extended',
      icon: '🧬',
      tests: [
        { code: '1781', asnd: 'L0115', name: 'LIPID PROFILE' },
        { code: '1207', asnd: 'L0187', name: 'Serum Total Cholesterol' },
        { code: '1177', asnd: 'L0051', name: 'Serum Triglycerides' },
        { code: '999',  asnd: 'L0052', name: 'HDL Cholesterol' },
        { code: '1026', asnd: '',      name: 'LDL Cholesterol' }
      ]
    }
  ];

  window.LabBundles = Object.freeze({
    all: bundles,
    get(id){ return bundles.find(b => b.id === id); }
  });
})();
