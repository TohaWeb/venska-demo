/* =========================================================
   Venska Easy Body — interactions & motion
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const header = $('.header');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.body.classList.add('is-loading');

  // Load service card images eagerly: they live in a transformed horizontal track
  $$('.card img').forEach((img) => { img.loading = 'eager'; });

  /* ---------- Smooth scroll ----------
     Off for now: native browser scrolling. To bring Lenis back, set this to true
     and restore <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"> in index.html. */
  const SMOOTH_SCROLL = false;
  let lenis = null;
  if (SMOOTH_SCROLL && !reduced && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.stop();
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  window.lenis = lenis;

  const scrollTo = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const offset = el.id === 'top' ? 0 : -70;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduced ? 'auto' : 'smooth' });
  };

  /* ---------- Anchors ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (a.dataset.prefill) prefillService(a.dataset.prefill);
      scrollTo(el);
    });
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    $('.menu').setAttribute('aria-hidden', 'true');
    lenis && lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    if (!open) return closeMenu();
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    $('.menu').setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Header / progress ---------- */
  const progress = $('.progress i');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > lastY && y > 600 && !document.body.classList.contains('menu-open'));
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav ---------- */
  const navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'services', 'programs', 'reviews', 'gift', 'contacts'].forEach((id) => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduced) {
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; });
    const loop = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', (e) => {
      const view = e.target.closest('[data-cursor]');
      const hover = e.target.closest('a, button, summary, label, select, input');
      cursor.classList.toggle('is-view', !!view && !hover);
      cursor.classList.toggle('is-hover', !!hover);
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = 1; });
  }

  /* ---------- 3D tilt ----------
     The .tilt wrapper never moves and is the only hover target;
     the transform goes to the inner .tilt__el, so hovering near an edge can't flicker. */
  if (finePointer && !reduced) {
    $$('.tilt').forEach((wrap) => {
      const el = $('.tilt__el', wrap);
      if (!el) return;
      let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, lift = 0, cl = 0;
      const render = () => {
        cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; cl += (lift - cl) * 0.12;
        el.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg) translateY(${cl}px)`;
        raf = (Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(lift - cl) > 0.01) ? requestAnimationFrame(render) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(render); };
      wrap.addEventListener('mousemove', (e) => {
        const r = wrap.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 7;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 7;
        lift = -6;
        kick();
      });
      wrap.addEventListener('mouseleave', () => { tx = 0; ty = 0; lift = 0; kick(); });
    });
  }

  /* ---------- Footer wordmark: always exactly the container width ---------- */
  const word = $('.footer__word');
  word.innerHTML = `<span class="footer__word-in">${[...word.textContent.trim()].map((ch) => `<span>${ch}</span>`).join('')}</span>`;
  const wordIn = $('.footer__word-in', word);
  const fitWord = () => {
    word.style.fontSize = '100px';
    const natural = wordIn.getBoundingClientRect().width;
    if (natural) word.style.fontSize = (100 * word.clientWidth / natural).toFixed(2) + 'px';
  };
  fitWord();
  document.fonts && document.fonts.ready.then(fitWord);
  // Refit whenever the box width changes (window resize, scrollbar appearing after the preloader)
  if ('ResizeObserver' in window) {
    let lastW = 0;
    new ResizeObserver(() => { if (word.clientWidth !== lastW) { lastW = word.clientWidth; fitWord(); } }).observe(word);
  } else window.addEventListener('resize', fitWord);

  /* ---------- Reviews: duplicate for seamless loop ---------- */
  $$('.reviews__track').forEach((t) => {
    t.innerHTML += t.innerHTML;
    $$('.review', t).slice(t.children.length / 2).forEach((r) => r.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- Goal selector ---------- */
  const nw = (t) => t.replace(/(LPG-масаж|SPA-ритуал)/g, '<span class="nw">$1</span>');
  const goals = [
    { name: 'Body Sculpt', img: 'assets/img/cryo.jpg', desc: 'Кріоліполіз + LPG-масаж + ендосфера. Руйнуємо локальні жирові пастки і виводимо їх лімфою.', stats: [['10', 'процедур у курсі'], ['5', 'тижнів курсу'], ['−6', "см в об'ємах*"]] },
    { name: 'Smooth Skin', img: 'assets/img/lpg.jpg', desc: 'LPG-масаж + ендосфера. Вирівнюємо рельєф шкіри, покращуємо мікроциркуляцію та тонус.', stats: [['12', 'процедур у курсі'], ['6', 'тижнів курсу'], ['2×', 'пружніша шкіра*']] },
    { name: 'Tone & Shape', img: 'assets/img/ems.jpg', desc: 'EMS-моделювання + LPG-масаж. Тонус м’язів, рельєф і підтягнутий силует без виснажливих тренувань.', stats: [['8', 'процедур у курсі'], ['4', 'тижні курсу'], ['+', 'тонус з перших сеансів']] },
    { name: 'Після пологів', img: 'assets/img/robe.jpg', desc: 'EMS + LPG-масаж + ендосфера. М’яко повертаємо тонус живота, пружність шкіри та легкість.', stats: [['10', 'процедур у курсі'], ['5', 'тижнів курсу'], ['1', 'релакс-масаж у подарунок']] },
    { name: '«Сьоме небо»', img: 'assets/img/ritual-light.jpg', desc: 'Авторський SPA-ритуал: пілінг, обгортання і масаж з теплими оліями. Повне перезавантаження.', stats: [['120', 'хвилин тільки для себе'], ['3', 'етапи ритуалу'], ['0', 'думок про справи']] },
    { name: 'Smooth & Free', img: 'assets/img/laser.jpg', desc: 'Лазерна епіляція курсом: з кожною процедурою волосся тоншає і стає майже непомітним.', stats: [['6–8', 'процедур у курсі'], ['4–6', 'тижнів між сеансами'], ['0', 'щоденного гоління']] },
  ];
  goals.forEach((g) => { const i = new Image(); i.src = g.img; });
  const panel = $('.goal__panel');
  const tabs = $$('.goal__tab');
  let goalTimer;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('is-active')) return;
      tabs.forEach((t) => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', t === tab); });
      const g = goals[+tab.dataset.goal];
      panel.classList.add('is-switching');
      clearTimeout(goalTimer);
      goalTimer = setTimeout(() => {
        $('.goal__name', panel).textContent = g.name;
        $('.goal__desc', panel).innerHTML = nw(g.desc);
        $('.goal__img img', panel).src = g.img;
        $$('.goal__list li', panel).forEach((li, i) => {
          $('b', li).textContent = g.stats[i][0];
          $('span', li).textContent = g.stats[i][1];
        });
        panel.classList.remove('is-switching');
      }, 380);
    });
  });

  /* ---------- Hero: rotating word ---------- */
  const rot = $('.rotator');
  if (rot && !reduced) {
    const words = $$('span', rot);
    let wi = 0;
    setInterval(() => {
      if (document.hidden) return;
      const cur = words[wi];
      wi = (wi + 1) % words.length;
      const next = words[wi];
      cur.classList.remove('is-active'); cur.classList.add('is-leaving');
      next.classList.remove('is-leaving'); next.classList.add('is-active');
      rot.setAttribute('aria-label', next.textContent);
      setTimeout(() => cur.classList.remove('is-leaving'), 1000);
    }, 2600);
  }

  /* ---------- Hero: open / closed right now (Kyiv time, 07:00–22:00) ---------- */
  const chip = $('.hero__chip');
  const statusEl = $('.hero__status');
  const updateStatus = () => {
    try {
      const hour = +new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Kyiv' }).format(new Date());
      const open = hour >= 7 && hour < 22;
      statusEl.textContent = open ? 'Зараз відчинено · до 22:00' : 'Зачинено · відкриємось о 07:00';
      chip.classList.toggle('is-closed', !open);
    } catch (e) { /* keep the static text */ }
  };
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Gift certificate ---------- */
  const certSum = $('[data-cert]');
  $$('.cert__amounts button').forEach((b) => {
    b.addEventListener('click', () => {
      $$('.cert__amounts button').forEach((x) => x.classList.toggle('is-active', x === b));
      if (hasGSAP && !reduced) {
        gsap.fromTo(certSum, { yPercent: 0, opacity: 1 }, {
          yPercent: -40, opacity: 0, duration: .25, ease: 'power2.in',
          onComplete: () => { certSum.textContent = b.dataset.sum; gsap.fromTo(certSum, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, ease: 'power3.out' }); },
        });
      } else certSum.textContent = b.dataset.sum;
    });
  });

  /* ---------- Booking form ---------- */
  const form = $('.form');
  function prefillService(value) {
    const radio = $$('input[name="service"]', form).find((r) => r.value === value);
    if (radio) radio.checked = true;
  }
  const phoneInput = form.elements.phone;
  phoneInput.addEventListener('input', () => { phoneInput.value = phoneInput.value.replace(/[^\d+\s()-]/g, ''); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    ['name', 'phone'].forEach((n) => {
      const el = form.elements[n];
      const valid = n === 'phone' ? el.value.replace(/\D/g, '').length >= 10 : !!el.value.trim();
      el.closest('.field').classList.toggle('is-error', !valid);
      if (!valid) ok = false;
    });
    const serviceOk = !!form.elements.service.value;
    $('[data-field="service"]', form).classList.toggle('is-error', !serviceOk);
    if (!serviceOk) ok = false;
    if (!ok) {
      if (hasGSAP && !reduced) gsap.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
      return;
    }
    // Demo: here the request would be sent to CRM / Telegram bot / Appointer
    form.classList.add('is-sent');
    setTimeout(() => { form.reset(); form.classList.remove('is-sent'); }, 6000);
  });
  $$('.field input', form).forEach((el) => el.addEventListener('input', () => el.closest('.field').classList.remove('is-error')));
  $$('input[name="service"]', form).forEach((el) => el.addEventListener('change', () => $('[data-field="service"]', form).classList.remove('is-error')));

  /* ---------- Counters ---------- */
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = +(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || '';
    const fmt = (v) => (dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toString()) + suffix;
    if (!hasGSAP || reduced) { el.textContent = fmt(target); return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } });
  };

  /* ---------- Without GSAP: show everything and stop ---------- */
  if (!hasGSAP || reduced) {
    $('.preloader').remove();
    document.body.classList.remove('is-loading');
    lenis && lenis.start();
    $$('[data-count]').forEach(runCounter);
    initMobileServiceCounter();
    return;
  }

  /* =========================================================
     GSAP motion
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);

  // Hide hero pieces before the intro
  gsap.set('.hero__title .line > span', { yPercent: 115 });
  gsap.set(['.hero__eyebrow', '.hero__lead', '.hero__cta', '.hero__facts', '.hero__scroll'], { opacity: 0, y: 30 });
  gsap.set('.hero__arch', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.hero__arch img', { scale: 1.3 });
  gsap.set('.hero__line', { clipPath: 'inset(0% 0% 100% 0%)' });
  gsap.set('.hero__seal', { scale: 0, rotate: -120 });
  gsap.set('.hero__chip', { opacity: 0, y: 24 });
  gsap.set('.header', { yPercent: -100, opacity: 0 });

  /* ---------- Preloader ---------- */
  const counter = { v: 0 };
  const plCount = $('.preloader__count');
  const imgsReady = new Promise((res) => {
    const hero = $('.hero__arch--main img');
    if (hero.complete) res(); else { hero.addEventListener('load', res); hero.addEventListener('error', res); }
    setTimeout(res, 3500);
  });
  const plTl = gsap.timeline();
  plTl.to(counter, { v: 100, duration: 1.8, ease: 'power2.inOut', onUpdate: () => { plCount.textContent = Math.round(counter.v); } }, 0)
      .to('.preloader__bar i', { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0);

  Promise.all([imgsReady, new Promise((r) => plTl.eventCallback('onComplete', r))]).then(() => {
    const out = gsap.timeline({ onComplete: () => { $('.preloader').remove(); } });
    out.to('.preloader__inner', { opacity: 0, y: -30, duration: .6, ease: 'power2.in' })
       .to('.preloader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.1')
       .add(heroIntro(), '-=.7');
  });

  function heroIntro() {
    document.body.classList.remove('is-loading');
    lenis && lenis.start();
    const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
    tl.to('.header', { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out' }, .3)
      .to('.hero__arch--main', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
      .to('.hero__arch--main img', { scale: 1, duration: 2.4, ease: 'expo.out' }, .2)
      .to('.hero__arch--small', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, .35)
      .to('.hero__arch--small img', { scale: 1, duration: 2.2, ease: 'expo.out' }, .55)
      .to('.hero__line', { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.6, ease: 'power2.inOut' }, .6)
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, .35)
      .to('.hero__title .line > span', { yPercent: 0, duration: 1.4, stagger: .12, ease: 'expo.out' }, .4)
      .to('.hero__lead', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, .8)
      .to('.hero__cta', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, .9)
      .to('.hero__facts', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 1)
      .to('.hero__seal', { scale: 1, rotate: 0, duration: 1.6, ease: 'expo.out' }, 1)
      .to('.hero__chip', { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 1.15)
      .to('.hero__scroll', { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, 1.3);
    return tl;
  }

  /* ---------- Hero parallax: layers drift at different speeds ---------- */
  const heroScroll = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__arch--main', { y: -50, ease: 'none', scrollTrigger: heroScroll });
  gsap.to('.hero__arch--small', { y: -140, ease: 'none', scrollTrigger: heroScroll });
  gsap.to('.hero__line', { y: 60, ease: 'none', scrollTrigger: heroScroll });
  gsap.to('.hero__seal', { y: -180, ease: 'none', scrollTrigger: heroScroll });
  gsap.to('.hero__chip', { y: -90, ease: 'none', scrollTrigger: heroScroll });
  gsap.to('.hero__content', { yPercent: -14, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } });

  /* ---------- Generic reveals ---------- */
  gsap.set('.reveal', { opacity: 0, y: 44 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, stagger: .09, ease: 'expo.out', overwrite: true }),
  });

  // Headings in sections: line-mask reveal (h2 with .reveal already handled; add subtle skew)
  $$('.h2:not(.reveal)').forEach((h) => {
    gsap.from(h, { opacity: 0, y: 60, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  /* ---------- Clip reveals + parallax images ---------- */
  $$('.clip-reveal').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
    const img = $('img', el);
    if (img && !el.closest('.contacts__map')) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  $$('[data-speed]').forEach((img) => {
    const dir = parseFloat(img.dataset.speed) < 0 ? -1 : 1;
    gsap.fromTo(img, { yPercent: -8 * dir }, {
      yPercent: 8 * dir, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* ---------- About: word-by-word fill ---------- */
  const big = $('[data-words]');
  if (big) {
    big.innerHTML = big.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    gsap.to($$('.w', big), {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: big, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  }

  /* ---------- Counters on view ---------- */
  $$('[data-count]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => runCounter(el) });
  });

  /* ---------- Services: horizontal scroll (desktop) ---------- */
  const mm = gsap.matchMedia();
  const track = $('.services__track');
  const cards = $$('.card', track);
  const countEl = $('.services__counter b');
  const total = cards.filter((c) => !c.classList.contains('card--cta')).length;
  const setCount = (i) => { countEl.textContent = String(Math.min(total, i + 1)).padStart(2, '0'); };

  mm.add('(min-width: 992px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.services', start: 'top top', end: () => '+=' + dist(),
        // refreshPriority: the pin is created after triggers that sit below it on the page
        // (about, gallery, gift…), so it must be measured first or their start/end ignore its spacer
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
        onUpdate: (self) => setCount(Math.round(self.progress * (cards.length - 1))),
      },
    });
    // Subtle inner parallax on the card images while sliding
    cards.forEach((card) => {
      const img = $('.card__img img', card);
      if (!img) return;
      gsap.fromTo(img, { xPercent: -8 }, {
        xPercent: 8, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    });
    gsap.from(cards, { opacity: 0, y: 80, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.services', start: 'top 70%' } });
  });
  mm.add('(max-width: 991px)', () => { initMobileServiceCounter(); });

  function initMobileServiceCounter() {
    const tr = $('.services__track');
    const cs = $$('.card', tr);
    const cEl = $('.services__counter b');
    const upd = () => {
      const center = tr.scrollLeft + tr.clientWidth / 2;
      let best = 0, bestD = Infinity;
      cs.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center); if (d < bestD) { bestD = d; best = i; } });
      cEl.textContent = String(Math.min(cs.filter((c) => !c.classList.contains('card--cta')).length, best + 1)).padStart(2, '0');
    };
    tr.addEventListener('scroll', upd, { passive: true });
    return () => tr.removeEventListener('scroll', upd);
  }

  /* ---------- Process line ---------- */
  gsap.to('.process__line i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.process__grid', start: 'top 85%', end: 'bottom 60%', scrub: true } });
  gsap.from('.step__n', { yPercent: 60, opacity: 0, stagger: .12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.process__grid', start: 'top 85%' } });

  /* ---------- Footer word: letters rise from a mask ---------- */
  gsap.from('.footer__word-in span', {
    yPercent: 105, duration: 1.4, stagger: .07, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer__word', start: 'top 92%' },
  });

  /* ---------- Marquee speed follows scroll velocity ---------- */
  const mq = $('.marquee__track');
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 400, 4);
      mq.getAnimations().forEach((a) => { a.playbackRate = 1 + v; });
    },
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
