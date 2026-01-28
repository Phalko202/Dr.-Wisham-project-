# HOW TO INSTALL & USE

## Installation Steps

1. **Open Chrome or Edge**
   
2. **Go to Extensions Page**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

3. **Enable Developer Mode**
   - Look for toggle switch in top-right corner (Chrome) or left sidebar (Edge)
   - Turn it ON

4. **Load the Extension**
   - Click "Load unpacked" button
   - Browse to: `c:\Users\Abdulla.faalih\Documents\coding files\aa1`
   - Click "Select Folder"

5. **Done!**
   - Extension is now installed and ready to use

## How to Use

1. Open browser and go to: https://dharaka.hmh.mv
2. Log in to the portal
3. Navigate to: **OPD Workflow > Results Validation**
4. Click on a patient's test results (the page with the lab test table)
5. Click the extension icon in browser toolbar
6. Click **"Extract Data"** button
7. View results in 3 formats:
   - **Formatted** - Organized by category with WNL display
   - **JSON** - Structured data format  
   - **Table** - Visual table view

## Features

✅ **Categorizes tests** into groups:
   - Complete Hemogram (HB, RBC, WBC, Platelets, etc.)
   - Differential Count (Neutrophils, Lymphocytes, etc.)
   - Inflammatory Markers (CRP, ESR, etc.)
   - Liver Function Tests
   - Renal Function Tests
   - Dengue Profile
   - And more...

✅ **WNL Display**: 
   - Normal values = "WNL" (Within Normal Limits)
   - Abnormal values = Shows actual number with ⚠️ warning

✅ **Copy to clipboard** or **Download as file**

✅ **No patient personal info** - Only test results

## Example Output

```
═══════════════════════════════════
   LAB TEST RESULTS
═══════════════════════════════════

▶ COMPLETE HEMOGRAM
───────────────────────────────────
  C-REACTIVE PROTEIN
    Result: WNL
    Reference: < 1.0

  RBC
    Result: 5.73 10^6/uL ⚠️
    Reference: 4.00-5.50

  HB
    Result: WNL
    Reference: 11.0-17.0

  HCT (PCV)
    Result: 47.7 % ⚠️
    Reference: 40.0-47.0

▶ DIFFERENTIAL COUNT
───────────────────────────────────
  Neutrophils
    Result: WNL
    Reference: 40-72

  Monocytes
    Result: 13.0 % ⚠️
    Reference: 0-1
```

## Troubleshooting

**Extension not loading?**
- Make sure you selected the correct folder
- Check that all files are present (manifest.json, content.js, popup.html, etc.)

**Extract button not working?**
- Ensure you're on the results page with the test table visible
- Refresh the page and try again
- Check browser console (F12) for errors

**No data showing?**
- Make sure the test results table is fully loaded
- Verify you're on the "Results Validation" page
- The page should have a table with columns: Test Name, LIS Result, Unit, Reference Range

---

Made for Hulhumale Hospital Lab Portal  
Version 1.0.0
