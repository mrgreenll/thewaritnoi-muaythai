/* Thewaritnoi Krabi Muaythai — shared behaviour for every page.
   Each block is guarded: pages without a gallery, hero or nav skip it.
   This file is the functional baseline; assets/motion.js layers the
   motion on top and is never required for anything here to work. */
(() => {
  'use strict';

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
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Lightbox: one photo viewer for the gallery and the room strips ──
     open(items, index): items are { src, alt, w, h, thumb } — w/h are the
     full file's pixels (the viewer never upscales past them), thumb is the
     on-page image the photo grows out of when the motion layer is up. The
     dialog is built on first use, so every page shares one markup. The
     thumbnail is already decoded, so it shows at once and the full file
     swaps in when it arrives. Colour comes back here, as it always has. */
  const Lightbox = (() => {
    let lb = null;
    let img;
    let cap;
    let list = [];
    let idx = 0;
    let closing = false;
    const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

    const fit = () => {
      const it = list[idx];
      const inner = lb.querySelector('.lb-inner');
      const cs = getComputedStyle(inner);
      const aw = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ah = inner.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
        - lb.querySelector('.lb-bar').offsetHeight - (parseFloat(cs.rowGap) || 0);
      const s = Math.min(aw / it.w, ah / it.h, 1);
      img.style.width = `${Math.floor(it.w * s)}px`;
      img.style.height = `${Math.floor(it.h * s)}px`;
    };

    const render = () => {
      const it = list[idx];
      img.alt = it.alt;
      const quick = it.thumb && it.thumb.currentSrc;
      img.src = quick || it.src;
      if (quick) {
        const full = new Image();
        full.src = it.src;
        full.decode().then(() => { if (list[idx] === it) img.src = it.src; }).catch(() => {});
      }
      cap.textContent = `${it.alt}  ·  ${idx + 1} / ${list.length}`;
      fit();
      [1, -1].forEach((d) => { const n = list[(idx + d + list.length) % list.length]; if (n) new Image().src = n.src; });
    };

    const step = (dir) => {
      if (list.length < 2 || closing) return;
      const next = (idx + dir + list.length) % list.length;
      const swap = () => { if (closing) return; idx = next; render(); };
      if (!motion('lightboxStep', { lb, img }, dir, swap)) swap();
    };

    const close = () => {
      if (!lb.open || closing) return;
      closing = true;
      const done = () => { closing = false; lb.close(); };
      if (!motion('lightboxClose', { lb, img, to: list[idx].thumb }, done)) done();
    };

    const setup = () => {
      lb = document.getElementById('lb');
      if (!lb) {
        lb = document.createElement('dialog');
        lb.className = 'lb';
        lb.id = 'lb';
        lb.setAttribute('aria-label', 'Photo viewer');
        lb.innerHTML = `
          <div class="lb-shade"></div>
          <button class="icon-btn lb-close" type="button" data-lb="close" aria-label="Close photo viewer">${icon('M6 6l12 12M18 6 6 18')}</button>
          <div class="lb-inner">
            <img id="lb-img" alt="">
            <div class="lb-bar">
              <button class="icon-btn" type="button" data-lb="prev" aria-label="Previous photo">${icon('M15 5 8 12l7 7')}</button>
              <p id="lb-cap"></p>
              <button class="icon-btn" type="button" data-lb="next" aria-label="Next photo">${icon('m9 5 7 7-7 7')}</button>
            </div>
          </div>`;
        document.body.appendChild(lb);
      }
      img = lb.querySelector('#lb-img');
      cap = lb.querySelector('#lb-cap');
      lb.addEventListener('click', (e) => {
        const act = e.target.closest('[data-lb]')?.dataset.lb;
        if (act === 'close') close();
        else if (act === 'prev') step(-1);
        else if (act === 'next') step(1);
        else if (e.target === lb || e.target.classList.contains('lb-inner') || e.target.classList.contains('lb-shade')) close();
      });
      lb.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      });
      /* Escape closes through close(), so it animates like every other exit */
      lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
      lb.addEventListener('close', () => lenis('start'));
      /* swipe on touch screens */
      let x0 = null;
      let y0 = 0;
      lb.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
      lb.addEventListener('pointerup', (e) => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        const dy = e.clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
      });
      addEventListener('resize', () => { if (lb.open) fit(); });
    };

    const open = (items, i) => {
      if (!lb) setup();
      list = items;
      idx = i;
      closing = false;
      lb.showModal();
      render();
      lenis('stop');
      motion('lightboxOpen', { lb, img, from: list[idx].thumb });
      /* keyboard focus belongs inside the modal, whatever the motion did */
      if (!lb.contains(document.activeElement)) lb.querySelector('.lb-close').focus();
    };
    return { open };
  })();

  /* ── Gallery: only present on /gallery/ ── */
  const grid = document.getElementById('grid');
  if (grid) {
    /* ── Gallery data: names and descriptions from brand/library/INDEX.md.
       Third value is the intrinsic height of the -sm.webp at 800px wide —
       it reserves the tile's box so lazy-loaded photos never jump the
       column beneath them. The full files are 1080px wide. Fourth value
       is the filter: training (and gym life), fight nights, team. ── */
    const photos = [
      ['training-pad-coaching-01', 'A trainer holds Thai pads while a fighter throws a punch, lit from the side in the gym\'s ring.', 800, 'training'],
      ['fight-flying-knee-02', 'A fighter airborne with a flying knee against the ropes, the crowd packed behind.', 533, 'fight'],
      ['training-flags-highkick-11', 'A high kick lands on the pads under the rooftop ring, national flags strung overhead.', 1000, 'training'],
      ['event-banner-group-07', 'The whole gym gathered under the gym banner, every fist up.', 600, 'team'],
      ['training-beach-silhouette-04', 'Knee-raise drills on the beach at sunrise, karst islands and longtail boats behind.', 533, 'training'],
      ['portrait-traditional-robe-03', 'A fighter backstage in a traditional red-and-gold robe with a victory garland and mongkol.', 950, 'fight'],
      ['training-knee-bellypad-12', 'A knee driven into the trainer\'s belly pad, both fighters braced on the mat.', 1000, 'training'],
      ['training-group-knees-15', 'A row of students working knees on the pads, trainers moving down the line.', 600, 'training'],
      ['training-woman-kick-08', 'A fighter lands a head-height kick on pads under the covered rooftop ring, flags overhead.', 997, 'training'],
      ['gym-handwrap-prep-05', 'A trainer wraps a fighter’s hands ringside before the session.', 800, 'training'],
      ['event-trophy-win-08', 'A fighter holds the cup after a win, her corner and coaches around her.', 1000, 'fight'],
      ['fight-clinch-stadium-01', 'Two fighters locked in a clinch exchange as the referee steps in.', 533, 'fight'],
      ['training-punch-mitt-17', 'A straight punch snaps into the focus mitt, the ring open to daylight behind.', 800, 'training'],
      ['event-team-lineup-04', 'The team lined up in fighting stance across the mat, the youngest at the front.', 1000, 'team'],
      ['training-rooftop-kick-07', 'Pad work on the covered rooftop ring, international flags strung from the rafters.', 997, 'training'],
      ['event-string-lights-02', 'The team together in the evening under string lights and paper lanterns.', 800, 'team'],
      ['training-kick-coaching-13', 'A kick thrown into the pads while the trainer calls the shot, mid-laugh.', 1000, 'training'],
      ['portrait-victory-referee-04', 'A fighter has her arm raised by the referee in the ring after a win.', 800, 'fight'],
      ['event-kids-group-06', 'The kids\' class packed onto the mat with the adult squad behind them.', 600, 'team'],
      ['training-heavybag-dynamic-10', 'A rear kick thrown at full power, gym-branded shorts in frame.', 1000, 'training'],
      ['training-knee-pad-16', 'A knee buried into the pad at close range, the trainer absorbing it square.', 800, 'training'],
      ['event-team-celebration-03', 'The whole gym in the ring for a post-fight group photo, the stadium crowd behind.', 600, 'team'],
      ['training-highkick-banner-14', 'A high kick caught clean on the pads beneath the gym banner.', 1000, 'training'],
      ['training-backlit-punch-03', 'A cross thrown into the pads, backlit, the coach calling the next shot.', 800, 'training'],
      ['event-team-trainers-05', 'Trainers and students shoulder to shoulder after a session, fists raised.', 997, 'team'],
      ['fight-ring-victory-04', 'The referee raises the winner’s arm, Thai flag banner overhead.', 533, 'fight'],
    ];
    const FILTERS = [['all', 'All'], ['training', 'Training'], ['fight', 'Fight nights'], ['team', 'Team']];

    /* The tiles are built once and only ever moved: filtering and
       re-flowing deal the same elements into new columns, so the motion
       layer can animate each photo from where it was to where it lands. */
    const tiles = photos.map(([name, alt, h, cat], i) => {
      const b = document.createElement('button');
      b.className = 'tile reveal';
      b.type = 'button';
      b.dataset.i = i;
      b.dataset.cat = cat;
      b.dataset.flipId = `photo-${i}`;
      b.setAttribute('aria-label', `Open photo: ${alt}`);
      b.innerHTML = `<span class="tile-in"><img src="/assets/img/${name}-sm.webp" alt="" loading="lazy" width="800" height="${h}"><span class="tile-cap"></span></span>`;
      b.querySelector('img').alt = alt;
      b.querySelector('.tile-cap').textContent = alt.split(/[,.]/)[0];
      return b;
    });

    /* ── Filters ── */
    let filter = 'all';
    const bar = document.getElementById('filters');
    if (bar) {
      bar.innerHTML = FILTERS.map(([key, label]) => {
        const n = key === 'all' ? photos.length : photos.filter((p) => p[3] === key).length;
        return `<button class="filter" type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${label}<span class="filter-n"><span class="sr-only"> (</span>${n}<span class="sr-only"> photos)</span></span></button>`;
      }).join('');
      bar.hidden = false;
    }
    const visible = () => tiles.filter((t) => filter === 'all' || t.dataset.cat === filter);

    /* ── Layout ──
       Photos are dealt into the shortest column so far, measured in
       aspect-ratio units rather than pixels — the intrinsic heights above
       are all we need, so the columns balance before a single image has
       loaded. */
    const columnCount = () => {
      const w = innerWidth;
      /* two columns is the floor, as it was before the masonry: one column
         of uncropped photos is a six-thousand-pixel scroll */
      if (w <= 900) return 2;
      if (w <= 1180) return 3;
      return 4;
    };

    const layout = () => {
      const n = columnCount();
      let cols = Array.from(grid.children);
      if (cols.length !== n) {
        cols = Array.from({ length: n }, (_, i) => {
          const c = document.createElement('div');
          c.className = 'grid-col';
          c.dataset.col = i;
          return c;
        });
      }
      const height = cols.map(() => 0);
      const shown = visible();
      shown.forEach((t) => {
        const k = height.indexOf(Math.min(...height));
        height[k] += Number(t.querySelector('img').getAttribute('height')) / 800;
        t.hidden = false;
        cols[k].appendChild(t);
      });
      /* filtered-out tiles stay in the DOM, hidden — in place when the
         columns survive (so the motion layer can send them off from where
         they were), parked in the last column when they are rebuilt */
      tiles.forEach((t) => {
        if (shown.includes(t)) return;
        t.hidden = true;
        if (!cols.includes(t.parentElement)) cols[cols.length - 1].appendChild(t);
      });
      if (grid.children.length !== n || cols[0].parentNode !== grid) grid.replaceChildren(...cols);
      grid.dataset.cols = n;
    };

    layout();
    document.dispatchEvent(new CustomEvent('tkm:gallery-layout', { detail: { tiles } }));

    let rs = 0;
    addEventListener('resize', () => {
      clearTimeout(rs);
      rs = setTimeout(() => { if (grid.children.length !== columnCount()) layout(); }, 150);
    }, { passive: true });

    bar?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b || b.dataset.filter === filter) return;
      filter = b.dataset.filter;
      bar.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (!motion('flip', grid, layout)) layout();
    });

    /* ── Pointer tilt ──
       One delegated listener for every tile, rAF-throttled, and only where
       there is a real pointer to track. ±6° — enough to feel the photo
       lift, not enough to bend the photography. */
    if (fine && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const TILT = 12; // deg across the full width; ±6 from centre
      let frame = 0;
      let active = null;

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
          tile.style.setProperty('--ry', `${((clientX - r.left) / r.width - 0.5) * TILT}deg`);
          tile.style.setProperty('--rx', `${((clientY - r.top) / r.height - 0.5) * -TILT}deg`);
          active = tile;
        });
      });

      grid.addEventListener('pointerleave', relax);
      grid.addEventListener('pointercancel', relax);
      addEventListener('blur', relax);
    }

    /* ── Open a photo: the viewer steps through what the filter shows ── */
    grid.addEventListener('click', (e) => {
      const tile = e.target.closest('.tile');
      if (!tile) return;
      const shown = visible();
      const items = shown.map((t) => {
        const [name, alt, h] = photos[Number(t.dataset.i)];
        return { src: `/assets/img/${name}.webp`, alt, w: 1080, h: Math.round(h * 1.35), thumb: t.querySelector('img') };
      });
      Lightbox.open(items, shown.indexOf(tile));
    });
  }

  /* ── Room strips (/stay/) ──
     Scroll sideways with a trackpad or a finger as before; with a mouse,
     drag the strip, or step with the arrow buttons. A progress line shows
     where you are. Photos open full size in the viewer. */
  document.querySelectorAll('.roomgal').forEach((strip) => {
    const opens = Array.from(strip.querySelectorAll('.shot-open'));
    const items = opens.map((b) => {
      const im = b.querySelector('img');
      return { src: im.getAttribute('src').replace('-sm.webp', '.webp'), alt: im.alt, w: 1440, h: 1080, thumb: im };
    });
    let dragged = false;
    opens.forEach((b, i) => b.addEventListener('click', (e) => {
      if (dragged) { e.preventDefault(); return; }
      Lightbox.open(items, i);
    }));
    /* Tabbing onto a photo that is only partly in the strip: the browser
       leaves it half hidden, so bring the whole photo in. */
    strip.addEventListener('focusin', (e) => {
      const fig = e.target.closest('figure');
      if (fig) fig.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });

    const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    const bar = document.createElement('div');
    bar.className = 'roomgal-bar';
    bar.innerHTML = `<span class="roomgal-track" aria-hidden="true"><i></i></span>
      <button class="icon-btn" type="button" data-dir="-1" aria-label="Scroll photos left">${icon('M15 5 8 12l7 7')}</button>
      <button class="icon-btn" type="button" data-dir="1" aria-label="Scroll photos right">${icon('m9 5 7 7-7 7')}</button>`;
    strip.after(bar);
    const thumb = bar.querySelector('.roomgal-track i');
    const [prev, next] = bar.querySelectorAll('[data-dir]');
    const stride = () => {
      const first = strip.firstElementChild;
      return (first ? first.getBoundingClientRect().width : 200) + (parseFloat(getComputedStyle(strip).columnGap) || 0);
    };
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-dir]');
      if (b && b.getAttribute('aria-disabled') !== 'true') strip.scrollBy({ left: Number(b.dataset.dir) * stride(), behavior });
    });
    const sync = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      bar.hidden = max < 4;
      const frac = strip.clientWidth / strip.scrollWidth;
      thumb.style.width = `${frac * 100}%`;
      thumb.style.transform = `translateX(${max > 0 ? (strip.scrollLeft / max) * ((1 - frac) / frac) * 100 : 0}%)`;
      /* aria-disabled, not disabled: a disabled button drops keyboard focus */
      prev.setAttribute('aria-disabled', String(strip.scrollLeft < 2));
      next.setAttribute('aria-disabled', String(strip.scrollLeft > max - 2));
    };
    strip.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();

    /* mouse drag: follow the pointer, then fling to the nearest photo in
       the direction of travel */
    let down = false;
    let x0 = 0;
    let s0 = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    strip.addEventListener('dragstart', (e) => e.preventDefault());
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      dragged = false;
      x0 = lastX = e.clientX;
      s0 = strip.scrollLeft;
      lastT = performance.now();
      vel = 0;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (!dragged && Math.abs(dx) > 5) { dragged = true; strip.classList.add('is-dragging'); }
      if (!dragged) return;
      strip.scrollLeft = s0 - dx;
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (!dragged) return;
      const w = stride();
      const max = strip.scrollWidth - strip.clientWidth;
      const target = Math.max(0, Math.min(max, Math.round((strip.scrollLeft - vel * 240) / w) * w));
      strip.scrollTo({ left: target, behavior });
      const settle = () => strip.classList.remove('is-dragging');
      if ('onscrollend' in window) strip.addEventListener('scrollend', settle, { once: true });
      setTimeout(settle, 700);
      /* the click that ends a drag is not a request to open the photo */
      setTimeout(() => { dragged = false; }, 0);
    });
  });

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

  /* ── Package matrix crosshair (/training/) ── */
  const matrix = document.querySelector('.matrix');
  if (matrix) {
    const clear = () => matrix.querySelectorAll('.is-row, .is-col, .is-hit').forEach((c) => c.classList.remove('is-row', 'is-col', 'is-hit'));
    matrix.addEventListener('pointerover', (e) => {
      const cell = e.target.closest('td');
      clear();
      if (!cell) return;
      const col = cell.cellIndex;
      cell.parentElement.querySelectorAll('th, td').forEach((c) => c.classList.add('is-row'));
      matrix.querySelectorAll('tr').forEach((tr) => { if (tr.children[col]) tr.children[col].classList.add('is-col'); });
      cell.classList.add('is-hit');
    });
    matrix.addEventListener('pointerleave', clear);
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
    // Nor must coming Back to a page the browser kept alive with it open.
    addEventListener('pageshow', (e) => { if (e.persisted) setOpen(false); });
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
