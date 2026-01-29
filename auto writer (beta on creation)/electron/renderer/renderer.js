const $ = (id) => document.getElementById(id);

const statusEl = $('status');
const diagEl = $('diag');
function setStatus(message) {
  statusEl.textContent = `Status: ${message}`;
}

function getDraftFromUI() {
  return {
    complaint: $('complaint').value.trim(),
    history: $('history').value.trim(),
    assessment: $('assessment').value.trim(),
    medications: $('medications').value.trim(),
    advice: $('advice').value.trim(),
    services: $('services').value.trim()
  };
}

function setDraftToUI(draft) {
  $('complaint').value = draft.complaint || '';
  $('history').value = draft.history || '';
  $('assessment').value = draft.assessment || '';
  $('medications').value = draft.medications || '';
  $('advice').value = draft.advice || '';
  $('services').value = draft.services || '';
}

function getProfile() {
  return $('profile')?.value || 'test';
}

let extractedEpisodes = [];

window.api.onVinaviStatus((s) => {
  if (!s) return;
  if (typeof s === 'string') setStatus(s);
  else if (s.message) setStatus(s.message);
});

$('btnConfig').addEventListener('click', async () => {
  const res = await window.api.openConfigInfo();
  setStatus(`Mapping file: ${res.path}`);
});

$('btnOpen').addEventListener('click', async () => {
  setStatus('Opening browser...');
  const profile = getProfile();
  await window.api.vinaviOpen({ profile });
  setStatus(profile === 'test' ? 'Test portal opened. Click Login there, then fill.' : 'Browser opened. Login in the browser, then fill.');
});

$('btnClose').addEventListener('click', async () => {
  setStatus('Closing browser...');
  await window.api.vinaviClose();
  setStatus('Browser closed.');
});

$('btnDiagnose').addEventListener('click', async () => {
  setStatus('Diagnosing current portal page...');
  const res = await window.api.vinaviDiagnose({ profile: getProfile() });
  if (!res?.ok) {
    diagEl.textContent = '';
    setStatus(res?.error || 'Diagnose failed.');
    return;
  }
  diagEl.textContent = JSON.stringify(res.data, null, 2);
  setStatus('Diagnostics ready. Use it to update mapping config.');
});

$('btnDraft').addEventListener('click', async () => {
  setStatus('Generating draft...');

  const payload = {
    idCard: $('idCard').value.trim(),
    age: $('age').value.trim(),
    sex: $('sex').value,
    freeNotes: $('freeNotes').value.trim(),
    constraints: $('constraints').value.trim()
  };

  const res = await window.api.draftNote(payload);
  if (res?.draft) setDraftToUI(res.draft);

  setStatus(res?.provider ? `Draft ready (${res.provider}). Review then fill.` : 'Draft ready.');
});

$('btnFill').addEventListener('click', async () => {
  const idCard = $('idCard').value.trim();
  if (!idCard) {
    setStatus('Please enter ID Card first.');
    return;
  }
  if (!$('reviewed').checked) {
    setStatus('Please tick “I reviewed/edited this draft” before filling.');
    return;
  }

  setStatus('Filling into Vinavi...');
  const payload = {
    idCard,
    profile: getProfile(),
    draft: getDraftFromUI()
  };

  const res = await window.api.vinaviFill(payload);
  if (res?.ok) setStatus('Done. Please verify in Vinavi before submitting.');
  else setStatus(res?.error || 'Fill failed. Check mapping config.');
});

$('btnClear').addEventListener('click', async () => {
  setDraftToUI({});
  $('reviewed').checked = false;
  setStatus('Draft cleared.');
});

$('btnFetch').addEventListener('click', async () => {
  setStatus('Fetching episodes (read-only)...');
  const limit = parseInt($('epLimit').value, 10);
  const res = await window.api.vinaviFetchEpisodes({ profile: getProfile(), limit: Number.isFinite(limit) ? limit : 8 });
  if (!res?.ok) {
    extractedEpisodes = [];
    $('historyDump').value = '';
    setStatus(res?.error || 'Failed to fetch episodes.');
    return;
  }
  extractedEpisodes = res.episodes || [];
  // Preview: first ~6000 chars across episodes
  const preview = extractedEpisodes
    .map((e, idx) => `#${idx + 1} ${e.url}\n${(e.rowText || '').trim()}\n${(e.text || '').slice(0, 1500).trim()}`)
    .join('\n\n')
    .slice(0, 6000);

  $('historyDump').value = preview;
  setStatus(`Fetched ${extractedEpisodes.length} episode(s). Ready for Q&A.`);
});

$('btnAsk').addEventListener('click', async () => {
  const q = $('question').value.trim();
  if (!q) {
    setStatus('Please enter a question.');
    return;
  }
  if (!extractedEpisodes.length) {
    setStatus('Fetch episodes first.');
    return;
  }
  setStatus('Answering from extracted history...');
  const res = await window.api.answerQuestion({ question: q, episodes: extractedEpisodes });
  if (!res?.ok) {
    $('answer').value = '';
    setStatus(res?.error || 'Failed to answer.');
    return;
  }
  $('answer').value = res.answer || '';
  setStatus(res?.provider ? `Answer ready (${res.provider}).` : 'Answer ready.');
});

setStatus('idle');
