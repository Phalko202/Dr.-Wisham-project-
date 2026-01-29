import { getSettings, setSettings } from './shared/settings.js';

async function withActiveVinaviTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith('https://vinavi.aasandha.mv/')) {
    throw new Error('Open a Vinavi tab first (vinavi.aasandha.mv).');
  }
  return tab;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message?.type === 'settings:get') {
        sendResponse({ ok: true, settings: await getSettings() });
        return;
      }
      if (message?.type === 'settings:set') {
        await setSettings(message.settings || {});
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'vinavi:invoke') {
        const tab = await withActiveVinaviTab();
        const res = await chrome.tabs.sendMessage(tab.id, message.payload);
        sendResponse({ ok: true, data: res });
        return;
      }

      if (message?.type === 'vinavi:fetchEpisodes') {
        const tab = await withActiveVinaviTab();
        const res = await chrome.tabs.sendMessage(tab.id, { type: 'episodes:fetch', payload: message.payload || {} });
        sendResponse({ ok: true, data: res });
        return;
      }

      if (message?.type === 'ai:answer') {
        const settings = await getSettings();
        const apiKey = settings.openaiApiKey;
        const model = settings.aiModel || 'gpt-4o-mini';
        if (!apiKey) {
          sendResponse({ ok: true, provider: 'fallback', answer: 'No AI key set. Open Options and set OpenAI API Key to enable Q&A.' });
          return;
        }

        const { question, episodes } = message.payload || {};
        const context = (episodes || [])
          .map((e, i) => `--- EPISODE ${i + 1} ---\nURL: ${e.url || ''}\nROW: ${e.rowText || ''}\nTEXT:\n${e.text || ''}`)
          .join('\n\n');

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            temperature: 0.1,
            messages: [
              {
                role: 'system',
                content:
                  'You are assisting a clinician by answering questions using ONLY the provided episode text. ' +
                  'If information is missing or unclear, say so. Do not invent facts. Summarize meds with dates when possible.'
              },
              {
                role: 'user',
                content: `Question:\n${question || ''}\n\nEpisode text (source of truth):\n${context || '[no episodes extracted]'}`
              }
            ]
          })
        });

        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`AI request failed (${resp.status}): ${t.slice(0, 500)}`);
        }

        const json = await resp.json();
        const answer = json?.choices?.[0]?.message?.content?.trim() || '';
        sendResponse({ ok: true, provider: `openai:${model}`, answer });
        return;
      }

      sendResponse({ ok: false, error: 'Unknown message type.' });
    } catch (e) {
      sendResponse({ ok: false, error: e?.message || String(e) });
    }
  })();

  return true;
});
