import {_utils} from "../utils/_utils.js";
import {_state} from "../state/state.js";
import {ScrollTrigger} from "../utils/_libs.js";

// The CSS marquee speeds up with the scroll velocity
export const marquee = () => {
    return new Promise((resolve) => {
        _utils.initSection('.marquee', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    const track = section.querySelector('.marquee__track');
    if (!track || _state.reducedMotion) return;

    let animation = null;
    ScrollTrigger.create({
        trigger: section, start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
            animation = animation || track.getAnimations()[0];
            if (!animation) return;
            animation.playbackRate = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
        },
        onLeave: () => { if (animation) animation.playbackRate = 1; },
        onLeaveBack: () => { if (animation) animation.playbackRate = 1; },
    });
}
