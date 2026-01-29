const DEFAULTS = {
  // Mapping (selectors are optional; label regex is used as fallback)
  patientSearchSelector: '',
  patientSearchLabelRegex: '(patient|id card|idcard|national id|search)',

  complaintSelector: '',
  complaintLabelRegex: '(complaint|chief complaint|presenting complaint)',

  historySelector: '',
  historyLabelRegex: '(history|hpi|present illness)',

  assessmentSelector: '',
  assessmentLabelRegex: '(assessment|diagnosis|impression)',

  medicationsSelector: '',
  medicationsLabelRegex: '(medication|medicine|rx|prescription)',

  adviceSelector: '',
  adviceLabelRegex: '(advice|counsel|counselling|education)',

  servicesSelector: '',
  servicesLabelRegex: '(services|procedure|investigation|lab|radiology)',

  // Episode scraping
  viewLabel: 'VIEW',
  episodeTextSelector: 'body',

  // AI
  openaiApiKey: '',
  aiModel: 'gpt-4o-mini'
};

export async function getSettings() {
  const stored = await chrome.storage.local.get(['settings']);
  return { ...DEFAULTS, ...(stored.settings || {}) };
}

export async function setSettings(partial) {
  const cur = await getSettings();
  const next = { ...cur, ...(partial || {}) };
  await chrome.storage.local.set({ settings: next });
}
