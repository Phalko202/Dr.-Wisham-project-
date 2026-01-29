# Vinavi AutoWriter

A desktop app that helps clinicians **draft** structured notes (with an AI model), **review** them, then **assistively fill** the Vinavi portal fields using browser automation.

Important safety constraints:
- The app is designed for **assistive drafting**. A clinician must review/edit before anything is filled.
- The app does **not** capture or store Vinavi credentials. Login is done manually in the browser.
- Start with **filling only** (no auto-submit). You can add submit later once you’re confident.

## Prerequisites
- Install Node.js LTS (includes npm).
- Windows 10/11 recommended.

## Setup
```bash
npm install
npx playwright install chromium
```

Create an `.env` file in the project root:
```ini
OPENAI_API_KEY=YOUR_KEY
AI_MODEL=gpt-4o-mini
```

## Run (dev)
```bash
npm run dev
```

## Build an EXE (installer)
```bash
npm run dist:win
```
Output goes to `dist/`.

## Portal mapping (required)
Vinavi is a third‑party site and the app can’t know field selectors ahead of time.
Update the mapping in `config/vinavi.mapping.json` to match your portal’s fields.

You’ll typically set:
- `loggedInUrlIncludes` (or a known selector)
- `patientSearch` selector/label
- Field locators for complaint/medications/advice/services

## Notes
This repo is a starter. Next step is to open Vinavi, inspect the DOM, and fill in the mapping JSON.

## Safe testing (recommended)
Use the built-in local portal first so you can test automation without risk of writing into real patient history.

- In the app header, choose **Test Portal (safe)**
- Click **Open Vinavi** (it will open the local test portal)
- Click **Login** inside the test portal page
- Enter any ID card value and press Enter (or click Load)
- Generate a draft, tick **I reviewed/edited this draft**, then **Fill into Vinavi**

If fill works on the test portal, then switch the profile to **Vinavi (real)** and configure `config/vinavi.mapping.json`.

## If you cannot install anything (hospital PC)
If your workstation blocks installing Node/Electron/Playwright, you **cannot** run the automation/scraper there.

Use the no-install offline helper instead:
- Open [lite/index.html](lite/index.html) in Chrome/Edge (double-click the file)
- Use it for drafting and for summarizing pasted episode text

For full automation on a locked-down PC, the practical options are:
- Ask IT to whitelist the EXE build
- Run the EXE on an approved machine (VM/personal laptop) and copy/paste results into Vinavi
