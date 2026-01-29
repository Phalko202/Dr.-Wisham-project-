let OpenAI;
try {
  OpenAI = require('openai').default;
} catch {
  OpenAI = null;
}

function buildEpisodeContext(episodes = []) {
  const lines = [];
  for (const ep of episodes) {
    const date = ep.date || ep.visitedOn || ep.createdDate || '';
    const memo = ep.memo || '';
    const doctor = ep.doctor || '';
    const head = [date && `Date: ${date}`, memo && `Memo: ${memo}`, doctor && `Doctor: ${doctor}`].filter(Boolean).join(' | ');
    const text = (ep.text || '').trim();
    lines.push(`--- EPISODE ---\n${head}\n${text}`);
  }
  return lines.join('\n');
}

async function answerQuestion(payload = {}) {
  const { question, episodes } = payload;
  const q = (question || '').trim();
  if (!q) return { ok: false, error: 'Question is required.' };

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  const context = buildEpisodeContext(Array.isArray(episodes) ? episodes : []);
  if (!apiKey || !OpenAI) {
    return {
      ok: true,
      provider: 'fallback',
      answer:
        'AI provider not configured. Set OPENAI_API_KEY in .env to enable clinical history Q&A. ' +
        'For now, you can read the extracted episodes text in the app.'
    };
  }

  const client = new OpenAI({ apiKey });

  const system =
    'You are assisting a clinician by answering questions using ONLY the provided episode text. ' +
    'If information is missing or unclear, say so. ' +
    'Summarize medications and comorbidities with dates when possible. ' +
    'Do not invent facts. Keep it concise and clinically useful.';

  const user =
    `Question:\n${q}\n\n` +
    `Episode text (source of truth):\n${context || '[no episodes extracted]'}\n\n` +
    'Answer the question based only on the episode text.';

  const resp = await client.chat.completions.create({
    model,
    temperature: 0.1,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const answer = resp?.choices?.[0]?.message?.content?.trim() || '';
  return { ok: true, provider: `openai:${model}`, answer };
}

module.exports = { answerQuestion };
