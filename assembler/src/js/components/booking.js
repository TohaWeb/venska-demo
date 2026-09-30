import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "../utils/_libs.js";

// Callback form: validation, success state, and pre-selecting a service from links like
// <a href="#booking" data-prefill="Подарунковий сертифікат">
export const booking = () => {
    return new Promise((resolve) => {
        // not lazy: a [data-prefill] link elsewhere on the page may be clicked first
        _utils.initSection('.booking', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    const form = section.querySelector('.form');
    if (!form) return;

    const serviceGroup = form.querySelector('[data-field="service"]');
    const serviceRadios = [...form.querySelectorAll('input[name="service"]')];

    window.addEventListener('anchorClick', (e) => {
        const value = e.detail.link.dataset.prefill;
        if (!value) return;
        const radio = serviceRadios.find((r) => r.value === value);
        if (radio) radio.checked = true;
    });

    const phone = form.elements.phone;
    phone.addEventListener('input', () => {
        phone.value = phone.value.replace(/[^\d+\s()-]/g, '');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;

        ['name', 'phone'].forEach((n) => {
            const el = form.elements[n];
            const valid = n === 'phone' ? el.value.replace(/\D/g, '').length >= 10 : !!el.value.trim();
            el.closest('.field').classList.toggle('is-error', !valid);
            if (!valid) ok = false;
        });

        const serviceOk = !!form.elements.service.value;
        serviceGroup?.classList.toggle('is-error', !serviceOk);
        if (!serviceOk) ok = false;

        if (!ok) {
            if (!_state.reducedMotion) gsap.fromTo(form, {x: -8}, {x: 0, duration: .5, ease: 'elastic.out(1, .3)'});
            return;
        }

        // Demo: this is where the request goes to a CRM / Telegram bot / Appointer
        form.classList.add('is-sent');
        setTimeout(() => {
            form.reset();
            form.classList.remove('is-sent');
        }, 6000);
    });

    form.querySelectorAll('.field input').forEach((el) => {
        el.addEventListener('input', () => el.closest('.field').classList.remove('is-error'));
    });
    serviceRadios.forEach((el) => {
        el.addEventListener('change', () => serviceGroup?.classList.remove('is-error'));
    });
}
