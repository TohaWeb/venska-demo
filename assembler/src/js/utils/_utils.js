import {_state} from "../state/state.js";

let resizeObserverTimeout;

export const _utils = {
    init() {
        return new Promise(async (resolve) => {
            await Promise.all([
                this.getScrollDirection(),
                this.anchors(),
            ]);
            resolve();
        })
    },

    getScrollDirection(){
        /**
         * Tracks the scroll direction and stores it in the state:
         * 1 — scrolling down, 0 — scrolling up.
         */
        return new Promise((resolve) => {
            let lastScrollTop = window.scrollY;

            window.addEventListener('scroll', () => {
                const currentScroll = window.scrollY;
                const direction = currentScroll > lastScrollTop ? 1 : 0;
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

                _state.updateState({ scrollDirection: direction });
            }, {passive: true});
            resolve();
        })
    },

    //Anchors
    anchors(){
        return new Promise((resolve) => {
            const links = document.querySelectorAll('a[href^="#"]:not(.js-handled)');
            links.forEach(link => _utils.initAnchor(link));
            resolve();
        });
    },
    initAnchor(link){
        const hash = link.getAttribute('href');
        if (!hash || hash.length < 2) return;
        try {
            const target = document.querySelector(hash);
            if (!target) return;
            link.classList.add('js-handled');
            link.addEventListener('click', e => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('anchorClick', {detail: {link, target}}));
                _utils.scrollToElement(target);
            });
        } catch (error) {}
    },
    scrollToElement(el) {
        /**
         * Scrolls to an element, leaving room for the fixed header.
         * Uses Lenis when it is enabled, otherwise native smooth scrolling.
         */
        if (!el) return;
        // offset = height of the compact header (row + its scrolled padding), because the header
        // shrinks while we travel — measuring it at click time would leave a gap on arrival
        const row = document.querySelector('.header__row');
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const offset = el.id === 'top' ? 0 : (row ? row.offsetHeight + 1.5 * rem : 0);
        const top = el.getBoundingClientRect().top + window.scrollY - offset;

        // same timing rule as the roomigo assembler: 1ms per px, clamped to 0.3–3s
        const duration = Math.min(3000, Math.max(300, Math.abs(Math.round(top - window.scrollY)))) / 1000;

        _state.updateState({isScrollingToAnchor: true});
        if (_state.lenisInit) {
            _state.lenisInit.scrollTo(top, {duration, onComplete: () => _state.updateState({isScrollingToAnchor: false})});
        } else {
            window.scrollTo({top, behavior: _state.reducedMotion ? 'auto' : 'smooth'});
            setTimeout(() => _state.updateState({isScrollingToAnchor: false}), 1200);
        }
    },

    initSection(selector, callback, lazy = true){
        /**
         * Initializes unhandled sections matching the provided selector.
         *
         * - Marks each element with 'js-handled' so it is only set up once.
         * - lazy = true and the element sits inside [data-section]: the callback waits for the
         *   first user interaction or for the section to become visible ("sVisible").
         * - lazy = false (or no [data-section]): the callback runs immediately. Use this for
         *   ScrollTrigger-driven sections — creating triggers later would shift the measured positions.
         *
         * @param {string} selector - CSS selector to target section elements.
         * @param {function} callback - Receives (sectionElement, index).
         * @param {boolean} lazy - Defer the callback until the section is needed.
         */
        const sections = document.querySelectorAll(selector);
        if (sections.length > 0 && typeof callback === 'function'){
            let index = 0;
            for(const section of sections){
                if(!section.classList.contains('js-handled')){
                    section.classList.add('js-handled');

                    const sectionIndex = index;
                    const holder = section.closest('[data-section]');
                    if(lazy && holder){
                        let isStart = false;
                        const activate = () => {
                            if (!isStart) {
                                isStart = true;
                                callback(section, sectionIndex);
                                _state.interactionEvents.forEach(event => window.removeEventListener(event, activate));
                            }
                        };
                        _state.interactionEvents.forEach(event => window.addEventListener(event, activate, {passive: true}));
                        holder.addEventListener("sVisible", activate);
                    } else {
                        callback(section, sectionIndex);
                    }
                }
                index++;
            }
        }
    },

    rebuildComponentsOnResize(callback, timeoutDelay = 500){
        /**
         * Runs the callback (debounced) after resize / orientation change / page resize.
         * Ignores plain 'resize' on touch devices — the address bar showing/hiding fires it while scrolling.
         */
        if (typeof callback !== 'function') return false;

        let timeout;
        _state.windowResizeEvents.forEach(event => {
            window.addEventListener(event, () => {
                if (_utils.isMobile.any() && event === 'resize') return false;
                clearTimeout(timeout);
                timeout = setTimeout(callback, timeoutDelay);
            })
        });
    },

    detectBrowser() {
        /**
         * Detects browser and platform with focus on Safari / WebKit behavior.
         *
         * Returns:
         * - "safari"      → Desktop Safari (macOS)
         * - "ios_safari"  → iOS Safari / WebView
         * - "firefox"
         * - "chrome"
         * - "other"
         */
        const ua = navigator.userAgent;

        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isFirefox = /Firefox/i.test(ua);
        const isChrome = /Chrome|Chromium|CriOS/i.test(ua);
        const isSafari = /Safari/i.test(ua) && !isChrome && !isFirefox;

        if (isIOS && isSafari) return 'ios_safari';
        if (isSafari) return 'safari';
        if (isFirefox) return 'firefox';
        if (isChrome) return 'chrome';

        return 'other';
    },

    isMobile: {
        Android: () => /Android/i.test(navigator.userAgent),
        iOS: () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.userAgent.includes("Macintosh") && 'ontouchend' in document),
        any: function () {
            return this.Android() || this.iOS() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        }
    },
}

export const observers = {
    init(){
        return new Promise(async (resolve) => {
            await Promise.all([
                this.initSectionObserver(),
                this.resizeObserver(),
            ]);
            resolve();
        });
    },

    initSectionObserver() {
        /**
         * Toggles .s-visible on every [data-section] and fires "sVisible" / "sHidden".
         * CSS pauses every .loop-anim inside a section that is off screen.
         */
        return new Promise((resolve) => {
            const sections = document.querySelectorAll('[data-section]');
            const list = new Map();

            sections.forEach(section => {
                const threshold = parseFloat(section.dataset.section) || 0;

                if (!list.has(threshold)) {
                    list.set(threshold, new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('s-visible', 'is-viewed');
                                entry.target.dispatchEvent(new Event("sVisible"));
                            } else {
                                entry.target.classList.remove('s-visible');
                                entry.target.dispatchEvent(new Event("sHidden"));
                            }
                        });
                    }, { threshold }));
                }

                list.get(threshold).observe(section);
            });

            resolve();
        })
    },
    resizeObserver() {
        /**
         * Fires a debounced "resizePage" event whenever the page height/width changes
         * (fonts loading, images, accordions) — ScrollTrigger and the header listen to it.
         */
        return new Promise((resolve) => {
            const ro = new ResizeObserver(() => {
                clearTimeout(resizeObserverTimeout);
                resizeObserverTimeout = setTimeout(() => {
                    window.dispatchEvent(new Event("resizePage"));
                }, 300)
            });
            ro.observe(document.body);
            resolve();
        })
    },
}
