import {_utils} from "./_utils.js";
import {_state} from "../state/state.js";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger.js";
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export {gsap, ScrollTrigger};

export const _libs = {
    init() {
        return new Promise(async (resolve) => {
            await Promise.all([
                this._lenis(),
                this._scrollTriggerRefresh(),
            ]);
            resolve();
        });
    },

    _lenis() {
        return new Promise((resolve) => {
            if (_state.useSmoothScroll && !_state.reducedMotion && !_utils.isMobile.any()) {
                const lenis = new Lenis({
                    smoothWheel: true,
                    lerp: 0.1,
                });
                // drive Lenis from GSAP's ticker so ScrollTrigger and Lenis share one frame loop
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add((time) => lenis.raf(time * 1000));
                gsap.ticker.lagSmoothing(0);
                _state.updateState({lenisInit: lenis});
            }
            resolve();
        });
    },

    _scrollTriggerRefresh() {
        return new Promise((resolve) => {
            // page height changes (fonts, images, resize) → re-measure every trigger once
            _utils.rebuildComponentsOnResize(() => ScrollTrigger.refresh(), 300);
            window.addEventListener('load', () => ScrollTrigger.refresh());
            resolve();
        });
    },

    _gsap(options = {}) {
        return gsap.timeline({
            scrollTrigger: options,
        });
    },
}
