// Lab Test Catalog - Complete accurate data from index.html
const LAB_DATA = {
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
    { code: '9642', asnd: 'L0197', name: 'CSF-Glucose' },
    { code: '9721', asnd: 'L0183', name: 'CSF-Proteins' },
    { code: '9644', asnd: 'L0253', name: 'CSF-Chloride' },
    { code: '9645', asnd: 'L0160', name: 'CSF-Cell Count' },
    { code: '9646', asnd: 'L0245', name: 'Pleural Fluid' },
    { code: '9647', asnd: 'L0246', name: 'Peritoneal Fluid' },
    { code: '9648', asnd: 'L0247', name: 'Synovial Fluid' },
    { code: '9625', asnd: 'L0025', name: 'Stool R/E' },
    { code: '9626', asnd: 'L0016', name: 'Occult Blood' },
    { code: '9627', asnd: 'L0011', name: 'Reducing Substances' },
    { code: '9628', asnd: 'L0201', name: 'Parasites Concentration Tech' },
    { code: '9629', asnd: 'L0026', name: 'Stool R/E-J Consecutive Days' },
    { code: '9630', asnd: 'L0091', name: 'Semen Analysis' },
    { code: '9631', asnd: 'L0193', name: 'Absolute Spermatozoa Count' }
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
    { code: '9650', asnd: '', name: 'Diabetology Profile', blocked: true },
    { code: '9584', asnd: '', name: 'Serum Glucose', blocked: true },
    { code: '1117', asnd: 'L0027', name: 'Random Blood Sugar (RBS)' },
    { code: '9401', asnd: 'L0028', name: 'Fasting Blood Sugar' },
    { code: '9651', asnd: 'L0210', name: 'Post Prandial Blood Sugar' },
    { code: '1146', asnd: 'L0001', name: 'Serum Amylase' },
    { code: '985', asnd: 'L0103', name: 'Glycoseylate Hb' },
    { code: '1044', asnd: 'L0222', name: 'Lipase' },
    { code: '924', asnd: 'L0282', name: 'C-Peptide' },
    { code: '4032', asnd: 'LR754', name: 'Insulin - Outsourced Abroad Only' },
    { code: '9009', asnd: 'LR607', name: 'Glutamic Acid Decarboxylase (GAD) IgG Antibodies - Outsourced Abroad Only' },
    { code: '9652', asnd: 'L0571', name: 'Anti-Insulin Antibodies AI2' },
    { code: '9653', asnd: '', name: 'ICA', blocked: true },
    { code: '9011', asnd: '', name: 'IAA', blocked: true },
    { code: '9013', asnd: '', name: 'Proinsulin', blocked: true },
    { code: '9654', asnd: 'L0202', name: 'Glucose Tolerance Test (GTT)' }
  ],
  'CARDIAC PROFILE': [
    { code: '', asnd: 'L0180', name: 'Cardiac Profile' },
    { code: '9725', asnd: 'L0074', name: 'CK' },
    { code: '927', asnd: 'L0106', name: 'CK-MB' },
    { code: '9405', asnd: 'L0037', name: 'Lactate Dehydrogenase' },
    { code: '9658', asnd: 'L0116', name: 'Troponin-T' },
    { code: '9502', asnd: 'LR798', name: 'Myoglobin - Outsourced Abroad Only' },
    { code: '9502', asnd: 'L0413', name: 'Myoglobin' },
    { code: '9659', asnd: '', name: 'H-FABP', blocked: true },
    { code: '9504', asnd: '', name: 'NT-proBNP', blocked: true },
    { code: '9661', asnd: '', name: 'Lp-PLA2', blocked: true },
    { code: '9662', asnd: '', name: 'MPO', blocked: true },
    { code: '1220', asnd: '', name: 'hs-cTnl', blocked: true },
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
    { code: '9556', asnd: '', name: 'LDL Cholesterol / HDL Cholesterol', blocked: true },
    { code: '9559', asnd: '', name: 'Chol / HDL Ratio', blocked: true },
    { code: '9517', asnd: '', name: 'ApoE', blocked: true },
    { code: '878', asnd: '', name: 'ApoA', blocked: true },
    { code: '879', asnd: '', name: 'ApoB', blocked: true },
    { code: '1046', asnd: 'L0335', name: 'lipoprotein A' },
    { code: '4364', asnd: 'L0662', name: 'IL-6 (Interleukin 6)' },
    { code: '9017', asnd: 'L0439', name: 'HCY' }
  ],
  'GASTRIC PANEL': [
    { code: '4365', asnd: '', name: 'Pepsinogen I', blocked: true },
    { code: '4366', asnd: '', name: 'Pepsinogen II', blocked: true },
    { code: '9666', asnd: '', name: 'P I / P II', blocked: true },
    { code: '9006', asnd: '', name: 'Gastrin 17', blocked: true },
    { code: '1244', asnd: 'L0204', name: 'Vitamin B12' },
    { code: '1001', asnd: 'L0101', name: 'H. Pylori IgG' }
  ],
  'BONE METABOLISM': [
    { code: '4286', asnd: 'LR355', name: 'Calcitonin - Outsourced Abroad Only' },
    { code: '4035', asnd: 'LR819', name: 'Osteocalcin - Outsourced Abroad Only' },
    { code: '1245', asnd: 'L0400', name: 'VITAMIN D (25-HYDROXY)' },
    { code: '9429', asnd: 'L0414', name: 'Intact PTH' },
    { code: '9665', asnd: '', name: 'β-CrossLaps (β-CTx)', blocked: true },
    { code: '9664', asnd: '', name: 'Total p1np', blocked: true },
    { code: '9007', asnd: '', name: 'IGF I', blocked: true },
    { code: '5005', asnd: 'L0249', name: 'Growth Hormone (GH)' },
    { code: '9663', asnd: '', name: 'IGFBP-3', blocked: true }
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
    { code: '1163', asnd: 'L0047', name: 'Serum Lactate' },
    { code: '1143', asnd: 'L0046', name: 'Serum Albumin' },
    { code: '9413', asnd: 'L0195', name: 'Serum Globulin' },
    { code: '9411', asnd: 'L0054', name: 'Serum Ammonia' }
  ],
  'RENAL PROFILE': [
    { code: '1774', asnd: 'L0248', name: 'Renal Profile' },
    { code: '', asnd: 'L0033', name: 'Blood Urea' },
    { code: '', asnd: 'L0034', name: 'Blood Urea Nitrogen (BUN)' },
    { code: '1155', asnd: 'L0035', name: 'Serum Creatinine' },
    { code: '1178', asnd: 'L0036', name: 'Serum Uric Acid' },
    { code: '890', asnd: 'L0033', name: 'Urea' },
    { code: '9608', asnd: 'L0302', name: 'β2-MG', blocked: true },
    { code: '9670', asnd: '', name: 'NGAL', blocked: true },
    { code: '9555', asnd: 'L0165', name: 'Serum Osmolality' },
    { code: '9671', asnd: 'L0096', name: 'Creatinine Clearance Test' },
    { code: '1159', asnd: 'L0105', name: 'Ferritin' },
    { code: '1166', asnd: 'L0104', name: 'Serum Follate' },
    { code: '1211', asnd: 'L0357', name: 'Serum Albumin' },
    { code: '9671', asnd: 'L0357', name: 'RBC Folate' },
    { code: '9673', asnd: '', name: 'EPO', blocked: true }
  ],
  'FERTILITY HORMONE': [
    { code: '1057', asnd: 'L0119', name: 'LH' },
    { code: '971', asnd: 'L0112', name: 'FSH' },
    { code: '1106', asnd: 'L0147', name: 'PRL' },
    { code: '1197', asnd: 'L0124', name: 'Testosterone' },
    { code: '5111', asnd: 'L0360', name: 'Testosterone (Total)' },
    { code: '1199', asnd: 'L0358', name: 'Free Testosterone' },
    { code: '9674', asnd: '', name: 'Free Testosterone Index', blocked: true },
    { code: '1105', asnd: 'L0113', name: 'Progesterone' },
    { code: '1147', asnd: 'L0114', name: 'Serum B-HCG' },
    { code: '9675', asnd: 'L0125', name: 'Serum B-HCG Titre' },
    { code: '972', asnd: 'L0217', name: 'Free B-HCG' },
    { code: '959', asnd: 'L0126', name: 'Estradiol' },
    { code: '945', asnd: 'L0363', name: 'DHEA' },
    { code: '4122', asnd: 'LR923', name: 'Sex Hormone Binding Globulin (SHBG) - Outsourced Abroad Only' },
    { code: '9003', asnd: 'LR234', name: 'Androstenedione - Outsourced Abroad Only' },
    { code: '4144', asnd: 'LR001', name: '17 hydroxyprogesterone', blocked: true },
    { code: '9676', asnd: 'LR1031', name: 'AMH' },
    { code: '9585', asnd: '', name: 'Free Estriol', blocked: true },
    { code: '9677', asnd: '', name: 'Pappa A', blocked: true }
  ],
  'THYROID PROFILE': [
    { code: '1852', asnd: 'L0231', name: 'Thyroid Profile' },
    { code: '975', asnd: 'L0257', name: 'FT4' },
    { code: '1192', asnd: 'L0140', name: 'T3' },
    { code: '870', asnd: 'L0142', name: 'TSH' },
    { code: '1224', asnd: 'L0228', name: 'Anti TPO' },
    { code: '9513', asnd: '', name: 'TRab', blocked: true },
    { code: '875', asnd: 'L0122', name: 'Anti TG' },
    { code: '5304', asnd: 'LR1055', name: 'Thyroglobulin - Outsourced Abroad Only' },
    { code: '9678', asnd: '', name: 'T-Uptake', blocked: true },
    { code: '1194', asnd: 'L0141', name: 'T4' },
    { code: '974', asnd: 'L0258', name: 'Free T3' },
    { code: '9724', asnd: '', name: 'Inoinized Calcium', blocked: true }
  ],
  'TUMOR MARKERS': [
    { code: '856', asnd: 'L0166', name: 'AFP' },
    { code: '903', asnd: 'L0151', name: 'CEA' },
    { code: '9015', asnd: 'L0152', name: 'Total PSA' },
    { code: '9773', asnd: 'L0374', name: 'F-PSA' },
    { code: '899', asnd: 'L0144', name: 'CA 125' },
    { code: '9001', asnd: 'L0188', name: 'CA 19.9' },
    { code: '900', asnd: 'L0169', name: 'CA 15.3' },
    { code: '9521', asnd: '', name: 'CA 50', blocked: true },
    { code: '9630', asnd: '', name: 'CYFRA 21-1', blocked: true },
    { code: '9520', asnd: '', name: 'CA 72-4', blocked: true },
    { code: '9505', asnd: '', name: 'CA 24-2', blocked: true },
    { code: '9508', asnd: '', name: 'S-100', blocked: true },
    { code: '9509', asnd: '', name: 'SCC', blocked: true },
    { code: '9631', asnd: '', name: 'ProGRP', blocked: true },
    { code: '9681', asnd: '', name: 'TPA', blocked: true },
    { code: '9682', asnd: '', name: 'NSE', blocked: true },
    { code: '9683', asnd: '', name: 'HER-2', blocked: true }
  ],
  'INFECTIOUS DISEASES': [
    { code: '995', asnd: 'L0192', name: 'HBsAg' },
    { code: '9470', asnd: 'L0161', name: 'Anti-HBs' },
    { code: '9478', asnd: 'L0203', name: 'HBeAg' },
    { code: '9479', asnd: 'L0145', name: 'Anti-HBe' },
    { code: '9472', asnd: 'L0189', name: 'Anti-HBc' },
    { code: '9465', asnd: 'L0218', name: 'Syphilis' },
    { code: '9471', asnd: 'L0139', name: 'VZV' },
    { code: '9468', asnd: 'L0149', name: 'HAV IgM' },
    { code: '9042', asnd: 'L0378', name: 'HIV Ab/Ag Combi' },
    { code: '4850', asnd: 'L0092', name: 'HIV Screening' },
    { code: '4887', asnd: 'L0129', name: 'Anti HCV ELISA' },
    { code: '9865', asnd: '', name: 'HTLV I/II', blocked: true },
    { code: '1001', asnd: 'L0101', name: 'H. pylori IgG' },
    { code: '9686', asnd: '', name: 'H. pylori IgM', blocked: true },
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
    { code: '9145', asnd: 'LR075', name: 'Adrenocorticotropic Hormone (ACTH) - Outsourced Abroad Only' },
    { code: '9004', asnd: '', name: 'Angiotensin I', blocked: true },
    { code: '9005', asnd: '', name: 'Angiotensin II', blocked: true }
  ],
  'AUTOIMMUNE': [
    { code: '9433', asnd: 'LR262', name: 'Anti-CCP Antibodies - Outsourced Abroad Only', vinaviServiceId: '5468' },
    { code: '8585', asnd: 'L0575', name: 'Anti-CCP/Quantitative (anti-cyclic citrullinated peptide)', vinaviServiceId: '8585' },
    { code: '9435', asnd: '', name: 'Anti-dsDNA IgG', blocked: true },
    { code: '9697', asnd: '', name: 'ANA Screen', blocked: true },
    { code: '9698', asnd: '', name: 'Anti-Sm IgG', blocked: true },
    { code: '9699', asnd: '', name: 'Anti-Rib-P IgG', blocked: true },
    { code: '9700', asnd: '', name: 'Anti-Jo-1 IgG', blocked: true },
    { code: '9701', asnd: '', name: 'Anti-Centromeres IgG', blocked: true },
    { code: '9702', asnd: '', name: 'Anti-Scl-70 IgG', blocked: true },
    { code: '9703', asnd: '', name: 'Anti-SSA/SSB', blocked: true },
    { code: '9704', asnd: '', name: 'Anti-Mi-2 IgG', blocked: true },
    { code: '9705', asnd: '', name: 'Anti-PM/Scl IgG', blocked: true },
    { code: '9706', asnd: '', name: 'Anti-Ku IgG', blocked: true },
    { code: '9707', asnd: '', name: 'Anti-SRP IgG', blocked: true },
    { code: '9708', asnd: '', name: 'Anti-Rs/Ro', blocked: true },
    { code: '9709', asnd: '', name: 'Anti-Cardiolipin IgG', blocked: true },
    { code: '9710', asnd: '', name: 'Anti-Cardiolipin IgM', blocked: true },
    { code: '9711', asnd: '', name: 'Anti-MPO', blocked: true }
  ],
  'INFLAMMATION MONITORING': [
    { code: '932', asnd: 'L0088', name: 'CRP (High Sensitive)' },
    { code: '9486', asnd: 'L0635', name: 'PCT (Procalcitonin)' },
    { code: '9486', asnd: 'LR1051', name: 'Procalcitonin - Outsourced Abroad Only' },
    { code: '3462', asnd: 'L0662', name: 'IL-6 (Interleukin 6)' },
    { code: '9014', asnd: '', name: 'SAA (Serum Amyloid A)', blocked: true }
  ],
  'IMMUNOGLOBULIN': [
    { code: '9713', asnd: '', name: 'IgG', blocked: true },
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
  'MICROBIOLOGY': [
    { code: '', asnd: 'L0086', name: 'Sputum AFB x 3 Days' },
    { code: '', asnd: 'L0082', name: 'Pus C/S' },
    { code: '', asnd: 'L0085', name: 'Swabs C/S' },
    { code: '', asnd: 'L0084', name: 'Exudate C/S' },
    { code: '', asnd: 'L0048', name: 'Skin Scrapings for fungus' },
    { code: '', asnd: 'L0080', name: 'Urine C/S' },
    { code: '', asnd: 'L0025', name: 'Stool R/E' },
    { code: '', asnd: 'L0097', name: 'Stool C/S' },
    { code: '', asnd: 'L0117', name: 'HVS / Vaginal swab' },
    { code: '', asnd: 'L0059', name: 'Mantoux Test' }
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
    { code: '9800', asnd: 'USG025', name: 'Thyroid (Soft Tissue)' },
    { code: '9801', asnd: 'USG007', name: 'Whole Abdominal Scan' },
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
    { code: '9850', asnd: 'IL0012', name: 'Bone Densitometry' }
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
    { code: '6238', asnd: 'IL0002', name: 'ECG - 12 Leads With Rhythm Lead' }
  ]
};

// Selection management
const selectedTests = new Map(); // key -> {code, asnd, name, vinaviServiceId?}

function resolveVinaviServiceId(test) {
  try {
    const parentWin = window.parent && window.parent !== window ? window.parent : null;
    if (!parentWin) return null;

    if (parentWin.ServiceMap && typeof parentWin.ServiceMap.getMappedServiceId === 'function') {
      const sid = parentWin.ServiceMap.getMappedServiceId(test);
      if (sid) return sid;
    }

    const asndKey = test?.asnd ? String(test.asnd).trim().toUpperCase() : '';
    if (asndKey && parentWin.ROUTINE_SERVICE_MAP_BY_ASND && parentWin.ROUTINE_SERVICE_MAP_BY_ASND[asndKey]) {
      return parentWin.ROUTINE_SERVICE_MAP_BY_ASND[asndKey];
    }

    if (parentWin.ServiceMap && typeof parentWin.ServiceMap.makeKeysFromTest === 'function') {
      const keys = parentWin.ServiceMap.makeKeysFromTest(test);
      const staticMap = parentWin.__STATIC_SERVICE_MAP__ || {};
      for (const key of keys) {
        if (staticMap[key]) {
          return staticMap[key];
        }
      }
    }
  } catch (error) {
    console.warn('[Catalog] Unable to resolve Vinavi service ID:', error);
  }
  return null;
}

function prepareSelectedTest(test) {
  const enriched = {
    code: test.code || '',
    asnd: test.asnd || '',
    name: test.name || ''
  };
  const vinaviId = resolveVinaviServiceId(enriched);
  if (vinaviId) {
    enriched.vinaviServiceId = String(vinaviId);
  }
  return enriched;
}

function refreshServiceIdCells() {
  let selectionChanged = false;
  document.querySelectorAll('tbody tr').forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    const test = {
      code: checkbox.dataset.code,
      asnd: checkbox.dataset.asnd,
      name: checkbox.dataset.name
    };
    const key = getTestKey(test);
    const vinaviId = resolveVinaviServiceId(test);
    const cell = row.querySelector('.td-service');
    if (cell) cell.textContent = vinaviId || '';
    if (checkbox.checked) {
      const enriched = prepareSelectedTest(test);
      const previous = selectedTests.get(key);
      const prevId = previous && previous.vinaviServiceId;
      const newId = enriched.vinaviServiceId;
      if (newId && newId !== prevId) {
        selectedTests.set(key, enriched);
        selectionChanged = true;
      }
    }
  });
  if (selectionChanged) {
    notifyParent();
  }
}

function collectMissingVinaviIds() {
  const missing = [];
  Object.entries(LAB_DATA).forEach(([category, tests]) => {
    tests.forEach(test => {
      const vinaviId = resolveVinaviServiceId(test);
      if (!vinaviId) {
        missing.push({
          category,
          name: test.name,
          code: test.code || '',
          asnd: test.asnd || ''
        });
      }
    });
  });
  return missing;
}

// Generate unique key for each test
function getTestKey(test) {
  return test.code ? `C:${test.code}` : `N:${test.name}`;
}

// Refresh Vinavi IDs in the rendered catalog (call after service map loads)
function refreshVinaviIds() {
  // Modern layout uses .test-row and .cell-vinavi
  document.querySelectorAll('.test-row').forEach(row => {
    const checkbox = row.querySelector('input.test-checkbox');
    if (!checkbox) return;
    
    const test = {
      code: checkbox.dataset.code,
      asnd: checkbox.dataset.asnd,
      name: checkbox.dataset.testName
    };
    
    const vinaviId = resolveVinaviServiceId(test);
    const cell = row.querySelector('.cell-vinavi');
    if (cell) {
      cell.textContent = vinaviId || '-';
      // Update checkbox dataset as well
      if (vinaviId) {
        checkbox.dataset.serviceId = vinaviId;
      }
    }
  });
  
  // Also update old catalog-table layout if present
  document.querySelectorAll('.catalog-table tbody tr').forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    
    const test = {
      code: checkbox.dataset.code,
      asnd: checkbox.dataset.asnd,
      name: checkbox.dataset.name
    };
    
    const vinaviId = resolveVinaviServiceId(test);
    const cell = row.querySelector('.td-service');
    if (cell && vinaviId) {
      cell.textContent = vinaviId;
    }
  });
  
  console.log('[Catalog] Refreshed Vinavi IDs');
}

// Render catalog as tables in 3-column card layout
function renderCatalog() {
  const container = document.getElementById('catalogContainer');
  container.innerHTML = '';

  Object.keys(LAB_DATA).forEach(category => {
    const tests = LAB_DATA[category];
    
    // Create category card
    const section = document.createElement('div');
    section.className = 'category-card';
    
    // Category header with SELECT ALL toggle
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <span>${category}</span>
      <div class="category-tools">
        <label>
          <input type="checkbox" class="select-all-toggle" data-category="${category}" aria-label="Select all in ${category}">
          SELECT ALL
        </label>
      </div>
    `;
    
    // Create table
    const table = document.createElement('table');
    table.className = 'catalog-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Sel</th>
          <th>Code</th>
          <th>ASND</th>
          <th>Vinavi ID</th>
          <th>Investigation</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Add test rows
    tests.forEach(test => {
      const key = getTestKey(test);
      const serviceId = resolveVinaviServiceId(test);
      const isBlocked = test.blocked === true;
      const row = document.createElement('tr');
      if (isBlocked) row.classList.add('blocked-test');
      row.innerHTML = `
        <td class="td-sel">${isBlocked ? '<span class="block-icon" title="Not available / No Vinavi mapping">🚫</span>' : `<input type="checkbox" data-key="${key}" data-code="${test.code}" data-asnd="${test.asnd}" data-name="${test.name}">`}</td>
        <td class="td-code">${test.code || ''}</td>
        <td class="td-asnd">${test.asnd || ''}</td>
        <td class="td-service">${serviceId || ''}</td>
        <td class="td-name">${test.name}${isBlocked ? ' <span class="unavailable-badge">N/A</span>' : ''}</td>
      `;
      tbody.appendChild(row);
      
      // Add checkbox listener only if not blocked
      if (!isBlocked) {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.addEventListener('change', (e) => {
            toggleTest(test, e.target.checked);
          });
        }
      }
    });
    
    section.appendChild(header);
    section.appendChild(table);
    container.appendChild(section);
    
    // Add SELECT ALL toggle listener
    header.querySelector('.select-all-toggle').addEventListener('change', (e) => {
      const checked = e.target.checked;
      selectAllInCategory(category, tests, checked);
    });
  });
}

// Toggle single test
function toggleTest(test, isSelected) {
  const key = getTestKey(test);
  
  if (isSelected) {
    // Prepare test object with vinaviServiceId (handle both serviceId and vinaviServiceId property names)
    const testToStore = {
      code: test.code || '',
      asnd: test.asnd || '',
      name: test.name || '',
      vinaviServiceId: test.vinaviServiceId || test.serviceId || null
    };
    
    // If vinaviServiceId is still null, try to resolve it
    if (!testToStore.vinaviServiceId) {
      const resolvedId = resolveVinaviServiceId(testToStore);
      if (resolvedId) {
        testToStore.vinaviServiceId = String(resolvedId);
      }
    }
    
    selectedTests.set(key, testToStore);
    console.log('[Catalog] Added test:', test.name, 'Key:', key, 'VinaviID:', testToStore.vinaviServiceId);
  } else {
    selectedTests.delete(key);
    console.log('[Catalog] Removed test:', test.name, 'Key:', key);
  }

  updateSelectionSummary();
  notifyParent();
}

function updateSelectionSummary() {
  const summary = document.getElementById('selectionSummary');
  const count = document.getElementById('selectionCount');
  
  if (summary && count) {
    count.textContent = `${selectedTests.size} tests selected`;
    summary.classList.toggle('visible', selectedTests.size > 0);
  }
}

// Select all tests in a category
function selectAllInCategory(category, tests, checked = true) {
  tests.forEach(test => {
    const key = getTestKey(test);
    if (checked) {
      selectedTests.set(key, prepareSelectedTest(test));
    } else {
      selectedTests.delete(key);
    }
    // Update checkbox UI
    const checkbox = document.querySelector(`input[data-key="${key}"]`);
    if (checkbox) checkbox.checked = checked;
  });
  updateSelectionSummary();
  notifyParent();
}

function notifyParent() {
  // Send selected tests to parent window/dashboard
  if (window.parent !== window) {
    const testsArray = Array.from(selectedTests.values());
    
    // Check if we're in bundle creation mode or lab ordering mode
    const inBundleCreationMode = window.parent._pendingBundleName || window.parent._editingBundleId;
    
    if (inBundleCreationMode) {
      // Use bundle creation variable
      window.parent._bundleCreationTests = testsArray;
    } else {
      // Use lab ordering variable - always set as new array
      window.parent.selectedTests = testsArray.slice();
    }
    
    // Also send postMessage for any listeners
    window.parent.postMessage({
      type: 'testSelectionChanged',
      selectedTests: testsArray,
      context: inBundleCreationMode ? 'bundleCreation' : 'labOrdering'
    }, '*');
    
    // Update parent's display functions if available
    if (typeof window.parent.updateSelectedTestsDisplay === 'function') {
      window.parent.updateSelectedTestsDisplay();
    }
    
    // Update bundle sidebar if in bundle creation mode
    if (inBundleCreationMode && typeof window.parent.updateBundleSidebar === 'function') {
      window.parent.updateBundleSidebar();
    }
    
    console.log('[Catalog] Notified parent. Tests count:', testsArray.length);
  }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  document.querySelectorAll('tbody tr').forEach(item => {
    const code = item.children[1]?.textContent.toLowerCase() || '';
    const asnd = item.children[2]?.textContent.toLowerCase() || '';
    const serviceId = item.children[3]?.textContent.toLowerCase() || '';
    const name = item.children[4]?.textContent.toLowerCase() || '';
    
    const matches = code.includes(query) || asnd.includes(query) || serviceId.includes(query) || name.includes(query);
    item.classList.toggle('hidden', !matches);
  });

  // Hide categories with no visible tests
  document.querySelectorAll('.category-card').forEach(category => {
    const visibleTests = category.querySelectorAll('tbody tr:not(.hidden)');
    category.classList.toggle('hidden', visibleTests.length === 0);
  });
});

// Select/Clear currently filtered rows across the catalog
function selectOrClearFiltered(select = true) {
  const visibleRows = document.querySelectorAll('tbody tr:not(.hidden)');
  visibleRows.forEach(row => {
    const cb = row.querySelector('input[type="checkbox"]');
    if (!cb) return;
    const test = { code: cb.dataset.code, asnd: cb.dataset.asnd, name: cb.dataset.name };
    if (select) {
      cb.checked = true;
      selectedTests.set(getTestKey(test), prepareSelectedTest(test));
    } else {
      cb.checked = false;
      selectedTests.delete(getTestKey(test));
    }
  });
  updateSelectionSummary();
  notifyParent();
}

// Modern Catalog Rendering
let currentCategory = 'all';

function renderModernCatalog() {
  const container = document.getElementById('catalogContainer');
  const tabsContainer = document.getElementById('categoryTabs');
  const categories = Object.keys(LAB_DATA);
  
  // Clear existing content
  container.innerHTML = '';
  tabsContainer.innerHTML = '';
  
  // Create "All Tests" tab
  const allTab = document.createElement('div');
  allTab.className = 'category-tab active';
  allTab.textContent = 'All Tests';
  allTab.onclick = () => {
    currentCategory = 'all';
    switchCategory('all');
  };
  tabsContainer.appendChild(allTab);
  
  // Create category tabs
  categories.forEach(categoryName => {
    const tab = document.createElement('div');
    tab.className = 'category-tab';
    tab.textContent = categoryName;
    tab.onclick = () => {
      currentCategory = categoryName;
      switchCategory(categoryName);
    };
    tabsContainer.appendChild(tab);
  });
  
  // Render category sections - always show all when on "All Tests"
  categories.forEach(categoryName => {
    const section = createCategorySection(categoryName, LAB_DATA[categoryName]);
    container.appendChild(section);
  });
  
  // Show all sections by default
  document.querySelectorAll('.category-section').forEach(sec => {
    sec.style.display = 'block';
  });
}

function createCategorySection(categoryName, tests) {
  const section = document.createElement('div');
  section.className = 'category-section';
  section.setAttribute('data-category', categoryName);
  
  // Category Header with title only
  const header = document.createElement('div');
  header.className = 'category-header-table';
  
  const title = document.createElement('h3');
  title.className = 'category-title-table';
  title.textContent = categoryName;
  
  header.appendChild(title);
  
  // Create Table
  const table = document.createElement('table');
  table.className = 'tests-table';
  
  // Table Header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th class="col-select">Sel</th>
      <th class="col-code">Code</th>
      <th class="col-asnd">ASND</th>
      <th class="col-vinavi">Vinavi ID</th>
      <th class="col-investigation">Investigation</th>
    </tr>
  `;
  
  // Table Body
  const tbody = document.createElement('tbody');
  tests.forEach(test => {
    const row = createTestRow(test, categoryName);
    tbody.appendChild(row);
  });
  
  table.appendChild(thead);
  table.appendChild(tbody);
  
  section.appendChild(header);
  section.appendChild(table);
  
  return section;
}

function createTestRow(test, categoryName) {
  const row = document.createElement('tr');
  row.className = 'test-row';
  if (test.blocked) {
    row.classList.add('test-blocked');
  }
  
  const serviceId = resolveVinaviServiceId(test);
  const isSelected = window.parent.selectedTests?.some(t => t.serviceId === serviceId) || false;
  
  // Checkbox cell
  const checkboxCell = document.createElement('td');
  checkboxCell.className = 'cell-checkbox';
  if (!test.blocked) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'test-checkbox';
    checkbox.checked = isSelected;
    checkbox.dataset.code = test.code;
    checkbox.dataset.asnd = test.asnd;
    checkbox.dataset.serviceId = serviceId;
    checkbox.dataset.testName = test.name;
    checkbox.dataset.testCode = test.asnd;
    checkbox.dataset.category = categoryName;
    checkbox.onchange = () => {
      const testData = {
        code: checkbox.dataset.code,
        asnd: checkbox.dataset.asnd,
        name: checkbox.dataset.testName,
        serviceId: checkbox.dataset.serviceId
      };
      toggleTest(testData, checkbox.checked);
    };
    checkboxCell.appendChild(checkbox);
  } else {
    const blockedIcon = document.createElement('span');
    blockedIcon.className = 'blocked-icon';
    blockedIcon.innerHTML = '🚫';
    blockedIcon.title = 'Test not available';
    checkboxCell.appendChild(blockedIcon);
  }
  
  // Code cell
  const codeCell = document.createElement('td');
  codeCell.className = 'cell-code';
  codeCell.textContent = test.code || '-';
  
  // ASND cell
  const asndCell = document.createElement('td');
  asndCell.className = 'cell-asnd';
  asndCell.textContent = test.asnd || '-';
  
  // Vinavi ID cell
  const vinaviCell = document.createElement('td');
  vinaviCell.className = 'cell-vinavi';
  vinaviCell.textContent = serviceId || '-';
  
  // Investigation cell
  const investigationCell = document.createElement('td');
  investigationCell.className = 'cell-investigation';
  investigationCell.textContent = test.name;
  if (test.blocked) {
    const naTag = document.createElement('span');
    naTag.className = 'na-tag';
    naTag.textContent = 'N/A';
    investigationCell.appendChild(document.createTextNode(' '));
    investigationCell.appendChild(naTag);
  }
  
  row.appendChild(checkboxCell);
  row.appendChild(codeCell);
  row.appendChild(asndCell);
  row.appendChild(vinaviCell);
  row.appendChild(investigationCell);
  
  return row;
}

function selectAllInCategory(categoryName, checked) {
  const section = document.querySelector(`.category-section[data-category="${categoryName}"]`);
  if (!section) return;
  
  const checkboxes = section.querySelectorAll('.test-checkbox');
  checkboxes.forEach(cb => {
    if (cb.checked !== checked) {
      cb.checked = checked;
      const testData = {
        code: cb.dataset.code,
        asnd: cb.dataset.asnd,
        name: cb.dataset.testName,
        serviceId: cb.dataset.serviceId
      };
      toggleTest(testData, checked);
    }
  });
}

function createTestCard(test, categoryName) {
  const card = document.createElement('div');
  card.className = 'test-card';
  if (test.blocked) {
    card.classList.add('blocked');
  }
  
  const testKey = getTestKey(test);
  card.setAttribute('data-key', testKey);
  card.setAttribute('data-category', categoryName);
  
  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'test-checkbox';
  checkbox.disabled = !!test.blocked;
  checkbox.checked = selectedTests.has(testKey);
  checkbox.setAttribute('data-code', test.code);
  checkbox.setAttribute('data-asnd', test.asnd);
  checkbox.setAttribute('data-name', test.name);
  checkbox.setAttribute('data-key', testKey);
  
  checkbox.onchange = () => {
    if (checkbox.checked) {
      selectedTests.set(testKey, test);
      card.classList.add('selected');
    } else {
      selectedTests.delete(testKey);
      card.classList.remove('selected');
    }
    updateSelectionSummary();
    notifyParent();
  };
  
  // Test Info
  const info = document.createElement('div');
  info.className = 'test-info';
  
  const name = document.createElement('div');
  name.className = 'test-name';
  name.textContent = test.name;
  
  const metaDiv = document.createElement('div');
  metaDiv.className = 'test-meta';
  
  const codeSpan = document.createElement('span');
  codeSpan.className = 'test-code';
  codeSpan.textContent = test.code;
  
  metaDiv.appendChild(codeSpan);
  
  if (test.asnd) {
    const asndSpan = document.createElement('span');
    asndSpan.className = 'test-asnd';
    asndSpan.textContent = `ASND: ${test.asnd}`;
    metaDiv.appendChild(asndSpan);
  }
  
  if (test.blocked) {
    const unavailableSpan = document.createElement('span');
    unavailableSpan.className = 'test-unavailable';
    unavailableSpan.textContent = 'UNAVAILABLE';
    metaDiv.appendChild(unavailableSpan);
  }
  
  info.appendChild(name);
  info.appendChild(metaDiv);
  
  // Click card to toggle checkbox
  card.onclick = (e) => {
    if (e.target !== checkbox && !test.blocked) {
      checkbox.checked = !checkbox.checked;
      checkbox.onchange();
    }
  };
  
  card.appendChild(checkbox);
  card.appendChild(info);
  
  if (selectedTests.has(testKey)) {
    card.classList.add('selected');
  }
  
  return card;
}

function getCategoryIcon(categoryName) {
  const icons = {
    'HAEMATOLOGY': '<svg width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="3"/><circle cx="6" cy="8" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="6" cy="16" r="2"/><circle cx="18" cy="16" r="2"/></svg>',
    'CLINICAL PATHOLOGY': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v4m6-4v4M8 6h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2zm0 6h8m-8 4h8"/></svg>',
    'ELECTROLYTES': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    'DIABETOLOGY': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>',
    'CARDIAC PROFILE': '<svg width="24" height="24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    'LIPID PROFILE': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zm0 18l-10-5v8l10 5 10-5v-8l-10 5z"/></svg>',
    'LIVER FUNCTION TEST': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="9" ry="7"/><path d="M8 12h8M10 8h4m-4 8h4"/></svg>',
    'RENAL FUNCTION TEST': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2c-2 0-3 2-3 5s1 5 3 5 3-2 3-5-1-5-3-5zm8 0c-2 0-3 2-3 5s1 5 3 5 3-2 3-5-1-5-3-5zM8 12c-2 0-3 2-3 5s1 5 3 5 3-2 3-5-1-5-3-5zm8 0c-2 0-3 2-3 5s1 5 3 5 3-2 3-5-1-5-3-5z"/></svg>',
    'BONE PROFILE': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="8" rx="3"/><rect x="8" y="10" width="8" height="12" rx="2"/></svg>',
    'THYROID PROFILE': '<svg width="24" height="24" fill="currentColor"><path d="M12 2C9 2 7 4 7 7v3c0 2-1 3-2 4v2h14v-2c-1-1-2-2-2-4V7c0-3-2-5-5-5zm-2 18c0 1.1.9 2 2 2s2-.9 2-2h-4z"/></svg>',
    'PROTEINS': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 14v8m-4-4h8"/></svg>',
    'TUMOR MARKERS': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    'HORMONES': '<svg width="24" height="24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
    'SEROLOGY': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    'INFECTIOUS DISEASES': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>',
    'AUTOIMMUNE DISEASES': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></svg>',
    'MICROBIOLOGY': '<svg width="24" height="24" fill="currentColor"><circle cx="8" cy="8" r="4"/><circle cx="16" cy="8" r="3"/><circle cx="12" cy="16" r="4"/></svg>',
    'SWABS': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4"/></svg>',
    'X-RAY': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>',
    'USG SCANS': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h2l3-9 4 18 3-9h2"/></svg>',
    'BONE SCAN': '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-2 7h4l-2-7z"/><rect x="8" y="9" width="8" height="13" rx="2"/></svg>'
  };
  
  return icons[categoryName] || '<svg width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>';
}

function switchCategory(category) {
  // Update tabs
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.remove('active');
    if ((category === 'all' && tab.textContent === 'All Tests') || 
        (category !== 'all' && tab.textContent === category)) {
      tab.classList.add('active');
    }
  });
  
  // Show/hide sections
  document.querySelectorAll('.category-section').forEach(section => {
    if (category === 'all') {
      section.style.display = 'block';
    } else {
      const sectionCategory = section.getAttribute('data-category');
      if (sectionCategory === category) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    }
  });
  
  // Apply current search filter if any
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) {
    filterTests(searchInput.value.trim());
  }
}

function selectAllInCategory(categoryName) {
  const section = document.querySelector(`.category-section[data-category="${categoryName}"]`);
  if (!section) return;
  
  const checkboxes = section.querySelectorAll('.test-checkbox:not([disabled])');
  checkboxes.forEach(cb => {
    if (!cb.checked) {
      cb.checked = true;
      cb.onchange();
    }
  });
}

function filterTests(searchTerm) {
  const term = searchTerm.toLowerCase();
  const sections = document.querySelectorAll('.category-section');
  let hasVisibleTests = false;
  
  sections.forEach(section => {
    const rows = section.querySelectorAll('.test-row');
    let visibleInSection = 0;
    
    rows.forEach(row => {
      // Get test data from table cells
      const investigationCell = row.querySelector('.cell-investigation');
      const codeCell = row.querySelector('.cell-code');
      const asndCell = row.querySelector('.cell-asnd');
      
      if (!investigationCell) return;
      
      const name = investigationCell.textContent.toLowerCase();
      const code = codeCell ? codeCell.textContent.toLowerCase() : '';
      const asnd = asndCell ? asndCell.textContent.toLowerCase() : '';
      
      const matches = name.includes(term) || code.includes(term) || asnd.includes(term);
      
      if (matches) {
        row.style.display = '';
        visibleInSection++;
        hasVisibleTests = true;
      } else {
        row.style.display = 'none';
      }
    });
    
    // Hide entire category section if no tests match
    if (visibleInSection === 0) {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
    }
  });
  
  // Show empty state if no results
  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    if (hasVisibleTests) {
      emptyState.style.display = 'none';
    } else {
      emptyState.style.display = 'block';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Expose LAB_DATA to parent window for fullscreen catalog sync
  if (window.parent && window.parent !== window) {
    try {
      window.parent.LAB_DATA = LAB_DATA;
      console.log('[Catalog] Exposed LAB_DATA to parent window:', Object.keys(LAB_DATA).length, 'categories');
    } catch (e) {
      console.warn('[Catalog] Could not expose LAB_DATA to parent:', e.message);
    }
  }
  // Also set on current window
  window.LAB_DATA = LAB_DATA;
  
  renderModernCatalog();
  
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim();
      if (term) {
        filterTests(term);
      } else {
        // Reset all rows to visible
        document.querySelectorAll('.test-row').forEach(row => {
          row.style.display = '';
        });
        // Reset all sections to visible
        document.querySelectorAll('.category-section').forEach(section => {
          section.style.display = 'block';
        });
        // Reset sections based on current category
        switchCategory(currentCategory);
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
          emptyState.style.display = 'none';
        }
      }
    });
  }
  
  // Select All Visible button
  const selectFilteredBtn = document.getElementById('selectFilteredBtn');
  if (selectFilteredBtn) {
    selectFilteredBtn.addEventListener('click', () => {
      const visibleRows = Array.from(document.querySelectorAll('.test-row'))
        .filter(row => row.style.display !== 'none');
      
      visibleRows.forEach(row => {
        const checkbox = row.querySelector('.test-checkbox');
        if (checkbox && !checkbox.disabled && !checkbox.checked) {
          checkbox.checked = true;
          checkbox.onchange();
        }
      });
    });
  }
  
  // Clear All button
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.test-checkbox:checked').forEach(cb => {
        cb.checked = false;
        cb.onchange();
      });
    });
  }
  
  // Clear Selection button in summary bar
  const clearSelectionBtn = document.getElementById('clearSelectionBtn');
  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener('click', () => {
      document.querySelectorAll('.test-checkbox:checked').forEach(cb => {
        cb.checked = false;
        cb.onchange();
      });
    });
  }
  
  // Try to refresh Vinavi IDs after a short delay
  setTimeout(() => {
    refreshVinaviIds();
  }, 500);
  
  // Handle messages from parent window
  if (window.parent && window.parent !== window) {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'serviceMapLoaded') {
        refreshVinaviIds();
      }
      
      // Handle clear all tests request from parent
      if (event.data && event.data.type === 'clearAllTests') {
        console.log('[Catalog] Clearing all tests');
        selectedTests.clear();
        
        // Uncheck all checkboxes
        document.querySelectorAll('.test-checkbox').forEach(cb => {
          cb.checked = false;
          const card = cb.closest('.test-card');
          if (card) card.classList.remove('selected');
        });
        
        // Also uncheck category select-all toggles
        document.querySelectorAll('.select-all-toggle').forEach(toggle => {
          toggle.checked = false;
        });
        
        updateSelectionSummary();
        console.log('[Catalog] All tests cleared');
      }
      
      // Handle uncheck request from parent
      if (event.data && event.data.type === 'uncheckTest') {
        const testToUncheck = event.data.test;
        if (testToUncheck) {
          console.log('[Catalog] Unchecking test:', testToUncheck);
          const checkboxes = document.querySelectorAll('.test-checkbox');
          let found = false;
          
          checkboxes.forEach(cb => {
            const cbCode = cb.dataset.code || cb.getAttribute('data-code') || '';
            const cbAsnd = cb.dataset.asnd || cb.getAttribute('data-asnd') || '';
            const cbName = cb.dataset.testName || cb.dataset.name || cb.getAttribute('data-name') || '';
            
            if ((testToUncheck.code && cbCode === testToUncheck.code) ||
                (testToUncheck.asnd && cbAsnd === testToUncheck.asnd) ||
                (testToUncheck.name && cbName === testToUncheck.name)) {
              if (cb.checked) {
                found = true;
                cb.checked = false;
                const testKey = cb.dataset.key || cb.getAttribute('data-key');
                if (testKey && selectedTests.has(testKey)) {
                  selectedTests.delete(testKey);
                  console.log('[Catalog] Removed from selectedTests:', testKey);
                }
                const card = cb.closest('.test-card');
                if (card) card.classList.remove('selected');
              }
            }
          });
          
          if (found) {
            updateSelectionSummary();
            // DO NOT call notifyParent() here - the parent already updated
            console.log('[Catalog] Test unchecked successfully, selectedTests count:', selectedTests.size);
          } else {
            console.warn('[Catalog] Test not found for unchecking:', testToUncheck);
          }
        }
      }
      
      // Handle check multiple tests request (bundle applied)
      if (event.data && event.data.type === 'checkTests') {
        const testsToCheck = event.data.tests;
        if (Array.isArray(testsToCheck) && testsToCheck.length > 0) {
          console.log('[Catalog] Checking tests from bundle:', testsToCheck.length);
          const checkboxes = document.querySelectorAll('.test-checkbox');
          
          testsToCheck.forEach(testToCheck => {
            checkboxes.forEach(cb => {
              const cbCode = cb.dataset.code || cb.getAttribute('data-code') || '';
              const cbAsnd = cb.dataset.asnd || cb.getAttribute('data-asnd') || '';
              const cbName = cb.dataset.testName || cb.dataset.name || cb.getAttribute('data-name') || '';
              
              if ((testToCheck.code && cbCode === testToCheck.code) ||
                  (testToCheck.asnd && cbAsnd === testToCheck.asnd) ||
                  (testToCheck.name && cbName === testToCheck.name)) {
                if (!cb.checked && !cb.disabled) {
                  cb.checked = true;
                  const testKey = cb.dataset.key || cb.getAttribute('data-key');
                  if (testKey) {
                    // Build complete test object with all fields including vinaviServiceId
                    const test = {
                      code: cbCode,
                      asnd: cbAsnd,
                      name: cbName,
                      vinaviServiceId: testToCheck.vinaviServiceId || cb.dataset.serviceId || null
                    };
                    selectedTests.set(testKey, test);
                  }
                  const card = cb.closest('.test-card');
                  if (card) card.classList.add('selected');
                }
              }
            });
          });
          
          updateSelectionSummary();
          // DO NOT call notifyParent() - parent already has the data from bundle apply
          console.log('[Catalog] Bundle tests checked - NOT notifying parent (parent initiated)');
        }
      }
    });
  }
});

// Make refreshVinaviIds accessible to parent window
window.refreshCatalogVinaviIds = refreshVinaviIds;

// Export selected tests function (called by parent)
window.getSelectedTests = () => {
  return Array.from(selectedTests.keys());
};

window.reportTestsMissingVinaviId = () => {
  const missing = collectMissingVinaviIds();
  if (missing.length === 0) {
    console.info('[Catalog] All tests currently have a resolved Vinavi service ID.');
  } else {
    console.groupCollapsed(`[Catalog] ${missing.length} test(s) missing Vinavi service IDs`);
    console.table(missing);
    console.groupEnd();
  }
  return missing;
};

// Listen for messages from parent dashboard
window.addEventListener('message', (event) => {
  if (event.data.type === 'clearSelection') {
    // Clear all selections
    selectedTests.clear();
    document.querySelectorAll('.test-checkbox').forEach(cb => {
      cb.checked = false;
    });
    updateSelectionSummary();
    notifyParent();
  } else if (event.data.type === 'uncheckTest') {
    // Uncheck a specific test - match by serviceId, code, or asnd
    const test = event.data.test;
    if (test) {
      // Find and uncheck the checkbox
      let found = false;
      document.querySelectorAll('.test-checkbox').forEach(cb => {
        const matches = 
          (test.serviceId && cb.dataset.serviceId === test.serviceId) ||
          (test.code && cb.dataset.code === test.code) ||
          (test.asnd && cb.dataset.asnd === test.asnd);
        
        if (matches) {
          cb.checked = false;
          found = true;
          
          // Remove from selectedTests
          const testData = {
            code: cb.dataset.code,
            asnd: cb.dataset.asnd,
            name: cb.dataset.testName,
            serviceId: cb.dataset.serviceId
          };
          const key = getTestKey(testData);
          selectedTests.delete(key);
        }
      });
      
      if (found) {
        updateSelectionSummary();
        console.log('[Catalog] Unchecked test:', test);
      }
    }
  } else if (event.data.type === 'syncTests') {
    // Sync all tests from parent (e.g., when bundle is applied)
    // DO NOT notify parent back - parent already has the correct data
    const parentTests = event.data.tests || [];
    console.log('[Catalog] Syncing tests from parent:', parentTests.length);
    
    // First, uncheck all and clear our internal selection
    document.querySelectorAll('.test-checkbox').forEach(cb => {
      cb.checked = false;
    });
    selectedTests.clear();
    
    let matchedCount = 0;
    
    // Then check only the ones in parentTests
    parentTests.forEach(test => {
      let foundMatch = false;
      document.querySelectorAll('.test-checkbox').forEach(cb => {
        if (foundMatch) return; // Already found this test
        
        // Get checkbox attributes (support both naming conventions)
        const cbServiceId = cb.dataset.serviceId || cb.getAttribute('data-service-id') || '';
        const cbCode = cb.dataset.code || cb.getAttribute('data-code') || '';
        const cbAsnd = cb.dataset.asnd || cb.getAttribute('data-asnd') || '';
        const cbName = cb.dataset.testName || cb.dataset.name || cb.getAttribute('data-name') || '';
        
        // Match by serviceId/vinaviServiceId, code, asnd, or name
        const testServiceId = test.serviceId || test.vinaviServiceId || '';
        const testCode = test.code || '';
        const testAsnd = test.asnd || '';
        const testName = test.name || '';
        
        const matches = 
          (testServiceId && cbServiceId && cbServiceId === testServiceId) ||
          (testCode && cbCode && cbCode === testCode) ||
          (testAsnd && cbAsnd && cbAsnd === testAsnd) ||
          (testName && cbName && cbName.toLowerCase() === testName.toLowerCase());
        
        if (matches && !cb.disabled) {
          cb.checked = true;
          foundMatch = true;
          matchedCount++;
          
          // Add to our internal selection (but don't notify parent)
          const testData = {
            code: cbCode,
            asnd: cbAsnd,
            name: cbName,
            serviceId: cbServiceId,
            vinaviServiceId: cbServiceId
          };
          selectedTests.set(getTestKey(testData), prepareSelectedTest(testData));
          console.log('[Catalog] Matched and checked:', cbName);
        }
      });
      
      if (!foundMatch) {
        console.warn('[Catalog] Could not find match for test:', test);
      }
    });
    
    // Update summary bar but DO NOT call notifyParent - parent already has the data!
    updateSelectionSummary();
    console.log('[Catalog] Sync complete. Matched:', matchedCount, 'of', parentTests.length, '- NOT notifying parent (parent initiated sync)');
  } else if (event.data.type === 'serviceMappingUpdated') {
    refreshServiceIdCells();
  } else if (event.data.type === 'ready') {
    // Notify parent of initial state
    notifyParent();
  }
});

// Expand to Fullscreen button handler
document.addEventListener('DOMContentLoaded', () => {
  const expandBtn = document.getElementById('expandFullscreenBtn');
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      // Get current selections
      const currentSelections = Array.from(selectedTests.values());
      
      // Send message to parent to open fullscreen catalog
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'openFullscreenCatalog',
          preselectedTests: currentSelections
        }, '*');
      }
      
      console.log('[Catalog] Requested fullscreen mode with', currentSelections.length, 'pre-selected tests');
    });
  }
});
