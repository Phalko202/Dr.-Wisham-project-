import { getSettings, setSettings } from './shared/settings.js';

const $ = (id) => document.getElementById(id);

function setStatus(m) {
  $('status').textContent = `Status: ${m}`;
}

async function load() {
  const s = await getSettings();
  for (const [k, v] of Object.entries(s)) {
    const el = $(k);
    if (el) el.value = v;
  }
}

$('save').addEventListener('click', async () => {
  const keys = [
    'patientSearchSelector','patientSearchLabelRegex',
    'complaintSelector','complaintLabelRegex',
    'historySelector','historyLabelRegex',
    'assessmentSelector','assessmentLabelRegex',
    'medicationsSelector','medicationsLabelRegex',
    'adviceSelector','adviceLabelRegex',
    'servicesSelector','servicesLabelRegex',
    'viewLabel','episodeTextSelector',
    'openaiApiKey','aiModel'
  ];
  const partial = {};
  for (const k of keys) {
    const el = $(k);
    if (el) partial[k] = el.value;
  }
  await setSettings(partial);
  setStatus('Saved');
});

load().then(() => setStatus('Loaded'));
