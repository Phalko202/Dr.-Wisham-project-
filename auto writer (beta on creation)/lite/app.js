const $ = (id) => document.getElementById(id);

function normalize(text) {
  return (text || '').replace(/\r/g, '').trim();
}

function templateDraft({ age, sex, freeNotes, constraints }) {
  const parts = [];
  const header = [age && `Age: ${age}`, sex && `Sex: ${sex}`].filter(Boolean).join(' | ');
  if (header) parts.push(header);
  if (freeNotes) parts.push(`\nClinician notes:\n${freeNotes}`);
  if (constraints) parts.push(`\nConstraints/Preferences:\n${constraints}`);

  parts.push(
    `\nStructured draft (edit as needed):\n` +
      `Complaint: \n` +
      `History/HPI: \n` +
      `Assessment: \n` +
      `Medications: \n` +
      `Advice: \n` +
      `Services: \n`
  );

  return parts.join('\n');
}

// --- History extraction (heuristics, non-AI) ---
const MONTHS = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)';
const DATE_RE = new RegExp(`\\b(\\d{1,2})\\s+${MONTHS}\\s+(\\d{4})\\b`, 'ig');

const CONDITION_KEYWORDS = [
  { key: 'HTN', re: /\b(htn|hypertension)\b/i },
  { key: 'DM', re: /\b(diabetes|dm\b|t2dm|t1dm)\b/i },
  { key: 'IHD', re: /\b(ihd|ischemic heart|coronary)\b/i },
  { key: 'Asthma', re: /\b(asthma|wheeze)\b/i },
  { key: 'COPD', re: /\b(copd|chronic obstructive)\b/i },
  { key: 'CKD', re: /\b(ckd|chronic kidney|renal failure)\b/i },
  { key: 'Dyslipidemia', re: /\b(dyslipidemia|hyperlipid|statin)\b/i }
];

const MED_KEYWORDS = [
  'amlodipine','losartan','valsartan','lisinopril','enalapril','ramipril','captopril',
  'metoprolol','atenolol','bisoprolol','carvedilol',
  'hydrochlorothiazide','hctz','chlorthalidone','furosemide','spironolactone',
  'metformin','insulin','glimepiride','gliclazide','sitagliptin','dapagliflozin','empagliflozin',
  'atorvastatin','rosuvastatin','simvastatin',
  'aspirin','clopidogrel','warfarin','rivaroxaban','apixaban'
];

function splitIntoEpisodes(raw) {
  const text = normalize(raw);
  if (!text) return [];

  // If there are dates, split on date occurrences (keep the date in the chunk)
  const matches = [...text.matchAll(DATE_RE)];
  if (matches.length <= 1) return [text];

  const positions = matches.map((m) => m.index).filter((v) => typeof v === 'number');
  const chunks = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i];
    const end = i + 1 < positions.length ? positions[i + 1] : text.length;
    chunks.push(text.slice(start, end).trim());
  }
  return chunks.filter(Boolean);
}

function firstDate(chunk) {
  const m = chunk.match(DATE_RE);
  if (!m || !m.length) return '';
  return m[0];
}

function extractConditions(text) {
  const found = new Set();
  for (const c of CONDITION_KEYWORDS) {
    if (c.re.test(text)) found.add(c.key);
  }
  return [...found];
}

function extractMeds(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const med of MED_KEYWORDS) {
    if (lower.includes(med)) found.add(med);
  }
  return [...found].sort();
}

function buildHistorySummary(raw) {
  const episodes = splitIntoEpisodes(raw);
  const overallConditions = new Set();
  const timeline = [];

  for (const ep of episodes) {
    const date = firstDate(ep);
    const conds = extractConditions(ep);
    const meds = extractMeds(ep);
    conds.forEach((c) => overallConditions.add(c));
    if (date || meds.length || conds.length) {
      timeline.push({ date, conditions: conds, meds, text: ep.slice(0, 500) });
    }
  }

  const summaryLines = [];
  summaryLines.push(`Comorbidities (heuristic): ${[...overallConditions].sort().join(', ') || 'Unknown'}`);
  summaryLines.push('');
  summaryLines.push('Timeline (heuristic):');
  if (!timeline.length) {
    summaryLines.push('- No dates/meds detected. Paste more episode text (including dates and medication names).');
  } else {
    for (const t of timeline) {
      summaryLines.push(
        `- ${t.date || '[date unknown]'} | Conditions: ${t.conditions.join(', ') || '—'} | Meds: ${t.meds.join(', ') || '—'}`
      );
    }
  }

  return { episodes, timeline, conditions: [...overallConditions], summaryText: summaryLines.join('\n') };
}

let extracted = { episodes: [], timeline: [], conditions: [], summaryText: '' };

$('btnDraft').addEventListener('click', () => {
  const age = normalize($('age').value);
  const sex = $('sex').value;
  const freeNotes = normalize($('freeNotes').value);
  const constraints = normalize($('constraints').value);
  $('draft').value = templateDraft({ age, sex, freeNotes, constraints });
});

$('btnExtract').addEventListener('click', () => {
  extracted = buildHistorySummary($('episodes').value);
  $('summary').value = extracted.summaryText;
  $('answer').value = '';
});

$('btnClear').addEventListener('click', () => {
  $('episodes').value = '';
  $('summary').value = '';
  $('question').value = '';
  $('answer').value = '';
  extracted = { episodes: [], timeline: [], conditions: [], summaryText: '' };
});

$('btnAsk').addEventListener('click', () => {
  const q = normalize($('question').value).toLowerCase();
  if (!q) {
    $('answer').value = 'Enter a question first.';
    return;
  }
  if (!extracted.timeline.length && !extracted.conditions.length) {
    $('answer').value = 'Paste episode text and click Extract first.';
    return;
  }

  if (q.includes('comorbid') || q.includes('condition') || q.includes('diagnos')) {
    $('answer').value = `Comorbidities detected (heuristic): ${extracted.conditions.sort().join(', ') || 'Unknown'}`;
    return;
  }

  // HTN-focused query
  if (q.includes('htn') || q.includes('hypertension')) {
    const lines = extracted.timeline
      .filter((t) => t.conditions.some((c) => c === 'HTN') || t.text.toLowerCase().includes('htn') || t.text.toLowerCase().includes('hypertension'))
      .map((t) => `- ${t.date || '[date unknown]'}: ${t.meds.join(', ') || 'No meds detected in text'}`);
    $('answer').value = lines.length ? `HTN-related episodes (heuristic):\n${lines.join('\n')}` : 'No HTN-related episodes detected in pasted text.';
    return;
  }

  if (q.includes('med') || q.includes('medicine') || q.includes('prescri')) {
    const allMeds = new Set();
    extracted.timeline.forEach((t) => t.meds.forEach((m) => allMeds.add(m)));
    $('answer').value = `Medications detected (heuristic): ${[...allMeds].sort().join(', ') || 'Unknown'}`;
    return;
  }

  $('answer').value =
    'This offline mode can answer only basic questions (comorbidities, meds, HTN meds). ' +
    'For richer Q&A, use the full EXE app with AI (requires IT approval / install), or an approved hospital AI tool.';
});
