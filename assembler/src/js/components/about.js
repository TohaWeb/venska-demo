import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap, ScrollTrigger} from "../utils/_libs.js";

export const about = () => {
    return new Promise((resolve) => {
        _utils.initSection('.about', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    wordFill(section);
    counters(section);
}

// The big statement fills in word by word while it scrolls through the screen
const wordFill = (section) => {
    const text = section.querySelector('[data-words]');
    if (!text || _state.reducedMotion) return;

    text.innerHTML = text.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    gsap.to(text.querySelectorAll('.w'), {
        opacity: 1, stagger: .1, ease: 'none',
        scrollTrigger: {trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: true},
    });
}

// Stats count up once they appear
const counters = (section) => {
    section.querySelectorAll('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const decimals = +(el.dataset.decimals || 0);
        const suffix = el.dataset.suffix || '';
        const format = (v) => (decimals ? v.toFixed(decimals).replace('.', ',') : Math.round(v).toString()) + suffix;

        if (_state.reducedMotion) {
            el.textContent = format(target);
            return;
        }

        ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter: () => {
                const o = {v: 0};
                gsap.to(o, {v: target, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = format(o.v); }});
            },
        });
    });
}
