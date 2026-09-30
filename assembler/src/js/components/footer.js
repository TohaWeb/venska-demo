import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "../utils/_libs.js";

export const footer = () => {
    return new Promise((resolve) => {
        _utils.initSection('.footer', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    const word = section.querySelector('.footer__word');
    if (!word) return;

    // split into letters so they can rise one by one
    word.innerHTML = `<span class="footer__word-in">${[...word.textContent.trim()].map((ch) => `<span>${ch}</span>`).join('')}</span>`;
    const inner = word.querySelector('.footer__word-in');

    // the wordmark always fills the container width exactly
    const fit = () => {
        word.style.fontSize = '100px';
        const natural = inner.getBoundingClientRect().width;
        if (natural) word.style.fontSize = (100 * word.clientWidth / natural).toFixed(2) + 'px';
    };
    fit();
    document.fonts?.ready.then(fit);
    let lastWidth = 0;
    new ResizeObserver(() => {
        if (word.clientWidth !== lastWidth) {
            lastWidth = word.clientWidth;
            fit();
        }
    }).observe(word);

    if (!_state.reducedMotion) {
        gsap.from(inner.querySelectorAll('span'), {
            yPercent: 105, duration: 1.4, stagger: .07, ease: 'expo.out',
            scrollTrigger: {trigger: word, start: 'top 92%'},
        });
    }
}
