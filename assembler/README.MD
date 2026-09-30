# Frontend Build — Venska Easy Body

Same setup as the roomigo assembler: gulp + SCSS + webpack.

## Install

    cd assembler
    npm ci

## Run

    - Development (watch, source maps):
    npm run dev

    - Production (what goes to GitHub Pages):
    npm run prod

## Output

| Source                    | Built to                         |
|---------------------------|----------------------------------|
| `src/html/index.html` + `src/html/modules/*` | `../index.html` |
| `src/scss/style.scss`     | `../assets/css/style.min.css`    |
| `src/js/main.js`          | `../assets/js/scripts.min.js`    |

`reset` only cleans `assets/css` and `assets/js` — `assets/img` holds the photos.
Edit HTML in `src/html`, never the generated `index.html` in the project root.

## SCSS

- `_variables.scss` — brand palette, fonts, breakpoints, mockup sizes (desktop 1440×810, tablet 820×1180, mobile 390×844).
- `_utils.scss` — `dynamic_clamp_*` + `px_to_rem` from the roomigo assembler. The root font size scales
  with the viewport, and everything is in `rem`, so the whole page scales with it.
- `modules/blocks/*` — one file per section.

## JS

- `main.js` → `utils/_utils.js`, `utils/_libs.js`, `state/state.js`, `components/*`.
- Every component starts via `_utils.initSection(selector, callback, lazy)`.
  ScrollTrigger-based sections pass `lazy = false` so trigger positions are measured in page order.
- Smooth scroll (Lenis) is off: `_state.useSmoothScroll = false` in `state/state.js`.

## Performance rules used here

- Infinite CSS animations get the `loop-anim` class; they pause while their `[data-section]`
  is off screen (the section observer toggles `.s-visible`).
- No `backdrop-filter` / `filter: blur` on large or moving areas; animate `transform` / `opacity` only.
- rAF loops (cursor, tilt) stop as soon as they settle.
