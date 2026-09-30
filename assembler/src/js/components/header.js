import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "../utils/_libs.js";

export const header = () => {
    return new Promise((resolve) => {
        _utils.initSection('.header', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    // slides in with the hero intro (see preloader.js)
    if (!_state.reducedMotion) gsap.set(section, {yPercent: -100, opacity: 0});

    scrollState(section);
    activeNav(section);
    mobileMenu();
}

// Solid background after the first scroll, hide on scroll down, reading progress bar
const scrollState = (section) => {
    const progress = document.querySelector('.progress i');
    const html = document.documentElement;
    let lastY = window.scrollY;
    let maxScroll = 1;
    let ticking = false;

    // scrollHeight is read on resize only, never inside the scroll handler
    const measure = () => { maxScroll = Math.max(1, html.scrollHeight - window.innerHeight); };
    measure();
    _state.windowResizeEvents.forEach((e) => window.addEventListener(e, measure));
    window.addEventListener('load', measure);

    const update = () => {
        ticking = false;
        const y = window.scrollY;
        section.classList.toggle('is-scrolled', y > 40);
        section.classList.toggle('is-hidden', y > lastY && y > 600 && !html.classList.contains('menu-open'));
        if (progress) progress.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;
        lastY = y;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, {passive: true});
    update();
}

// Highlights the menu link of the section in the middle of the screen
const activeNav = (section) => {
    const links = [...section.querySelectorAll('.nav a')];
    const targets = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    if (!targets.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
        });
    }, {rootMargin: '-45% 0px -50% 0px'});
    targets.forEach((t) => io.observe(t));
}

const mobileMenu = () => {
    const html = document.documentElement;
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.menu');
    if (!burger || !menu) return;

    const setState = (open) => {
        html.classList.toggle('menu-open', open);
        html.classList.toggle('overflow-hidden', open);
        burger.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-hidden', String(!open));
        if (_state.lenisInit) open ? _state.lenisInit.stop() : _state.lenisInit.start();
    };

    burger.addEventListener('click', () => setState(!html.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && html.classList.contains('menu-open')) setState(false);
    });
    // any anchor link closes the menu before scrolling
    window.addEventListener('anchorClick', () => {
        if (html.classList.contains('menu-open')) setState(false);
    });
    _utils.rebuildComponentsOnResize(() => {
        if (window.matchMedia('(min-width: 1024px)').matches) setState(false);
    });
}
