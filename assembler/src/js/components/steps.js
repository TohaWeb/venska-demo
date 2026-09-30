import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "../utils/_libs.js";

export const steps = () => {
    return new Promise((resolve) => {
        _utils.initSection('.process', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    if (_state.reducedMotion) {
        gsap.set(section.querySelectorAll('.process__line i'), {scaleX: 1});
        return;
    }
    const grid = section.querySelector('.process__grid');

    // the timeline line draws itself while the steps scroll in
    gsap.to(section.querySelectorAll('.process__line i'), {
        scaleX: 1, ease: 'none',
        scrollTrigger: {trigger: grid, start: 'top 85%', end: 'bottom 60%', scrub: true},
    });
    gsap.from(section.querySelectorAll('.step__n'), {
        yPercent: 60, opacity: 0, stagger: .12, duration: 1.2, ease: 'expo.out',
        scrollTrigger: {trigger: grid, start: 'top 85%'},
    });
}
