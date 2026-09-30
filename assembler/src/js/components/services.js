import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "../utils/_libs.js";

export const services = () => {
    return new Promise((resolve) => {
        // not lazy: the pin changes the page height, every trigger below depends on it
        _utils.initSection('.services', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    const track = section.querySelector('.services__track');
    const cards = [...track.querySelectorAll('.card')];
    const countEl = section.querySelector('.services__counter b');
    const total = cards.filter((c) => !c.classList.contains('card--cta')).length;
    const setCount = (i) => { countEl.textContent = String(Math.min(total, i + 1)).padStart(2, '0'); };

    const mm = gsap.matchMedia();

    // Desktop: the section is pinned and the track slides sideways while scrolling
    mm.add('(min-width: 1024px)', () => {
        if (_state.reducedMotion) return;
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
            x: () => -dist(), ease: 'none',
            scrollTrigger: {
                trigger: section, start: 'top top', end: () => '+=' + dist(),
                // the pin is created after triggers that sit below it on the page,
                // so it must be measured first or their start/end ignore its spacer
                pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
                onUpdate: (self) => setCount(Math.round(self.progress * (cards.length - 1))),
            },
        });

        // subtle inner parallax on the card photos while sliding
        cards.forEach((card) => {
            const img = card.querySelector('.card__img img');
            if (!img) return;
            gsap.fromTo(img, {xPercent: -8}, {
                xPercent: 8, ease: 'none',
                scrollTrigger: {trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true},
            });
        });

        gsap.from(cards, {opacity: 0, y: 80, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: {trigger: section, start: 'top 70%'}});
    });

    // Mobile / tablet: native swipe, the counter follows the card closest to the centre
    mm.add('(max-width: 1023px)', () => {
        const update = () => {
            const center = track.scrollLeft + track.clientWidth / 2;
            let best = 0, bestD = Infinity;
            cards.forEach((c, i) => {
                const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
                if (d < bestD) { bestD = d; best = i; }
            });
            setCount(best);
        };
        track.addEventListener('scroll', update, {passive: true});
        return () => track.removeEventListener('scroll', update);
    });
}
