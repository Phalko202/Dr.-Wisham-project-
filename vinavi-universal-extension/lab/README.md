# HMH Lab Test Extension - Vinavi Integration

Chrome extension for ordering lab tests from HMH Laboratory Test Catalog through Vinavi Portal.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `vinavi-lab-extension` folder

## Usage

1. Click the extension icon to open the dashboard
2. Search for a patient using ID, name, NIC, or phone
3. Select a patient to view their episodes
4. Click on an episode to open lab ordering
5. Select lab tests from the catalog
6. Submit order to Vinavi portal

## API Configuration

The extension connects to:
- **Auth**: https://auth.aasandha.mv
- **Vinavi**: https://vinavi.aasandha.mv

Requires active authentication session with Aasandha Portal.

## Features

- Patient search and selection
- Episode management
- 200+ lab tests organized in categories
- Real-time test selection
- Direct integration with Vinavi API
- Modern dashboard interface
