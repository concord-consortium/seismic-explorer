# Terms of Use Link and Licensing Copy for Seismic Explorer

**Jira**: https://concord-consortium.atlassian.net/browse/SE-4

**Status**: **Closed**

## Overview

Seismic Explorer's About and Share dialogs get the license and Terms of Use copy approved for CODAP's About dialog, replacing the 2016 copyright block in Share, so that every Geo app states the same thing: the source is MIT, and use of the hosted site is governed by Concord's Terms of Use. The About and Share controls and the dialogs' close control become real buttons, and the dialogs open with focus on their close button, close on Esc, are named by their titles, and fit the viewport.

SE-4 is one of five matching Geo stories (HURR-70, SE-4, TE-10, WM-67, FM-5). Their shared decisions (numbered 1 to 11 below) live in the stream's `geo-common.md`; Kiley Brown decided 3, 5, 6 and 9, and Doug the rest.

## Requirements

### License copy

- **R1. One license-copy component** renders the copy below and is the last block of both the About dialog and the Share dialog. In About it follows the existing paragraphs; in Share it replaces the 2016 `copyright` block. The orphaned `.copyright` rule in `css/share-modal-content.less` is deleted (decision 5).
- **R2. Copy, word for word** (CODAP `V3.AboutDialog.*` with the product and host swapped), in this order:
  - Paragraph 1: **Seismic Explorer is free, open-source software.** The Seismic Explorer source code is released under the [MIT License], so you’re welcome to use, modify, and build on it.
  - Paragraph 2: **Your use of Seismic Explorer at seismic-explorer.concord.org** is governed by our [Terms of Use]. The hosted version is free for non-commercial use; commercial use requires a separate written agreement. For more information, visit [concord.org/licensing] or contact [licensing@concord.org].
  - Copyright line, at 12px: `© {current year} The Concord Consortium, Inc.`
  - The leading phrase of each paragraph is bold. "you’re" uses the curly apostrophe U+2019 (decision 1).
- **R3. Year** is `new Date().getFullYear()` at render time. No range and no build-time constant (decision 1).
- **R4. The old text is gone** from Share: no "Copyright © 2016", "All rights reserved", "opensource.org/licenses/MIT" or "Please provide attribution" (decision 5).

### Links

- **R5. Link targets**, kept in one constants module (`js/license-constants.js`):
  - MIT License: `https://github.com/concord-consortium/seismic-explorer/blob/master/LICENSE`
  - Terms of Use: `https://concord.org/terms-of-use/`
  - concord.org/licensing: `https://concord.org/licensing`
  - licensing@concord.org: `mailto:licensing@concord.org`
- **R6. Web links open in a new tab**: the three web links have `target="_blank"` and `rel="noopener noreferrer"` (decision 2), and append visually hidden text " (opens in a new tab)". The mailto link is a plain same-tab `<a>` with no hint.
- **R7. Links in the copy are underlined**, in both dialogs.

### Reachability

- **R8. Hidden user interface is unchanged**: with `showUserInterface=false` the app renders exactly as before (decision 3, Kiley: "Don't add anything").
- **R9. No other new surface**: no top-bar Terms of Use item, no heading over the copy, no links row (decision 6).
- **R10. Reload, About and Share are `<button type="button">`s**, each looking as its old control did (15px, `#777`, `#111` on hover, same position), keeping `data-test="reload"`, `data-test="about"`, `data-test="share"` and the `ReloadClicked`, `AboutDialogOpened` and `ShareDialogOpened` logs, with a keyboard focus ring that fits inside the 22px top bar. Reload's icon is `aria-hidden`; the button is named "Reload" by `aria-label`, with a matching `title` tooltip. Tab goes Reload, Share, About, as they read on screen. *(Share as a button goes beyond the story: decision 4, Doug, 2026-11-18, after Teale Fristoe's review of HURR-70. Reload as a button: Kiley Brown's review of the Geo branch builds, Doug, 2026-11-19.)*

### Dialog behavior (both dialogs, through `BasicModal`, decision 7)

- **R11. Esc closes the dialog** while focus is inside it. A click on the map (the overlay lets clicks through) moves focus out, and Esc then goes to the map; that stays.
- **R12. The close control is a `<button type="button">` named "Close"**, keeping `data-test="close-modal"` and the old look (the Font Awesome × at the top right), with the icon hidden from assistive technology and a keyboard focus ring.
- **R13. Each dialog is named by its title**: "About: Seismic Explorer" and "Share: Seismic Explorer".
- **R14. Focus goes to Close, stays in the dialog and comes back**: opening a dialog puts focus on Close, so a screen reader announces the title; Close shows its ring when opened by keyboard, not by mouse. Tab stays inside the dialog, and Esc or Close returns focus to the button that opened it, even when a click did not focus the button (macOS Safari and Firefox): each click handler focuses its own button first, so react-modal records it. *(Focus on Close and on the opener go beyond the story: decision 7, Doug, 2026-11-18 and 2026-11-19.)*
- **R15. The dialog fits the viewport**: height capped at `calc(100vh - 40px)`, scrolling only when the content is taller, so About keeps its title on screen in the 900 × 600 iframe the Share dialog's embed code uses.

### Unchanged

- **R16.** About's paragraphs and data credits, the splash screen (decision 11), and the non-blocking overlay (the map stays usable, and clicking outside does not close a dialog) are unchanged.

### Tests

- **R17.** Unit tests render the real About and Share content and cover, for each: the four hrefs as literal URLs; `target` and `rel` on the web links and their absence on the mailto link; each link's accessible name; the R2 copy word for word, including the curly apostrophe and bold lead-ins; that the copy is the last block; and the year under two pinned dates. In Share, the R4 text is absent. Through the real top bar, for both About and Share: a focusable `type="button"` that opens its dialog, named by its title, with focus on Close; Esc and Close each close it and return focus to the button, including after a click from the body that did not focus it (seven tests per button; removing either handler's focus call fails its 2). Reload is a focusable `type="button"` named "Reload" with a matching tooltip, and Reload, Share and About come in that document order, so Tab follows the on-screen order (28 Jest tests in all). *(Enter itself is checked in the browser only: jsdom 11 does not turn Enter on a button into a click, and neither Cypress 13's `type('{enter}')` nor a Chrome DevTools key press from Cypress activated the button. Layout, focus rings and the height cap are browser checks too.)*

### CI

- **R18.** `.github/workflows/ci.yml` moves from `cypress-io/github-action@v5` to `@v7`, in a commit of its own.

### Review

- **R19.** Kiley reviews the result on the branch deploy before merge, at `https://models-resources.concord.org/seismic-explorer/branch/add-terms-of-use-link/index.html` (`s3-deploy-action` strips the Jira key from the branch name), standalone and embedded through the Share dialog's own iframe code: both dialogs end with the copy, the wording matches codap#2758, and each link goes where it should. *(A review step, not code.)*

## Technical Notes

- **Stack**: React 16.8.3, react-modal 3.8.1, Less with global class names, Font Awesome 4, `standard` 12, Jest 24 with jsdom 11. Run Node 16: `npm ci --legacy-peer-deps`, `npx jest`, `npx standard js`.
- **Component tests**: the repo's first. `package.json`'s `jest.moduleNameMapper` stubs Less imports (`js/test/style-stub.js`). `#app` must exist before `basic-modal.js` is imported, since it calls `Modal.setAppElement('#app')` at import. Jest 24 has no `setSystemTime`, so `js/test/pin-date.js` replaces `global.Date`.
- **react-modal**: Esc needs only `onRequestClose`; the dialog is named through `aria={{ labelledby }}` pointing at each content component's title id (`ABOUT_TITLE_ID`, `SHARE_TITLE_ID`); react-modal 3.8.1 never sets `aria-modal` itself, so `BasicModal` passes `modal: true` in the same `aria` prop, and while a dialog is open the library hides `#app` with `aria-hidden`; focus return is on by default. On open it records the opener before rendering the content and focuses the content `div` only if focus is not already inside, so `autoFocus` on Close works and focus return still reaches the opener.
- **Dialog height and width**: `box-sizing: border-box; max-height: calc(100vh - 40px)` on `.basic-modal`. In a 900 × 600 iframe About is 20 to 580px and scrolls to the copy by wheel and keyboard; at 1024 × 768 and larger it does not scroll. `border-box` also applies to the existing `max-width` caps, so both dialogs are 38.4px (the 2.4em side padding) narrower than before.
- **Top bar**: Reload sits on the left; Share and About sit, in that order, in one right-floated group, each with the 1.2em right margin, so Tab moves left to right as they read on screen. The buttons reset `padding`, `border`, `background`, `font` and `line-height` to match the old spans. All three sit 2px from the viewport's top, so the focus ring uses `outline-offset: 0` to stay whole inside the 22px bar.
- **Cypress**: `cypress/e2e/basic/smoke.cy.js` finds About, Share and Close by `data-test`, which is kept, so it needs no change.
- **CI**: v5 and v6 share the got 11.8.6 dev-server ping that failed for HURR-70 on GitHub runner 2.338; v7 runs on Node 24. The evidence is HURR-70's CI run, not a local repro.
- **Reference**: CODAP-1595 / codap#2758 for the copy and `ExternalLink`; HURR-70 for the Geo shape. Seismic follows the shape, not the code.

## Out of Scope

- From the story: a third-party acknowledgements list, usage tracking, changing the software license, localizing the legal copy, and a cookie banner.
- Existing credit links in About, including their missing `rel`.
- Embeds with `showUserInterface=false`, where About and the copy stay unreachable (decision 3).
- The splash screen (decision 11).
- The top-bar text color, `#777` on white at 4.48:1, just under WCAG AA's 4.5:1.
- Other CI modernization (`actions/checkout@v3`, `actions/setup-node@v3`, Node 16 in the build job).
- The other four Geo apps and Boreal Forest Fire Explorer.

## Not Yet Implemented

- An automated test of pressing Enter on About or Share. jsdom 11 and Cypress 13 cannot activate a native button with Enter, so Enter is checked in the browser; an automated test would need a new dependency such as cypress-real-events.

## Decisions

### Label the dialogs with `contentLabel` or `aria-labelledby`?
**Context**: geo-common decision 7 allows either for Seismic.
**Options considered**:
- A) `aria-labelledby` pointing at each content component's title.
- B) `contentLabel` strings passed from `top-controls.js`, repeating each title.

**Decision**: A. The visible title stays the only source of the name.

---

### Make the dialog fit the viewport in this story?
**Context**: The story does not mention height, but the copy it adds pushes About's title off the top of the 900 × 600 embed.
**Options considered**:
- A) Cap the dialog's height and let it scroll (R15).
- B) Leave it.

**Decision**: A, Doug, 2026-11-18, with the cap in `vh` so only small viewports scroll and 40px of margin. Story requirement 4 asks for the link to stay reachable when embedded.

---

### Upgrade the Cypress action in this story?
**Context**: Not in the story, and the failure could not be reproduced locally.
**Options considered**:
- A) Move to `@v7` in its own commit.
- B) Push with v5 and upgrade only if CI fails.

**Decision**: A, Doug, 2026-11-18. v5 shares the failing ping with v6 and is unsupported; HURR-70 made the same move and went green.

---

### Does Share become a button too? (geo-common decision 4)
**Context**: Share opened the same copy from a `<span>` that Tab never reached.

**Decision**: Yes, Doug, 2026-11-18, for all five Geo apps, after Teale Fristoe's review of HURR-70. Beyond the story. Reload followed on 2026-11-19, after Kiley Brown's review of the Geo branch builds.

---

### Does opening a dialog put focus on Close? (geo-common decision 7)
**Context**: react-modal focused the dialog's content `div`; focusing Close puts focus inside the element that carries the dialog's name.

**Decision**: Yes, Doug, 2026-11-18, for all five Geo apps, after WM-67's and FM-5's self-reviews. Beyond the story. Done with `autoFocus`; Seismic has no backdrop click to test (R16).

---

### Keep `box-sizing: border-box` although it narrows the dialogs?
**Context**: `border-box` makes the height cap include the padding, and also takes the 2.4em side padding out of the existing width caps.
**Options considered**:
- A) Keep `border-box` and accept 38.4px narrower dialogs.
- B) Drop it and use `max-height: calc(100vh - 40px - 1em)`, a second copy of the padding value in another file that no test can check.

**Decision**: A, Doug, 2026-11-18.

---

### Test with react-dom's test utilities or add Testing Library?
**Options considered**:
- A) `react-dom/test-utils` (`act`, `Simulate`) and DOM queries.
- B) Add `@testing-library/react`.

**Decision**: A. Testing Library would be a dependency and lockfile change for a two-point story, and every R17 assertion works without it.

---

### Where do the new files go?
**Options considered**:
- A) Flat: `js/components/`, `js/license-constants.js`, styles in `css/`.
- B) A `js/components/license/` folder as in HURR-70.

**Decision**: A, matching the repo's layout.

---

### Ship the Jest config with the first tests or separately?
**Decision**: With the license-copy step that first needs it. It changes no dependency, and a config commit with no test could not show it works.

---

### Scope `.visually-hidden` under the link's own class
**Context**: The README asks that each component's styles be scoped to its root class.

**Decision**: `ExternalLink` renders `<a className='external-link'>`, and the hidden-text rule sits under `.external-link`.

---

### Check for Share's old 2016 block in Share only
**Context**: About never had the 2016 block, so checking its absence there could not fail.

**Decision**: One Share-only test that also asserts the copy is present; putting the old block back fails it.
