import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "../utils/_libs.js";

// Gift certificate: the amount buttons roll the sum on the card
export const gift = () => {
    return new Promise((resolve) => {
        _utils.initSection('.gift', (section) => init(section));
        resolve();
    })
}

const init = (section) => {
    const sum = section.querySelector('[data-cert]');
    const buttons = [...section.querySelectorAll('.cert__amounts button')];
    if (!sum || !buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.toggle('is-active', b === btn));

            if (_state.reducedMotion) {
                sum.textContent = btn.dataset.sum;
                return;
            }
            gsap.timeline()
                .to(sum, {yPercent: -40, opacity: 0, duration: .25, ease: 'power2.in'})
                .add(() => { sum.textContent = btn.dataset.sum; })
                .fromTo(sum, {yPercent: 40, opacity: 0}, {yPercent: 0, opacity: 1, duration: .45, ease: 'power3.out'});
        });
    });
}
