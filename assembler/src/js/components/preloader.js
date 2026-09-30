import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap, ScrollTrigger} from "../utils/_libs.js";
import {heroIntro} from "./hero.js";

export const preloader = () => {
    return new Promise((resolve) => {
        _utils.initSection('.preloader', (section) => init(section), false);
        resolve();
    })
}

const finish = () => {
    document.documentElement.classList.remove('is-loading');
    if (_state.lenisInit) _state.lenisInit.start();
    window.dispatchEvent(new Event('preloaderDone'));
}

// Waits for the first hero photo (with a timeout, so a slow network never blocks the page)
const whenHeroReady = () => new Promise((resolve) => {
    const img = document.querySelector('.hero__arch--main img');
    const done = () => resolve();
    if (!img || (img.complete && img.naturalWidth)) return done();
    img.addEventListener('load', done, {once: true});
    img.addEventListener('error', done, {once: true});
    setTimeout(done, 3500);
});

const init = (preloader) => {
    if (_state.lenisInit) _state.lenisInit.stop();

    if (_state.reducedMotion) {
        preloader.remove();
        finish();
        return;
    }

    const count = preloader.querySelector('.preloader__count');
    const counter = {v: 0};

    const progress = gsap.timeline();
    progress.to(counter, {
        v: 100, duration: 1.8, ease: 'power2.inOut',
        onUpdate: () => { count.textContent = Math.round(counter.v); },
    }, 0).to(preloader.querySelector('.preloader__bar i'), {scaleX: 1, duration: 1.8, ease: 'power2.inOut'}, 0);

    Promise.all([whenHeroReady(), new Promise((r) => progress.eventCallback('onComplete', r))]).then(() => {
        gsap.timeline({onComplete: () => preloader.remove()})
            .to(preloader.querySelector('.preloader__inner'), {opacity: 0, y: -30, duration: .6, ease: 'power2.in'})
            .to(preloader, {clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut'}, '-=.1')
            .add(() => finish(), '-=.8')
            .to('.header', {yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out'}, '-=.5')
            .add(heroIntro().eventCallback('onComplete', () => ScrollTrigger.refresh()), '-=1.1');
    });
}
