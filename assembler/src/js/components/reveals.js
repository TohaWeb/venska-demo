import {_state} from "../state/state.js";
import {gsap, ScrollTrigger} from "../utils/_libs.js";

// Page-wide scroll effects: fade-up reveals, clip-path image reveals, image parallax.
export const reveals = () => {
    return new Promise((resolve) => {
        if (!_state.reducedMotion) {
            fadeUp();
            headings();
            clipReveals();
            parallax();
        }
        resolve();
    })
}

// .reveal — fade + rise, batched so neighbours stagger nicely
const fadeUp = () => {
    gsap.set('.reveal', {opacity: 0, y: 44});
    ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        onEnter: (els) => gsap.to(els, {opacity: 1, y: 0, duration: 1.2, stagger: .09, ease: 'expo.out', overwrite: true}),
    });
}

// Section headings that are not already .reveal
const headings = () => {
    document.querySelectorAll('.h2:not(.reveal)').forEach((h) => {
        gsap.from(h, {opacity: 0, y: 60, duration: 1.3, ease: 'expo.out', scrollTrigger: {trigger: h, start: 'top 88%'}});
    });
}

// .clip-reveal — the frame opens from the bottom, the photo settles from a zoom
const clipReveals = () => {
    document.querySelectorAll('.clip-reveal').forEach((el) => {
        gsap.fromTo(el, {clipPath: 'inset(100% 0% 0% 0%)'}, {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
            scrollTrigger: {trigger: el, start: 'top 85%'},
        });
        const img = el.querySelector('img');
        if (img) {
            gsap.fromTo(img, {scale: 1.3}, {scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: {trigger: el, start: 'top 85%'}});
        }
    });
}

// img[data-speed] — the image is 124% of its frame and shifts ±8% while the frame crosses the screen
const parallax = () => {
    document.querySelectorAll('img[data-speed]').forEach((img) => {
        const dir = parseFloat(img.dataset.speed) < 0 ? -1 : 1;
        gsap.fromTo(img, {yPercent: -8 * dir}, {
            yPercent: 8 * dir, ease: 'none',
            scrollTrigger: {trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true},
        });
    });
}
