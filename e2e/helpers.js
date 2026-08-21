/* eslint-disable no-console */
// E2E helpers — real Chrome via puppeteer-core against the local stack.
// Config via env with defaults (see e2e-spec runner conventions).
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

// Chrome lives wherever puppeteer cached it, and the version is part of that path, so
// it is discovered rather than pinned to one machine. CHROME_PATH overrides.
function findChrome() {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const cache = path.join(home, '.cache', 'puppeteer', 'chrome');
  try {
    const build = fs
      .readdirSync(cache)
      .filter((d) => /^(win64|win32|linux|mac)-/.test(d))
      .sort()
      .pop();
    if (!build) return null;
    const candidates = [
      path.join(cache, build, 'chrome-win64', 'chrome.exe'),
      path.join(cache, build, 'chrome-win32', 'chrome.exe'),
      path.join(cache, build, 'chrome-linux64', 'chrome'),
      path.join(cache, build, 'chrome-mac-x64', 'Google Chrome for Testing.app',
        'Contents', 'MacOS', 'Google Chrome for Testing'),
      path.join(cache, build, 'chrome-mac-arm64', 'Google Chrome for Testing.app',
        'Contents', 'MacOS', 'Google Chrome for Testing'),
    ];
    return candidates.find((exe) => fs.existsSync(exe)) || null;
  } catch {
    return null; // no puppeteer cache on this machine
  }
}

const CFG = {
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:8080',
  CHROME_PATH: process.env.CHROME_PATH || findChrome(),
  // Where the local SMTP sink drops .eml files — the invite link is read off disk.
  MAILS_DIR: process.env.MAILS_DIR || path.join(__dirname, 'mails'),
  LETTER_MAPPING:
    process.env.E2E_LETTER_MAPPING ||
    'A=1,B=2,C=3,D=4,E=5,F=6,G=7,H=8,I=9,J=0,K=1,L=2,M=3,N=4,O=5,P=6,Q=7,R=8,S=9,T=0,U=1,V=2,W=3,X=4,Y=5,Z=6',
  ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL || 'superadmin@company.com',
  ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD || 'ChangeMe@NF2026',
  SHOTS_DIR: path.join(__dirname, 'shots'),
  NAV_TIMEOUT: 30000,
};

const MAP = Object.fromEntries(
  CFG.LETTER_MAPPING.split(',').map((pair) => pair.split('=').map((s) => s.trim()))
);

function solveLetters(letters) {
  return letters
    .map((l) => {
      const d = MAP[String(l).toUpperCase()];
      if (d === undefined) throw new Error(`No mapping for challenge letter "${l}"`);
      return d;
    })
    .join('');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- browser ---------------- */

async function launchBrowser() {
  if (!CFG.CHROME_PATH) {
    throw new Error(
      'No Chrome found. Run `npx puppeteer browsers install chrome` or set CHROME_PATH.'
    );
  }
  return puppeteer.launch({
    headless: 'new',
    executablePath: CFG.CHROME_PATH,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1000'],
    defaultViewport: { width: 1500, height: 950 },
  });
}

// New tab with collectors attached. sessionStorage is per-tab, so each page is
// an isolated auth session; localStorage (disclaimer flag) is shared.
async function newPage(browser) {
  const page = await browser.newPage();
  page.setDefaultTimeout(CFG.NAV_TIMEOUT);
  page.setDefaultNavigationTimeout(CFG.NAV_TIMEOUT);
  page._consoleErrors = [];
  page._pageErrors = [];
  page._apiFailures = [];
  page.on('dialog', (d) => d.accept().catch(() => {}));
  page.on('console', (msg) => {
    if (msg.type() === 'error') page._consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => page._pageErrors.push(String(err && err.message)));
  page.on('response', (res) => {
    try {
      if (res.url().startsWith(CFG.API_URL) && res.status() >= 400) {
        page._apiFailures.push(`${res.request().method()} ${res.url()} -> ${res.status()}`);
      }
    } catch {
      /* detached */
    }
  });
  page.on('requestfailed', (req) => {
    if (req.url().startsWith(CFG.API_URL)) {
      page._apiFailures.push(`${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
    }
  });

  // Puppeteer's bare "Waiting failed: Nms exceeded" says nothing about which
  // wait gave up. Re-throw with the scenario call site and the current URL.
  const rawWaitForFunction = page.waitForFunction.bind(page);
  page.waitForFunction = async (fn, opts, ...args) => {
    const site = (new Error().stack.split('\n').find((l) => l.includes('scenarios.js')) || '')
      .trim()
      .replace(/^at\s+/, '');
    try {
      return await rawWaitForFunction(fn, opts, ...args);
    } catch (err) {
      throw new Error(`waitForFunction at ${site || 'unknown'} [${page.url()}]: ${err.message}`);
    }
  };
  return page;
}

async function goto(page, pathname, opts = {}) {
  await page.goto(CFG.APP_URL + pathname, {
    waitUntil: 'domcontentloaded',
    timeout: opts.timeout || CFG.NAV_TIMEOUT,
  });
}

/* ---------------- DOM utilities ---------------- */

async function waitForText(page, text, timeout = CFG.NAV_TIMEOUT) {
  try {
    await page.waitForFunction(
      (t) => document.body && document.body.innerText.includes(t),
      { timeout },
      text
    );
  } catch (err) {
    throw new Error(`waitForText(${JSON.stringify(text)}) failed at ${page.url()}: ${err.message}`);
  }
}

async function waitForGone(page, text, timeout = CFG.NAV_TIMEOUT) {
  try {
    await page.waitForFunction(
      (t) => !document.body || !document.body.innerText.includes(t),
      { timeout },
      text
    );
  } catch (err) {
    throw new Error(`waitForGone(${JSON.stringify(text)}) failed at ${page.url()}: ${err.message}`);
  }
}

// Poll a predicate from Node instead of puppeteer's in-page polling. The in-page
// poller has been observed to stall after a same-tab route change — it kept
// waiting for 20s on a page whose DOM already satisfied the predicate. Each
// evaluate here runs in the page's current execution context, so a swapped
// document cannot strand the wait.
async function pollFor(page, label, fn, { timeout = CFG.NAV_TIMEOUT, interval = 200, arg } = {}) {
  const deadline = Date.now() + timeout;
  let last;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    last = await page.evaluate(fn, arg);
    if (last) return last;
    if (Date.now() > deadline) {
      throw new Error(`pollFor(${label}) timed out after ${timeout}ms at ${page.url()}`);
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(interval);
  }
}

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}

// Click the nth (default first; -1 = last) enabled element matching selector
// whose innerText includes/equals `text`, optionally scoped to `within`.
async function clickByText(page, selector, text, opts = {}) {
  const { within = null, nth = 0, exact = false, timeout = CFG.NAV_TIMEOUT } = opts;
  try {
    await page.waitForFunction(
      (sel, txt, w, ex) => {
        const scope = w ? document.querySelector(w) : document;
        if (!scope) return false;
        return [...scope.querySelectorAll(sel)].some((e) => {
          const t = (e.innerText || e.textContent || '').trim();
          return (ex ? t === txt : t.includes(txt)) && !e.disabled;
        });
      },
      { timeout },
      selector, text, within, exact
    );
  } catch (err) {
    throw new Error(
      `clickByText(${selector}, ${JSON.stringify(text)}) never appeared at ${page.url()}: ${err.message}`
    );
  }
  const clicked = await page.evaluate(
    (sel, txt, w, ex, n) => {
      const scope = w ? document.querySelector(w) : document;
      if (!scope) return false;
      const els = [...scope.querySelectorAll(sel)].filter((e) => {
        const t = (e.innerText || e.textContent || '').trim();
        return (ex ? t === txt : t.includes(txt)) && !e.disabled;
      });
      const el = els[n < 0 ? els.length + n : n];
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    },
    selector, text, within, exact, nth
  );
  if (!clicked) throw new Error(`clickByText: no enabled "${text}" in ${selector}`);
}

// React-safe value setter used inside page.evaluate (attached to window so it
// resolves in strict and non-strict evaluate contexts alike).
const SET_NATIVE_VALUE_SRC = `
  window.__setNativeValue = function (el, value) {
    var proto =
      el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype :
      el instanceof HTMLSelectElement ? HTMLSelectElement.prototype :
      HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
`;

// Fill the control belonging to the label whose text starts with `labelText`.
// Handles <div><label/><control/></div>, label-wrapped checkboxes, and controls
// nested one level deep (password fields inside a relative wrapper).
async function fillByLabel(page, labelText, value, opts = {}) {
  const { within = null, timeout = CFG.NAV_TIMEOUT } = opts;
  await page.waitForFunction(
    (lt, w) => {
      const scope = w ? document.querySelector(w) : document;
      if (!scope) return false;
      return [...scope.querySelectorAll('label')].some((l) =>
        (l.textContent || '').trim().replace(/\s+/g, ' ').startsWith(lt)
      );
    },
    { timeout },
    labelText, within
  );
  const ok = await page.evaluate(
    (lt, val, w, helperSrc) => {
      // eslint-disable-next-line no-eval
      eval(helperSrc);
      const scope = w ? document.querySelector(w) : document;
      const lab = [...scope.querySelectorAll('label')].find((l) =>
        (l.textContent || '').trim().replace(/\s+/g, ' ').startsWith(lt)
      );
      if (!lab) return false;
      let ctl = lab.querySelector('input, textarea, select');
      if (!ctl) {
        let sib = lab.nextElementSibling;
        while (sib && !ctl) {
          if (sib.matches && sib.matches('input, textarea, select')) ctl = sib;
          else if (sib.querySelector) ctl = sib.querySelector('input, textarea, select');
          if (!ctl) sib = sib.nextElementSibling;
        }
      }
      if (!ctl && lab.parentElement) ctl = lab.parentElement.querySelector('input, textarea, select');
      if (!ctl) return false;
      ctl.scrollIntoView({ block: 'center' });
      if (ctl.type === 'checkbox') {
        if (ctl.checked !== !!val) ctl.click();
        return true;
      }
      __setNativeValue(ctl, String(val));
      return true;
    },
    labelText, value, within, SET_NATIVE_VALUE_SRC
  );
  if (!ok) throw new Error(`fillByLabel: no control for label "${labelText}"`);
}

// Set the select (scoped by `within`) that offers `optionValue` to that value.
async function setSelectWithOption(page, optionValue, opts = {}) {
  const { within = null } = opts;
  const ok = await page.evaluate(
    (val, w, helperSrc) => {
      // eslint-disable-next-line no-eval
      eval(helperSrc);
      const scope = w ? document.querySelector(w) : document;
      if (!scope) return false;
      const sel = [...scope.querySelectorAll('select')].find((s) =>
        [...s.options].some((o) => o.value === val)
      );
      if (!sel) return false;
      __setNativeValue(sel, val);
      return true;
    },
    optionValue, within, SET_NATIVE_VALUE_SRC
  );
  if (!ok) throw new Error(`setSelectWithOption: no select offering "${optionValue}"`);
}

// Fill an input found by placeholder (scoped).
async function fillByPlaceholder(page, placeholder, value, opts = {}) {
  const { within = null, nth = 0 } = opts;
  const sel = `input[placeholder="${placeholder}"], textarea[placeholder="${placeholder}"]`;
  await page.waitForFunction(
    (s, w) => {
      const scope = w ? document.querySelector(w) : document;
      return scope && scope.querySelectorAll(s).length > 0;
    },
    { timeout: CFG.NAV_TIMEOUT },
    sel, within
  );
  const ok = await page.evaluate(
    (s, val, w, n, helperSrc) => {
      // eslint-disable-next-line no-eval
      eval(helperSrc);
      const scope = w ? document.querySelector(w) : document;
      const els = [...scope.querySelectorAll(s)];
      const el = els[n < 0 ? els.length + n : n];
      if (!el) return false;
      __setNativeValue(el, String(val));
      return true;
    },
    sel, value, within, nth, SET_NATIVE_VALUE_SRC
  );
  if (!ok) throw new Error(`fillByPlaceholder: no "${placeholder}"`);
}

// Table-row scoped lookups: the first <tr> whose text includes rowText.
async function getRowCells(page, rowText) {
  return page.evaluate((txt) => {
    const tr = [...document.querySelectorAll('tbody tr')].find((r) =>
      (r.innerText || '').includes(txt)
    );
    if (!tr) return null;
    return [...tr.querySelectorAll('td')].map((td) => (td.innerText || '').trim());
  }, rowText);
}

async function clickInRow(page, rowText, matcher) {
  // matcher: { text } or { title }
  const ok = await page.evaluate(
    (txt, m) => {
      const tr = [...document.querySelectorAll('tbody tr')].find((r) =>
        (r.innerText || '').includes(txt)
      );
      if (!tr) return false;
      let btn = null;
      if (m.title) btn = tr.querySelector(`button[title="${m.title}"]`);
      if (!btn && m.text)
        btn = [...tr.querySelectorAll('button')].find((b) =>
          (b.innerText || '').trim().includes(m.text)
        );
      if (!btn) return false;
      btn.scrollIntoView({ block: 'center' });
      btn.click();
      return true;
    },
    rowText, matcher
  );
  if (!ok) throw new Error(`clickInRow: row "${rowText}" / ${JSON.stringify(matcher)} not found`);
}

/* ---------------- challenge + login ---------------- */

async function readChallengeLetters(page) {
  await page.waitForSelector('input[maxlength="1"]', { timeout: CFG.NAV_TIMEOUT });
  const letters = await page.$$eval('input[maxlength="1"]', (els) =>
    els.map((e) => ((e.previousElementSibling && e.previousElementSibling.textContent) || '').trim())
  );
  if (letters.some((l) => !l)) throw new Error(`Could not read challenge letters: [${letters}]`);
  return letters;
}

async function solveChallengeInUI(page) {
  const letters = await readChallengeLetters(page);
  const digits = solveLetters(letters);
  const inputs = await page.$$('input[maxlength="1"]');
  for (let i = 0; i < inputs.length; i += 1) {
    await inputs[i].click({ clickCount: 3 });
    await page.keyboard.type(digits[i], { delay: 15 });
  }
  return { letters, digits };
}

// Full two-phase UI login. loginPath: '/admin-portal/login' | '/investor-portal/login'.
async function uiLogin(page, { email, password, loginPath, expectPath }) {
  await goto(page, loginPath);
  await page.waitForSelector('input[type="email"]');
  await page.evaluate((helperSrc) => {
    // eslint-disable-next-line no-eval
    eval(helperSrc);
    const em = document.querySelector('input[type="email"]');
    const pw = document.querySelector('input[type="password"]');
    if (em) __setNativeValue(em, '');
    if (pw) __setNativeValue(pw, '');
  }, SET_NATIVE_VALUE_SRC);
  await page.type('input[type="email"]', email, { delay: 5 });
  await page.type('input[type="password"]', password, { delay: 5 });
  await clickByText(page, 'button', 'Continue');

  const outcome = await page.waitForFunction(
    (expect) => {
      if (window.location.pathname.startsWith(expect)) return 'landed';
      const t = document.body.innerText;
      if (t.includes('Security Check')) return 'challenge';
      if (t.includes('Too many attempts')) return 'error:429 cooldown shown (the backend allows 10 logins per IP per 10 min window; wait it out or restart the backend to clear the in-memory limiter)';
      const err = document.querySelector('.text-red-600');
      if (err && err.innerText.trim()) return 'error:' + err.innerText.trim();
      return false;
    },
    { timeout: CFG.NAV_TIMEOUT },
    expectPath
  );
  const state1 = await outcome.jsonValue();
  if (String(state1).startsWith('error:')) {
    throw new Error(`Login failed for ${email}: ${String(state1).slice(6)}`);
  }
  if (state1 === 'challenge') {
    await solveChallengeInUI(page);
    await clickByText(page, 'button', 'Verify');
    const done = await page.waitForFunction(
      (expect) => {
        if (window.location.pathname.startsWith(expect)) return 'landed';
        const t = document.body.innerText;
        if (t.includes('Too many attempts')) return 'error:429 cooldown shown (the backend allows 10 logins per IP per 10 min window; wait it out or restart the backend to clear the in-memory limiter)';
        const err = document.querySelector('.text-red-600');
        if (err && err.innerText.trim()) return 'error:' + err.innerText.trim();
        return false;
      },
      { timeout: CFG.NAV_TIMEOUT },
      expectPath
    );
    const state2 = await done.jsonValue();
    if (String(state2).startsWith('error:')) {
      throw new Error(`Challenge verify failed for ${email}: ${String(state2).slice(6)}`);
    }
  }
  await sleep(300);
}

/* ---------------- mail sink ---------------- */

function findMailLink(email, sinceMs) {
  if (!fs.existsSync(CFG.MAILS_DIR)) return null;
  const files = fs
    .readdirSync(CFG.MAILS_DIR)
    .filter((f) => f.endsWith('.eml'))
    .map((f) => ({ f, m: fs.statSync(path.join(CFG.MAILS_DIR, f)).mtimeMs }))
    .filter((x) => x.m >= sinceMs - 2000)
    .sort((a, b) => b.m - a.m);
  for (const { f } of files) {
    const raw = fs.readFileSync(path.join(CFG.MAILS_DIR, f), 'utf8');
    const unfolded = raw.replace(/=\r?\n/g, '').replace(/\r?\n\s+/g, ' ');
    if (!unfolded.toLowerCase().includes(email.toLowerCase())) continue;
    const m = unfolded.match(/https?:\/\/[^\s"'<>]*set-password\?token=([A-Za-z0-9_.\-]+)/);
    if (m) return { url: m[0], token: m[1], file: f };
  }
  return null;
}

async function waitForMailLink(email, sinceMs, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const hit = findMailLink(email, sinceMs);
    if (hit) return hit;
    if (Date.now() > deadline) {
      throw new Error(`No set-password mail for ${email} within ${timeoutMs}ms in ${CFG.MAILS_DIR}`);
    }
    await sleep(1000);
  }
}

/* ---------------- direct API ---------------- */

async function api(pathname, { method = 'GET', token, body } = {}) {
  const res = await fetch(CFG.API_URL + pathname, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let env = null;
  try {
    env = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, env };
}

// Two-phase login straight against the API (used for provisioning, not UI tests).
async function apiLogin(email, password) {
  const l = await api('/api/auth/login', { method: 'POST', body: { email, password } });
  if (l.status !== 200 || !l.env?.success) {
    throw new Error(`API login failed (${l.status}): ${l.env?.message}`);
  }
  const challenge = l.env.data?.challenge;
  if (!challenge) {
    const auth = l.env.data?.auth;
    if (auth?.accessToken) return auth;
    throw new Error('API login: neither challenge nor auth in response');
  }
  const answers = solveLetters(challenge.letters);
  const v = await api('/api/auth/verify-challenge', {
    method: 'POST',
    body: { challengeId: challenge.challengeId, answers },
  });
  if (v.status !== 200 || !v.env?.success || !v.env?.data?.accessToken) {
    throw new Error(`API verify-challenge failed (${v.status}): ${v.env?.message}`);
  }
  return v.env.data; // { accessToken, refreshToken, user }
}

// Create a user via API, complete the invite from the mail sink, return creds.
async function provisionUserViaApi({ fullName, email, role, password }) {
  const auth = await apiLogin(CFG.ADMIN_EMAIL, CFG.ADMIN_PASSWORD);
  const since = Date.now();
  const c = await api('/api/admin/users', {
    method: 'POST',
    token: auth.accessToken,
    body: { fullName, email, role, active: true },
  });
  if (c.status >= 400 || c.env?.success === false) {
    throw new Error(`API create user failed (${c.status}): ${c.env?.message}`);
  }
  const mail = await waitForMailLink(email, since);
  const r = await api('/api/auth/reset-password', {
    method: 'POST',
    body: { token: mail.token, newPassword: password },
  });
  if (r.status >= 400 || r.env?.success === false) {
    throw new Error(`API reset-password (invite) failed (${r.status}): ${r.env?.message}`);
  }
  return { email, password };
}

module.exports = {
  CFG,
  pollFor,
  MAP,
  solveLetters,
  sleep,
  launchBrowser,
  newPage,
  goto,
  waitForText,
  waitForGone,
  bodyText,
  clickByText,
  fillByLabel,
  fillByPlaceholder,
  setSelectWithOption,
  getRowCells,
  clickInRow,
  readChallengeLetters,
  solveChallengeInUI,
  uiLogin,
  findMailLink,
  waitForMailLink,
  api,
  apiLogin,
  provisionUserViaApi,
  SET_NATIVE_VALUE_SRC,
};
