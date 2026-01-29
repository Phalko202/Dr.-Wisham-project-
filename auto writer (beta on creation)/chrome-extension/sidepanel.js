const $ = (id) => document.getElementById(id);

function setStatus(msg) {
  $('status').textContent = `Status: ${msg}`;
}

function getDraft() {
  return {
    complaint: $('complaint').value.trim(),
    history: $('history').value.trim(),
    assessment: $('assessment').value.trim(),
    medications: $('medications').value.trim(),
    advice: $('advice').value.trim(),
    services: $('services').value.trim()
  };
}

let episodes = [];

async function invokeVinavi(payload) {
  const res = await chrome.runtime.sendMessage({ type: 'vinavi:invoke', payload });
  if (!res?.ok) throw new Error(res?.error || 'Invoke failed');
  return res.data;
}

$('btnOptions').addEventListener('click', async () => {
  await chrome.runtime.openOptionsPage();
});

$('btnSearch').addEventListener('click', async () => {
  try {
    setStatus('Searching patient...');
    await invokeVinavi({ type: 'patient:search', payload: { idCard: $('idCard').value.trim() } });
    setStatus('Search sent. Verify patient loaded in Vinavi.');
  } catch (e) {
    setStatus(e.message);
  }
});

$('btnDiagnose').addEventListener('click', async () => {
  try {
    setStatus('Diagnosing fields...');
    const res = await invokeVinavi({ type: 'diagnose' });
    $('diag').textContent = JSON.stringify(res.fields || [], null, 2);
    setStatus('Diagnostics ready. Use Options to set selectors.');
  } catch (e) {
    $('diag').textContent = '';
    setStatus(e.message);
  }
});

$('btnFill').addEventListener('click', async () => {
  try {
    if (!$('reviewed').checked) {
      setStatus('Tick “I reviewed this” before filling.');
      return;
    }
    setStatus('Filling mapped fields...');
    const res = await invokeVinavi({ type: 'fields:fill', payload: { draft: getDraft() } });
    setStatus(`Fill done: ${JSON.stringify(res.results || {})}`);
  } catch (e) {
    setStatus(e.message);
  }
});

async function scrapeUrl(url) {
  const tab = await chrome.tabs.create({ url, active: false });
  try {
    // wait load
    await new Promise((resolve) => {
      const listener = (tabId, info) => {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });

    const data = await chrome.tabs.sendMessage(tab.id, { type: 'episode:extractText' });
    return { ok: true, text: data?.text || '', url };
  } finally {
    if (tab?.id) await chrome.tabs.remove(tab.id).catch(() => null);
  }
}

$('btnFetch').addEventListener('click', async () => {
  try {
    setStatus('Fetching episodes...');
    const limit = parseInt($('epLimit').value, 10);
    const res = await chrome.runtime.sendMessage({ type: 'vinavi:fetchEpisodes', payload: { limit: Number.isFinite(limit) ? limit : 8 } });
    if (!res?.ok) throw new Error(res?.error || 'Fetch failed');

    const data = res.data;
    if (data?.episodes?.length) {
      episodes = data.episodes;
    } else if (data?.urls?.length) {
      episodes = [];
      for (let i = 0; i < data.urls.length; i++) {
        setStatus(`Scraping episode ${i + 1}/${data.urls.length}...`);
        const r = await scrapeUrl(data.urls[i]);
        episodes.push({ index: i + 1, url: data.urls[i], rowText: '', text: r.text });
      }
    } else {
      episodes = [];
    }

    const preview = episodes
      .map((e, i) => `#${i + 1} ${e.url}\n${(e.rowText || '').trim()}\n${(e.text || '').slice(0, 1200).trim()}`)
      .join('\n\n')
      .slice(0, 6000);

    $('historyDump').value = preview;
    setStatus(`Fetched ${episodes.length} episode(s).`);
  } catch (e) {
    episodes = [];
    $('historyDump').value = '';
    setStatus(e.message);
  }
});

$('btnAsk').addEventListener('click', async () => {
  try {
    const question = $('question').value.trim();
    if (!question) {
      setStatus('Enter a question.');
      return;
    }
    if (!episodes.length) {
      setStatus('Fetch episodes first.');
      return;
    }

    setStatus('Answering...');
    const res = await chrome.runtime.sendMessage({ type: 'ai:answer', payload: { question, episodes } });
    if (!res?.ok) throw new Error(res?.error || 'AI failed');
    $('answer').value = res.answer || '';
    setStatus(res.provider ? `Answer ready (${res.provider}).` : 'Answer ready.');
  } catch (e) {
    $('answer').value = '';
    setStatus(e.message);
  }
});

setStatus('idle');
