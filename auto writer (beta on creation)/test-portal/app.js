const $ = (id) => document.getElementById(id);

const screenLogin = $('screenLogin');
const screenSearch = $('screenSearch');
const screenRecord = $('screenRecord');

const logEl = $('log');
const patientBadge = $('patientBadge');

const state = {
  loggedIn: false,
  patientId: null,
  autosave: true
};

function now() {
  return new Date().toLocaleString();
}

function appendLog(line) {
  logEl.textContent = `${now()}  ${line}\n` + logEl.textContent;
}

function setScreens() {
  screenLogin.hidden = state.loggedIn;
  screenSearch.hidden = !state.loggedIn;
  screenRecord.hidden = !state.loggedIn || !state.patientId;
  patientBadge.textContent = state.patientId ? `Loaded: ${state.patientId}` : 'No patient loaded';
}

function clearFields() {
  $('fieldComplaint').value = '';
  $('fieldHistory').value = '';
  $('fieldAssessment').value = '';
  $('fieldMedications').value = '';
  $('fieldAdvice').value = '';
  $('fieldServices').value = '';
}

function simulateSave(reason) {
  if (!state.patientId) {
    appendLog('Save blocked: no patient loaded');
    return;
  }

  const payload = {
    complaint: $('fieldComplaint').value,
    history: $('fieldHistory').value,
    assessment: $('fieldAssessment').value,
    medications: $('fieldMedications').value,
    advice: $('fieldAdvice').value,
    services: $('fieldServices').value
  };

  appendLog(`Saved (${reason}) for patient ${state.patientId}: ${JSON.stringify(payload)}`);
}

$('autosave').addEventListener('change', (e) => {
  state.autosave = !!e.target.checked;
  appendLog(`Autosave simulation: ${state.autosave ? 'ON' : 'OFF'}`);
});

$('login').addEventListener('click', () => {
  state.loggedIn = true;
  appendLog('Login successful (simulated)');
  setScreens();
});

function loadPatient() {
  const v = $('patientSearch').value.trim();
  if (!v) return;
  state.patientId = v;
  appendLog(`Patient loaded: ${v}`);
  setScreens();
}

$('btnLoad').addEventListener('click', loadPatient);
$('patientSearch').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    loadPatient();
  }
});

for (const id of ['fieldComplaint','fieldHistory','fieldAssessment','fieldMedications','fieldAdvice','fieldServices']) {
  $(id).addEventListener('input', () => {
    if (state.autosave) simulateSave(`autosave:${id}`);
  });
}

$('btnFakeSave').addEventListener('click', () => simulateSave('manual'));
$('btnClear').addEventListener('click', () => {
  clearFields();
  appendLog('Fields cleared');
});

$('reset').addEventListener('click', () => {
  state.loggedIn = false;
  state.patientId = null;
  clearFields();
  appendLog('Reset portal');
  setScreens();
});

appendLog('Test portal loaded');
setScreens();
