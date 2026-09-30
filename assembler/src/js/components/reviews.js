import {_utils} from "../utils/_utils.js";

// Each row loops endlessly: the cards are duplicated and the track slides by -50%
export const reviews = () => {
    return new Promise((resolve) => {
        // not lazy: duplicating later would make the moving row jump
        _utils.initSection('.reviews', (section) => init(section), false);
        resolve();
    })
}

const init = (section) => {
    section.querySelectorAll('.reviews__track').forEach((track) => {
        const originals = [...track.children];
        originals.forEach((card) => {
            const copy = card.cloneNode(true);
            copy.setAttribute('aria-hidden', 'true');
            track.appendChild(copy);
        });
    });
}
