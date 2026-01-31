# Medicine Database Management

## How to Add Medicines from Aasandha API

### Method 1: Import from Network Tab JSON

1. **Open Vinavi Portal** and go to prescriptions
2. **Search for a medicine** (e.g., "fexofen")
3. **Open DevTools** (F12) → **Network** tab
4. **Find the medicines request** (filter[query]=...)
5. **Click on it** → **Response** tab
6. **Copy the entire JSON**
7. **Open Extension Console**:
   ```javascript
   // Paste your JSON, then run:
   const jsonData = {paste JSON here};
   const imported = MedicineDatabase.importFromAasandhaJSON(jsonData);
   console.log(`Imported ${imported.length} medicines:`, imported);
   ```

### Method 2: Export/Import Database for Backup

**Export (Backup):**
```javascript
// In browser console
const backup = MedicineDatabase.exportToJSON();
console.log(backup);
// Copy the output and save to a file: medicines-backup.json
```

**Import (Restore):**
```javascript
// Paste your backup JSON:
const backupData = '[{paste backup here}]';
MedicineDatabase.importFromJSON(backupData);
```

### Method 3: Manual Addition

Edit `scripts/medicine-database.js` and add:

```javascript
{
  id: 'MEDXXX',
  vinaviCode: 'M1234',     // From Aasandha "code"
  mfdaCode: 'P5678',        // From Aasandha "mfda_code"
  name: 'Medicine Name',    // Brand name
  generic: 'Generic Name',  // Generic/active ingredient
  strength: '100 mg',       // Dosage strength
  form: 'Tablet',          // Preparation form
  category: 'Antibiotic'   // Medicine category
}
```

## Transfer Between Computers

### Export Current Database:
```javascript
MedicineDatabase.exportToJSON()
```

### On New Computer:
1. Install extension
2. Open console
3. Run: `MedicineDatabase.importFromJSON('paste backup here')`

## Database Structure

Each medicine has:
- `id`: Unique identifier
- `vinaviCode`: Vinavi medicine code (M1148)
- `mfdaCode`: MFDA registration code (P2264)
- `name`: Brand/product name (Fexofen)
- `generic`: Generic name (Fexofenadine)
- `strength`: Dosage (180 mg)
- `form`: Preparation type (Tablet, Syrup, Capsule, etc.)
- `category`: Medicine class (Antibiotic, Analgesic, etc.)

## Current Database Stats

- Total Medicines: 100+
- Categories: 12
- Includes: Analgesics, Antibiotics, Antihistamines, Cardiovascular, GI, Respiratory, Vitamins, etc.

## Adding Medicines from Your JSON

The JSON you provided has been processed:
- ✅ Fexofen 180mg (M1148, P2264)
- ✅ Fexofen 120mg (M1149, P2265)
- ✅ Fexofenadine 30mg, 60mg (tablets)
- ✅ Fexofenadine liquid forms
- ✅ Iron complex supplement

All medicines are now searchable in Clinical Sets!
