/* ==========================================================================
   ASHWORTH & VANE — The Glass Pavilion
   main.js

   Requires (loaded in index.html): GSAP 3.12.5, ScrollTrigger 3.12.5, Lenis 1.1.13
   ========================================================================== */
(() => {
  'use strict';

  /* ========================================================================
     0. IMAGE CONFIG — replace any `src` / `alt` here, nothing else to touch.
        Each `key` matches a data-img="key" attribute in index.html.
        NOTE: these are Unsplash placeholders; swap in your own photography.
     ======================================================================== */
  const IMAGES = [
    { key: 'hero',         src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=72', alt: 'A glass pavilion glowing at twilight beside a still reflecting pool' },
    { key: 'entrance',     src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=72', alt: 'The entrance of a modern luxury house, warmly lit against a deep blue dusk sky' },
    { key: 'living',       src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=72', alt: 'A double-height living room with glass walls and warm interior lighting' },
    { key: 'kitchen',      src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=72', alt: 'A marble kitchen island with handleless oak joinery' },
    { key: 'staircase',    src: 'https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=2000&q=72', alt: 'A floating staircase lit by warm light in a modern interior' },
    { key: 'pool',         src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=72', alt: 'An infinity pool glowing at dusk in front of a modern villa' },
    { key: 'golden',       src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=72', alt: 'A contemporary luxury house at golden hour' },
    { key: 'gThreshold',   src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=72', alt: 'The threshold: a lit entrance hall with a floating staircase and warm light' },
    { key: 'gLiving',      src: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=72', alt: 'A refined living room with a sculptural sofa and floor-to-ceiling glass' },
    { key: 'gKitchen',     src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=72', alt: 'A kitchen with a long marble island and integrated appliances' },
    { key: 'gSuite',       src: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=72', alt: 'A bedroom suite with a panoramic glass wall framing the view' },
    { key: 'valley',       src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2200&q=72', alt: 'A misty valley and river seen from above at dusk' },
    { key: 'ritualStairs', src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=72', alt: 'A glass staircase glowing with warm light in the evening' },
    { key: 'terrace',      src: 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=1200&q=72', alt: 'A couple sharing a quiet moment on a terrace at dusk' }
  ];

  /* ========================================================================
     1. HELPERS
     ======================================================================== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CLIP_HIDDEN = 'inset(100% 0% 0% 0%)';
  const CLIP_FULL   = 'inset(0% 0% 0% 0%)';
  let lenis = null;

  /** Wrap each word of an element in <span class="word"> (keeps an aria-label). */
  function splitWords(el) {
    if (el.dataset.splitDone) return $$('.word', el);
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((w, i, arr) => {
      const s = document.createElement('span');
      s.className = 'word';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w;
      el.appendChild(s);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.dataset.splitDone = '1';
    return $$('.word', el);
  }

  /** Wrap an element's text in a .line > span mask so it can slide up (idempotent). */
  function maskLine(el) {
    if (!$('.line', el)) {
      const text = el.textContent;
      el.textContent = '';
      const line = document.createElement('span');
      const inner = document.createElement('span');
      line.className = 'line';
      inner.textContent = text;
      line.appendChild(inner);
      el.appendChild(line);
    }
    return $('.line > span', el);
  }

  /* ========================================================================
     2. IMAGES — inject src/alt from the config above
     ======================================================================== */
  function injectImages() {
    const map = new Map(IMAGES.map((i) => [i.key, i]));
    $$('img[data-img]').forEach((img) => {
      const item = map.get(img.dataset.img);
      if (!item) { img.classList.add('is-broken'); return; }
      img.alt = img.hasAttribute('data-decorative') ? '' : item.alt;
      img.addEventListener('error', () => img.classList.add('is-broken'), { once: true });
      img.src = item.src; // `loading` attr is already set in the HTML
    });
  }

  /* ========================================================================
     3. CHROME — header state + scroll progress line (no GSAP needed)
     ======================================================================== */
  function initChrome() {
    const header = $('#header');
    const bar = $('.progress span');
    const links = $$('.nav__link');
    const spy = links.map((l) => {
      const t = $(l.getAttribute('href'));
      return t ? { link: l, el: t } : null;
    }).filter(Boolean);
    let ticking = false, lastY = window.scrollY || 0, current = null;

    const update = () => {
      const y = window.scrollY || root.scrollTop;
      const max = root.scrollHeight - window.innerHeight;
      const menuOpen = root.classList.contains('menu-open');
      header.classList.toggle('is-scrolled', y > 60);
      // hide on scroll down, reveal on scroll up
      if (!menuOpen && Math.abs(y - lastY) > 6) {
        header.classList.toggle('is-hidden', y > 500 && y > lastY);
        lastY = y;
      }
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;

      // scroll-spy: pinned sections are measured through their pin-spacer
      const mid = window.innerHeight * 0.5;
      let found = null;
      spy.forEach((s) => {
        const box = (s.el.closest('.pin-spacer') || s.el).getBoundingClientRect();
        if (box.top <= mid && box.bottom > mid) found = s.link;
      });
      if (found !== current) {
        current = found;
        spy.forEach((s) => s.link.classList.toggle('is-current', s.link === found));
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /** Full-screen mobile menu */
  function initMenu() {
    const btn = $('.menu-btn');
    const menu = $('#menu');
    if (!btn || !menu) return;
    const set = (open) => {
      root.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      if (open) { if (lenis) lenis.stop(); root.style.overflow = 'hidden'; $('#header').classList.remove('is-hidden'); }
      else { root.style.overflow = ''; if (lenis && !root.classList.contains('is-loading')) lenis.start(); }
    };
    btn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) set(false); });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }

  /** Buttons that lean toward the pointer (desktop, fine pointer only) */
  function initMagnetic() {
    if (!window.gsap || reducedQuery.matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.nav__btn, .btn-fill, .to-top').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const qy = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.28);
        qy((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ========================================================================
     4. CUSTOM CURSOR — soft ring that grows over interactive elements
     ======================================================================== */
  function initCursor() {
    const el = $('.cursor');
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const ease = reducedQuery.matches ? 1 : 0.18;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, first = true;

    const tick = () => {
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) ? requestAnimationFrame(tick) : 0;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (first) { x = tx; y = ty; first = false; }
      el.classList.add('is-visible');
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    const label = $('span', el);
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest ? e.target.closest('a, button, input, textarea, [data-cursor]') : null;
      const text = t && t.dataset.cursor;
      if (text) label.textContent = text;
      el.classList.toggle('has-label', !!text);
      el.classList.toggle('is-active', !!t && !text);
    });
    root.addEventListener('mouseleave', () => el.classList.remove('is-visible'));
  }

  /* ========================================================================
     5. CONTACT FORM — floating labels (CSS), validation, success state
     ======================================================================== */
  function initForm() {
    const form = $('#viewing-form');
    const thanks = $('#viewing-thanks');
    if (!form) return;

    const rules = {
      name:  (v) => v.trim().length >= 2 || 'Please enter your full name.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.'
    };
    const validate = (input) => {
      const rule = rules[input.name];
      if (!rule) return true;
      const res = rule(input.value);
      const err = $('.field__error', input.closest('.field'));
      if (err) err.textContent = res === true ? '' : res;
      input.setAttribute('aria-invalid', res === true ? 'false' : 'true');
      return res === true;
    };

    $$('input, textarea', form).forEach((input) => {
      input.addEventListener('blur', () => validate(input));
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') validate(input);
        if (input.tagName === 'TEXTAREA') { // auto-grow
          input.style.height = 'auto';
          input.style.height = Math.min(input.scrollHeight, 220) + 'px';
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [form.elements.name, form.elements.email];
      const ok = fields.map(validate).every(Boolean);
      if (!ok) { fields.find((f) => f.getAttribute('aria-invalid') === 'true').focus(); return; }

      /* TODO: send the enquiry to your backend here, e.g.
         fetch('/api/viewing', { method: 'POST', body: new FormData(form) }) */

      form.classList.add('is-leaving');
      setTimeout(() => {
        form.hidden = true;
        thanks.hidden = false;
        void thanks.offsetWidth; // reflow so the fade-in transitions
        thanks.classList.add('is-visible');
        thanks.focus({ preventScroll: true });
      }, 650);
    });
  }

  /* ========================================================================
     6. SMOOTH SCROLL (Lenis) wired to ScrollTrigger
     ======================================================================== */
  function initLenis() {
    if (reducedQuery.matches || typeof window.Lenis === 'undefined') return;
    // lerp-based smoothing: lighter than a fixed-duration ease and never "queues" wheel input
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /** In-page anchors — resolves pinned sections to their pin start. */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = $(hash);
        if (!target) return;
        e.preventDefault();
        const st = window.ScrollTrigger ? ScrollTrigger.getAll().find((s) => s.pin === target) : null;
        const dest = st ? st.start : target;
        if (lenis) lenis.scrollTo(dest, { duration: 1.6 });
        else if (typeof dest === 'number') window.scrollTo(0, dest);
        else target.scrollIntoView();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.replaceState(null, '', hash);
      });
    });
  }

  /* ========================================================================
     7. HERO — load animation (runs once) …
     ======================================================================== */
  /** Preloader: counts up while the hero image loads, then lifts away. */
  function runLoader(done) {
    const loader = $('.loader');
    if (!loader) return done();
    const count = $('.loader__count', loader);
    const bar = $('.loader__bar i', loader);
    const heroImg = $('.hero__layer--a img');
    const imgReady = new Promise((res) => {
      if (!heroImg || (heroImg.complete && heroImg.naturalWidth)) return res();
      heroImg.addEventListener('load', res, { once: true });
      heroImg.addEventListener('error', res, { once: true });
      setTimeout(res, 5000);
    });
    const state = { v: 0 };
    const counted = new Promise((res) => gsap.to(state, {
      v: 100, duration: 1.9, ease: 'power2.inOut', onComplete: res,
      onUpdate() { count.textContent = Math.round(state.v); bar.style.transform = `scaleX(${state.v / 100})`; }
    }));
    root.classList.add('is-loading');
    if (lenis) lenis.stop();
    Promise.all([counted, imgReady]).then(() => {
      gsap.timeline({
        onComplete() {
          loader.remove();
          root.classList.remove('is-loading');
          if (lenis && !root.classList.contains('menu-open')) lenis.start();
          ScrollTrigger.refresh();
        }
      })
        .to('.loader__foot, .loader__name', { y: -40, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .to(loader, { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, 0.35)
        .add(done, 0.75);
    });
  }

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero__layer--a img', { scale: 1.15 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
      .fromTo('.hero__eyebrow', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.25)
      .fromTo('.hero__title .line > span', { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 1.4, stagger: 0.12, ease: 'power4.out' }, 0.45)
      .fromTo('.hero__sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2 }, 1.15)
      .fromTo('#header', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1.0)
      .fromTo('.hero__scroll', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.6);
  }

  /* … and scroll animation (pinned on desktop, parallax on mobile) */
  function heroScroll(desktop) {
    const hero = $('#hero');
    if (!desktop) {
      gsap.to('.hero__layer--a', {
        yPercent: 10, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
      return;
    }
    const layerB = $('.hero__layer--b');
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=100%', pin: true, scrub: true, anticipatePin: 1 }
    });
    tl.to('.hero__layer--a', { scale: 1.12, duration: 1 }, 0)
      .to(['.hero__content', '.hero__scroll'], { opacity: 0, y: -60, duration: 0.45, ease: 'power1.in' }, 0)
      .fromTo(layerB, { clipPath: CLIP_HIDDEN }, { clipPath: CLIP_FULL, duration: 0.8, ease: 'power2.inOut' }, 0.2)
      .fromTo('.hero__layer--b img', { scale: 1.25 }, { scale: 1, duration: 0.9 }, 0.2)
      .fromTo('.hero__approach', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.8);
  }

  /* ========================================================================
     8. ROOM SEQUENCE
     ======================================================================== */
  function roomsDesktop() {
    const section = $('#house');
    const rooms = $$('.room', section);
    const N = rooms.length;
    const counter = $('.rooms__current', section);

    // timeline pacing (in abstract units): each room = hold + E transition + text
    const E = 0.7, GAP = 1.6;
    const s = (i) => (i - 1) * GAP + E;       // start of transition into room i
    const D = s(N - 1) + E + 1.1;              // total length

    gsap.set(rooms, { zIndex: (i) => i + 1 });

    const R = rooms.map((room) => ({
      room,
      media: $('.room__media', room),
      plx: $('.room__plx', room),
      img: $('.room__plx img', room),
      dim: $('.room__dim', room),
      num: $('.room__num', room),
      cap: $('.room__caption', room),
      title: $$('.room__title .word', room),
      desc: $$('.room__desc .word', room),
      words: $$('.word', room)
    }));

    // initial states
    R.forEach((r, i) => {
      gsap.set(r.num, { opacity: 0, y: 16 });
      gsap.set(r.words, { opacity: 0, y: 30 });
      if (i > 0) {
        gsap.set(r.room, { clipPath: CLIP_HIDDEN });
        gsap.set(r.img, { scale: 1.3 });
      }
    });

    // Room 01 text reveals when the section nears the viewport (before the pin begins)
    const intro0 = gsap.timeline({ paused: true })
      .to(R[0].num, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
      .to(R[0].title, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out' }, 0.15)
      .to(R[0].desc, { opacity: 1, y: 0, duration: 0.8, stagger: 0.025, ease: 'power3.out' }, 0.35);
    ScrollTrigger.create({
      trigger: section, start: 'top 70%',
      onEnter: () => intro0.play(),
      onLeaveBack: () => intro0.reverse()
    });

    let current = 0;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section, start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * D * 0.6),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = self.progress * D;
          let idx = 0;
          for (let i = 1; i < N; i++) if (t >= s(i) + E * 0.5) idx = i;
          if (idx !== current) {
            current = idx;
            if (counter) counter.textContent = String(idx + 1).padStart(2, '0');
          }
        }
      }
    });

    R.forEach((r, i) => {
      const start = i === 0 ? 0 : s(i);
      const end = i === N - 1 ? D : s(i + 1) + E;

      // parallax: image and caption drift at different speeds / directions
      tl.fromTo(r.plx, { yPercent: 5 }, { yPercent: -5, duration: end - start }, start);
      tl.fromTo(r.cap, { y: 30 }, { y: -40, duration: end - start }, start);

      if (i === 0) return;
      const p = R[i - 1];

      // next image enters: clip wipe from the bottom + scale-down from 1.3
      tl.fromTo(r.room, { clipPath: CLIP_HIDDEN }, { clipPath: CLIP_FULL, duration: E, ease: 'power2.inOut' }, s(i));
      tl.fromTo(r.img, { scale: 1.3 }, { scale: 1, duration: E + 0.5, ease: 'power2.out' }, s(i));

      // previous image is pushed back and darkened
      tl.fromTo(p.media, { scale: 1 }, { scale: 0.95, duration: E, ease: 'power2.inOut' }, s(i));
      tl.fromTo(p.dim, { opacity: 0 }, { opacity: 0.75, duration: E, ease: 'power2.inOut' }, s(i));

      // previous caption leaves
      tl.fromTo(p.num, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, s(i));
      tl.fromTo(p.words, { opacity: 1, y: 0 },
        { opacity: 0, y: -24, duration: 0.3, stagger: 0.01, ease: 'power1.in', immediateRender: false }, s(i));

      // new caption: rising word reveal
      tl.fromTo(r.num, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, s(i) + 0.25);
      tl.fromTo(r.title, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, s(i) + 0.3);
      tl.fromTo(r.desc, { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.02, ease: 'power2.out' }, s(i) + 0.5);
    });

    tl.to({}, { duration: 0.01 }, D - 0.01); // pad timeline to full length
  }

  function roomsMobile() {
    $$('.room').forEach((room) => {
      const plx = $('.room__plx', room);
      const num = $('.room__num', room);
      const words = $$('.word', room);
      gsap.fromTo(plx, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: room, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      gsap.set(num, { opacity: 0, y: 16 });
      gsap.set(words, { opacity: 0, y: 24 });
      gsap.timeline({ scrollTrigger: { trigger: room, start: 'top 65%', toggleActions: 'play none none reverse' } })
        .to(num, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .to(words, { opacity: 1, y: 0, duration: 0.8, stagger: 0.03, ease: 'power3.out' }, 0.1);
    });
  }

  /* ========================================================================
     9. STATEMENT
     ======================================================================== */
  function statement(desktop) {
    const words = $$('.statement__headline .word');
    gsap.set(words, { opacity: 0.15 });
    gsap.to(words, {
      opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: '.statement__headline', start: 'top 82%', end: 'bottom 48%', scrub: true }
    });

    const card = $('.statement__card');
    gsap.fromTo(card, { clipPath: CLIP_HIDDEN }, {
      clipPath: CLIP_FULL, duration: 1.5, ease: 'power4.inOut',
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
    gsap.fromTo(card, { yPercent: desktop ? 20 : 8 }, {
      yPercent: desktop ? -16 : -6, ease: 'none',
      scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.fromTo(card, { rotation: -3 }, {
      rotation: 0, ease: 'none',
      scrollTrigger: { trigger: '.statement__inner', start: 'top 90%', end: 'center 40%', scrub: true }
    });
    gsap.fromTo($('img', card), { yPercent: -6, scale: 1.15 }, {
      yPercent: 6, scale: 1.15, ease: 'none',
      scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ========================================================================
     10. HORIZONTAL GALLERY
     ======================================================================== */
  function revealPanel(panel) {
    gsap.to(maskLine($('.hpanel__title', panel)), { yPercent: 0, duration: 1.2, ease: 'power4.out' });
    gsap.to([$('.hpanel__num', panel), $('.hpanel__desc', panel)], {
      opacity: 1, y: 0, duration: 1, stagger: 0.12, delay: 0.2, ease: 'power3.out'
    });
  }
  function hidePanelText(panel) {
    gsap.set(maskLine($('.hpanel__title', panel)), { yPercent: 110 });
    gsap.set([$('.hpanel__num', panel), $('.hpanel__desc', panel)], { opacity: 0, y: 24 });
  }

  function galleryDesktop() {
    const section = $('#gallery');
    const track = $('.hgallery__track', section);
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const hTween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true
      }
    });

    gsap.to($('.hgallery__bar span', section), {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + dist(), scrub: true, invalidateOnRefresh: true }
    });

    // mask title reveal as each text panel reaches the centre zone
    $$('.hpanel--text', track).forEach((panel, i) => {
      hidePanelText(panel);
      ScrollTrigger.create(i === 0
        ? { trigger: section, start: 'top 55%', once: true, onEnter: () => revealPanel(panel) }
        : { trigger: panel, containerAnimation: hTween, start: 'left 62%', once: true, onEnter: () => revealPanel(panel) });
    });

    // inner parallax (image 120% wide moves opposite to scroll) + slow scale on the active panel
    $$('.hpanel--photo', track).forEach((panel) => {
      gsap.fromTo($('.hpanel__plx', panel), { xPercent: -8 }, {
        xPercent: 8, ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true }
      });
      gsap.fromTo($('img', panel), { scale: 1 }, {
        scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: hTween, start: 'left 80%', end: 'right 20%', scrub: true }
      });
    });
  }

  function galleryMobile() {
    $$('.hpanel--text').forEach((panel) => {
      hidePanelText(panel);
      ScrollTrigger.create({ trigger: panel, start: 'top 78%', once: true, onEnter: () => revealPanel(panel) });
    });
    $$('.hpanel--photo').forEach((panel) => {
      gsap.fromTo($('.hpanel__plx', panel), { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ========================================================================
     11. THE VIEW
     ======================================================================== */
  function view(desktop) {
    const section = $('#view');
    const panes = $$('.pane', section);
    const text = $('.view__text > div', section);
    gsap.set(text, { opacity: 0, scale: 1.1 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: desktop
        ? { trigger: section, start: 'top top', end: '+=140%', pin: true, scrub: true, anticipatePin: 1 }
        : { trigger: section, start: 'top 70%', end: 'bottom 35%', scrub: true }
    });
    // panes slide apart at different speeds: outer ones up, middle one down
    tl.to(panes[0], { yPercent: -105, xPercent: desktop ? -5 : 0, duration: 1.0, ease: 'power2.inOut' }, 0.1)
      .to(panes[1], { yPercent: 105, duration: 1.3, ease: 'power2.inOut' }, 0.2)
      .to(panes[2], { yPercent: -105, xPercent: desktop ? 5 : 0, duration: 0.9, ease: 'power2.inOut' }, 0.3)
      .to(text, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 0.5);
  }

  /* ========================================================================
     12. EVENINGS / RITUALS
     ======================================================================== */
  function rituals(desktop) {
    const st = { trigger: '.rituals__stage', start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo('.rituals__img--a', { yPercent: desktop ? 18 : 8 }, { yPercent: desktop ? -18 : -8, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.rituals__img--b', { yPercent: desktop ? 45 : 22 }, { yPercent: desktop ? -35 : -16, ease: 'none', scrollTrigger: st });

    const lines = $$('.rituals__line .line > span');
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, {
      yPercent: 0, duration: 1.3, stagger: 0.14, ease: 'power4.out',
      scrollTrigger: { trigger: '.rituals__line', start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  }

  /* ========================================================================
     12b. MARQUEE + GROUNDS
     ======================================================================== */
  function marquee() {
    const track = $('.marquee__track');
    if (!track) return;
    // endless loop; scroll velocity speeds it up and flips its direction
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()),
      onUpdate: (self) => {
        const boost = Math.min(5, Math.abs(self.getVelocity()) / 350);
        gsap.to(loop, { timeScale: self.direction * (1 + boost), duration: 0.4, overwrite: true });
      }
    });
  }

  function grounds() {
    gsap.set('.grounds__title .line > span', { yPercent: 110 });
    gsap.to('.grounds__title .line > span', {
      yPercent: 0, duration: 1.3, stagger: 0.14, ease: 'power4.out',
      scrollTrigger: { trigger: '.grounds__title', start: 'top 85%', toggleActions: 'play none none reverse' }
    });
    $$('.ground').forEach((row) => {
      gsap.from(row.children, {
        y: 36, opacity: 0, duration: 1, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 90%' }
      });
    });
  }

  /* ========================================================================
     13. SPECIFICATIONS — count-up numbers
     ======================================================================== */
  const formatCount = (el, v) => {
    const dec = parseInt(el.dataset.decimals || '0', 10);
    return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };
  const resetCounters = () => $$('.count').forEach((el) => { el.textContent = formatCount(el, parseFloat(el.dataset.count)); });

  function specs() {
    gsap.from('.spec', {
      y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.specs__grid', start: 'top 85%' }
    });
    $$('.count').forEach((el, i) => {
      const end = parseFloat(el.dataset.count);
      const obj = { v: 0 };
      el.textContent = formatCount(el, 0);
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(obj, {
          v: end, duration: 2.2, delay: i * 0.08, ease: 'power3.out',
          onUpdate: () => { el.textContent = formatCount(el, obj.v); },
          onComplete: () => { el.textContent = formatCount(el, end); }
        })
      });
    });
  }

  /* ========================================================================
     14. CONTACT + generic reveals
     ======================================================================== */
  function contact() {
    const lines = $$('.contact__title .line > span');
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, {
      yPercent: 0, duration: 1.3, stagger: 0.14, ease: 'power4.out',
      scrollTrigger: { trigger: '.contact__title', start: 'top 85%' }
    });
    gsap.from('.form .field, .form__actions', {
      y: 30, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.form', start: 'top 88%' }
    });
  }

  function reveals() {
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 30, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ========================================================================
     15. ORCHESTRATION — gsap.matchMedia
         desktop : pinned / horizontal / scrubbed cinematic version
         mobile  : simplified vertical stack, same reveals
         reduced : nothing animates, static content (CSS base layout)
     ======================================================================== */
  function initAnimations() {
    const mm = gsap.matchMedia();
    mm.add({
      desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
      mobile:  '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)'
    }, (ctx) => {
      const { desktop, mobile } = ctx.conditions;
      if (!desktop && !mobile) return; // reduced motion: leave everything static

      root.classList.add('fx-motion');
      root.classList.toggle('fx-desktop', desktop);

      // Created top-to-bottom so pin spacing is calculated in page order
      heroScroll(desktop);
      desktop ? roomsDesktop() : roomsMobile();
      statement(desktop);
      marquee();
      desktop ? galleryDesktop() : galleryMobile();
      view(desktop);
      rituals(desktop);
      grounds();
      specs();
      contact();
      reveals();

      gsap.delayedCall(0.1, () => ScrollTrigger.refresh());

      return () => {
        root.classList.remove('fx-motion', 'fx-desktop');
        resetCounters();
      };
    });
  }

  /* ========================================================================
     16. INIT
     ======================================================================== */
  function init() {
    injectImages();
    initChrome();
    initMenu();
    initCursor();
    initForm();

    const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (!hasGSAP) {            // CDN blocked? Show the static page instead of hidden content.
      root.classList.remove('js-motion');
      initAnchors();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    $$('[data-split]').forEach(splitWords);

    if (!reducedQuery.matches) {
      initLenis();
      runLoader(heroIntro);
    } else {
      root.classList.remove('js-motion');
      $('.loader') && $('.loader').remove();
    }

    initAnimations();
    initAnchors();
    initMagnetic();

    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  init();
})();
