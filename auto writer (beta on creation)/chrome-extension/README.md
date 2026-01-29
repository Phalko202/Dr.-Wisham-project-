# Vinavi AutoWriter (Chrome Extension)

This is a **Manifest V3** Chrome extension that runs in a side panel while you use Vinavi.

Safety model:
- You **log in manually**.
- Read-only history scraping only clicks **VIEW** and reads page text.
- Filling into fields happens only when you click **Fill mapped fields**.
- No auto-submit.

## Install (no admin, if Developer Mode is allowed)
1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the folder: `chrome-extension/`

## Use
1. Open `https://vinavi.aasandha.mv` and log in manually
2. Click the extension → **Open Side Panel**
3. In **Options**, set selectors if needed
4. Use:
   - **Search in Vinavi** (fills the patient search field + presses Enter)
   - **Fetch** (scrapes consultations by clicking VIEW / opening VIEW links)
   - **Ask (AI optional)** (requires OpenAI key in Options)

## Mapping tips
- Use **Diagnose** to list visible inputs and selector hints.
- Prefer stable selectors like element IDs.

If your hospital policy blocks Developer Mode or extensions, you’ll need IT approval.
