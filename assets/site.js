/* Thewaritnoi Krabi Muaythai — shared behaviour for every page.
   Each block is guarded: pages without a gallery, hero or nav skip it. */
(() => {
  'use strict';

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Gallery: only present on /gallery/ ── */
  if (document.getElementById('grid')) {
    /* ── Gallery data: names and descriptions from brand/library/INDEX.md.
       Third value is the intrinsic height of the -sm.webp at 800px wide —
       it reserves the tile's box so lazy-loaded photos never jump the
       column beneath them. ── */
    const photos = [
      ['training-pad-coaching-01', 'A trainer holds Thai pads while a fighter throws a punch, lit from the side in the gym\'s ring.', 800],
      ['fight-flying-knee-02', 'A fighter airborne with a flying knee against the ropes, the crowd packed behind.', 533],
      ['training-flags-highkick-11', 'A high kick lands on the pads under the rooftop ring, national flags strung overhead.', 1000],
      ['event-banner-group-07', 'The whole gym gathered under the gym banner, every fist up.', 600],
      ['training-beach-silhouette-04', 'Knee-raise drills on the beach at sunrise, karst islands and longtail boats behind.', 533],
      ['portrait-traditional-robe-03', 'A fighter backstage in a traditional red-and-gold robe with a victory garland and mongkol.', 950],
      ['training-knee-bellypad-12', 'A knee driven into the trainer\'s belly pad, both fighters braced on the mat.', 1000],
      ['training-group-knees-15', 'A row of students working knees on the pads, trainers moving down the line.', 600],
      ['training-woman-kick-08', 'A fighter lands a head-height kick on pads under the covered rooftop ring, flags overhead.', 997],
      ['gym-handwrap-prep-05', 'A trainer wraps a fighter\u2019s hands ringside before the session.', 800],
      ['event-trophy-win-08', 'A fighter holds the cup after a win, her corner and coaches around her.', 1000],
      ['fight-clinch-stadium-01', 'Two fighters locked in a clinch exchange as the referee steps in.', 533],
      ['training-punch-mitt-17', 'A straight punch snaps into the focus mitt, the ring open to daylight behind.', 800],
      ['event-team-lineup-04', 'The team lined up in fighting stance across the mat, the youngest at the front.', 1000],
      ['training-rooftop-kick-07', 'Pad work on the covered rooftop ring, international flags strung from the rafters.', 997],
      ['event-string-lights-02', 'The team together in the evening under string lights and paper lanterns.', 800],
      ['training-kick-coaching-13', 'A kick thrown into the pads while the trainer calls the shot, mid-laugh.', 1000],
      ['portrait-victory-referee-04', 'A fighter has her arm raised by the referee in the ring after a win.', 800],
      ['event-kids-group-06', 'The kids\' class packed onto the mat with the adult squad behind them.', 600],
      ['training-heavybag-dynamic-10', 'A rear kick thrown at full power, gym-branded shorts in frame.', 1000],
      ['training-knee-pad-16', 'A knee buried into the pad at close range, the trainer absorbing it square.', 800],
      ['event-team-celebration-03', 'The whole gym in the ring for a post-fight group photo, the stadium crowd behind.', 600],
      ['training-highkick-banner-14', 'A high kick caught clean on the pads beneath the gym banner.', 1000],
      ['training-backlit-punch-03', 'A cross thrown into the pads, backlit, the coach calling the next shot.', 800],
      ['event-team-trainers-05', 'Trainers and students shoulder to shoulder after a session, fists raised.', 997],
      ['fight-ring-victory-04', 'The referee raises the winner\u2019s arm, Thai flag banner overhead.', 533],
    ];

    const grid = document.getElementById('grid');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const esc = (str) => str.replace(/"/g, '&quot;');

    /* ── Layout ──
       Photos are dealt into the shortest column so far, measured in
       aspect-ratio units rather than pixels — the intrinsic heights above
       are all we need, so the columns balance before a single image has
       loaded. Each column div carries its index, so the stagger can step
       across the columns without measuring anything. */
    const columnCount = () => {
      const w = innerWidth;
      /* two columns is the floor, as it was before the masonry: one column
         of fourteen uncropped photos is a six-thousand-pixel scroll */
      if (w <= 900) return 2;
      if (w <= 1180) return 3;
      return 4;
    };

    const build = (n) => {
      const cols = Array.from({ length: n }, () => ({ h: 0, tiles: [] }));
      photos.forEach(([name, alt, h], i) => {
        const col = cols.reduce((a, b) => (b.h < a.h ? b : a));
        col.h += h / 800;
        col.tiles.push(`
          <button class="tile reveal" type="button" data-i="${i}" aria-label="Open photo: ${esc(alt)}">
            <span class="tile-in">
              <img src="/assets/img/${name}-sm.webp" alt="${esc(alt)}" loading="lazy" width="800" height="${h}">
              <span class="tile-cap">${alt.split(/[,.]/)[0]}</span>
            </span>
          </button>`);
      });
      grid.dataset.cols = n;
      grid.innerHTML = cols
        .map((c) => `<div class="grid-col">${c.tiles.join('')}</div>`)
        .join('');
    };

    const layout = () => {
      const n = columnCount();
      if (grid.dataset.cols === String(n)) return;
      build(n);
      Array.from(grid.children).forEach((c, i) => { c.dataset.col = i; });
      document.dispatchEvent(new CustomEvent('tkm:gallery-layout', { detail: { tiles: Array.from(grid.querySelectorAll('.tile')) } }));
    };

    layout();

    let rs = 0;
    addEventListener('resize', () => {
      clearTimeout(rs);
      rs = setTimeout(layout, 150);
    }, { passive: true });

    /* ── Pointer tilt ──
       One delegated listener for all fourteen tiles, rAF-throttled, and
       only where there is a real pointer to track. ±6° — enough to feel
       the photo lift, not enough to bend the photography. */
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced.matches) {
      const TILT = 12; // deg across the full width; ±6 from centre
      let frame = 0, active = null;

      const relax = () => {
        if (!active) return;
        active.style.setProperty('--rx', '0deg');
        active.style.setProperty('--ry', '0deg');
        active = null;
      };

      grid.addEventListener('pointermove', (e) => {
        const tile = e.target.closest('.tile');
        if (!tile) { relax(); return; }
        if (frame) return;
        const { clientX, clientY } = e;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (active && active !== tile) relax();
          const r = tile.getBoundingClientRect();
          tile.style.setProperty('--ry', `${((clientX - r.left) / r.width - .5) * TILT}deg`);
          tile.style.setProperty('--rx', `${((clientY - r.top) / r.height - .5) * -TILT}deg`);
          active = tile;
        });
      });

      grid.addEventListener('pointerleave', relax);
      grid.addEventListener('pointercancel', relax);
      addEventListener('blur', relax);
    }

    /* ── Lightbox ── */
    const lb = document.getElementById('lb');
    const lbImg = document.getElementById('lb-img');
    const lbCap = document.getElementById('lb-cap');
    let idx = 0;

    const show = (i) => {
      idx = (i + photos.length) % photos.length;
      const [name, alt] = photos[idx];
      lbImg.src = `/assets/img/${name}.webp`;
      lbImg.alt = alt;
      lbCap.textContent = `${alt}  ·  ${idx + 1} / ${photos.length}`;
    };

    grid.addEventListener('click', (e) => {
      const tile = e.target.closest('.tile');
      if (!tile) return;
      show(Number(tile.dataset.i));
      lb.showModal();
    });

    lb.addEventListener('click', (e) => {
      const act = e.target.closest('[data-lb]')?.dataset.lb;
      if (act === 'close') lb.close();
      else if (act === 'prev') show(idx - 1);
      else if (act === 'next') show(idx + 1);
      else if (e.target === lb || e.target.classList.contains('lb-inner')) lb.close();
    });

    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    });
  }

  /* ── Live opening status (assets/hours.js, Bangkok time) ──
     [data-live="gym"] says whether the gym is open; [data-live="classes"]
     whether a class is running or when the next one starts. The week strip
     on /training/ marks today. Repainted every 30s so an open tab keeps up. */
  const lives = document.querySelectorAll('[data-live]');
  const days = document.querySelectorAll('.week > div');
  if ((lives.length || days.length) && window.TKMHours) {
    const paint = () => {
      const s = window.TKMHours.status(new Date());
      lives.forEach((el) => {
        const classes = el.dataset.live === 'classes';
        const text = classes ? s.classes : s.gym;
        el.dataset.state = (classes ? s.classNow : s.open) ? 'on' : 'off';
        if (el.dataset.text === text) return;
        el.dataset.text = text;
        el.innerHTML = '<i class="live-dot" aria-hidden="true"></i><span></span>';
        el.lastChild.textContent = text;
      });
      days.forEach((d, i) => d.classList.toggle('is-today', i === s.dayIndex));
    };
    paint();
    setInterval(paint, 30000);
  }

  /* ── Nav background on scroll ── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Nav link roll-up hover ──
     The label slides up and out while an aria-hidden copy rolls in from
     below. Wrapped here so the five pages share one nav markup; without
     JS the links keep their plain colour hover. The Book button keeps
     its own background swap. */
  document.querySelectorAll('.nav-links a:not(.nav-book)').forEach((a) => {
    const label = a.textContent.trim();
    a.classList.add('has-roll');
    a.innerHTML = `<span class="roll"><span class="roll-in">${label}<span class="roll-dup" aria-hidden="true">${label}</span></span></span>`;
  });

  /* ── Hand-offs to the motion layer ──
     motion() runs window.TKMMotion[name](...args) when motion.js is up and
     reports whether it took the job; lenis() pauses or resumes smooth
     scrolling around overlays. Both are no-ops on the static site. */
  const motion = (name, ...args) => {
    const fn = window.TKMMotion && window.TKMMotion[name];
    return typeof fn === 'function' ? Boolean(fn(...args)) : false;
  };
  const lenis = (method) => {
    const l = window.TKMMotion && window.TKMMotion.lenis;
    if (l) l[method]();
  };

  /* ── Burger menu (below 1024px, where the inline nav is hidden) ──
     While it is open, everything behind it is inert, so keyboard and
     screen-reader focus cannot wander into the page underneath. */
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('navmenu');
  if (burger && menu) {
    const closeBtn = menu.querySelector('.navmenu-close');
    const behind = [document.querySelector('main'), document.querySelector('.foot')].filter(Boolean);
    let open = false;
    const setOpen = (next) => {
      if (next === open) return;
      open = next;
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      behind.forEach((el) => { el.inert = open; });
      lenis(open ? 'stop' : 'start');
      if (open) {
        menu.hidden = false;
        motion('menu', true, menu, () => {});
        (menu.querySelector('a') || closeBtn)?.focus();
      } else {
        const done = () => { if (!open) menu.hidden = true; };
        if (!motion('menu', false, menu, done)) done();
        burger.focus();
      }
    };
    burger.addEventListener('click', () => setOpen(!open));
    closeBtn?.addEventListener('click', () => setOpen(false));
    menu.addEventListener('click', (e) => { if (e.target === menu) setOpen(false); });
    addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      /* keep Tab inside: the visible close control, then the links */
      const shown = (el) => el && getComputedStyle(el).display !== 'none';
      const ring = [shown(closeBtn) ? closeBtn : burger, ...menu.querySelectorAll('a')];
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    // Resizing up past the breakpoint must not leave the panel stuck open.
    matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ── Motion layer fallback ──
     The head gate adds html.motion before first paint; assets/motion.js
     (deferred) takes over from there. Deferred scripts have all run by
     DOMContentLoaded, so if motion.js never registered itself — a vendor
     file failed to load, or motion.js did — drop the classes and show the
     static page now rather than waiting on the CSS fail-safe. */
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    if (root.classList.contains('motion') && !window.TKMMotion) root.classList.remove('motion', 'intro');
  });
})();
