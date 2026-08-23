/* Thewaritnoi Krabi Muaythai — shared behaviour for every page.
   Each block is guarded: pages without a gallery, hero or nav skip it. */
(() => {
  'use strict';

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Gallery: only present on /gallery/ ── */
  if (document.getElementById('grid')) {
    /* ── Gallery data: names and descriptions from brand/library/INDEX.md ── */
    const photos = [
      ['training-pad-coaching-01', 'A trainer holds Thai pads while a fighter throws a punch, lit from the side in the gym\'s ring.', true],
      ['fight-flying-knee-02', 'A fighter airborne with a flying knee against the ropes, the crowd packed behind.'],
      ['training-beach-silhouette-04', 'Knee-raise drills on the beach at sunrise, karst islands and longtail boats behind.', true],
      ['portrait-traditional-robe-03', 'A fighter backstage in a traditional red-and-gold robe with a victory garland and mongkol.'],
      ['training-woman-kick-08', 'A fighter lands a head-height kick on pads under the covered rooftop ring, flags overhead.'],
      ['gym-handwrap-prep-05', 'A trainer wraps a fighter’s hands ringside before the session.'],
      ['fight-clinch-stadium-01', 'Two fighters locked in a clinch exchange as the referee steps in.'],
      ['training-rooftop-kick-07', 'Pad work on the covered rooftop ring, international flags strung from the rafters.'],
      ['event-string-lights-02', 'The team together in the evening under string lights and paper lanterns.'],
      ['portrait-victory-referee-04', 'A fighter has her arm raised by the referee in the ring after a win.'],
      ['training-heavybag-dynamic-10', 'A rear kick thrown at full power, gym-branded shorts in frame.'],
      ['event-team-celebration-03', 'The whole gym in the ring for a post-fight group photo, the stadium crowd behind.'],
      ['training-backlit-punch-03', 'A cross thrown into the pads, backlit, the coach calling the next shot.'],
      ['fight-ring-victory-04', 'The referee raises the winner’s arm, Thai flag banner overhead.'],
    ];

    const grid = document.getElementById('grid');
    grid.innerHTML = photos.map(([name, alt, wide], i) => `
      <button class="tile${wide ? ' wide' : ''}" type="button" data-i="${i}" aria-label="Open photo: ${alt.replace(/"/g, '&quot;')}">
        <img src="/assets/img/${name}-sm.webp" alt="${alt.replace(/"/g, '&quot;')}" loading="lazy" width="800" height="800">
        <span>${alt.split(/[,.]/)[0]}</span>
      </button>`).join('');

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

  /* ── Nav background on scroll ── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Burger menu (below 1024px, where the inline nav is hidden) ── */
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('navmenu');
  if (burger && menu) {
    const closeBtn = menu.querySelector('.navmenu-close');
    const setOpen = (open) => {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      if (open) (menu.querySelector('a') || closeBtn)?.focus();
      else burger.focus();
    };
    burger.addEventListener('click', () => setOpen(menu.hidden));
    closeBtn?.addEventListener('click', () => setOpen(false));
    menu.addEventListener('click', (e) => { if (e.target === menu) setOpen(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });
    // Resizing up past the breakpoint must not leave the panel stuck open.
    matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ── Sticky booking CTA: appears once the hero's own CTA is gone ── */
  const fab = document.querySelector('.fab');
  const hero = document.querySelector('.hero');
  if (fab && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      fab.classList.toggle('show', !entry.isIntersecting);
    }, { threshold: 0.25 }).observe(hero);
  } else if (fab) {
    fab.classList.add('show');
  }

  /* ── Scroll reveals ── */
  const reveals = document.querySelectorAll('.reveal:not(.in)');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }
})();
