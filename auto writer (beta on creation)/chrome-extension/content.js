// Content script runs on vinavi.aasandha.mv pages.

async function getSettings() {
  const res = await chrome.runtime.sendMessage({ type: 'settings:get' });
  if (!res?.ok) throw new Error(res?.error || 'Failed to read settings');
  return res.settings;
}

function toRegex(pattern) {
  if (!pattern) return null;
  try {
    return new RegExp(pattern, 'i');
  } catch {
    return null;
  }
}

function isVisible(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

function firstVisible(list) {
  return list.find(isVisible) || list[0] || null;
}

function findByLabelRegex(labelRe) {
  if (!labelRe) return null;

  const inputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"], [role="textbox"]'));

  // aria-label / placeholder / name
  const best = inputs
    .map((el) => {
      const aria = el.getAttribute('aria-label') || '';
      const ph = el.getAttribute('placeholder') || '';
      const name = el.getAttribute('name') || '';
      const id = el.id || '';
      let lab = '';
      if (id) {
        const l = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (l?.textContent) lab = l.textContent.trim();
      }
      const parentLabel = el.closest('label');
      if (!lab && parentLabel?.textContent) lab = parentLabel.textContent.trim();

      const text = [aria, ph, name, lab].filter(Boolean).join(' | ');
      return { el, text };
    })
    .filter((x) => labelRe.test(x.text));

  return firstVisible(best.map((b) => b.el));
}

function findField(selector, labelRegex) {
  if (selector) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  const re = toRegex(labelRegex);
  if (re) return findByLabelRegex(re);
  return null;
}

function setValue(el, value) {
  const text = (value ?? '').toString();
  if (!el) return;

  const tag = el.tagName?.toLowerCase();
  const editable = el.isContentEditable || el.getAttribute('contenteditable') === 'true';

  el.focus();

  if (tag === 'input' || tag === 'textarea') {
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  if (editable) {
    el.textContent = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
}

function pressEnter(el) {
  if (!el) return;
  el.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true })
  );
  el.dispatchEvent(
    new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true })
  );
}

async function diagnoseFields() {
  const candidates = Array.from(
    document.querySelectorAll('input, textarea, [contenteditable="true"], [role="textbox"]')
  ).filter(isVisible);

  function cssPath(el) {
    if (!el || el.nodeType !== 1) return '';
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    let cur = el;
    for (let depth = 0; cur && cur.nodeType === 1 && depth < 5; depth++) {
      const tag = cur.tagName.toLowerCase();
      if (cur.id) {
        parts.unshift(`#${CSS.escape(cur.id)}`);
        break;
      }
      let idx = 1;
      let sib = cur;
      while ((sib = sib.previousElementSibling)) {
        if (sib.tagName.toLowerCase() === tag) idx++;
      }
      parts.unshift(`${tag}:nth-of-type(${idx})`);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  function labelText(el) {
    const aria = el.getAttribute('aria-label') || '';
    if (aria.trim()) return aria.trim();
    const ph = el.getAttribute('placeholder') || '';
    if (ph.trim()) return ph.trim();
    const name = el.getAttribute('name') || '';
    if (name.trim()) return name.trim();
    if (el.id) {
      const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lab?.textContent) return lab.textContent.trim();
    }
    const parentLabel = el.closest('label');
    if (parentLabel?.textContent) return parentLabel.textContent.trim();
    return '';
  }

  return candidates.slice(0, 100).map((el) => ({
    tag: el.tagName.toLowerCase(),
    type: el.getAttribute('type') || '',
    id: el.id || '',
    name: el.getAttribute('name') || '',
    ariaLabel: el.getAttribute('aria-label') || '',
    placeholder: el.getAttribute('placeholder') || '',
    label: labelText(el),
    selectorHint: cssPath(el)
  }));
}

async function fetchEpisodes({ limit } = {}) {
  const settings = await getSettings();
  const viewLabel = settings.viewLabel || 'VIEW';
  const viewRe = new RegExp(viewLabel, 'i');

  // Prefer anchors with visible text VIEW
  const links = Array.from(document.querySelectorAll('a'))
    .filter((a) => isVisible(a) && viewRe.test((a.textContent || '').trim()))
    .slice(0, Math.max(1, Number(limit || 10)));

  if (links.length === 0) {
    // Fallback: buttons with VIEW
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter((b) => isVisible(b) && viewRe.test((b.textContent || '').trim()))
      .slice(0, Math.max(1, Number(limit || 10)));

    if (buttons.length === 0) {
      return { ok: false, error: 'No VIEW links/buttons found on this page. Navigate to consultations list first.' };
    }

    // If VIEW is a button without URL, we can only do in-tab navigation scraping (best-effort)
    const episodes = [];
    for (let i = 0; i < buttons.length; i++) {
      const beforeUrl = location.href;
      const btn = buttons[i];
      const rowText = btn.closest('tr')?.innerText || '';
      btn.click();
      await new Promise((r) => setTimeout(r, 900));

      const textEl = document.querySelector(settings.episodeTextSelector || 'body');
      const text = (textEl?.innerText || '').slice(0, 20000);
      episodes.push({ index: i + 1, url: location.href, rowText, text });

      if (location.href !== beforeUrl) {
        history.back();
        await new Promise((r) => setTimeout(r, 900));
      } else {
        // modal style
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    return { ok: true, episodes };
  }

  // If VIEW is link-based, we can open each URL in a new tab and scrape via extension messaging.
  // We return URLs and let the side panel orchestrate opening/scraping (background will do it).
  const urls = links.map((a) => a.href).filter(Boolean);
  return { ok: true, urls };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      if (message?.type === 'diagnose') {
        sendResponse({ ok: true, fields: await diagnoseFields() });
        return;
      }

      if (message?.type === 'patient:search') {
        const settings = await getSettings();
        const el = findField(settings.patientSearchSelector, settings.patientSearchLabelRegex);
        if (!el) {
          sendResponse({ ok: false, error: 'Patient search field not found. Configure selectors in Options.' });
          return;
        }
        setValue(el, message.payload?.idCard || '');
        pressEnter(el);
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'fields:fill') {
        const settings = await getSettings();
        const draft = message.payload?.draft || {};

        const map = [
          ['complaint', settings.complaintSelector, settings.complaintLabelRegex],
          ['history', settings.historySelector, settings.historyLabelRegex],
          ['assessment', settings.assessmentSelector, settings.assessmentLabelRegex],
          ['medications', settings.medicationsSelector, settings.medicationsLabelRegex],
          ['advice', settings.adviceSelector, settings.adviceLabelRegex],
          ['services', settings.servicesSelector, settings.servicesLabelRegex]
        ];

        const results = {};
        for (const [key, sel, re] of map) {
          const value = (draft[key] || '').toString();
          if (!value.trim()) continue;
          const el = findField(sel, re);
          if (!el) {
            results[key] = 'not-found';
            continue;
          }
          setValue(el, value);
          results[key] = 'filled';
        }

        sendResponse({ ok: true, results });
        return;
      }

      if (message?.type === 'episodes:fetch') {
        sendResponse(await fetchEpisodes(message.payload || {}));
        return;
      }

      if (message?.type === 'episode:extractText') {
        const settings = await getSettings();
        const el = document.querySelector(settings.episodeTextSelector || 'body') || document.body;
        const text = (el?.innerText || '').slice(0, 20000);
        sendResponse({ ok: true, text });
        return;
      }

      sendResponse({ ok: false, error: 'Unknown content message.' });
    } catch (e) {
      sendResponse({ ok: false, error: e?.message || String(e) });
    }
  })();
  return true;
});
