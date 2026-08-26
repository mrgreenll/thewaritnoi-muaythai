// Full-page screenshot via the system Google Chrome in headless mode.
// No puppeteer / no npm install: talks the DevTools Protocol over Node's
// built-in WebSocket (Node 22+).
//
//   node screenshot.mjs [url] [width] [label]
//   node screenshot.mjs http://localhost:3000            -> 1440px desktop
//   node screenshot.mjs http://localhost:3000 390 mobile -> 390px mobile
//
// Saves to ./temporary screenshots/screenshot-N[-label].png (never overwrites)
// and prints a horizontal-overflow report for the captured width.

import { spawn } from 'child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'temporary screenshots');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const width = parseInt(process.argv[3] || '1440', 10);
const label = process.argv[4] ? `-${process.argv[4]}` : '';
const isMobile = width <= 600;
const scale = isMobile ? 2 : 1;

const n = readdirSync(dir).filter((f) => f.endsWith('.png')).length + 1;
const outFile = join(dir, `screenshot-${n}${label}.png`);

const port = 9200 + Math.floor(Math.random() * 600);
const profile = join(tmpdir(), `klmt-chrome-${process.pid}`);
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text',
  `--force-device-scale-factor=${scale}`,
  '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function endpoint() {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      const j = await r.json();
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
    const events = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method && events.has(msg.method)) {
        events.get(msg.method).forEach((fn) => fn(msg.params));
      }
    });
    ws.addEventListener('error', reject);
    ws.addEventListener('open', () => resolve({
      send(method, params = {}, sessionId) {
        return new Promise((res, rej) => {
          const msgId = ++id;
          pending.set(msgId, { res, rej });
          ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
        });
      },
      once(method) {
        return new Promise((res) => {
          const list = events.get(method) || [];
          const fn = (p) => { events.set(method, (events.get(method) || []).filter((f) => f !== fn)); res(p); };
          events.set(method, [...list, fn]);
        });
      },
      close: () => ws.close(),
    }));
  });
}

let exitCode = 0;
try {
  const cdp = await connect(await endpoint());
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const call = (m, p) => cdp.send(m, p, sessionId);

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', {
    width, height: isMobile ? 844 : 900, deviceScaleFactor: scale, mobile: isMobile,
  });

  const loaded = cdp.once('Page.loadEventFired');
  await call('Page.navigate', { url });
  await Promise.race([loaded, sleep(20000)]);
  await sleep(600);

  // Settle: force scroll-triggered reveals on, wait for fonts + images.
  const settle = await call('Runtime.evaluate', {
    awaitPromise: true, returnByValue: true,
    expression: `(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const cap = (p, ms) => Promise.race([p, wait(ms)]);
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      // lazy images never fire load while offscreen — force them all in
      document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
      window.scrollTo(0, document.body.scrollHeight);
      await wait(500);
      window.scrollTo(0, 0);
      await cap(document.fonts.ready, 5000);
      const imgs = [...document.images].filter(i => !i.complete);
      await cap(Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; }))), 15000);
      await wait(600);
      const broken = [...document.images]
        .filter(i => i.getAttribute('src') && !i.naturalWidth)
        .map(i => i.currentSrc || i.src);
      const wide = [...document.querySelectorAll('body *')]
        .filter(el => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 8)
        .map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '')
             + ' -> ' + Math.round(el.getBoundingClientRect().right) + 'px');
      return JSON.stringify({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        broken, wide,
      });
    })()`,
  });
  const info = JSON.parse(settle.result.value);

  const evalIn = async (expression, awaitPromise = true) => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  // Full-page capture, in bands.
  //
  // The two obvious one-shot routes both fail on this page in Chrome 151:
  // `captureBeyondViewport` + a full-page `clip` hangs forever once the images
  // have decoded, and growing the viewport to the whole document and reading
  // `fromSurface: false` returns a mostly-empty raster. Plain viewport-sized
  // captures are fast and correct, so shoot a stack of them and stitch.
  //
  // Anything anchored to the viewport is pinned to the document first, so it
  // appears exactly once instead of repeating in every band.
  await evalIn(`(() => {
    const hero = document.querySelector('.hero');
    const h = hero ? Math.round(hero.getBoundingClientRect().height) : 0;
    const st = document.createElement('style');
    st.textContent = 'html{scroll-behavior:auto!important}'
      + (h ? '.hero{min-height:' + h + 'px!important;height:' + h + 'px!important}' : '')
      + '.nav,.fab{position:absolute!important}body::after{position:absolute!important}';
    document.head.appendChild(st);
  })()`, false);
  await sleep(400);

  const fullHeight = Math.ceil((await call('Page.getLayoutMetrics')).cssContentSize.height);
  // An absolutely positioned .fab resolves against the initial containing block,
  // which parks it one viewport down the page. Drop it to the real page bottom.
  await evalIn(`(() => {
    const st = document.createElement('style');
    st.textContent = '.fab{top:${fullHeight - 110}px!important;bottom:auto!important}';
    document.head.appendChild(st);
  })()`, false);

  // 1200, not 1800: Page.captureScreenshot hangs outright on /gallery/ once
  // the viewport passes ~1500px tall (reproduces on the pre-masonry page
  // too, so it is the harness, not the layout). Smaller bands, more of them.
  const BAND = 1200;
  await call('Emulation.setDeviceMetricsOverride', { width, height: BAND, deviceScaleFactor: scale, mobile: isMobile });
  await sleep(500);

  const bands = [];
  for (let y = 0; y < fullHeight; y += BAND) {
    await evalIn(`window.scrollTo(0, ${y})`, false);
    await sleep(420);
    const at = await evalIn(`Math.round(window.scrollY)`, false);
    bands.push({ y: at, data: (await call('Page.captureScreenshot', { format: 'png' })).data });
  }

  // Stitch on a canvas in a blank tab, so page CSS cannot interfere. The bands
  // come back at the host's pixel ratio; they are drawn down to 1 CSS px = 1
  // image px so the canvas stays small enough for toDataURL to finish.
  await call('Page.navigate', { url: 'about:blank' });
  await sleep(400);
  await evalIn(`(() => {
    window.__c = document.createElement('canvas');
    window.__c.width = ${width};
    window.__c.height = ${fullHeight};
    window.__x = window.__c.getContext('2d');
    window.__x.fillStyle = '#060404';
    window.__x.fillRect(0, 0, ${width}, ${fullHeight});
    return 1;
  })()`, false);
  for (const band of bands) {
    await evalIn(`(async () => {
      const im = new Image();
      im.src = 'data:image/png;base64,${band.data}';
      await im.decode();
      window.__x.drawImage(im, 0, ${band.y}, ${width}, im.naturalHeight * ${width} / im.naturalWidth);
      return 1;
    })()`);
  }
  // Pull the data URL back in chunks — a single ~12 MB Runtime.evaluate
  // response never arrives.
  const len = await evalIn(`(() => { window.__d = window.__c.toDataURL('image/png'); return window.__d.length; })()`, false);
  let dataUrl = '';
  for (let o = 0; o < len; o += 2_000_000) {
    dataUrl += await evalIn(`window.__d.substr(${o}, 2000000)`, false);
  }
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');

  writeFileSync(outFile, png);
  cdp.close();

  console.log(`Saved: ${outFile}`);
  console.log(`Viewport ${width}px  |  page height ${fullHeight}px  |  ${bands.length} bands`);
  const overflow = info.scrollWidth - info.clientWidth;
  console.log(overflow > 0
    ? `HORIZONTAL OVERFLOW: scrollWidth ${info.scrollWidth} > clientWidth ${info.clientWidth} (+${overflow}px)`
    : `No horizontal overflow (scrollWidth ${info.scrollWidth} = clientWidth ${info.clientWidth})`);
  if (info.wide.length) console.log('Elements past the right edge:\n  ' + info.wide.join('\n  '));
  if (info.broken.length) { console.log('BROKEN IMAGES:\n  ' + info.broken.join('\n  ')); exitCode = 1; }
} catch (err) {
  console.error('screenshot failed:', err.message);
  exitCode = 1;
} finally {
  chrome.kill();
  await sleep(200);
  rmSync(profile, { recursive: true, force: true });
}
process.exit(exitCode);
