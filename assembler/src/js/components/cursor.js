import {_state} from "../state/state.js";

// Custom cursor: a dot that follows the mouse and a ring that eases after it.
// The rAF loop only runs while the ring is still catching up — no work when the mouse is idle.
export const cursor = () => {
    return new Promise((resolve) => {
        const el = document.querySelector('.cursor');
        if (!el || !_state.finePointer || _state.reducedMotion) {
            el?.remove();
            resolve();
            return;
        }

        const dot = el.querySelector('.cursor__dot');
        const ring = el.querySelector('.cursor__ring');
        let mx = -100, my = -100, rx = mx, ry = my;
        let raf = 0;
        let seen = false;

        // hidden until the mouse actually moves — otherwise the ring sits in the top-left corner
        el.style.opacity = '0';

        const render = () => {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            raf = (Math.abs(mx - rx) + Math.abs(my - ry) > 0.1) ? requestAnimationFrame(render) : 0;
        };

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            if (!seen) {
                // first move: jump the ring straight to the pointer instead of flying in from the corner
                seen = true;
                rx = mx;
                ry = my;
                el.style.opacity = '1';
            }
            dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
            if (!raf) raf = requestAnimationFrame(render);
        }, {passive: true});

        document.addEventListener('mouseover', (e) => {
            const view = e.target.closest('[data-cursor]');
            const hover = e.target.closest('a, button, summary, label, input');
            el.classList.toggle('is-view', !!view && !hover);
            el.classList.toggle('is-hover', !!hover);
        });
        document.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { if (seen) el.style.opacity = '1'; });

        resolve();
    })
}
