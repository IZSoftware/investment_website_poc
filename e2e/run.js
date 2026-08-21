/* eslint-disable no-console */
// E2E runner: sequential scenarios, one shared browser, fail-soft.
// Exit code = number of failed scenarios. Screenshots for failures land in
// e2e/shots/<scenario>.png. Run with: npm run e2e
const fs = require('fs');
const path = require('path');
const { CFG, launchBrowser } = require('./helpers');
const { buildScenarios } = require('./scenarios');

const ONLY = process.env.E2E_ONLY
  ? process.env.E2E_ONLY.split(',').map((s) => s.trim())
  : null;

(async () => {
  fs.mkdirSync(CFG.SHOTS_DIR, { recursive: true });

  // Preflight: both servers must answer before we spend time in Chrome.
  for (const [name, url] of [
    ['frontend', CFG.APP_URL],
    ['backend', `${CFG.API_URL}/actuator/health`],
  ]) {
    try {
      const res = await fetch(url);
      if (res.status >= 500) throw new Error(`status ${res.status}`);
    } catch (e) {
      console.error(`Preflight failed: ${name} at ${url} is not answering (${e.message})`);
      process.exit(99);
    }
  }

  const browser = await launchBrowser();
  const state = { runId: Date.now().toString(36) };
  console.log(`E2E run ${state.runId} — app ${CFG.APP_URL}, api ${CFG.API_URL}`);

  const scenarios = buildScenarios().filter((s) => !ONLY || ONLY.includes(s.name));
  const results = [];

  for (const s of scenarios) {
    const t0 = Date.now();
    process.stdout.write(`\n=== ${s.name} ===\n`);
    try {
      await s.fn({ browser, state });
      results.push({ name: s.name, ok: true, ms: Date.now() - t0 });
      console.log(`PASS ${s.name} (${Date.now() - t0}ms)`);
    } catch (err) {
      results.push({ name: s.name, ok: false, ms: Date.now() - t0, err: err.message });
      console.log(`FAIL ${s.name} (${Date.now() - t0}ms): ${err.message}`);
      try {
        const pg = state.lastPage;
        if (pg && !pg.isClosed()) {
          // Snapshot the DOM before the screenshot: fullPage capture resizes the
          // viewport and can time out on tall pages, losing the diagnosis.
          const snap = await pg.evaluate(() => ({
            url: window.location.href,
            body: (document.body ? document.body.innerText : '(no body)').slice(0, 400),
          }));
          console.log(`      at ${snap.url}`);
          console.log(`      body: ${snap.body.replace(/\s*\n\s*/g, ' | ')}`);
          const apiFails = (pg._apiFailures || []).slice(-5);
          if (apiFails.length) console.log(`      recent API failures: ${apiFails.join(' | ')}`);
          const consoleErrs = (pg._consoleErrors || []).slice(-3);
          if (consoleErrs.length) console.log(`      console: ${consoleErrs.join(' | ').slice(0, 300)}`);
          const shot = path.join(CFG.SHOTS_DIR, `${s.name}.png`);
          await pg.screenshot({ path: shot });
          console.log(`      screenshot: ${shot}`);
        }
      } catch (shotErr) {
        console.log(`      (screenshot failed: ${shotErr.message})`);
      }
    }
  }

  await browser.close().catch(() => {});

  const failures = results.filter((r) => !r.ok);
  const width = Math.max(...results.map((r) => r.name.length), 8);
  console.log('\n================ E2E RESULTS ================');
  for (const r of results) {
    console.log(
      `${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(width)}  ${String(r.ms).padStart(7)}ms${
        r.ok ? '' : `  ${r.err}`
      }`
    );
  }
  console.log('=============================================');
  console.log(`${results.length - failures.length}/${results.length} passed`);
  process.exit(failures.length);
})().catch((err) => {
  console.error('Runner crashed:', err);
  process.exit(98);
});
