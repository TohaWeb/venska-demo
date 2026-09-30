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

    // Same Lenis setup as the roomigo assembler (_libs._lenis)
    _lenis() {
        return new Promise((resolve, reject) => {
            if(_state.useSmoothScroll && !_state.reducedMotion && !_utils.isMobile.any()){
                const lenis = new Lenis({
                    smoothWheel: true,
                    smoothTouch: true,
                    wheelMultiplier: 1,
                    touchMultiplier: 1,
                    lerp: _utils.detectBrowser() === 'safari' ? 0.1 : 0.075,
                    easing: (t) => 1 - Math.pow(1 - t, 3),
                });

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }

                requestAnimationFrame(raf);

                // scroll-linked GSAP animations read the Lenis position on the same frame
                lenis.on('scroll', ScrollTrigger.update);

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
