/**
 * Fullscreen Lab Catalog Popup
 * Opens a fullscreen modal for selecting lab tests - easier to use than inline checkboxes
 */

class FullscreenLabCatalog {
  constructor() {
    this.isOpen = false;
    this.selectedTests = new Map();
    this.onConfirmCallback = null;
    this.episodeId = null;
    this.diagnosisId = null;
    this.catalogData = null;
    
    // Load catalog data - delayed to allow LAB_DATA to be set
    setTimeout(() => this.loadCatalogData(), 100);
  }

  loadCatalogData() {
    // Try to get LAB_DATA from window first (lab-catalog.js may have loaded it)
    if (window.LAB_DATA && Object.keys(window.LAB_DATA).length > 20) {
      this.catalogData = window.LAB_DATA;
      console.log('[FullscreenCatalog] LAB_DATA loaded from window:', Object.keys(this.catalogData).length, 'categories');
    } else {
      // Define complete LAB_DATA directly
      this.catalogData = this.getDefaultLabData();
      // Also set to window for other scripts
      window.LAB_DATA = this.catalogData;
      console.log('[FullscreenCatalog] LAB_DATA created from default:', Object.keys(this.catalogData).length, 'categories');
    }
  }
  
  getDefaultLabData() {
    // This is the complete LAB_DATA from lab-catalog.js
    return {
      'HAEMATOLOGY': [
        { code: '920', asnd: 'L0118', name: 'Complete Hemogram' },
        { code: '4778', asnd: 'L0017', name: 'Hb/PCV' },
        { code: '9615', asnd: 'L0012', name: 'TLC' },
        { code: '9616', asnd: 'L0013', name: 'DLC' },
        { code: '9463', asnd: 'L0007', name: 'ESR' },
        { code: '9558', asnd: 'L0079', name: 'Total RBC Count' },
        { code: '9455', asnd: 'L0019', name: 'Reticulocyte Count' },
        { code: '9577', asnd: 'L0020', name: 'Platelet Count(PLT)' },
        { code: '9450', asnd: 'L0021', name: 'AEC' },
        { code: '9617', asnd: 'L0018', name: 'Blood Picture' },
        { code: '9618', asnd: 'L0030', name: 'Sickling Test' },
        { code: '1162', asnd: 'L0065', name: 'Serum Iron' },
        { code: '9416', asnd: 'L0093', name: 'Serum TIBC' },
        { code: '1159', asnd: 'L0105', name: 'Serum Ferrittin' },
        { code: '9619', asnd: 'L0075', name: 'G6PD (Qualitative)', blocked: true },
        { code: '9620', asnd: 'L0076', name: 'G6PD (Quantitative)' },
        { code: '9621', asnd: 'L0031', name: 'Blood Grouping & Rh Typing' },
        { code: '9622', asnd: 'L0014', name: 'Bleeding Time' },
        { code: '9623', asnd: 'L0015', name: 'Clotting Time' },
        { code: '9479', asnd: 'L0094', name: 'Prothrombin Time / INR' },
        { code: '9480', asnd: 'L0102', name: 'APTT' },
        { code: '9483', asnd: 'L0224', name: 'Thrombin Time' },
        { code: '9624', asnd: 'L0219', name: 'Coagulogram (PT, APTT,TT)' },
        { code: '932', asnd: 'L0088', name: 'CRP' }
      ],
      'CLINICAL PATHOLOGY': [
        { code: '1227', asnd: 'L0023', name: 'Urine Analysis' },
        { code: '1237', asnd: 'L0002', name: 'Specific Gravity' },
        { code: '9437', asnd: 'L0271', name: 'Urine Albumin' },
        { code: '1233', asnd: 'L0003', name: 'Urine Glucose' },
        { code: '1234', asnd: 'L0220', name: 'Urine Glucose (Fasting)' },
        { code: '1235', asnd: 'L0221', name: 'Urine Glucose (Post Prandial)' },
        { code: '9632', asnd: 'L0004', name: 'Deposit & Microscopy' },
        { code: '1017', asnd: 'L0005', name: 'Ketone Bodies' },
        { code: '1230', asnd: 'L0306', name: 'Urine Bilirubin' },
        { code: '9572', asnd: 'L0006', name: 'pH' },
        { code: '9635', asnd: 'L0024', name: 'Porphobilinogen (PBG)' },
        { code: '1228', asnd: 'L0010', name: 'Urine Bence Jones Protein' },
        { code: '9435', asnd: 'L0072', name: '24hr Urinary Proteins' },
        { code: '9641', asnd: 'L0109', name: 'Urine for Pregnancy Test' },
        { code: '9640', asnd: 'L0095', name: 'Microalbumin' },
        { code: '9625', asnd: 'L0025', name: 'Stool R/E' },
        { code: '9626', asnd: 'L0016', name: 'Occult Blood' },
        { code: '9630', asnd: 'L0091', name: 'Semen Analysis' }
      ],
      'ELECTROLYTES': [
        { code: '1152', asnd: 'L0038', name: 'Serum Calcium' },
        { code: '1172', asnd: 'L0055', name: 'Serum Sodium' },
        { code: '1170', asnd: 'L0056', name: 'Serum Potassium' },
        { code: '1154', asnd: 'L0057', name: 'Serum Chloride' },
        { code: '1165', asnd: 'L0058', name: 'Serum Magnesium' },
        { code: '1169', asnd: 'L0039', name: 'Serum Phosphorous' },
        { code: '9649', asnd: 'L0290', name: 'Serum Bicarbonate' }
      ],
      'DIABETOLOGY': [
        { code: '1117', asnd: 'L0027', name: 'Random Blood Sugar (RBS)' },
        { code: '9401', asnd: 'L0028', name: 'Fasting Blood Sugar' },
        { code: '9651', asnd: 'L0210', name: 'Post Prandial Blood Sugar' },
        { code: '1146', asnd: 'L0001', name: 'Serum Amylase' },
        { code: '985', asnd: 'L0103', name: 'Glycoseylate Hb' },
        { code: '1044', asnd: 'L0222', name: 'Lipase' },
        { code: '924', asnd: 'L0282', name: 'C-Peptide' },
        { code: '9654', asnd: 'L0202', name: 'Glucose Tolerance Test (GTT)' }
      ],
      'CARDIAC PROFILE': [
        { code: '', asnd: 'L0180', name: 'Cardiac Profile' },
        { code: '9725', asnd: 'L0074', name: 'CK' },
        { code: '927', asnd: 'L0106', name: 'CK-MB' },
        { code: '9405', asnd: 'L0037', name: 'Lactate Dehydrogenase' },
        { code: '9658', asnd: 'L0116', name: 'Troponin-T' },
        { code: '9502', asnd: 'L0413', name: 'Myoglobin' },
        { code: '3982', asnd: 'L0427', name: 'D-Dimer' }
      ],
      'LIPID PROFILE': [
        { code: '1781', asnd: 'L0115', name: 'LIPID PROFILE' },
        { code: '1207', asnd: 'L0187', name: 'Serum Total Cholesterol' },
        { code: '1177', asnd: 'L0051', name: 'Serum Triglycerides' },
        { code: '999', asnd: 'L0052', name: 'HDL Cholesterol' },
        { code: '1026', asnd: 'L0286', name: 'LDL Cholesterol' },
        { code: '9550', asnd: 'L0287', name: 'VLDL' },
        { code: '9552', asnd: 'L0285', name: 'Cholesterol / HDL Ratio' },
        { code: '1046', asnd: 'L0335', name: 'lipoprotein A' },
        { code: '9017', asnd: 'L0439', name: 'HCY' }
      ],
      'LIVER PROFILE': [
        { code: '1831', asnd: 'L0148', name: 'LIVER Profile' },
        { code: '1179', asnd: 'L0043', name: 'AST' },
        { code: '1180', asnd: 'L0042', name: 'ALT' },
        { code: '981', asnd: 'L0053', name: 'GGT' },
        { code: '1144', asnd: 'L0044', name: 'Serum Alkaline Phosphatase' },
        { code: '1157', asnd: 'L0041', name: 'Direct Bilirubin' },
        { code: '1176', asnd: 'L0045', name: 'Total Protien' },
        { code: '1175', asnd: 'L0040', name: 'Serum Total Bilirubin' },
        { code: '1143', asnd: 'L0046', name: 'Serum Albumin' },
        { code: '9411', asnd: 'L0054', name: 'Serum Ammonia' }
      ],
      'RENAL PROFILE': [
        { code: '1774', asnd: 'L0248', name: 'Renal Profile' },
        { code: '', asnd: 'L0033', name: 'Blood Urea' },
        { code: '', asnd: 'L0034', name: 'Blood Urea Nitrogen (BUN)' },
        { code: '1155', asnd: 'L0035', name: 'Serum Creatinine' },
        { code: '1178', asnd: 'L0036', name: 'Serum Uric Acid' },
        { code: '890', asnd: 'L0033', name: 'Urea' },
        { code: '9671', asnd: 'L0096', name: 'Creatinine Clearance Test' },
        { code: '1159', asnd: 'L0105', name: 'Ferritin' },
        { code: '1166', asnd: 'L0104', name: 'Serum Follate' }
      ],
      'THYROID PROFILE': [
        { code: '1852', asnd: 'L0231', name: 'Thyroid Profile' },
        { code: '975', asnd: 'L0257', name: 'FT4' },
        { code: '1192', asnd: 'L0140', name: 'T3' },
        { code: '870', asnd: 'L0142', name: 'TSH' },
        { code: '1224', asnd: 'L0228', name: 'Anti TPO' },
        { code: '875', asnd: 'L0122', name: 'Anti TG' },
        { code: '1194', asnd: 'L0141', name: 'T4' },
        { code: '974', asnd: 'L0258', name: 'Free T3' }
      ],
      'FERTILITY HORMONES': [
        { code: '1057', asnd: 'L0119', name: 'LH' },
        { code: '971', asnd: 'L0112', name: 'FSH' },
        { code: '1106', asnd: 'L0147', name: 'PRL' },
        { code: '1197', asnd: 'L0124', name: 'Testosterone' },
        { code: '5111', asnd: 'L0360', name: 'Testosterone (Total)' },
        { code: '1105', asnd: 'L0113', name: 'Progesterone' },
        { code: '1147', asnd: 'L0114', name: 'Serum B-HCG' },
        { code: '959', asnd: 'L0126', name: 'Estradiol' },
        { code: '9676', asnd: 'LR1031', name: 'AMH' }
      ],
      'MICROBIOLOGY': [
        { code: '9692', asnd: 'L0060', name: 'Urine C/S' },
        { code: '9693', asnd: 'L0063', name: 'Sputum C/S' },
        { code: '9694', asnd: 'L0062', name: 'Stool C/S' },
        { code: '9695', asnd: 'L0061', name: 'Blood C/S' },
        { code: '9696', asnd: 'L0067', name: 'Throat Swab C/S' },
        { code: '9697', asnd: 'L0068', name: 'Ear Swab C/S' },
        { code: '9698', asnd: 'L0064', name: 'Wound Swab C/S' },
        { code: '9699', asnd: 'L0066', name: 'CSF C/S' }
      ],
      'SEROLOGY': [
        { code: '1242', asnd: 'L0081', name: 'Widal' },
        { code: '1240', asnd: 'L0082', name: 'VDRL/RPR' },
        { code: '9702', asnd: 'L0085', name: 'ASOT' },
        { code: '9703', asnd: 'L0086', name: 'RA Factor' },
        { code: '1155', asnd: 'L0107', name: 'Anti CCP' },
        { code: '869', asnd: 'L0098', name: 'ANA' },
        { code: '871', asnd: 'L0166', name: 'Anti dsDNA' },
        { code: '9724', asnd: 'L0089', name: 'HBsAg (ELISA)' },
        { code: '991', asnd: 'L0090', name: 'Anti-HCV' },
        { code: '993', asnd: 'L0087', name: 'HIV I/II Abs' },
        { code: '1239', asnd: 'L0078', name: 'CMV IgG' },
        { code: '1238', asnd: 'L0200', name: 'CMV IgM' },
        { code: '9468', asnd: 'L0225', name: 'Dengue NS1' },
        { code: '9469', asnd: 'L0226', name: 'Dengue IgG' },
        { code: '9470', asnd: 'L0227', name: 'Dengue IgM' }
      ],
      'TUMOR MARKERS': [
        { code: '856', asnd: 'L0166', name: 'AFP' },
        { code: '903', asnd: 'L0151', name: 'CEA' },
        { code: '9015', asnd: 'L0152', name: 'Total PSA' },
        { code: '9773', asnd: 'L0374', name: 'F-PSA' },
        { code: '899', asnd: 'L0144', name: 'CA 125' },
        { code: '9001', asnd: 'L0188', name: 'CA 19.9' },
        { code: '900', asnd: 'L0169', name: 'CA 15.3' }
      ],
      'BONE METABOLISM': [
        { code: '4286', asnd: 'LR355', name: 'Calcitonin - Outsourced Abroad Only' },
        { code: '4035', asnd: 'LR819', name: 'Osteocalcin - Outsourced Abroad Only' },
        { code: '1245', asnd: 'L0400', name: 'VITAMIN D (25-HYDROXY)' },
        { code: '9429', asnd: 'L0414', name: 'Intact PTH' },
        { code: '988', asnd: 'L0610', name: 'GH' }
      ],
      'INFECTIOUS DISEASES': [
        { code: '995', asnd: 'L0192', name: 'HBsAg' },
        { code: '9470', asnd: 'L0161', name: 'Anti-HBs' },
        { code: '9478', asnd: 'L0203', name: 'HBeAg' },
        { code: '9479', asnd: 'L0145', name: 'Anti-HBe' },
        { code: '9472', asnd: 'L0189', name: 'Anti-HBc' },
        { code: '9465', asnd: 'L0218', name: 'Syphilis' },
        { code: '9042', asnd: 'L0378', name: 'HIV Ab/Ag Combi' },
        { code: '4850', asnd: 'L0092', name: 'HIV Screening' },
        { code: '4887', asnd: 'L0129', name: 'Anti HCV ELISA' },
        { code: '9473', asnd: 'L0146', name: 'Anti-HBc IgM' }
      ],
      'ASO / RF': [
        { code: '9422', asnd: 'L0184', name: 'ASO' },
        { code: '9689', asnd: 'L0266', name: 'Rheumatoid Factor (Qualitative)' },
        { code: '9692', asnd: 'L0267', name: 'Rheumatoid Factor (Quantitative)' }
      ],
      'HYPERTENSION': [
        { code: '4322', asnd: 'LR857', name: 'Plasma Renin - Outsourced Abroad Only' },
        { code: '4146', asnd: 'LR090', name: 'Aldosterone - Outsourced Abroad Only' },
        { code: '9023', asnd: 'L0110', name: 'Cortisol' },
        { code: '9145', asnd: 'LR075', name: 'ACTH - Outsourced Abroad Only' }
      ],
      'AUTOIMMUNE': [
        { code: '9433', asnd: 'LR262', name: 'Anti-CCP Antibodies - Outsourced Abroad Only', vinaviServiceId: '5468' },
        { code: '8585', asnd: 'L0575', name: 'Anti-CCP/Quantitative (anti-cyclic citrullinated peptide)', vinaviServiceId: '8585' },
        { code: '9435', asnd: '', name: 'Anti-dsDNA IgG', blocked: true },
        { code: '9697', asnd: '', name: 'ANA Screen', blocked: true },
        { code: '9703', asnd: '', name: 'Anti-SSA/SSB', blocked: true }
      ],
      'INFLAMMATION MONITORING': [
        { code: '932', asnd: 'L0088', name: 'CRP (High Sensitive)' },
        { code: '9486', asnd: 'L0635', name: 'PCT (Procalcitonin)' },
        { code: '3462', asnd: 'L0662', name: 'IL-6 (Interleukin 6)' }
      ],
      'GASTRIC PANEL': [
        { code: '4365', asnd: '', name: 'Pepsinogen I', blocked: true },
        { code: '4366', asnd: '', name: 'Pepsinogen II', blocked: true },
        { code: '1244', asnd: 'L0204', name: 'Vitamin B12' },
        { code: '1001', asnd: 'L0101', name: 'H. Pylori IgG' }
      ],
      'IMMUNOGLOBULIN': [
        { code: '9712', asnd: 'L0095', name: 'IgG', blocked: true },
        { code: '9714', asnd: '', name: 'IgA', blocked: true },
        { code: '9715', asnd: '', name: 'IgM', blocked: true },
        { code: '9716', asnd: '', name: 'IgE', blocked: true }
      ],
      'DENGUE': [
        { code: '9693', asnd: 'L0098', name: 'Dengue IgG ELISA' },
        { code: '9691', asnd: 'L0099', name: 'Dengue IgM ELISA' },
        { code: '9717', asnd: 'L0111', name: 'Dengue (Rapid)' }
      ],
      'HEPATIC': [
        { code: '9488', asnd: '', name: 'HA', blocked: true },
        { code: '9507', asnd: '', name: 'PIIIP N-P', blocked: true },
        { code: '9710', asnd: '', name: 'C IV', blocked: true },
        { code: '9501', asnd: '', name: 'Laminin', blocked: true },
        { code: '9711', asnd: '', name: 'Cholyglycine', blocked: true }
      ],
      'TORCH': [
        { code: '1212', asnd: 'L0137', name: 'Toxo IgG', blocked: true },
        { code: '1215', asnd: 'L0138', name: 'Toxo IgM', blocked: true },
        { code: '9474', asnd: 'L0127', name: 'Rubella IgG', blocked: true },
        { code: '9475', asnd: 'L0128', name: 'Rubella IgM', blocked: true },
        { code: '9476', asnd: 'L0175', name: 'CMV IgG', blocked: true },
        { code: '9477', asnd: 'L0176', name: 'CMV IgM', blocked: true },
        { code: '9713', asnd: 'L0130', name: 'HSV-1 IgG', blocked: true },
        { code: '9714', asnd: 'L0131', name: 'HSV-1 IgM', blocked: true },
        { code: '9715', asnd: 'L0130', name: 'HSV-2 IgG', blocked: true },
        { code: '9716', asnd: 'L0131', name: 'HSV-2 IgM', blocked: true }
      ],
      'DRUG MONITORING': [
        { code: '9526', asnd: 'L0277', name: 'Serum Digoxin' },
        { code: '9532', asnd: '', name: 'CSA (Cyclosporine A)', blocked: true },
        { code: '9533', asnd: '', name: 'FK 506 (Tacrolimus)', blocked: true }
      ],
      'VDRL / TRANSFERRIN': [
        { code: '9718', asnd: 'L0064', name: 'VDRL' },
        { code: '9719', asnd: 'L0062', name: 'Widal Slide', blocked: true },
        { code: '9694', asnd: 'L0386', name: 'Transferrin' }
      ],
      'USG SCANS': [
        { code: '9800', asnd: 'USG025', name: 'Thyroid (Soft Tissue)', vinaviServiceId: '7257' },
        { code: '9801', asnd: 'USG007', name: 'Whole Abdominal Scan', vinaviServiceId: '7239' },
        { code: '7268', asnd: 'USG036', name: 'Knee Joint' },
        { code: '7241', asnd: 'USG009', name: 'Transvaginal' },
        { code: '7240', asnd: 'USG008', name: 'Breast (Both Sides)' },
        { code: '7236', asnd: 'USG004', name: 'Pelvis (USG Scan)' },
        { code: '7233', asnd: 'USG001', name: 'F.N.A.C - Plain' },
        { code: '7234', asnd: 'USG002', name: 'Upper Abdomen' },
        { code: '7235', asnd: 'USG003', name: 'Cranium' },
        { code: '7285', asnd: 'USG053', name: 'Shoulder' }
      ],
      'DOPPLER STUDIES': [
        { code: '7242', asnd: 'USG010', name: 'Arterial Doppler - Left Lower Limb' },
        { code: '7243', asnd: 'USG011', name: 'Arterial Doppler - Left Upper Limb' },
        { code: '7244', asnd: 'USG012', name: 'Arterial Doppler - Right Lower Limb' },
        { code: '7245', asnd: 'USG013', name: 'Arterial Doppler - Right Upper Limb' },
        { code: '7250', asnd: 'USG018', name: 'Arterial Doppler - Bilateral Lower Limb' },
        { code: '7246', asnd: 'USG014', name: 'Venous Doppler - Left Upper Limb' },
        { code: '7247', asnd: 'USG015', name: 'Venous Doppler - Right Lower Limb' },
        { code: '7248', asnd: 'USG016', name: 'Venous Doppler - Right Upper Limb' },
        { code: '7249', asnd: 'USG017', name: 'Venous Doppler - Left Lower Limb' },
        { code: '7251', asnd: 'USG019', name: 'Venous Doppler - Bilateral Lower Limb' },
        { code: '6250', asnd: 'IL0018', name: 'ECHO Doppler' },
        { code: '7254', asnd: 'USG022', name: 'Carotids B/L (Doppler Study)' }
      ],
      'MRI SCANS': [
        { code: '7124', asnd: 'MRI017', name: 'Knee' },
        { code: '7125', asnd: 'MRI018', name: 'Ankle' },
        { code: '7200', asnd: 'MRI094', name: 'Ankle (Both)' },
        { code: '7119', asnd: 'MRI012', name: 'Shoulders' },
        { code: '7226', asnd: 'MRI120', name: 'Shoulders (Both)' },
        { code: '7120', asnd: 'MRI013', name: 'Elbow' },
        { code: '7221', asnd: 'MRI115', name: 'Elbow (Both)' },
        { code: '7121', asnd: 'MRI014', name: 'Wrist' }
      ],
      'BONE SCAN': [
        { code: '9850', asnd: 'IL0012', name: 'Bone Densitometry', vinaviServiceId: '6244' }
      ],
      'X-RAY': [
        { code: '7315', asnd: 'XR015', name: 'Chest (PA)', vinaviServiceId: '7315' },
        { code: '7319', asnd: 'XR019', name: 'L.S.Spine (AP)', vinaviServiceId: '7319' },
        { code: '7320', asnd: 'XR020', name: 'L.S.Spine (Lat)', vinaviServiceId: '7320' },
        { code: '7421', asnd: 'XR122', name: 'L.S.Spine (LAT) Extension', vinaviServiceId: '7421' },
        { code: '7422', asnd: 'XR123', name: 'L.S.Spine (LAT) Flexion', vinaviServiceId: '7422' },
        { code: '7341', asnd: 'XR041', name: 'Knee (AP)' },
        { code: '7342', asnd: 'XR042', name: 'Knee (Lat)' },
        { code: '7395', asnd: 'XR096', name: 'Femur with Knee (AP)' },
        { code: '7408', asnd: 'XR109', name: 'Tibia Fibula with Ankle (AP)' },
        { code: '7409', asnd: 'XR110', name: 'Tibia Fibula with Ankle (Lat)' },
        { code: '7410', asnd: 'XR111', name: 'Tibia Fibula with Knee (AP)' },
        { code: '7416', asnd: 'XR117', name: 'Tibia Fibula with Knee (Lat)' },
        { code: '7781', asnd: 'XR140', name: 'Ankle - Unilateral (AP + Lat)' },
        { code: '7308', asnd: 'XR008', name: 'Ankle (AP)' },
        { code: '7309', asnd: 'XR009', name: 'Ankle (Lat)' },
        { code: '7397', asnd: 'XR098', name: 'Forearm with Elbow (AP)' },
        { code: '7398', asnd: 'XR099', name: 'Forearm with Elbow (Lat)' },
        { code: '7399', asnd: 'XR100', name: 'Forearm with Wrist (AP)' },
        { code: '7400', asnd: 'XR101', name: 'Forearm with Wrist (Lat)' },
        { code: '7343', asnd: 'XR043', name: 'Wrist (AP)' },
        { code: '7344', asnd: 'XR044', name: 'Wrist (AP/Lateral)' },
        { code: '7336', asnd: 'XR036', name: 'Shoulder (AP)' },
        { code: '7337', asnd: 'XR037', name: 'Shoulder (AX)' },
        { code: '7406', asnd: 'XR107', name: 'Shoulder with Humerus (AP)' },
        { code: '7436', asnd: 'XR137', name: 'Shoulder with Humerus (Lateral)' },
        { code: '7411', asnd: 'XR112', name: 'Humerus with Elbow (AP)' },
        { code: '7412', asnd: 'XR113', name: 'Humerus with Elbow (Lat)' },
        { code: '7338', asnd: 'XR038', name: 'Elbow (AP)' },
        { code: '7339', asnd: 'XR039', name: 'Elbow (Lat)' },
        { code: '7324', asnd: 'XR024', name: 'Hand with Wrist (AP)' },
        { code: '7325', asnd: 'XR025', name: 'Hand with Wrist (Ob)' }
      ],
      'DIAGNOSTIC PROCEDURES': [
        { code: '6238', asnd: 'IL0002', name: 'ECG - 12 Leads With Rhythm Lead', vinaviServiceId: '6238' }
      ]
    };
  }

  /**
   * Open the fullscreen catalog popup
   * @param {Object} options - Configuration options
   * @param {string} options.episodeId - Current episode ID for adding tests
   * @param {string} options.diagnosisId - Diagnosis ID to link tests to
   * @param {Array} options.preselected - Pre-selected tests to show as checked
   * @param {Function} options.onConfirm - Callback when user confirms selection
   */
  open(options = {}) {
    // Always try to load latest LAB_DATA from window (set by lab-catalog.js)
    if (window.LAB_DATA && Object.keys(window.LAB_DATA).length > 0) {
      this.catalogData = window.LAB_DATA;
      console.log('[FullscreenCatalog] Using LAB_DATA from window:', Object.keys(this.catalogData).length, 'categories');
    } else if (!this.catalogData) {
      // Fall back to embedded default data
      this.catalogData = this.getDefaultLabData();
      console.log('[FullscreenCatalog] Using embedded LAB_DATA:', Object.keys(this.catalogData).length, 'categories');
    }
    
    this.episodeId = options.episodeId || null;
    this.diagnosisId = options.diagnosisId || null;
    this.onConfirmCallback = options.onConfirm || null;
    
    // CLEAR previous selections to avoid stale data
    this.selectedTests.clear();
    
    // Pre-select tests if provided
    if (options.preselected && Array.isArray(options.preselected)) {
      console.log('[FullscreenCatalog] Loading', options.preselected.length, 'preselected tests');
      options.preselected.forEach(test => {
        const key = this.getTestKey(test);
        this.selectedTests.set(key, test);
      });
    }

    this.createModal();
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close() {
    const modal = document.getElementById('hmh-fullscreen-catalog');
    if (modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, 300);
    }
    this.isOpen = false;
  }

  minimize() {
    const modal = document.getElementById('hmh-fullscreen-catalog');
    if (modal) {
      modal.classList.toggle('minimized');
      const minBtn = modal.querySelector('#hmh-catalog-minimize-btn');
      if (minBtn) {
        minBtn.innerHTML = modal.classList.contains('minimized') ? '🔼' : '🔽';
        minBtn.title = modal.classList.contains('minimized') ? 'Restore' : 'Minimize';
      }
    }
  }

  getTestKey(test) {
    return test.code ? `C:${test.code}` : `N:${test.name}`;
  }

  createModal() {
    // Remove existing modal if any
    const existing = document.getElementById('hmh-fullscreen-catalog');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'hmh-fullscreen-catalog';
    modal.className = 'hmh-catalog-modal';
    modal.innerHTML = `
      <div class="hmh-catalog-container">
        <!-- Header -->
        <div class="hmh-catalog-header">
          <div class="hmh-catalog-header-left">
            <div class="hmh-catalog-logo">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-8.038 0l-2.387.477a2 2 0 00-1.022.547L2 18.001V21h20v-2.999l-2.572-2.573z"/>
                <circle cx="12" cy="4" r="3"/>
                <path d="M9 14a5 5 0 0110 0"/>
              </svg>
            </div>
            <div class="hmh-catalog-title">
              <h1>HMH Lab Test Catalog</h1>
              <p>Select tests for this episode</p>
            </div>
          </div>
          <div class="hmh-catalog-header-right">
            <button id="hmh-catalog-minimize-btn" class="hmh-catalog-btn-icon" title="Minimize">🔽</button>
            <button id="hmh-catalog-close-btn" class="hmh-catalog-btn-icon" title="Close">✕</button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="hmh-catalog-toolbar">
          <div class="hmh-catalog-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" id="hmh-catalog-search" placeholder="Search tests by name, code, or ASND...">
          </div>
          <div class="hmh-catalog-actions">
            <button id="hmh-catalog-clear-btn" class="hmh-catalog-btn secondary">Clear All</button>
            <button id="hmh-catalog-select-visible-btn" class="hmh-catalog-btn secondary">Select Visible</button>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="hmh-catalog-tabs" id="hmh-catalog-tabs">
          <button class="hmh-catalog-tab active" data-category="all">All Tests</button>
        </div>

        <!-- Main Content -->
        <div class="hmh-catalog-content" id="hmh-catalog-content">
          <!-- Categories and tests will be rendered here -->
        </div>

        <!-- Footer with Selection Summary -->
        <div class="hmh-catalog-footer">
          <div class="hmh-catalog-selection-info">
            <span class="hmh-catalog-count" id="hmh-catalog-count">0 tests selected</span>
            <div class="hmh-catalog-selected-pills" id="hmh-catalog-pills">
              <!-- Selected test pills will appear here -->
            </div>
          </div>
          <div class="hmh-catalog-footer-actions">
            <button id="hmh-catalog-cancel-btn" class="hmh-catalog-btn secondary">Cancel</button>
            <button id="hmh-catalog-confirm-btn" class="hmh-catalog-btn primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();

    // Append to body
    document.body.appendChild(modal);

    // Render catalog content
    this.renderCatalog();

    // Attach event listeners
    this.attachEventListeners(modal);

    // Update selection display
    this.updateSelectionDisplay();

    // Trigger opening animation
    requestAnimationFrame(() => {
      modal.classList.add('open');
    });
  }

  renderCatalog() {
    const tabsContainer = document.getElementById('hmh-catalog-tabs');
    const contentContainer = document.getElementById('hmh-catalog-content');
    
    if (!this.catalogData) {
      contentContainer.innerHTML = '<div class="hmh-catalog-loading">Loading catalog data...</div>';
      // Try to fetch from iframe or wait
      this.waitForCatalogData(contentContainer, tabsContainer);
      return;
    }

    this.renderCatalogContent(tabsContainer, contentContainer);
  }

  waitForCatalogData(contentContainer, tabsContainer) {
    // Attempt to load from various sources
    const checkInterval = setInterval(() => {
      if (window.LAB_DATA) {
        this.catalogData = window.LAB_DATA;
        clearInterval(checkInterval);
        this.renderCatalogContent(tabsContainer, contentContainer);
      }
    }, 100);

    // Timeout after 3 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this.catalogData) {
        contentContainer.innerHTML = '<div class="hmh-catalog-error">Failed to load catalog. Please refresh the page.</div>';
      }
    }, 3000);
  }

  renderCatalogContent(tabsContainer, contentContainer) {
    const categories = Object.keys(this.catalogData);
    
    // Clear existing tabs (except "All Tests")
    tabsContainer.innerHTML = '<button class="hmh-catalog-tab active" data-category="all">All Tests</button>';
    
    // Add category tabs
    categories.forEach(category => {
      const tab = document.createElement('button');
      tab.className = 'hmh-catalog-tab';
      tab.dataset.category = category;
      tab.textContent = category;
      tab.onclick = () => this.switchCategory(category);
      tabsContainer.appendChild(tab);
    });

    // Render category sections
    contentContainer.innerHTML = '';
    categories.forEach(category => {
      const section = this.createCategorySection(category, this.catalogData[category]);
      contentContainer.appendChild(section);
    });
  }

  createCategorySection(categoryName, tests) {
    const section = document.createElement('div');
    section.className = 'hmh-catalog-section';
    section.dataset.category = categoryName;

    const header = document.createElement('div');
    header.className = 'hmh-catalog-section-header';
    header.innerHTML = `
      <h3>${categoryName} <span class="hmh-category-count">(${tests.length})</span></h3>
      <button class="hmh-catalog-select-all" data-category="${categoryName}">Select All</button>
    `;

    // Create scrollable table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'hmh-catalog-table-container';

    // Create Table
    const table = document.createElement('table');
    table.className = 'hmh-catalog-table';
    
    // Table Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th class="col-select">✓</th>
        <th class="col-code">Code</th>
        <th class="col-investigation">Investigation</th>
      </tr>
    `;
    
    // Table Body
    const tbody = document.createElement('tbody');
    tests.forEach(test => {
      const row = this.createTestRow(test, categoryName);
      tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    section.appendChild(header);
    section.appendChild(tableContainer);

    // Select all button handler
    header.querySelector('.hmh-catalog-select-all').onclick = () => {
      this.selectAllInCategory(categoryName, tests);
    };

    return section;
  }

  createTestRow(test, categoryName) {
    const row = document.createElement('tr');
    row.className = 'hmh-catalog-row';
    if (test.blocked) row.classList.add('blocked');

    const key = this.getTestKey(test);
    const isSelected = this.selectedTests.has(key);
    if (isSelected) row.classList.add('selected');

    // Checkbox cell
    const checkboxCell = document.createElement('td');
    checkboxCell.className = 'cell-checkbox';
    if (!test.blocked) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'hmh-test-checkbox';
      checkbox.checked = isSelected;
      checkbox.dataset.key = key;
      checkboxCell.appendChild(checkbox);
    } else {
      checkboxCell.innerHTML = '<span class="hmh-blocked-icon">🚫</span>';
    }

    // Code cell
    const codeCell = document.createElement('td');
    codeCell.className = 'cell-code';
    codeCell.textContent = test.code || test.asnd || '-';

    // Investigation cell
    const investigationCell = document.createElement('td');
    investigationCell.className = 'cell-investigation';
    investigationCell.textContent = test.name;
    if (test.blocked) {
      const naTag = document.createElement('span');
      naTag.className = 'hmh-na-tag';
      naTag.textContent = 'N/A';
      investigationCell.appendChild(document.createTextNode(' '));
      investigationCell.appendChild(naTag);
    }

    row.appendChild(checkboxCell);
    row.appendChild(codeCell);
    row.appendChild(investigationCell);

    // Click handler for row
    if (!test.blocked) {
      row.onclick = (e) => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        this.toggleTest(test, checkbox.checked);
        row.classList.toggle('selected', checkbox.checked);
      };
    }

    return row;
  }

  toggleTest(test, isSelected) {
    const key = this.getTestKey(test);
    if (isSelected) {
      this.selectedTests.set(key, {
        code: test.code || '',
        asnd: test.asnd || '',
        name: test.name || '',
        vinaviServiceId: test.vinaviServiceId || null
      });
    } else {
      this.selectedTests.delete(key);
    }
    this.updateSelectionDisplay();
  }

  selectAllInCategory(categoryName, tests) {
    const section = document.querySelector(`.hmh-catalog-section[data-category="${categoryName}"]`);
    if (!section) return;

    tests.forEach(test => {
      if (!test.blocked) {
        const key = this.getTestKey(test);
        this.selectedTests.set(key, {
          code: test.code || '',
          asnd: test.asnd || '',
          name: test.name || '',
          vinaviServiceId: test.vinaviServiceId || null
        });
      }
    });

    // Update all checkboxes in section
    section.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = true;
      cb.closest('tr.hmh-catalog-row')?.classList.add('selected');
    });

    this.updateSelectionDisplay();
  }

  switchCategory(category) {
    // Update tabs
    document.querySelectorAll('.hmh-catalog-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category || (category === 'all' && tab.dataset.category === 'all'));
    });

    // Show/hide sections
    document.querySelectorAll('.hmh-catalog-section').forEach(section => {
      section.style.display = (category === 'all' || section.dataset.category === category) ? 'block' : 'none';
    });
  }

  updateSelectionDisplay() {
    const count = document.getElementById('hmh-catalog-count');
    const pills = document.getElementById('hmh-catalog-pills');
    
    if (count) {
      count.textContent = `${this.selectedTests.size} test${this.selectedTests.size !== 1 ? 's' : ''} selected`;
    }

    if (pills) {
      pills.innerHTML = '';
      const tests = Array.from(this.selectedTests.values()).slice(0, 5);
      tests.forEach(test => {
        const pill = document.createElement('span');
        pill.className = 'hmh-catalog-pill';
        pill.innerHTML = `
          ${test.name}
          <button class="hmh-catalog-pill-remove" data-key="${this.getTestKey(test)}">×</button>
        `;
        pill.querySelector('.hmh-catalog-pill-remove').onclick = (e) => {
          e.stopPropagation();
          this.removeTest(test);
        };
        pills.appendChild(pill);
      });

      if (this.selectedTests.size > 5) {
        const morePill = document.createElement('span');
        morePill.className = 'hmh-catalog-pill more';
        morePill.textContent = `+${this.selectedTests.size - 5} more`;
        pills.appendChild(morePill);
      }
    }
  }

  removeTest(test) {
    const key = this.getTestKey(test);
    this.selectedTests.delete(key);

    // Update checkbox in table
    const checkbox = document.querySelector(`input[data-key="${key}"]`);
    if (checkbox) {
      checkbox.checked = false;
      checkbox.closest('tr.hmh-catalog-row')?.classList.remove('selected');
    }

    this.updateSelectionDisplay();
  }

  filterTests(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    document.querySelectorAll('tr.hmh-catalog-row').forEach(row => {
      const name = row.querySelector('.cell-investigation')?.textContent.toLowerCase() || '';
      const code = row.querySelector('.cell-code')?.textContent.toLowerCase() || '';
      const asnd = row.querySelector('.cell-asnd')?.textContent.toLowerCase() || '';
      const matches = name.includes(term) || code.includes(term) || asnd.includes(term);
      row.style.display = matches ? '' : 'none';
    });

    // Hide empty sections
    document.querySelectorAll('.hmh-catalog-section').forEach(section => {
      const visibleRows = section.querySelectorAll('tr.hmh-catalog-row:not([style*="display: none"])');
      section.style.display = visibleRows.length > 0 ? '' : 'none';
    });
  }

  attachEventListeners(modal) {
    // Close button
    modal.querySelector('#hmh-catalog-close-btn').onclick = () => this.close();
    
    // Minimize button
    modal.querySelector('#hmh-catalog-minimize-btn').onclick = () => this.minimize();
    
    // Cancel button
    modal.querySelector('#hmh-catalog-cancel-btn').onclick = () => this.close();
    
    // Confirm button
    modal.querySelector('#hmh-catalog-confirm-btn').onclick = () => this.confirm();
    
    // Search
    const searchInput = modal.querySelector('#hmh-catalog-search');
    searchInput.oninput = (e) => this.filterTests(e.target.value);
    
    // Clear all
    modal.querySelector('#hmh-catalog-clear-btn').onclick = () => {
      this.selectedTests.clear();
      modal.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('tr.hmh-catalog-row')?.classList.remove('selected');
      });
      this.updateSelectionDisplay();
    };
    
    // Select visible
    modal.querySelector('#hmh-catalog-select-visible-btn').onclick = () => {
      modal.querySelectorAll('tr.hmh-catalog-row:not([style*="display: none"]):not(.blocked)').forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
          checkbox.checked = true;
          row.classList.add('selected');
          const key = checkbox.dataset.key;
          const name = row.querySelector('.cell-investigation')?.textContent || '';
          const code = row.querySelector('.cell-code')?.textContent || '';
          const asnd = row.querySelector('.cell-asnd')?.textContent || '';
          this.selectedTests.set(key, { name, code, asnd });
        }
      });
      this.updateSelectionDisplay();
    };
    
    // All Tests tab
    modal.querySelector('.hmh-catalog-tab[data-category="all"]').onclick = () => this.switchCategory('all');
    
    // Close on background click
    modal.onclick = (e) => {
      if (e.target === modal) this.close();
    };
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  confirm() {
    const selectedArray = Array.from(this.selectedTests.values());
    
    if (this.onConfirmCallback) {
      this.onConfirmCallback(selectedArray, {
        episodeId: this.episodeId,
        diagnosisId: this.diagnosisId
      });
    }
    
    // Also send to parent window if exists
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'labTestsSelected',
        tests: selectedArray,
        episodeId: this.episodeId,
        diagnosisId: this.diagnosisId
      }, '*');
    }
    
    this.close();
  }

  addStyles() {
    if (document.getElementById('hmh-fullscreen-catalog-styles')) return;

    const style = document.createElement('style');
    style.id = 'hmh-fullscreen-catalog-styles';
    style.textContent = `
      .hmh-catalog-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        z-index: 999999;
        opacity: 0;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hmh-catalog-modal.open {
        opacity: 1;
      }

      .hmh-catalog-modal.closing {
        opacity: 0;
      }

      .hmh-catalog-modal.minimized .hmh-catalog-container {
        height: 60px;
        overflow: hidden;
      }

      .hmh-catalog-modal.minimized .hmh-catalog-content,
      .hmh-catalog-modal.minimized .hmh-catalog-toolbar,
      .hmh-catalog-modal.minimized .hmh-catalog-tabs,
      .hmh-catalog-modal.minimized .hmh-catalog-footer {
        display: none;
      }

      .hmh-catalog-container {
        width: 95vw;
        height: 95vh;
        max-width: 1600px;
        background: #ffffff;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        transform: scale(0.95);
        transition: transform 0.3s ease;
      }

      .hmh-catalog-modal.open .hmh-catalog-container {
        transform: scale(1);
      }

      /* Header */
      .hmh-catalog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
        color: white;
      }

      .hmh-catalog-header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .hmh-catalog-logo {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hmh-catalog-title h1 {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
      }

      .hmh-catalog-title p {
        font-size: 13px;
        opacity: 0.85;
        margin: 4px 0 0;
      }

      .hmh-catalog-header-right {
        display: flex;
        gap: 8px;
      }

      .hmh-catalog-btn-icon {
        width: 40px;
        height: 40px;
        border: none;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        color: white;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .hmh-catalog-btn-icon:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      /* Toolbar */
      .hmh-catalog-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      .hmh-catalog-search {
        display: flex;
        align-items: center;
        gap: 12px;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 16px;
        flex: 1;
        max-width: 500px;
        transition: all 0.2s;
      }

      .hmh-catalog-search:focus-within {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .hmh-catalog-search input {
        border: none;
        outline: none;
        font-size: 15px;
        flex: 1;
        background: transparent;
      }

      .hmh-catalog-search svg {
        color: #94a3b8;
      }

      .hmh-catalog-actions {
        display: flex;
        gap: 12px;
      }

      .hmh-catalog-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hmh-catalog-btn.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
      }

      .hmh-catalog-btn.primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      .hmh-catalog-btn.secondary {
        background: white;
        color: #475569;
        border: 2px solid #e2e8f0;
      }

      .hmh-catalog-btn.secondary:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      /* Tabs */
      .hmh-catalog-tabs {
        display: flex;
        gap: 4px;
        padding: 0 24px;
        background: #f8fafc;
        overflow-x: auto;
        scrollbar-width: thin;
      }

      .hmh-catalog-tab {
        padding: 12px 20px;
        border: none;
        background: transparent;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .hmh-catalog-tab:hover {
        color: #3b82f6;
      }

      .hmh-catalog-tab.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
      }

      /* Content */
      .hmh-catalog-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        background: #f1f5f9;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        align-content: start;
      }

      .hmh-catalog-section {
        margin-bottom: 0;
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
      }

      .hmh-catalog-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        flex-shrink: 0;
      }

      .hmh-catalog-section-header h3 {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }

      .hmh-catalog-select-all {
        padding: 6px 12px;
        background: #e0e7ff;
        color: #4338ca;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .hmh-catalog-select-all:hover {
        background: #c7d2fe;
      }

      /* Table container - no individual scrolling */
      .hmh-catalog-table-container {
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }

      /* Table Styling */
      .hmh-catalog-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        margin-bottom: 0;
        border: none;
        font-size: 13px;
      }

      .hmh-catalog-table thead {
        background: #f9fafb;
        position: sticky;
        top: 0;
        z-index: 1;
        border-bottom: 2px solid #e5e7eb;
      }

      .hmh-catalog-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 12px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #d1d5db;
      }

      .hmh-catalog-table th.col-select {
        width: 40px;
        text-align: center;
      }

      .hmh-catalog-table th.col-code {
        width: 70px;
      }

      .hmh-catalog-table th.col-investigation {
        width: auto;
      }

      .hmh-category-count {
        font-weight: 400;
        color: #6b7280;
        font-size: 13px;
      }

      .hmh-catalog-table tbody tr {
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.15s ease;
        cursor: pointer;
      }

      .hmh-catalog-table tbody tr:hover:not(.blocked) {
        background: #f0f9ff;
      }

      .hmh-catalog-table tbody tr.selected {
        background: #dbeafe;
      }

      .hmh-catalog-table tbody tr.blocked {
        background: #fef2f2;
        opacity: 0.7;
        cursor: not-allowed;
      }

      .hmh-catalog-table tbody tr.blocked:hover {
        background: #fee2e2;
      }

      .hmh-catalog-table td {
        padding: 8px 10px;
        font-size: 13px;
        color: #374151;
        vertical-align: middle;
      }

      .hmh-catalog-table .cell-checkbox {
        text-align: center;
        width: 40px;
      }

      .hmh-catalog-table .cell-code {
        width: 70px;
        font-weight: 600;
        color: #2563eb;
        font-family: monospace;
        font-size: 12px;
      }

      .hmh-catalog-table .cell-investigation {
        font-weight: 500;
        color: #111827;
      }

      .hmh-test-checkbox {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: #3b82f6;
      }

      .hmh-blocked-icon {
        font-size: 14px;
        display: inline-block;
      }

      .hmh-na-tag {
        display: inline-block;
        padding: 2px 6px;
        background: #fecaca;
        color: #991b1b;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        margin-left: 6px;
      }

      /* Footer */
      .hmh-catalog-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        background: white;
        border-top: 1px solid #e2e8f0;
      }

      .hmh-catalog-selection-info {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        overflow: hidden;
      }

      .hmh-catalog-count {
        font-size: 15px;
        font-weight: 700;
        color: #3b82f6;
        white-space: nowrap;
      }

      .hmh-catalog-selected-pills {
        display: flex;
        gap: 8px;
        flex-wrap: nowrap;
        overflow-x: auto;
      }

      .hmh-catalog-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: #eff6ff;
        color: #1e40af;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }

      .hmh-catalog-pill.more {
        background: #f1f5f9;
        color: #64748b;
      }

      .hmh-catalog-pill-remove {
        border: none;
        background: none;
        color: #3b82f6;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .hmh-catalog-pill-remove:hover {
        color: #dc2626;
      }

      .hmh-catalog-footer-actions {
        display: flex;
        gap: 12px;
      }

      /* Loading & Error */
      .hmh-catalog-loading,
      .hmh-catalog-error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        font-size: 16px;
        color: #64748b;
      }

      .hmh-catalog-error {
        color: #dc2626;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .hmh-catalog-container {
          width: 100vw;
          height: 100vh;
          border-radius: 0;
        }

        .hmh-catalog-toolbar {
          flex-direction: column;
          gap: 12px;
        }

        .hmh-catalog-search {
          max-width: none;
          width: 100%;
        }

        .hmh-catalog-content {
          grid-template-columns: repeat(2, 1fr);
        }

        .hmh-catalog-footer {
          flex-direction: column;
          gap: 16px;
        }

        .hmh-catalog-table {
          font-size: 12px;
        }
        
        .hmh-catalog-table th,
        .hmh-catalog-table td {
          padding: 6px 8px;
        }
      }

      @media (max-width: 900px) {
        .hmh-catalog-content {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// Create global instance
window.fullscreenLabCatalog = new FullscreenLabCatalog();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FullscreenLabCatalog };
}
