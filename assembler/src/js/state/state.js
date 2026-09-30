const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
const isTablet = !isDesktop && window.matchMedia('(min-width: 768px)').matches;
const isMobile = !isDesktop && !isTablet;

let hasChangedState = false;

export let _state = {
    scrollDirection: 0,
    isUserActive: false,
    lenisInit: null,
    isScrollingToAnchor: false,

    // Smooth scroll (Lenis) is switched off: native scrolling felt smoother on this page.
    // Flip to true to bring it back — _libs._lenis() handles the rest.
    useSmoothScroll: false,

    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,

    isDesktop: isDesktop,
    isTablet: isTablet,
    isMobile: isMobile,
    prevDesktop: isDesktop,
    prevTablet: isTablet,
    prevMobile: isMobile,

    windowResizeEvents: ['resize', 'resizePage', 'orientationchange'],
    interactionEvents: ['mousemove', 'mousewheel', 'touchmove', 'keydown', 'mousedown', 'focus', 'orientationchange', 'wheel'],

    updateState(newState){
        for (const key in newState) {
            if (_state[key] !== newState[key]) {
                hasChangedState = true;
                break;
            }
        }
        if (hasChangedState) {
            _state = { ..._state, ...newState };
            if (newState.hasOwnProperty('scrollDirection')){
                window.dispatchEvent(new Event('scrollDirectionChanged'));
            }
            hasChangedState = false;
        }
    },
}
