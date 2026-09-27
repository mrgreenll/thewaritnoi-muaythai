/* Thewaritnoi Krabi Muaythai — the motion layer ("Fight Night").
   Spec: docs/superpowers/specs/2026-09-27-fight-night-motion-design.md

   Runs only when the head gate put `motion` on <html>. site.js is the
   functional baseline and never depends on this file; the two talk only
   through window.TKMMotion (hooks site.js may call) and DOM events.

   One loud moment — the home intro. Everything else answers a person's
   action or carries information. Every component is its own function,
   guarded by an element check, and runs inside safe() so one failure
   cannot strand the page in its hidden start state.

   Scrubbed timelines always use fromTo(): a plain to() would record the
   CSS hold state (opacity 0) as its start value. */
(() => {
  'use strict';

  const root = document.documentElement;
  if (!root.classList.contains('motion')) return;

  const { gsap, ScrollTrigger, SplitText, CustomEase } = window;
  if (!gsap || !ScrollTrigger || !SplitText || !CustomEase) {
    root.classList.remove('motion', 'intro');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  if (window.Flip) gsap.registerPlugin(window.Flip);

  /* Hooks for site.js. Each returns truthy when it handled the call. */
  const hooks = (window.TKMMotion = { lenis: null });

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const intro = root.classList.contains('intro');
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const safe = (name, fn) => {
    try { return fn(); } catch (err) { console.error(`[motion] ${name}:`, err); return null; }
  };
  /* Components mark what they own; the generic reveal skips those. */
  const claim = (el, kind) => { el.dataset.motion = kind; return el; };
  const wrap = (el, cls) => {
    const span = document.createElement('span');
    span.className = cls;
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
    return span;
  };
  /* What a screen reader should hear for split type: the text, with a
     space where a <br> broke the line. */
  const spoken = (el) => {
    const copy = el.cloneNode(true);
    copy.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
    return copy.textContent.replace(/\s+/g, ' ').trim();
  };

  /* ── The house vocabulary ──
     punch  — fast in, small overshoot, hard settle: type, stamps, buttons
     rope   — slow-fast-slow: wipes, curtains, rules drawing taut
     settle — power3.out: camera push-ins, parallax, quiet fades */
  CustomEase.create('punch', 'M0,0 C0.1,0 0.14,0.92 0.36,1.05 0.5,1.11 0.62,0.99 1,1');
  CustomEase.create('rope', 'M0,0 C0.72,0 0.18,1 1,1');
  const settle = 'power3.out';

  /* ═══ Global ════════════════════════════════════════════════ */

  /* Smooth scroll — desktop pointer only. */
  function smoothScroll() {
    if (!fine || !window.Lenis) return;
    const lenis = new window.Lenis({ lerp: 0.11, anchors: { offset: -88 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    hooks.lenis = lenis;
  }

  /* Nav: a red rope along the bottom edge measures the page; a line
     follows the hovered link and returns to the current page. */
  function nav() {
    const bar = $('#nav');
    if (!bar) return;
    const progress = document.createElement('span');
    progress.className = 'nav-progress';
    progress.setAttribute('aria-hidden', 'true');
    bar.appendChild(progress);
    gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    const links = $('.nav-links', bar);
    if (!links) return;
    const line = document.createElement('span');
    line.className = 'nav-line';
    line.setAttribute('aria-hidden', 'true');
    links.appendChild(line);
    const items = $$('a:not(.nav-book)', links);
    const current = items.find((a) => a.getAttribute('aria-current') === 'page');
    const place = (a, animate) => {
      if (!a) { gsap.to(line, { opacity: 0, duration: 0.3 }); return; }
      const vars = { x: a.offsetLeft, y: a.offsetTop + a.offsetHeight - 2, scaleX: a.offsetWidth, opacity: 1 };
      if (animate) gsap.to(line, { ...vars, duration: 0.5, ease: 'punch', overwrite: true });
      else gsap.set(line, vars);
    };
    place(current, false);
    if (!current) gsap.set(line, { opacity: 0 });
    items.forEach((a) => {
      a.addEventListener('pointerenter', () => place(a, true));
      a.addEventListener('focus', () => place(a, true));
    });
    links.addEventListener('pointerleave', () => place(current, true));
    links.addEventListener('focusout', (e) => { if (!links.contains(e.relatedTarget)) place(current, true); });
    ScrollTrigger.addEventListener('refresh', () => place(current, false));
  }

  /* Menu (below 1024px): the panel drops from under the nav, links rise
     from their own lines, the burger becomes the X that closes it. */
  function menu() {
    const burger = $('.burger');
    const panel = $('#navmenu');
    if (!burger || !panel) return;
    const svg = $('svg', burger);
    svg.innerHTML = '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
    const [top, mid, bot] = $$('line', svg);
    const rolls = $$('a', panel).map((a) => wrap(a, 'navmenu-roll'));

    hooks.menu = (open, el, done) => {
      gsap.killTweensOf([panel, top, mid, bot, ...rolls]);
      if (open) {
        gsap.timeline()
          .fromTo(panel, { yPercent: -100 }, { yPercent: 0, duration: 0.75, ease: 'expo.inOut' }, 0)
          .fromTo(rolls, { yPercent: 115 }, { yPercent: 0, duration: 0.8, stagger: 0.055, ease: 'punch' }, 0.32)
          .to(top, { y: 6, rotation: 45, transformOrigin: '50% 50%', duration: 0.5, ease: 'punch' }, 0)
          .to(bot, { y: -6, rotation: -45, transformOrigin: '50% 50%', duration: 0.5, ease: 'punch' }, 0)
          .to(mid, { scaleX: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.25 }, 0);
      } else {
        gsap.timeline({ onComplete: () => { gsap.set([panel, ...rolls], { clearProps: 'transform' }); done(); } })
          .to(rolls, { yPercent: -115, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, 0)
          .to(panel, { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, 0.12)
          .to([top, bot], { y: 0, rotation: 0, duration: 0.45, ease: 'punch' }, 0)
          .to(mid, { scaleX: 1, opacity: 1, duration: 0.3 }, 0.1);
      }
      return true;
    };
  }

  /* Buttons: the fill sweeps in and the label rolls (motion.css); on a
     fine pointer the button leans toward the cursor. */
  function buttons() {
    $$('.btn, .nav-book').forEach((btn) => {
      Array.from(btn.childNodes)
        .filter((n) => n.nodeType === 3 && n.textContent.trim())
        .forEach((node) => {
          const text = node.textContent.trim();
          const label = document.createElement('span');
          label.className = 'btn-label';
          const roll = document.createElement('span');
          roll.className = 'btn-roll';
          roll.textContent = text;
          const dup = document.createElement('span');
          dup.className = 'btn-dup';
          dup.setAttribute('aria-hidden', 'true');
          dup.textContent = text;
          roll.appendChild(dup);
          label.appendChild(roll);
          node.replaceWith(label);
        });
      if (!fine) return;
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.32);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); gsap.to(btn, { scale: 1, duration: 0.3 }); });
      btn.addEventListener('pointerdown', () => gsap.to(btn, { scale: 0.96, duration: 0.12, ease: 'power2.out' }));
      btn.addEventListener('pointerup', () => gsap.to(btn, { scale: 1, duration: 0.45, ease: 'punch' }));
    });
  }

  /* Cursor label: a red disc that says what a zone does (VIEW, DRAG).
     Fine pointers only, and only over [data-cursor]; the system cursor
     stays everywhere else. */
  function cursor() {
    if (!fine) return;
    const el = document.createElement('div');
    el.className = 'cursor';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0 });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    let zone = null;
    let placed = false;
    addEventListener('pointermove', (e) => {
      if (!placed) { gsap.set(el, { x: e.clientX, y: e.clientY }); placed = true; }
      xTo(e.clientX);
      yTo(e.clientY);
      const next = e.target.closest ? e.target.closest('[data-cursor]') : null;
      if (next === zone) return;
      zone = next;
      if (zone) {
        el.textContent = zone.dataset.cursor;
        gsap.to(el, { scale: 1, duration: 0.45, ease: 'punch', overwrite: 'auto' });
      } else {
        gsap.to(el, { scale: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' });
      }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => {
      zone = null;
      gsap.to(el, { scale: 0, duration: 0.25 });
    });
  }

  /* Footer: the page lifts off it (sticky, motion.css); its content rises
     out of the shadow as it is uncovered. */
  function footer() {
    const foot = $('.foot');
    const main = $('main');
    const inner = foot && $(':scope > .shell', foot);
    if (!inner || !main || innerHeight < 560) return;
    gsap.fromTo(inner, { y: -90, autoAlpha: 0.25 }, {
      y: 0, autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: main, start: 'bottom bottom', end: () => `+=${foot.offsetHeight}`, scrub: true },
    });
  }

  /* ═══ Reveals ═══════════════════════════════════════════════ */

  /* Eyebrow: the red rule pulls taut, then the label slides off it. */
  function eyebrowTl(el) {
    claim(el, 'eyebrow');
    const label = wrap(el, 'eyebrow-label');
    gsap.set(el, { '--rule': 0 });
    gsap.set(label, { autoAlpha: 0, x: -14 });
    return gsap.timeline()
      .to(el, { '--rule': 1, duration: 0.65, ease: 'rope' })
      .to(label, { autoAlpha: 1, x: 0, duration: 0.55, ease: settle }, 0.22);
  }
  function eyebrows() {
    $$('.eyebrow').forEach((el) => {
      if (el.closest('.page-head') || el.dataset.motion) return;
      const tl = eyebrowTl(el).pause();
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => tl.play() });
    });
  }

  /* Section headings: each line rises from behind itself. */
  function headings() {
    $$('main h2').forEach((h2) => {
      if (h2.closest('.page-head, .hero, .panel') || h2.dataset.motion) return;
      claim(h2, 'heading');
      SplitText.create(h2, {
        type: 'lines', mask: 'lines', linesClass: 'm-line', aria: 'none', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 115, duration: 1.05, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: h2, start: 'top 88%', once: true },
        }),
      });
    });
  }

  /* Framed photographs: the print wipes up into its frame, then drifts
     inside it as the page scrolls. */
  function frames() {
    $$('.frame').forEach((fig) => {
      const img = $('img', fig);
      if (!img) return;
      claim(fig, 'frame');
      const media = img.parentElement.tagName === 'PICTURE' ? img.parentElement : img;
      const mask = document.createElement('div');
      mask.className = 'frame-mask';
      const inner = document.createElement('div');
      inner.className = 'frame-inner';
      media.replaceWith(mask);
      inner.appendChild(media);
      mask.appendChild(inner);
      const cap = $('figcaption', fig);
      gsap.set(fig, { autoAlpha: 0, y: 40 });
      gsap.set(mask, { yPercent: 100 });
      gsap.set(inner, { yPercent: -100 });
      gsap.set(img, { scale: 1.32 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 86%', once: true } })
        .to(fig, { autoAlpha: 1, y: 0, duration: 0.9, ease: settle })
        .to([mask, inner], { yPercent: 0, duration: 1.15, ease: 'expo.inOut' }, 0.1)
        .to(img, { scale: 1.12, duration: 1.7, ease: 'expo.out' }, 0.1);
      if (cap) {
        gsap.set(cap, { autoAlpha: 0 });
        tl.to(cap, { autoAlpha: 1, duration: 0.6 }, 0.9);
      }
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* The stats strip: cells land one after another. */
  function stats() {
    $$('.stats').forEach((dl) => {
      claim(dl, 'stats');
      const cells = $$(':scope > div', dl);
      gsap.set(cells, { autoAlpha: 0, y: 26 });
      gsap.to(cells, {
        autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'punch', clearProps: 'transform',
        scrollTrigger: { trigger: dl, start: 'top 90%', once: true },
      });
    });
  }

  /* Whatever carries .reveal and no dedicated treatment rises a short way
     with its neighbours. Body copy stays quick and quiet. */
  function reveals() {
    const els = $$('.reveal').filter((el) => !el.dataset.motion);
    const offset = (el) => (el.classList.contains('d3') ? 0.18 : el.classList.contains('d2') ? 0.12 : el.classList.contains('d1') ? 0.06 : 0);
    gsap.set(els, { autoAlpha: 0, y: 16 });
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => batch.forEach((el, i) => gsap.to(el, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: settle, delay: offset(el) + i * 0.05,
        clearProps: 'transform,opacity,visibility',
      })),
    });
  }

  /* ═══ Photographs: colour comes back when you touch them ═══════ */

  /* A soft circle of the same photograph, in colour, riding the pointer.
     The circle moves one way and the photo inside it the other, so the
     colour stays registered to the black-and-white frame underneath. */
  function torch(band, img) {
    const t = document.createElement('div');
    t.className = 'torch';
    t.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('div');
    inner.className = 'torch-inner';
    const clone = img.cloneNode(false);
    clone.className = 'torch-img';
    clone.alt = '';
    clone.removeAttribute('loading');
    clone.removeAttribute('fetchpriority');
    inner.appendChild(clone);
    t.appendChild(inner);
    band.appendChild(t);
    const size = () => gsap.set(inner, { width: band.offsetWidth, height: band.offsetHeight });
    size();
    ScrollTrigger.addEventListener('refresh', size);
    const q = (el, prop) => gsap.quickTo(el, prop, { duration: 0.55, ease: 'power3.out' });
    const tx = q(t, 'x'), ty = q(t, 'y'), ix = q(inner, 'x'), iy = q(inner, 'y');
    const aim = (e, jump) => {
      const b = band.getBoundingClientRect();
      const r = t.offsetWidth / 2;
      const x = e.clientX - b.left - r;
      const y = e.clientY - b.top - r;
      if (jump) { gsap.set(t, { x, y }); gsap.set(inner, { x: -x, y: -y }); }
      tx(x); ty(y); ix(-x); iy(-y);
    };
    band.addEventListener('pointerenter', (e) => { aim(e, true); gsap.to(t, { opacity: 1, duration: 0.5, ease: settle, overwrite: 'auto' }); });
    band.addEventListener('pointermove', (e) => aim(e, false));
    band.addEventListener('pointerleave', () => gsap.to(t, { opacity: 0, duration: 0.45, ease: settle, overwrite: 'auto' }));
    return clone;
  }

  /* Photo bands open like a letterbox as they arrive, drift while they
     pass, and set their line word by word. */
  function bands() {
    $$('.band').forEach((band) => {
      const img = $(':scope > img', band);
      if (!img) return;
      const bars = ['top', 'bot'].map((edge) => {
        const bar = document.createElement('i');
        bar.className = `band-bar band-bar--${edge}`;
        bar.setAttribute('aria-hidden', 'true');
        band.appendChild(bar);
        return bar;
      });
      const photos = [img];
      if (fine) photos.push(torch(band, img));
      gsap.set(photos, { scale: 1.2 });
      gsap.fromTo(photos, { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.fromTo(bars, { scaleY: 1 }, {
        scaleY: 0, ease: 'none',
        scrollTrigger: { trigger: band, start: 'top 92%', end: 'top 32%', scrub: 0.5 },
      });
      const line = $('.band-line', band);
      if (!line) return;
      claim(line, 'band-line');
      const split = SplitText.create(line, { type: 'lines,words', mask: 'lines', linesClass: 'm-line', wordsClass: 'm-word', aria: 'none' });
      gsap.set(line, { '--rule': 0 });
      gsap.set(split.words, { yPercent: 115 });
      gsap.timeline({ scrollTrigger: { trigger: band, start: 'top 55%', once: true } })
        .to(line, { '--rule': 1, duration: 0.6, ease: 'rope' })
        .to(split.words, { yPercent: 0, duration: 0.85, stagger: 0.06, ease: 'punch' }, 0.2);
    });
  }

  /* ═══ Home ══════════════════════════════════════════════════ */

  /* The hero. First visit of a session opens on the rope curtain; later
     visits get the headline and the camera settle alone. Returns the
     opening timeline, paused. */
  function hero() {
    const heroEl = $('.hero');
    if (!heroEl) return null;
    const cam = $('.hero-cam', heroEl);
    const img = $('.hero-cam img', heroEl);
    const h1 = $('.poster-type', heroEl);
    const lines = $$('i', h1);
    const name = spoken(h1);
    SplitText.create(h1, { type: 'words,chars', wordsClass: 'm-word', charsClass: 'm-char' });
    h1.setAttribute('aria-label', name);
    const chars = lines.map((line) => $$('.m-char', line));
    gsap.set(chars.flat(), { yPercent: 135, rotate: 8, transformOrigin: '0% 100%' });
    gsap.set(cam, { scale: intro ? 1.3 : 1.12 });

    const rule = $('.poster-rule', heroEl);
    const ruleText = rule && $('b', rule);
    const lead = $('.lead', heroEl);
    const leadLines = lead ? SplitText.create(lead, { type: 'lines', mask: 'lines', linesClass: 'm-line', aria: 'none' }).lines : [];
    const ctas = $$('.hero-cta .btn', heroEl);
    const hint = $('.scroll-hint', heroEl);
    if (rule) gsap.set(rule, { '--rule': 0 });
    if (ruleText) gsap.set(ruleText, { autoAlpha: 0, x: -12 });
    gsap.set(leadLines, { yPercent: 110 });
    gsap.set(ctas, { autoAlpha: 0, y: 26 });
    if (hint) gsap.set(hint, { autoAlpha: 0 });

    /* Headline: line by line, letters punching up from under the line.
       The red line lands with a camera shake. */
    const headline = gsap.timeline();
    chars.forEach((set, i) => headline.to(set, { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.026, ease: 'punch' }, i * 0.17));
    const impact = 0.17 + (chars[1] ? chars[1].length : 0) * 0.026 + 0.26;
    headline.to(cam, { keyframes: { x: [0, -9, 7, -4, 2, 0], y: [0, 5, -3, 2, -1, 0] }, duration: 0.34, ease: 'none' }, impact);

    const bottom = gsap.timeline();
    if (rule) bottom.to(rule, { '--rule': 1, duration: 0.7, ease: 'rope' }, 0);
    if (ruleText) bottom.to(ruleText, { autoAlpha: 1, x: 0, duration: 0.6, ease: settle }, 0.25);
    bottom.to(leadLines, { yPercent: 0, duration: 0.95, stagger: 0.07, ease: 'expo.out' }, 0.15)
      .to(ctas, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'punch', clearProps: 'opacity,visibility' }, 0.35);
    if (hint) bottom.to(hint, { autoAlpha: 1, duration: 0.8 }, 0.6);

    const tl = gsap.timeline({ paused: true });
    const curtain = $('.curtain');
    if (intro && curtain) {
      const halves = $$('.curtain-half', curtain);
      const navItems = $$('#nav > :not(.nav-progress)');
      gsap.set(halves, { '--rope': 0 });
      gsap.set(navItems, { autoAlpha: 0, y: -22 });
      let ready = false;
      const decoded = Promise.race([img && img.decode ? img.decode().catch(() => {}) : null, wait(1400)]).then(() => { ready = true; });
      tl.to(halves, { '--rope': 1, duration: 0.7, ease: 'rope' })
        .add(() => { if (!ready) { tl.pause(); decoded.then(() => tl.resume()); } })
        .addLabel('split', '+=0.08')
        .to(halves[0], { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, 'split')
        .to(halves[1], { yPercent: 100, duration: 1.05, ease: 'expo.inOut' }, 'split')
        .to(cam, { scale: 1, duration: 2.2, ease: 'expo.out' }, 'split+=0.15')
        .add(headline, 'split+=0.5')
        .add(bottom, 'split+=1.15')
        .to(navItems, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'punch', clearProps: 'all' }, 'split+=1.3')
        .add(() => { curtain.remove(); root.classList.remove('intro'); });
    } else {
      if (curtain) curtain.remove();
      tl.to(cam, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0)
        .add(headline, 0.08)
        .add(bottom, 0.7);
    }

    /* Scroll: the photo pushes in and sinks, the headline peels away line
       by line, the lower group lifts off first. */
    const peel = gsap.timeline({ scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } });
    if (img) peel.fromTo(img, { yPercent: 0, scale: 1 }, { yPercent: 16, scale: 1.1, ease: 'none', duration: 1 }, 0);
    lines.forEach((line, i) => {
      peel.fromTo(line, { y: 0 }, { y: -(170 - i * 50), ease: 'none', duration: 1 }, 0)
        .fromTo(line, { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none', duration: 0.45 }, 0.35 + i * 0.08);
    });
    const group = $('.hero-bottom', heroEl);
    if (group) peel.fromTo(group, { y: 0, autoAlpha: 1 }, { y: -70, autoAlpha: 0, ease: 'none', duration: 0.5 }, 0);
    return tl;
  }

  /* Sub-page headers: photo settles, rule draws, headline rises letter
     by letter, intro fades up. Returns the opening timeline, paused. */
  function pageHead() {
    const head = $('.page-head');
    if (!head) return null;
    const img = $('.page-head-media img', head);
    const back = $('.backlink', head);
    const brow = $('.eyebrow', head);
    const h1 = $('h1', head);
    const lede = $$('.shell > p', head).filter((p) => !p.classList.contains('eyebrow'));
    const tl = gsap.timeline({ paused: true });
    if (img) {
      gsap.set(img, { scale: 1.16 });
      tl.to(img, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: head, start: 'top top', end: 'bottom top', scrub: true } });
    }
    if (back) {
      gsap.set(back, { autoAlpha: 0, x: -16 });
      tl.to(back, { autoAlpha: 1, x: 0, duration: 0.6, ease: settle }, 0.1);
    }
    if (brow) tl.add(eyebrowTl(brow), 0.12);
    if (h1) {
      const name = spoken(h1);
      const split = SplitText.create(h1, { type: 'lines,words,chars', mask: 'lines', linesClass: 'm-line', wordsClass: 'm-word', charsClass: 'm-char' });
      h1.setAttribute('aria-label', name);
      gsap.set(split.chars, { yPercent: 120 });
      tl.to(split.chars, { yPercent: 0, duration: 0.85, stagger: 0.016, ease: 'punch' }, 0.2);
    }
    if (lede.length) {
      gsap.set(lede, { autoAlpha: 0, y: 14 });
      tl.to(lede, { autoAlpha: 1, y: 0, duration: 0.8, ease: settle }, 0.55);
    }
    return tl;
  }

  /* Kinetic band: drifts on its own; scrolling pushes it faster, in the
     direction you scroll, and leans it. */
  function marquee() {
    const band = $('.marquee');
    if (!band) return;
    const track = $('.marquee-track', band);
    const set = $('.marquee-set', track);
    let w = 0;
    const fill = () => {
      w = set.offsetWidth;
      if (!w) return;
      while (track.children.length < 2 || track.children.length * w < innerWidth + w * 2) track.appendChild(set.cloneNode(true));
    };
    fill();
    ScrollTrigger.addEventListener('refresh', fill);
    let x = 0;
    let dir = -1;
    let vel = 0;
    const base = fine ? 70 : 46; // px per second at rest
    const lean = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3.out' });
    const st = ScrollTrigger.create({
      trigger: band, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => { dir = self.direction === 1 ? -1 : 1; vel = self.getVelocity(); },
    });
    gsap.ticker.add((time, dt) => {
      if (!st.isActive || !w) return;
      vel *= 0.93;
      x = gsap.utils.wrap(-w, 0, x + (dir * (base + Math.min(Math.abs(vel) * 0.25, 1100)) * dt) / 1000);
      gsap.set(track, { x });
      lean(gsap.utils.clamp(-10, 10, -vel / 260));
    });
  }

  /* The quote lands like a pad combination: phrases snap in one strike at
     a time as you scroll through it, each strike jolting the block. One
     way only — once a phrase has landed it stays readable. */
  function quote() {
    const q = $('.quote');
    const punches = q ? $$('.punch', q) : [];
    if (!punches.length) return;
    claim(q, 'quote');
    const bq = $('blockquote', q);
    const aside = $(':scope > div', q);
    const dim = 0.14;
    gsap.set(q, { '--rule': 0 });
    gsap.set(punches, { opacity: dim });
    if (aside) gsap.set(aside, { autoAlpha: 0, y: 14 });
    let lit = 0;
    let reach = 0;
    let asideIn = false;
    const update = (self) => {
      if (self.progress > reach) {
        reach = self.progress;
        gsap.set(q, { '--rule': reach });
      }
      const target = Math.min(punches.length, Math.floor(reach * punches.length + 0.5));
      if (target > lit) {
        punches.slice(lit, target).forEach((p, i) => gsap.fromTo(p, { opacity: dim, x: -22 }, {
          opacity: 1, x: 0, duration: 0.34, ease: 'punch', delay: i * 0.1, overwrite: true,
        }));
        gsap.fromTo(bq, { x: 5 }, { x: 0, duration: 0.45, ease: 'elastic.out(1, 0.4)', delay: 0.05, overwrite: true });
        lit = target;
      }
      if (lit === punches.length && !asideIn && aside) {
        asideIn = true;
        gsap.to(aside, { autoAlpha: 1, y: 0, duration: 0.8, ease: settle, delay: 0.3 });
      }
    };
    ScrollTrigger.create({ trigger: q, start: 'top 82%', end: 'center 50%', onUpdate: update, onRefresh: update });
  }

  /* Where to next: rows arrive; on a fine pointer the hovered row's photo
     follows the cursor behind the type, in colour, flipping between
     photos as you move between rows. */
  function indexList() {
    const index = $('.index');
    if (!index) return;
    claim(index, 'index');
    const rows = $$('.index-row', index);
    gsap.set(rows, { autoAlpha: 0, y: 34 });
    gsap.to(rows, {
      autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'punch', clearProps: 'all',
      scrollTrigger: { trigger: index, start: 'top 86%', once: true },
    });
    if (!fine) return;

    const float = document.createElement('div');
    float.className = 'index-float';
    float.setAttribute('aria-hidden', 'true');
    const imgs = rows.map((row) => {
      const thumb = $('.index-thumb', row);
      const im = document.createElement('img');
      im.src = thumb.getAttribute('src');
      im.alt = '';
      im.decoding = 'async';
      float.appendChild(im);
      return im;
    });
    index.appendChild(float);
    gsap.set(float, { xPercent: -50, yPercent: -50, scale: 0.4, autoAlpha: 0 });
    gsap.set(imgs, { yPercent: 101 });
    const xTo = gsap.quickTo(float, 'x', { duration: 0.75, ease: 'power3.out' });
    const yTo = gsap.quickTo(float, 'y', { duration: 0.75, ease: 'power3.out' });
    const rTo = gsap.quickTo(float, 'rotation', { duration: 0.9, ease: 'power3.out' });
    let current = -1;
    let lastX = null;
    let still = null;
    index.addEventListener('pointermove', (e) => {
      const r = index.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
      if (lastX !== null) rTo(gsap.utils.clamp(-9, 9, (e.clientX - lastX) * 0.45));
      lastX = e.clientX;
      if (still) still.kill();
      still = gsap.delayedCall(0.12, () => rTo(0));
    });
    const show = (i) => {
      index.classList.add('is-hovering');
      if (current === -1) {
        gsap.to(float, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'punch', overwrite: 'auto' });
        gsap.fromTo(imgs[i], { yPercent: 0, scale: 1.25 }, { scale: 1, duration: 0.8, ease: settle, overwrite: true });
      } else if (i !== current) {
        const dir = i > current ? 1 : -1;
        gsap.to(imgs[current], { yPercent: -101 * dir, duration: 0.6, ease: 'expo.inOut', overwrite: true });
        gsap.fromTo(imgs[i], { yPercent: 101 * dir, scale: 1.2 }, { yPercent: 0, scale: 1, duration: 0.65, ease: 'expo.inOut', overwrite: true });
      }
      current = i;
    };
    const hide = () => {
      index.classList.remove('is-hovering');
      gsap.to(float, { autoAlpha: 0, scale: 0.4, duration: 0.4, ease: 'power2.in', overwrite: 'auto',
        onComplete: () => { if (current === -1) gsap.set(imgs, { yPercent: 101 }); } });
      current = -1;
      lastX = null;
    };
    rows.forEach((row, i) => row.addEventListener('pointerenter', () => show(i)));
    index.addEventListener('pointerleave', hide);
  }

  /* Ring ropes: every .ropes divider becomes three strings that bend when
     the pointer crosses them, twang once as they come into view, and bow
     against fast scrolling. The path `d` update is the one deliberate
     exception to transform/opacity-only motion — three hairline paths. */
  function ropes() {
    const NS = 'http://www.w3.org/2000/svg';
    const sets = [];
    $$('.ropes').forEach((el, n) => {
      el.classList.add('is-live');
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'ropes-svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('viewBox', '0 0 1000 15');
      svg.setAttribute('preserveAspectRatio', 'none');
      const grad = `rope-grad-${n}`;
      svg.innerHTML = `<defs><linearGradient id="${grad}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">`
        + '<stop offset="0" style="stop-color:var(--blood)"/><stop offset=".22" style="stop-color:var(--blood)"/>'
        + '<stop offset=".22" style="stop-color:var(--hairline-strong)"/><stop offset="1" style="stop-color:var(--hairline-strong)"/></linearGradient></defs>';
      const strings = [0.5, 8, 14.5].map((y, i) => {
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('class', i === 1 ? 'rope-mid' : 'rope-edge');
        if (i === 1) path.setAttribute('stroke', `url(#${grad})`);
        svg.appendChild(path);
        const s = { y, d: 0, x: 500, held: false, last: null };
        s.draw = () => path.setAttribute('d', `M0 ${s.y} Q${s.x.toFixed(1)} ${(s.y + s.d * 2).toFixed(2)} 1000 ${s.y}`);
        s.draw();
        return s;
      });
      el.appendChild(svg);

      const release = (s) => {
        s.held = false;
        gsap.to(s, { d: 0, duration: 1.6, ease: 'elastic.out(1.1, 0.16)', overwrite: true, onUpdate: s.draw });
      };
      const twang = (s, amp) => gsap.to(s, {
        keyframes: [{ d: amp, duration: 0.09, ease: 'power2.out' }, { d: 0, duration: 1.5, ease: 'elastic.out(1.2, 0.14)' }],
        overwrite: true, onUpdate: s.draw,
      });

      sets.push({ el, strings, release, twang, visible: false, twanged: false });
    });
    if (!sets.length) return;

    /* Visibility comes from an IntersectionObserver, not ScrollTrigger:
       the footer's ropes live in a sticky footer, whose rendered position
       ScrollTrigger's layout measurements do not see. */
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const set = sets.find((x) => x.el === entry.target);
      set.visible = entry.isIntersecting;
      if (entry.intersectionRatio >= 0.99 && !set.twanged) {
        set.twanged = true;
        set.strings.forEach((s, i) => { s.x = 500; gsap.delayedCall(0.15 + i * 0.06, () => set.twang(s, i === 1 ? 6 : 3.5)); });
      }
    }), { threshold: [0, 1] });
    sets.forEach((set) => io.observe(set.el));

    if (fine) {
      const GRAB = 22;
      addEventListener('pointermove', (e) => sets.forEach((set) => {
        if (!set.visible) return;
        const r = set.el.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right;
        const ly = e.clientY - r.top + 1;
        set.strings.forEach((s) => {
          const dist = ly - s.y;
          if (inside && Math.abs(dist) < GRAB) {
            s.held = true;
            s.x = ((e.clientX - r.left) / r.width) * 1000;
            gsap.to(s, { d: dist * 0.85, duration: 0.12, ease: 'power2.out', overwrite: true, onUpdate: s.draw });
          } else if (s.held) {
            set.release(s);
          } else if (inside && s.last !== null && Math.sign(s.last) !== Math.sign(dist) && Math.abs(s.last) < 80) {
            /* crossed between two pointer events: pluck it on the way past */
            s.x = ((e.clientX - r.left) / r.width) * 1000;
            set.twang(s, gsap.utils.clamp(-14, 14, dist * 0.4));
          }
          s.last = inside ? dist : null;
        });
      }), { passive: true });
    }

    /* Fast scrolling bows the ropes against the direction of travel. */
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const bow = gsap.utils.clamp(-7, 7, -self.getVelocity() / 450);
        if (Math.abs(bow) < 0.6) return;
        sets.forEach((set) => {
          if (!set.visible) return;
          set.strings.forEach((s) => {
            if (s.held) return;
            s.x = 500;
            gsap.to(s, { d: bow, duration: 0.2, ease: 'power2.out', overwrite: true, onUpdate: s.draw, onComplete: () => set.release(s) });
          });
        });
      },
    });
  }

  /* ═══ Gallery (site.js builds the grid, and rebuilds it on resize) ══ */

  function galleryTiles(tiles) {
    const fresh = tiles.filter((t) => !t.dataset.motion);
    fresh.forEach((t) => {
      claim(t, 'tile');
      if (fine) t.dataset.cursor = 'View';
    });
    if (!fresh.length) return;
    gsap.set(fresh, { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(fresh, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: settle, stagger: 0.07, clearProps: 'transform' }),
    });
  }

  /* ═══ Boot ══════════════════════════════════════════════════ */

  safe('smoothScroll', smoothScroll);
  safe('nav', nav);
  safe('menu', menu);
  safe('buttons', buttons);
  safe('cursor', cursor);
  safe('marquee', marquee);
  safe('eyebrows', eyebrows);
  safe('headings', headings);
  safe('frames', frames);
  safe('stats', stats);
  safe('bands', bands);
  safe('quote', quote);
  safe('indexList', indexList);
  safe('ropes', ropes);
  safe('footer', footer);
  safe('galleryTiles', () => galleryTiles($$('#grid .tile')));
  document.addEventListener('tkm:gallery-layout', (e) => safe('galleryTiles', () => galleryTiles(e.detail.tiles)));
  safe('reveals', reveals);
  root.classList.add('motion-ready');

  /* The opening waits for the display faces (preloaded, so usually
     already there), so type is split once, at its real metrics. */
  Promise.race([document.fonts.ready, wait(1000)]).then(() => {
    const opening = safe('hero', hero) || safe('pageHead', pageHead);
    root.classList.add('motion-lit');
    if (opening) opening.play();
    ScrollTrigger.refresh();
  });
})();
