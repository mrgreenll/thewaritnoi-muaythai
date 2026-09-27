/* Thewaritnoi Krabi Muaythai — the motion layer ("Fight Night").
   Spec: docs/superpowers/specs/2026-09-27-fight-night-motion-design.md

   Runs only when the head gate put `motion` on <html>. site.js is the
   functional baseline and never depends on this file; the two talk only
   through window.TKMMotion (hooks site.js may call) and DOM events.

   Every component is its own function, guarded by an element check, and
   runs inside safe() so one failure cannot strand the page in its hidden
   start state. */
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
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const safe = (name, fn) => {
    try { fn(); } catch (err) { console.error(`[motion] ${name}:`, err); }
  };

  /* ── The house vocabulary ──
     punch  — fast in, small overshoot, hard settle: type, stamps, buttons
     rope   — slow-fast-slow: wipes, curtains, rules drawing taut
     settle — power3.out: camera push-ins, parallax, quiet fades */
  CustomEase.create('punch', 'M0,0 C0.1,0 0.14,0.92 0.36,1.05 0.5,1.11 0.62,0.99 1,1');
  CustomEase.create('rope', 'M0,0 C0.72,0 0.18,1 1,1');
  const settle = 'power3.out';

  /* ── Smooth scroll — desktop pointer only ── */
  function smoothScroll() {
    if (!fine || !window.Lenis) return;
    const lenis = new window.Lenis({ lerp: 0.11, anchors: { offset: -88 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    hooks.lenis = lenis;
  }

  /* ── Generic reveals ──
     Whatever carries .reveal and no dedicated treatment rises a short way
     with its neighbours. Body copy stays quick and quiet: the loud moments
     are elsewhere. d1–d3 keep their old meaning as small offsets. */
  function reveals() {
    const els = $$('.reveal').filter((el) => !el.dataset.motion);
    const offset = (el) => (el.classList.contains('d3') ? 0.18 : el.classList.contains('d2') ? 0.12 : el.classList.contains('d1') ? 0.06 : 0);
    gsap.set(els, { autoAlpha: 0, y: 16 });
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => batch.forEach((el, i) => gsap.to(el, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: settle, delay: offset(el) + i * 0.05,
        clearProps: 'transform',
      })),
    });
  }

  /* ── Gallery tiles — site.js builds (and on resize rebuilds) the grid ── */
  function galleryTiles(tiles) {
    const fresh = tiles.filter((t) => !t.dataset.motion);
    fresh.forEach((t) => { t.dataset.motion = 'tile'; });
    if (!fresh.length) return;
    gsap.set(fresh, { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(fresh, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: settle, stagger: 0.07, clearProps: 'transform' }),
    });
  }

  /* ── Boot ── */
  safe('smoothScroll', smoothScroll);
  safe('galleryTiles', () => galleryTiles($$('#grid .tile')));
  document.addEventListener('tkm:gallery-layout', (e) => safe('galleryTiles', () => galleryTiles(e.detail.tiles)));
  safe('reveals', reveals);

  root.classList.add('motion-ready');
})();
