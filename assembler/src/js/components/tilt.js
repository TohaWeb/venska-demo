import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";

// 3D tilt on hover. The .tilt wrapper never moves and is the only hover target;
// the transform goes to the inner .tilt__el, so hovering near an edge can't flicker.
export const tilt = () => {
    return new Promise((resolve) => {
        if (_state.finePointer && !_state.reducedMotion) {
            _utils.initSection('.tilt', (wrap) => init(wrap));
        }
        resolve();
    })
}

const init = (wrap) => {
    const el = wrap.querySelector('.tilt__el');
    if (!el) return;

    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, lift = 0, cl = 0;

    const render = () => {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        cl += (lift - cl) * 0.12;
        el.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg) translateY(${cl}px)`;
        raf = (Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(lift - cl) > 0.01) ? requestAnimationFrame(render) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(render); };

    wrap.addEventListener('mousemove', (e) => {
        const r = wrap.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 7;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 7;
        lift = -6;
        kick();
    });
    wrap.addEventListener('mouseleave', () => {
        tx = 0; ty = 0; lift = 0;
        kick();
    });
}
