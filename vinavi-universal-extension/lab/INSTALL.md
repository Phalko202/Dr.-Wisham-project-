# Installation & Setup Guide

## Quick Start

1. **Load Extension in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" button
   - Select the `vinavi-lab-extension` folder
   - Extension will be installed and icon will appear in toolbar

2. **First Use**
   - Ensure you are logged into Aasandha Portal (auth.aasandha.mv)
   - Click the extension icon to open dashboard
   - Dashboard opens in a new tab

3. **Workflow**
   ```
   Search Patient → Select Patient → View Episodes → Select Episode → 
   Choose Lab Tests → Submit to Vinavi
   ```

## API Endpoints

The extension communicates with:
- `https://auth.aasandha.mv` - Authentication
- `https://vinavi.aasandha.mv` - Patient data and lab orders

## Authentication

Extension uses existing Aasandha Portal session cookies. Make sure you're logged in to the portal before using the extension.

## Troubleshooting

**Connection Issues:**
- Go to Settings view in dashboard
- Click "Test Connection" to verify API accessibility
- Ensure you're logged into Aasandha Portal

**No Search Results:**
- Verify patient exists in Vinavi system
- Check API connection status
- Try different search terms (ID, name, NIC, phone)

**Can't Submit Orders:**
- Ensure at least one test is selected
- Verify episode is active
- Check authentication status

## Files Structure

```
vinavi-lab-extension/
├── manifest.json          - Extension configuration
├── background.js          - Service worker for API calls
├── dashboard.html         - Main dashboard interface
├── lab-catalog.html       - Lab tests catalog
├── content.js            - Vinavi page integration
├── content.css           - Content script styles
├── scripts/
│   ├── dashboard.js      - Dashboard logic
│   └── lab-catalog.js    - Catalog data & logic
└── styles/
    └── dashboard.css     - Dashboard styles
```

## Support

For issues or questions, contact HMH IT Support.
