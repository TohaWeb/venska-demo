import {_utils, observers} from "./utils/_utils.js";
import {_libs} from "./utils/_libs.js";
import {_state} from "./state/state.js";
import {hero} from "./components/hero.js";
import {preloader} from "./components/preloader.js";
import {header} from "./components/header.js";
import {cursor} from "./components/cursor.js";
import {tilt} from "./components/tilt.js";
import {reveals} from "./components/reveals.js";
import {marquee} from "./components/marquee.js";
import {services} from "./components/services.js";
import {goal} from "./components/goal.js";
import {about} from "./components/about.js";
import {steps} from "./components/steps.js";
import {reviews} from "./components/reviews.js";
import {gift} from "./components/gift.js";
import {booking} from "./components/booking.js";
import {footer} from "./components/footer.js";

// always start from the top — the intro animation is built for it
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', async () => {
    let isUserInteracted = true;
    _state.interactionEvents.forEach(event => {
        window.addEventListener(event, () => {
            if (isUserInteracted) {
                isUserInteracted = false;
                _state.updateState({isUserActive: true});
            }
        }, {passive: true});
    });

    await Promise.all([
        _utils.init(),
        _libs.init(),
        observers.init(),
    ]);

    // Order matters for ScrollTrigger: hero first (intro states), then page order.
    // The services pin uses refreshPriority, so triggers created before it still measure correctly.
    await Promise.all([
        hero(),
        header(),
        preloader(),
        cursor(),
        tilt(),
        reveals(),
        marquee(),
        services(),
        goal(),
        about(),
        steps(),
        reviews(),
        gift(),
        booking(),
        footer(),
    ]);
});
