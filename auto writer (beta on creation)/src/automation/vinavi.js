const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

let chromium;
try {
  chromium = require('playwright').chromium;
} catch {
  chromium = null;
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function toRegex(value) {
  if (!value) return null;
  if (value instanceof RegExp) return value;
  try {
    return new RegExp(value, 'i');
  } catch {
    return null;
  }
}

async function firstVisible(locator) {
  const count = await locator.count();
  for (let i = 0; i < count; i++) {
    const item = locator.nth(i);
    try {
      if (await item.isVisible()) return item;
    } catch {
      // ignore
    }
  }
  return locator.first();
}

async function findField(page, mapping) {
  if (!mapping) return null;

  if (mapping.selector) {
    const loc = page.locator(mapping.selector);
    try {
      if ((await loc.count()) > 0) return await firstVisible(loc);
    } catch {
      // ignore
    }
  }

  const labelRe = toRegex(mapping.labelRegex);
  if (labelRe) {
    // Try accessible label
    try {
      const byLabel = page.getByLabel(labelRe);
      if ((await byLabel.count()) > 0) return await firstVisible(byLabel);
    } catch {
      // ignore
    }

    // Try placeholder
    try {
      const byPh = page.getByPlaceholder(labelRe);
      if ((await byPh.count()) > 0) return await firstVisible(byPh);
    } catch {
      // ignore
    }

    // Try role textbox with name
    try {
      const byRole = page.getByRole('textbox', { name: labelRe });
      if ((await byRole.count()) > 0) return await firstVisible(byRole);
    } catch {
      // ignore
    }
  }

  return null;
}

async function fillSmart(locator, value) {
  if (!locator) return;
  const text = (value ?? '').toString();
  if (!text.trim()) return;

  // Try normal fill
  try {
    await locator.click({ timeout: 1500 });
  } catch {
    // ignore
  }

  try {
    await locator.fill(text);
    return;
  } catch {
    // ignore
  }

  // Try type
  try {
    await locator.press('Control+A');
    await locator.type(text, { delay: 1 });
    return;
  } catch {
    // ignore
  }

  // Try contenteditable
  try {
    await locator.evaluate((el, v) => {
      if (el && el.isContentEditable) {
        el.textContent = v;
      }
    }, text);
  } catch {
    // ignore
  }
}

class VinaviAutomation {
  constructor({ userDataDir }) {
    this.userDataDir = userDataDir;
    this.context = null;
    this.page = null;
    this.projectRoot = path.join(__dirname, '..', '..');
    this.mappingPath = path.join(this.projectRoot, 'config', 'vinavi.mapping.json');
  }

  resolveMappingPath(profile) {
    if (!profile || profile === 'vinavi') return path.join(this.projectRoot, 'config', 'vinavi.mapping.json');
    if (profile === 'test') return path.join(this.projectRoot, 'config', 'test.mapping.json');
    // Allow passing an absolute path in advanced scenarios
    if (path.isAbsolute(profile) && fs.existsSync(profile)) return profile;
    return path.join(this.projectRoot, 'config', 'vinavi.mapping.json');
  }

  resolvePortalUrl(portalUrl) {
    if (!portalUrl) return portalUrl;
    // local:relative/path -> file://... for safe testing
    if (portalUrl.startsWith('local:')) {
      const rel = portalUrl.slice('local:'.length);
      const abs = path.join(this.projectRoot, rel);
      return pathToFileURL(abs).href;
    }
    return portalUrl;
  }

  getMapping(profile) {
    const p = this.resolveMappingPath(profile);
    return loadJson(p);
  }

  async open(profile) {
    if (!chromium) {
      throw new Error('Playwright is not installed. Run: npm install');
    }
    if (this.context) return;

    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      headless: false,
      viewport: { width: 1280, height: 800 }
    });

    this.page = this.context.pages()[0] || (await this.context.newPage());

    const mapping = this.getMapping(profile);
    await this.page.goto(this.resolvePortalUrl(mapping.portalUrl), { waitUntil: 'domcontentloaded' });
  }

  async close() {
    try {
      await this.context?.close();
    } finally {
      this.context = null;
      this.page = null;
    }
  }

  async diagnose(profile) {
    await this.open(profile);
    const page = this.page;

    const data = await page.evaluate(() => {
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
        if (!el) return '';
        const aria = el.getAttribute('aria-label') || '';
        if (aria.trim()) return aria.trim();
        const ph = el.getAttribute('placeholder') || '';
        if (ph.trim()) return ph.trim();
        const name = el.getAttribute('name') || '';
        if (name.trim()) return name.trim();

        // Associated <label for="id">
        if (el.id) {
          const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
          if (lab && lab.textContent) return lab.textContent.trim();
        }

        // Parent <label>
        const parentLabel = el.closest('label');
        if (parentLabel && parentLabel.textContent) return parentLabel.textContent.trim();

        return '';
      }

      const candidates = Array.from(
        document.querySelectorAll('input, textarea, [contenteditable="true"], [role="textbox"]')
      ).filter((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'input') {
          const type = (el.getAttribute('type') || 'text').toLowerCase();
          if (['hidden', 'submit', 'button', 'checkbox', 'radio', 'file'].includes(type)) return false;
        }
        const style = window.getComputedStyle(el);
        return style && style.visibility !== 'hidden' && style.display !== 'none';
      });

      return candidates.slice(0, 80).map((el) => {
        const tag = el.tagName.toLowerCase();
        const type = tag === 'input' ? (el.getAttribute('type') || 'text') : '';
        const editable = el.isContentEditable || el.getAttribute('contenteditable') === 'true';
        return {
          tag,
          type,
          editable,
          label: labelText(el),
          placeholder: el.getAttribute('placeholder') || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          name: el.getAttribute('name') || '',
          id: el.id || '',
          selectorHint: cssPath(el)
        };
      });
    });

    return data;
  }

  async fill({ idCard, draft, profile }, onStatus) {
    const status = (message) => onStatus?.({ message, ts: Date.now() });

    try {
      await this.open(profile);
      const mapping = this.getMapping(profile);
      const page = this.page;

      status('Waiting for portal...');
      await page.waitForLoadState('domcontentloaded');

      // Best-effort: assume user is logged in. If not, they can login manually and retry.
      status('Trying to locate patient search...');
      const searchLoc = await findField(page, mapping.patientSearch);
      if (!searchLoc) {
        return {
          ok: false,
          error:
            'Could not find patient search field. Please update config/vinavi.mapping.json with a selector or labelRegex for patientSearch.'
        };
      }

      status('Searching patient...');
      await fillSmart(searchLoc, idCard);
      try {
        await searchLoc.press('Enter');
      } catch {
        // ignore
      }

      // Small wait for patient record UI to update
      await page.waitForTimeout(1200);

      const fieldEntries = Object.entries(mapping.fields || {});
      for (const [key, fieldMap] of fieldEntries) {
        const value = draft?.[key] || '';
        if (!value.trim()) continue;

        status(`Filling ${key}...`);
        const loc = await findField(page, fieldMap);
        if (!loc) {
          status(`Skipping ${key} (no locator).`);
          continue;
        }
        await fillSmart(loc, value);
      }

      status('Fill completed (verify in Vinavi).');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.message || String(e) };
    }
  }

  async fetchEpisodes(payload = {}, onStatus) {
    const status = (message) => onStatus?.({ message, ts: Date.now() });
    const profile = payload.profile;
    const limit = Number(payload.limit || 10);

    try {
      await this.open(profile);
      const page = this.page;
      status('Looking for episode VIEW buttons/links...');

      await page.waitForLoadState('domcontentloaded');

      // Prefer link role (common for tables), then button.
      const viewLinkLocator = page.getByRole('link', { name: /view/i });
      const viewButtonLocator = page.getByRole('button', { name: /view/i });

      let count = 0;
      try {
        count = await viewLinkLocator.count();
      } catch {
        count = 0;
      }
      if (count === 0) {
        try {
          count = await viewButtonLocator.count();
        } catch {
          count = 0;
        }
      }

      if (count === 0) {
        return {
          ok: false,
          error:
            'No “VIEW” links found on this page. Navigate to the patient consultations list first, then try again.'
        };
      }

      const episodes = [];
      const toFetch = Math.min(count, Math.max(1, limit));

      for (let i = 0; i < toFetch; i++) {
        status(`Opening episode ${i + 1} of ${toFetch}...`);

        const beforeUrl = page.url();
        const viewTarget = (await viewLinkLocator.count()) > 0 ? viewLinkLocator.nth(i) : viewButtonLocator.nth(i);

        // Attempt to read row metadata (best-effort)
        let rowText = '';
        try {
          rowText = await viewTarget.locator('xpath=ancestor::tr[1]').innerText({ timeout: 800 });
        } catch {
          rowText = '';
        }

        await viewTarget.click();

        // Wait for either navigation or content change.
        await Promise.race([
          page.waitForURL((u) => u.toString() !== beforeUrl, { timeout: 2500 }).catch(() => null),
          page.waitForTimeout(800)
        ]);

        // Extract visible text; keep bounded.
        status(`Extracting episode ${i + 1} text...`);
        let text = '';
        try {
          text = await page.locator('body').innerText({ timeout: 2000 });
        } catch {
          text = '';
        }
        if (text.length > 20000) text = text.slice(0, 20000);

        const episode = {
          index: i + 1,
          url: page.url(),
          rowText,
          text
        };
        episodes.push(episode);

        // Return to list if navigated; otherwise try to close modal.
        if (page.url() !== beforeUrl) {
          status('Returning to episode list...');
          await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null);
        } else {
          // modal style
          await page.keyboard.press('Escape').catch(() => null);
          const close = page.getByRole('button', { name: /close|back|cancel|done|x/i });
          try {
            if ((await close.count()) > 0) await close.first().click({ timeout: 800 });
          } catch {
            // ignore
          }
        }

        await page.waitForTimeout(300);
      }

      status(`Fetched ${episodes.length} episode(s).`);
      return { ok: true, episodes };
    } catch (e) {
      return { ok: false, error: e?.message || String(e) };
    }
  }
}

module.exports = { VinaviAutomation };
