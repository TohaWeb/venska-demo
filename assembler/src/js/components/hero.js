import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "../utils/_libs.js";

export const hero = () => {
    return new Promise((resolve) => {
        // not lazy: the intro states must be applied before the preloader lifts
        _utils.initSection('.hero', (section) => init(section), false);
        resolve();
    })
}

let intro = null;

// Called by the preloader once it has finished
export const heroIntro = () => intro ? intro() : gsap.timeline();

const init = (section) => {
    rotator(section);
    openStatus(section);

    if (_state.reducedMotion) return;

    const q = (s) => section.querySelectorAll(s);

    // hidden until the intro plays
    gsap.set(q('.hero__title .line > span'), {yPercent: 115});
    gsap.set(q('.hero__eyebrow, .hero__lead, .hero__cta, .hero__facts, .hero__scroll'), {opacity: 0, y: 30});
    gsap.set(q('.hero__arch'), {clipPath: 'inset(100% 0% 0% 0%)'});
    gsap.set(q('.hero__arch img'), {scale: 1.3});
    gsap.set(q('.hero__line'), {clipPath: 'inset(0% 0% 100% 0%)'});
    gsap.set(q('.hero__seal'), {scale: 0, rotate: -120});
    gsap.set(q('.hero__chip'), {opacity: 0, y: 24});

    intro = () => {
        const tl = gsap.timeline();
        tl.to(q('.hero__arch--main'), {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut'}, 0)
            .to(q('.hero__arch--main img'), {scale: 1, duration: 2.4, ease: 'expo.out'}, .2)
            .to(q('.hero__arch--small'), {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut'}, .35)
            .to(q('.hero__arch--small img'), {scale: 1, duration: 2.2, ease: 'expo.out'}, .55)
            .to(q('.hero__line'), {clipPath: 'inset(0% 0% 0% 0%)', duration: 2.6, ease: 'power2.inOut'}, .6)
            .to(q('.hero__eyebrow'), {opacity: 1, y: 0, duration: 1, ease: 'expo.out'}, .35)
            .to(q('.hero__title .line > span'), {yPercent: 0, duration: 1.4, stagger: .12, ease: 'expo.out'}, .4)
            .to(q('.hero__lead'), {opacity: 1, y: 0, duration: 1.1, ease: 'expo.out'}, .8)
            .to(q('.hero__cta'), {opacity: 1, y: 0, duration: 1.1, ease: 'expo.out'}, .9)
            .to(q('.hero__facts'), {opacity: 1, y: 0, duration: 1.1, ease: 'expo.out'}, 1)
            .to(q('.hero__seal'), {scale: 1, rotate: 0, duration: 1.6, ease: 'expo.out'}, 1)
            .to(q('.hero__chip'), {opacity: 1, y: 0, duration: 1.2, ease: 'expo.out'}, 1.15)
            .to(q('.hero__scroll'), {opacity: 1, y: 0, duration: 1, ease: 'expo.out'}, 1.3);
        return tl;
    };

    // layers drift at different speeds while scrolling away
    const scroll = {trigger: section, start: 'top top', end: 'bottom top', scrub: true};
    gsap.to(q('.hero__arch--main'), {y: -50, ease: 'none', scrollTrigger: scroll});
    gsap.to(q('.hero__arch--small'), {y: -140, ease: 'none', scrollTrigger: scroll});
    gsap.to(q('.hero__line'), {y: 60, ease: 'none', scrollTrigger: scroll});
    gsap.to(q('.hero__seal'), {y: -180, ease: 'none', scrollTrigger: scroll});
    gsap.to(q('.hero__chip'), {y: -90, ease: 'none', scrollTrigger: scroll});
    gsap.to(q('.hero__content'), {
        yPercent: -14, opacity: 0, ease: 'none',
        scrollTrigger: {trigger: section, start: 'top top', end: 'bottom 20%', scrub: true},
    });
}

// Last word of the title cycles through a few words
const rotator = (section) => {
    const rot = section.querySelector('.rotator');
    if (!rot || _state.reducedMotion) return;

    const words = [...rot.querySelectorAll('span')];
    let index = 0;

    setInterval(() => {
        // skip while the tab is hidden or the hero is off screen
        if (document.hidden || !section.classList.contains('s-visible')) return;
        const current = words[index];
        index = (index + 1) % words.length;
        const next = words[index];

        current.classList.remove('is-active');
        current.classList.add('is-leaving');
        next.classList.remove('is-leaving');
        next.classList.add('is-active');
        rot.setAttribute('aria-label', next.textContent);
        setTimeout(() => current.classList.remove('is-leaving'), 1000);
    }, 2600);
}

// "Open now" / "Closed" by Kyiv time, 07:00–22:00
const openStatus = (section) => {
    const chip = section.querySelector('.hero__chip');
    const status = section.querySelector('.hero__status');
    if (!chip || !status) return;

    const update = () => {
        try {
            const hour = +new Intl.DateTimeFormat('en-GB', {hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Kyiv'}).format(new Date());
            const open = hour >= 7 && hour < 22;
            status.textContent = open ? 'Зараз відчинено · до 22:00' : 'Зачинено · відкриємось о 07:00';
            chip.classList.toggle('is-closed', !open);
        } catch (e) { /* keep the static text */ }
    };
    update();
    setInterval(update, 60000);
}
