# Lab Test Data Extractor - Chrome Extension

A Chrome extension designed specifically for **Hulhumale Hospital (dharaka.hmh.mv)** to extract lab test results quickly and efficiently.

## 🎯 Features

- **One-Click Extraction**: Extract all lab test results from the Results Validation page with a single click
- **Multiple Export Formats**: 
  - Formatted text (human-readable)
  - JSON (for data processing)
  - Table view (visual comparison)
- **Copy to Clipboard**: Easily copy results in any format
- **Download Results**: Save lab test data as text files
- **Abnormal Value Detection**: Automatically highlights abnormal test values
- **Patient Information**: Extracts patient details including BHT, Sample ID, Age, Gender, and Barcode ID

## 📋 What It Extracts

The extension extracts the following information:

### Patient Information
- Name
- BHT (Bed Head Ticket)
- Sample ID
- Age
- Gender
- Barcode ID

### Test Results
- Test Name (e.g., C-REACTIVE PROTEIN, HB, RBC, etc.)
- Result Value
- Unit of Measurement
- Reference Range
- Delta Check
- Machine Used
- Abnormal Status

### Example Output

```
=== LAB TEST RESULTS ===

--- Patient Information ---
Name: ABDULLA FAALIH
BHT: 44L 210925
Sample ID: 44L 210925
Age: 19
Gender: Male
Barcode ID: E3172717640

--- Test Results ---

C-REACTIVE PROTEIN: 1.0 mg/dL (Ref: <1.0)

COMPLETE BLOOD COUNT
─────────────────────
RBC: 5.73 10^6/uL (Ref: 4.00-5.50) ⚠️ ABNORMAL
HB: 16.6 g/dL (Ref: 11.0-17.0)
HCT (PCV): 47.7 % (Ref: 40.0-47.0) ⚠️ ABNORMAL
MCV: 83.2 fL (Ref: 76.0-96.0)
MCH: 29.0 pg (Ref: 27.0-33.0)
MCHC: 34.8 g/dL (Ref: 32.0-36.0)
...
```

## 🚀 Installation

### Step 1: Download the Extension

1. Download or clone this repository to your computer
2. Make sure all files are in the same folder

### Step 2: Install in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the folder containing the extension files
6. The extension icon should appear in your Chrome toolbar

### Step 3: Generate Icons (Optional)

The extension requires icon files. You can:

**Option A: Use a placeholder**
- Create simple PNG files named `icon16.png`, `icon48.png`, `icon128.png` in the `icons/` folder
- Use any medical/lab-related icon

**Option B: Create icons using an online tool**
- Visit https://www.favicon-generator.org/
- Upload a medical/lab icon image
- Download the generated icons
- Rename them to `icon16.png`, `icon48.png`, `icon128.png`
- Place them in the `icons/` folder

## 📖 How to Use

1. **Navigate to the Hospital Portal**
   - Go to `dharaka.hmh.mv`
   - Log in to your account
   - Navigate to the Results Validation page (the page with lab test results)

2. **Extract Data**
   - Click the extension icon in your Chrome toolbar
   - Click the **"Extract Data"** button
   - The extension will automatically extract all test results

3. **View Results**
   - Switch between different views using the tabs:
     - **Formatted**: Human-readable text format
     - **JSON**: Structured data format
     - **Table**: Visual table format

4. **Export Data**
   - **Copy Text**: Copy formatted text to clipboard
   - **Copy JSON**: Copy JSON data to clipboard
   - **Download**: Save as a text file

## 🔧 Technical Details

### Files Structure

```
aa1/
├── manifest.json          # Extension configuration
├── content.js            # Data extraction logic
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── popup.css             # Styling
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Permissions

The extension requires:
- `activeTab`: To access the current tab's content
- `scripting`: To inject the content script
- Host permissions for `dharaka.hmh.mv`

## 🛠️ Troubleshooting

### Extension doesn't appear
- Make sure Developer mode is enabled in `chrome://extensions/`
- Check that all files are in the correct folder
- Reload the extension

### "No data extracted" message
- Ensure you're on the Results Validation page
- Check that the page has fully loaded
- Try refreshing the page and extracting again

### Data extraction incomplete
- The page structure might have changed
- Check the browser console for errors (F12 → Console)
- Report the issue with screenshots

## 🔒 Privacy & Security

- This extension only works on `dharaka.hmh.mv`
- No data is sent to external servers
- All data processing happens locally in your browser
- Extracted data is only stored temporarily in your browser's local storage

## 📝 Updates & Maintenance

To update the extension:
1. Download the latest version
2. Replace the old files
3. Go to `chrome://extensions/`
4. Click the refresh icon on the extension card

## 🤝 Support

If you encounter any issues:
1. Check the Troubleshooting section
2. Verify you're using the latest version
3. Check browser console for errors
4. Report issues with detailed screenshots

## ⚖️ License

This extension is created for internal use at Hulhumale Hospital.

## 📌 Version

**Version 1.0.0** - Initial Release

---

**Note**: This extension is specifically designed for the Hulhumale Hospital portal. It may not work on other websites or lab portals.
