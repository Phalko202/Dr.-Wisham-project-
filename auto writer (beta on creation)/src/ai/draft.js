const { z } = require('zod');

let OpenAI;
try {
  OpenAI = require('openai').default;
} catch {
  OpenAI = null;
}

const DraftSchema = z.object({
  complaint: z.string().default(''),
  history: z.string().default(''),
  assessment: z.string().default(''),
  medications: z.string().default(''),
  advice: z.string().default(''),
  services: z.string().default('')
});

function buildFallbackDraft(payload = {}) {
  const base = (payload.freeNotes || '').trim();
  return {
    complaint: base,
    history: '',
    assessment: '',
    medications: '',
    advice: '',
    services: ''
  };
}

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

async function draftNote(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey || !OpenAI) {
    return { provider: 'fallback', draft: buildFallbackDraft(payload) };
  }

  const client = new OpenAI({ apiKey });

  const { idCard, age, sex, freeNotes, constraints } = payload || {};

  const system =
    'You draft clinical text for a clinician to review. ' +
    'Return ONLY valid JSON with keys: complaint, history, assessment, medications, advice, services. ' +
    'Be concise, avoid hallucinating facts, and do not include private identifiers. ' +
    'No markdown.';

  const user =
    `Context (for drafting only):\n` +
    `- Age: ${age || ''}\n` +
    `- Sex: ${sex || ''}\n` +
    `- ID Card (do not repeat in note): ${idCard ? '[provided]' : ''}\n` +
    `- Constraints: ${constraints || ''}\n\n` +
    `Doctor free-notes:\n${freeNotes || ''}\n\n` +
    `Now produce the JSON draft.`;

  const resp = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const text = resp?.choices?.[0]?.message?.content || '';
  const json = extractJson(text) || {};
  const parsed = DraftSchema.safeParse(json);

  if (!parsed.success) {
    return { provider: `openai:${model}`, draft: buildFallbackDraft(payload), warning: 'AI returned invalid JSON; using fallback.' };
  }

  return { provider: `openai:${model}`, draft: parsed.data };
}

module.exports = { draftNote };
