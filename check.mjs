// Page checks via the system Google Chrome in headless mode — no npm install,
// same DevTools-Protocol-over-WebSocket approach as screenshot.mjs.
//
//   node check.mjs [baseUrl] [--modes=motion,reduced,nojs] [--widths=1440,390] [--pages=/,/training/]
//
// For every page × mode × width it loads the page, scrolls it through the
// way a visitor would, lets the motion settle, then fails on:
//   - console errors, uncaught exceptions, failed requests
//   - horizontal overflow
//   - broken images
//   - content in <main> that is still invisible: faded out, or pushed outside
//     the box that clips it (a masked line that never rose, a wipe that
//     never opened)
//
// Modes: motion  = the full site
//        reduced = prefers-reduced-motion: reduce (the static site)
//        nojs    = JavaScript disabled
// Exits 1 on any failure.

import { spawn } from 'child_process';
import { rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1].split(',') : fallback;
};
const base = (args.find((a) => !a.startsWith('--')) || 'http://localhost:3000').replace(/\/$/, '');
const modes = opt('modes', ['motion', 'reduced', 'nojs']);
const widths = opt('widths', ['1440', '390']).map(Number);
const pages = opt('pages', ['/', '/training/', '/stay/', '/gallery/', '/find-us/']);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let port, profile, chrome;
function launch() {
  port = 9800 + Math.floor(Math.random() * 150);
  profile = join(tmpdir(), `tkm-check-${process.pid}-${port}`);
  chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--hide-scrollbars', '--force-color-profile=srgb', '--no-sandbox',
    '--disable-dev-shm-usage', 'about:blank',
  ], { stdio: 'ignore' });
}
async function shutdown() {
  chrome?.kill();
  await sleep(200);
  if (profile) rmSync(profile, { recursive: true, force: true });
}

async function endpoint() {
  for (let i = 0; i < 100; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error('Chrome did not expose a DevTools endpoint');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const listeners = new Set();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method) {
        listeners.forEach((fn) => fn(msg));
      }
    });
    ws.addEventListener('error', reject);
    ws.addEventListener('close', () => {
      pending.forEach(({ rej }) => rej(new Error('DevTools connection closed')));
      pending.clear();
    });
    ws.addEventListener('open', () => resolve({
      send(method, params = {}, sessionId) {
        return new Promise((res, rej) => {
          const msgId = ++id;
          pending.set(msgId, { res, rej });
          ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
        });
      },
      listen: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
      close: () => ws.close(),
    }));
  });
}

/* Runs in the page. Scrolls every candidate into view the way it would sit
   for a reader, then reports anything that is still not visible. A first
   pass is instant; whatever fails it gets a second look after it has sat
   in view for a moment — scroll-linked motion needs a frame or two and a
   tween to catch up, the same as it does for a person. */
const INSPECT = `(async () => {
  const out = [];
  const root = document.querySelector('main');
  if (!root) return JSON.stringify({ out: ['no <main>'], n: 0 });
  /* .tile-cap: gallery captions only appear on hover, by design.
     Split type (.m-*) is aria-hidden under an aria-label on its heading,
     but it is exactly what a sighted reader sees, so it is checked. */
  const skip = (el) => el.closest('[aria-hidden="true"]:not(.m-char, .m-word, .m-line, .m-line-mask), .sr-only, dialog:not([open]), [hidden], template, noscript, .tile-cap');
  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const cands = [...root.querySelectorAll('*')].filter((el) => !skip(el) && (el.tagName === 'IMG' || hasOwnText(el)));
  const opacity = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity); } return o; };
  /* Horizontal scrollers (room strips, the price matrix) clip on purpose:
     only their vertical clipping counts. */
  const clipped = (el) => {
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    if (!area) return false;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const ox = cs.overflowX !== 'visible', oy = cs.overflowY !== 'visible';
      if (!ox && !oy) continue;
      const c = n.getBoundingClientRect();
      const scrollerX = /auto|scroll/.test(cs.overflowX);
      const w = scrollerX || !ox ? r.width : Math.max(0, Math.min(r.right, c.right) - Math.max(r.left, c.left));
      const h = !oy ? r.height : Math.max(0, Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top));
      if ((w * h) / area < 0.5) return n;
    }
    return false;
  };
  const name = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '') + ' "' + (el.getAttribute('alt') || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40) + '"';
  const view = (el) => {
    const r0 = el.getBoundingClientRect();
    const top = r0.top + scrollY;
    /* above the fold: judge it where a visitor first sees it */
    window.scrollTo(0, top < innerHeight * 0.8 ? 0 : Math.max(0, top - innerHeight / 2 + r0.height / 2));
  };
  const verdict = (el) => {
    const o = opacity(el);
    if (o < 0.99) return 'faded (' + o.toFixed(2) + '): ' + name(el);
    const c = clipped(el);
    return c ? 'clipped by ' + c.tagName.toLowerCase() + '.' + String(c.className).split(' ')[0] + ': ' + name(el) : null;
  };
  let n = 0;
  const retry = [];
  for (const el of cands) {
    const r0 = el.getBoundingClientRect();
    if (!r0.width || !r0.height) continue;
    n++;
    view(el);
    if (verdict(el)) retry.push(el);
  }
  for (const el of retry) {
    view(el);
    await new Promise((r) => setTimeout(r, 700));
    const v = verdict(el);
    if (v) out.push(v);
  }
  window.scrollTo(0, 0);
  return JSON.stringify({ out, n });
})()`;

async function run(cdp, page, mode, width) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const call = (m, p) => cdp.send(m, p, sessionId);
  const errors = [];
  const stop = cdp.listen((msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push('exception: ' + (d.exception?.description || d.text).split('\n')[0]);
    } else if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(msg.params.type)) {
      errors.push('console.error: ' + msg.params.args.map((a) => a.value ?? a.description).join(' '));
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      errors.push('log: ' + msg.params.entry.text + (msg.params.entry.url ? ' ' + msg.params.entry.url : ''));
    }
  });

  const mobile = width <= 600;
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Log.enable');
  await call('Emulation.setDeviceMetricsOverride', { width, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
  if (mobile) await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await call('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: mode === 'reduced' ? 'reduce' : 'no-preference' }],
  });
  if (mode === 'nojs') await call('Emulation.setScriptExecutionDisabled', { value: true });

  const evaluate = async (expression, awaitPromise = true) => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  await call('Page.navigate', { url: base + page });
  // Scripts are off in nojs mode, so poll from the protocol side, not the page.
  for (let i = 0; i < 100; i++) {
    const ready = mode === 'nojs'
      ? (await call('Page.getFrameTree')).frameTree.frame.url !== 'about:blank'
      : await evaluate('document.readyState === "complete"', false).catch(() => false);
    if (ready) break;
    await sleep(100);
  }
  await sleep(mode === 'nojs' ? 800 : 3200); // the home intro runs ~2.2s

  let report;
  if (mode === 'nojs') {
    // Page scripts are disabled, but Runtime.evaluate still runs.
    await call('Emulation.setScriptExecutionDisabled', { value: false });
  }
  // Scroll through like a reader: reveals fire, lazy images load.
  await evaluate(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.35)) {
      window.scrollTo(0, y);
      await wait(${mode === 'motion' ? 140 : 20});
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await wait(${mode === 'motion' ? 1800 : 200});
    const pending = [...document.images].filter((i) => !i.complete);
    await Promise.race([Promise.all(pending.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), wait(8000)]);
    window.scrollTo(0, 0);
    await wait(${mode === 'motion' ? 1200 : 100});
  })()`);
  report = JSON.parse(await evaluate(INSPECT));
  const layout = JSON.parse(await evaluate(`JSON.stringify({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    broken: [...document.images].filter((i) => i.getAttribute('src') && i.complete && !i.naturalWidth).map((i) => i.getAttribute('src')),
    motion: document.documentElement.className
  })`, false));

  stop();
  await cdp.send('Target.closeTarget', { targetId });

  const fails = [...errors];
  if (layout.sw > layout.cw) fails.push(`horizontal overflow: ${layout.sw} > ${layout.cw}`);
  layout.broken.forEach((b) => fails.push('broken image: ' + b));
  report.out.forEach((o) => fails.push(o));
  return { fails, checked: report.n, html: layout.motion };
}

let failed = 0;
const withTimeout = (p, ms) => Promise.race([p, sleep(ms).then(() => { throw new Error(`timed out after ${ms / 1000}s`); })]);
try {
  launch();
  let cdp = await connect(await endpoint());
  for (const width of widths) {
    for (const mode of modes) {
      for (const page of pages) {
        const tag = `${mode.padEnd(7)} ${String(width).padStart(4)}  ${page.padEnd(11)}`;
        let result;
        for (let attempt = 1; attempt <= 2 && !result; attempt++) {
          try {
            result = await withTimeout(run(cdp, page, mode, width), 120000);
          } catch (err) {
            if (attempt === 2) result = { fails: ['run error: ' + err.message], checked: 0, html: '?' };
            else {
              console.log(`      ${tag} ${err.message} — relaunching Chrome and retrying`);
              try { cdp.close(); } catch { /* already gone */ }
              await shutdown();
              launch();
              cdp = await connect(await endpoint());
            }
          }
        }
        const { fails, checked, html } = result;
        if (fails.length) {
          failed++;
          console.log(`FAIL  ${tag} (${checked} checked, html="${html}")`);
          const shown = fails.slice(0, 12);
          shown.forEach((f) => console.log('        ' + f));
          if (fails.length > shown.length) console.log(`        … ${fails.length - shown.length} more`);
        } else {
          console.log(`pass  ${tag} (${checked} checked)`);
        }
      }
    }
  }
  cdp.close();
} catch (err) {
  console.error('check failed to run:', err.message);
  failed++;
} finally {
  await shutdown();
}
console.log(failed ? `\n${failed} run(s) failed` : '\nall runs passed');
process.exit(failed ? 1 : 0);
