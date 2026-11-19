# Terms of Use Link and Licensing Copy for Seismic Explorer

**Jira**: https://concord-consortium.atlassian.net/browse/SE-4
**Repo**: https://github.com/concord-consortium/seismic-explorer
**Implementation Spec**: [implementation.md](implementation.md)
**Status**: **In Development**

## Overview

Seismic Explorer's About and Share dialogs get the license and Terms of Use copy approved for CODAP's About dialog, replacing the 2016 copyright block in Share, so that every Geo app states the same thing: the source is MIT, and use of the hosted site is governed by Concord's Terms of Use. The About and Share controls and the dialogs' close control become real buttons, and the dialogs open with focus on their close button, close on Esc, are named by their titles, and fit the viewport.

## Project Owner Overview

Concord published non-commercial Terms of Use for everything served from its servers, and the Geo simulations are widely embedded in commercial curricula. Seismic Explorer does not yet mention the Terms of Use anywhere; its only license text is a 2016 MIT block in the Share dialog. After this story, both the About and Share dialogs end with the same short statement the other Geo apps and CODAP show, with working links to the MIT License, the Terms of Use, concord.org/licensing and the licensing email, and the current year in the copyright line.

The dialogs that carry the copy also become usable from the keyboard and by screen-reader users: About and Share can be reached with Tab and opened with Enter, Esc closes the dialog, the close control is a named button that takes focus when the dialog opens, each dialog announces its title, and a dialog that grows taller than a small embed (such as the 900 × 600 iframe the Share dialog suggests) scrolls instead of losing its title off the top of the screen. Kiley reviews the result on the branch deploy before merge.

## Background

SE-4 is the Seismic Explorer story in a set of five matching Geo stories (HURR-70, SE-4, TE-10, WM-67, FM-5). The decisions shared by all five are in the global oob doc `streams/terms-of-use/geo-common.md` (decisions 1 to 11). Doug took all but four; Kiley Brown decided 3, 5, 6 and 9 on 2026-11-17. This spec applies them to Seismic rather than re-deciding them. HURR-70's branch (hurricane-model, PR #163) is the first of the five implemented to that doc and is the worked example for the component split and the tests.

What the code has today (master):

- `js/components/top-controls.js` renders the top bar: Reload (`<span>` with an icon), and About and Share as `<span className='top-link right' onClick>`, each opening a `BasicModal` holding `AboutModalContent` or `ShareModalContent`.
- `js/components/basic-modal.js` wraps react-modal 3.8.1. It passes no `onRequestClose`, so Esc does nothing; its close control is `<i onClick className='close-icon fa fa-close' data-test='close-modal'>`, which is not focusable and has no name; and `top-controls.js` passes no `contentLabel`, so the dialog's `aria-label` is empty. react-modal already gives `role="dialog"`, moves focus into the dialog, traps Tab inside it, hides `#app` from assistive technology while open, and returns focus to the element focused before opening. Its overlay has `pointer-events: none`, so the map stays usable while a dialog is open. Checked in Jest and in the browser.
- `js/components/about-modal-content.js` has the title "About: Seismic Explorer", six descriptive paragraphs and data credits, and no copyright block.
- `js/components/share-modal-content.js` has the title "Share: Seismic Explorer", the link and embed textareas, and a hardcoded `<div className='copyright'>` reading "Copyright © 2016 The Concord Consortium. All rights reserved. The software is licensed under the MIT license. Please provide attribution…", styled by `.copyright` in `css/share-modal-content.less` (0.65em).
- `config.showUserInterface` (default true, overridable by URL parameter in `js/config.js`) makes `js/containers/app.js` skip `<TopControls />`, which removes every route to About.
- Seismic loads normally in a plain iframe (checked with the Share dialog's own 900 × 600 embed snippet): unlike Hurricane, it does not wait for an Activity Player message, so the top bar and About are there when embedded.
- `LICENSE` is MIT, and the default branch is `master`.

## Requirements

### License copy

- **R1. One license-copy component** renders the copy below and is the last block of both the About dialog and the Share dialog. In About it follows the existing paragraphs; in Share it replaces the 2016 `copyright` block. The orphaned `.copyright` rule in `css/share-modal-content.less` is deleted (decision 5).
- **R2. Copy, word for word** (geo-common "Copy"; CODAP `V3.AboutDialog.*` with the product and host swapped), in this order:
  - Paragraph 1: **Seismic Explorer is free, open-source software.** The Seismic Explorer source code is released under the [MIT License], so you’re welcome to use, modify, and build on it.
  - Paragraph 2: **Your use of Seismic Explorer at seismic-explorer.concord.org** is governed by our [Terms of Use]. The hosted version is free for non-commercial use; commercial use requires a separate written agreement. For more information, visit [concord.org/licensing] or contact [licensing@concord.org].
  - Copyright line, in the existing small copyright style (0.65em, as the Share block uses today): `© {current year} The Concord Consortium, Inc.`
  - The leading phrase of each paragraph is bold. "you’re" uses the curly apostrophe U+2019 (decision 1).
- **R3. Year** is `new Date().getFullYear()` at render time. No range and no build-time constant (decision 1).
- **R4. The old text is gone** from Share: no "Copyright © 2016", "All rights reserved", "opensource.org/licenses/MIT" or "Please provide attribution" (decision 5).

### Links

- **R5. Link targets**, kept in one constants module rather than inline in JSX:
  - MIT License: `https://github.com/concord-consortium/seismic-explorer/blob/master/LICENSE`
  - Terms of Use: `https://concord.org/terms-of-use/`
  - concord.org/licensing: `https://concord.org/licensing`
  - licensing@concord.org: `mailto:licensing@concord.org`
- **R6. Web links open in a new tab**: the three web links have `target="_blank"` and `rel="noopener noreferrer"` (decision 2), and append visually hidden text " (opens in a new tab)" so their accessible name is the visible text plus the hint. The mailto link is a plain same-tab `<a>` with no hint.
- **R7. Links in the copy are underlined**, in both dialogs.

### Reachability

- **R8. Hidden user interface is unchanged**: with `showUserInterface=false` the app renders exactly as today, with no corner link, About control or other addition (decision 3, Kiley: "Don't add anything").
- **R9. No other new surface**: no top-bar Terms of Use item, no heading over the copy, no links row (decision 6; Kiley confirmed the link inside the dialogs counts as visible).
- **R10. About and Share are `<button type="button">`s**, each looking as its current text control does (15px, `#777`, `#111` on hover, same position and spacing; no default button border, background or padding), keeping `data-test="about"` and `data-test="share"` and the `AboutDialogOpened` and `ShareDialogOpened` logs. Each shows a visible focus indicator on keyboard focus whose outline fits inside the 22px top bar with no side clipped. Reload stays as it is. (geo-common decision 4: [applies story] for About; [beyond story] for Share, which the story does not ask for, decided by Doug on 2026-11-18 after Teale Fristoe's review of HURR-70 asked for Share to be keyboard reachable.)

### Dialog behavior

These apply to both About and Share, since both use `BasicModal` (decision 7).

- **R11. Esc closes the dialog** while focus is inside it. react-modal listens for Esc on the dialog itself, and the overlay deliberately lets clicks reach the map (R16), so after a click on the map Esc goes to the map instead; that stays as is.
- **R12. The close control is a `<button type="button">` named "Close"**, keeping `data-test="close-modal"` and today's look (the Font Awesome × at the top right, `#777`, `#000` on hover), with the icon hidden from assistive technology and a visible focus indicator on keyboard focus.
- **R13. Each dialog is named by its title**: "About: Seismic Explorer" and "Share: Seismic Explorer".
- **R14. Focus goes to Close, stays in the dialog and comes back**: opening About or Share puts focus on its Close button, inside the element that carries the dialog's name, so a screen reader announces the title. Close shows its focus ring when the dialog was opened by keyboard and not when it was opened by mouse. Tab stays inside the open dialog (react-modal's existing trap), and closing the dialog by Esc or Close returns focus to the button that opened it. (geo-common decision 7: focus on Close is [beyond story].)
- **R15. The dialog fits the viewport**: its height is capped at `calc(100vh - 40px)`, and it scrolls only when its content is taller than that, so its title stays on screen in small frames while larger viewports show it whole, as today. With the new copy the About dialog would otherwise be cut off at the top in the 900 × 600 iframe the Share dialog's embed code uses.

### Unchanged

- **R16.** About's descriptive paragraphs and data credits, and their links, are unchanged. The splash screen is unchanged (decision 11). The overlay stays non-blocking (the map remains usable while a dialog is open) and clicking outside still does not close the dialog.

### Tests

- **R17.** Unit tests render the real About and Share content (not the copy component alone) and cover, for each: the four hrefs, asserted as literal URLs rather than the constants module's values; `target` and `rel` on the three web links and their absence on the mailto link; each web link's accessible name including the " (opens in a new tab)" hint, and the mailto link's name as its text alone; the R2 copy word for word and in order, including the curly apostrophe and the two bold lead-in phrases; that the copy is the dialog's last block (R1); the copyright line, with the clock pinned to a fixed date and the year asserted as a literal, under two different pinned years so neither a year computed as the code computes it nor a hardcoded year passes; and that the R4 text is absent. Tests also cover, through the real top bar and for both About and Share: each is a focusable `type="button"` button that opens its dialog; the dialog is named by its title (R13); focus is on Close after the button is focused and activated, as Enter does (R14); Esc and the Close button each close it (R11, R12); and focus returns to the button that opened it (R14). Enter itself is part of the browser check: jsdom 11 does not turn Enter on a button into a click, Cypress 13's `type('{enter}')` does not activate a native button, and a key press sent through the Chrome DevTools protocol from Cypress did not reach the app either, so an automated Enter test would need a new dependency such as cypress-real-events. R10's and R12's appearance, their focus indicators, and R15 are layout and are checked in the browser rather than in Jest.

### CI

- **R18. CI's Cypress job runs on GitHub's current runner.** `.github/workflows/ci.yml` uses `cypress-io/github-action@v5`, which has the same dev-server wait (got 11.8.6 ping) as the v6 that failed for HURR-70 on runner 2.338 and is listed as unsupported by the action's maintainers; it moves to `@v7`, in a commit of its own.

### Review

- **R19.** Kiley reviews the result on the branch deploy before merge (story acceptance criterion). CI's S3 deploy publishes each branch at `https://models-resources.concord.org/seismic-explorer/branch/<name>/index.html`, and `s3-deploy-action` strips a leading Jira key from the branch name (DEV-185's branch is at `branch/oidc-auth-for-s3-deployment/`), so this story's branch is at `https://models-resources.concord.org/seismic-explorer/branch/add-terms-of-use-link/index.html`. The review covers that URL standalone and embedded, for the "visible both standalone and embedded" criterion: the Share dialog's embed code (a 900 × 600 iframe) pasted into any HTML page shows the full top bar, since Seismic needs no Activity Player handshake to load. In both, the About and Share dialogs each end with the copy (R1); its wording matches CODAP's About dialog (codap#2758) apart from the product and host (R2); MIT License, Terms of Use and concord.org/licensing each open the right page in a new tab, and licensing@concord.org opens a new email (R5, R6).

## Technical Notes

- **Reference implementation**: CODAP's About dialog (CODAP-1595 / codap#2758): strings `V3.AboutDialog.*` in `v3/src/utilities/translation/lang/en-US.json5`, links in `about-dialog-constants.ts`, new-tab links in `components/common/external-link.tsx` with hint `V3.ExternalLink.opensInNewTab`. HURR-70's `src/components/license/` (`license-constants.ts`, `external-link.tsx`, `license-copy.tsx`, `license-copy.test.tsx`) is the Geo worked example; Seismic is plain JS with Less and global class names, so it follows the shape, not the code.
- **No shared package**: the Geo apps share no component library (geo-common "No shared package").
- **Stack**: React 16.8.3, react-modal 3.8.1, Less (global classes, imported for side effects), Font Awesome 4, `standard` 12 for lint, Jest 24 with jsdom 11. The only existing Jest test is `js/reducers/index.test.js`; there is no component test setup, no Testing Library and no Jest config. A throwaway test confirmed that the real `TopControls` renders under Jest with `react-dom/test-utils` (`act`, `Simulate`) once `.less` imports are mapped to a stub and an `#app` element exists before `basic-modal.js` is imported (it calls `Modal.setAppElement('#app')` at import). Jest 24 has no `setSystemTime`, so pinning the year means replacing `global.Date` for the test.
- **react-modal**: Esc needs only `onRequestClose` (`shouldCloseOnEsc` defaults to true); the name can come from `contentLabel` or `aria={{ labelledby }}`; focus return (`shouldReturnFocusAfterClose`) is on by default, so R14 follows once About can hold focus. All three confirmed with a throwaway Jest test. On open, react-modal records the focused element for focus return before it renders the content, then focuses the content `div` unless focus is already inside it, so `autoFocus` on Close takes effect and focus return still goes to the opener (checked in Jest, Chromium and Firefox).
- **Dialog height**: `.basic-modal` is `position: absolute; top: 50%; transform: translate(-50%, -50%); overflow: auto` with no `max-height`. Measured in Chromium at 900 × 600: About is already 538px tall; with copy of the new length appended it is 763px and its top sits at -89px, title and close control off screen and unreachable. With the real copy injected it is 706px tall with its top at -61px. `box-sizing: border-box; max-height: calc(100vh - 40px)` on `.basic-modal` puts it at 13 to 573px with the rest scrolling; at 1024 × 768 (69 to 699px) and 1280 × 800 (104 to 696px) it is shorter than the cap and does not scroll (checked in the browser). In a 900 × 600 browser window the page already has a horizontal scrollbar (its scroll width is 949px with no dialog open), which `100vh` counts, so the margins there are 13px above and 27px below (the scrollbar's height included) rather than 20px each. In the Share dialog's own embed (a 900 × 600 iframe with `scrolling="no"`) the page has no scrollbar, so About sits at 20 to 580px, and the mouse wheel, PageDown and the arrow keys (focus starts on Close) scroll it to the copy; Share is 76 to 524px and does not scroll. The × is inside the scrolling box, so it scrolls out of view with the content; Esc and Tab still reach it. `border-box` also applies to the existing `max-width` caps, so both dialogs are 38.4px narrower than today (About 668.4 to 630px and Share 443.4 to 405px at 900 × 600), with the Share textareas narrowing with them; this was accepted over repeating the padding value in the height cap.
- **Top bar layout**: About and Share float right, About first in the DOM, so About is the rightmost item and Tab reaches About before Share. A `<button>` with the `top-link right` classes and `padding: 0; border: 0; background: none; font: inherit; line-height: inherit` measured the same as today's span in Chromium at 900px wide, 15px Lato, `#777`: About at (841, 2, 40.9 × 18) and Share at (785.3, 2, 37.8 × 18). The top bar is 22px tall with both buttons 2px from the top, so a focus outline with a 2px offset is clipped at the viewport's top edge; with `outline-offset: 0` the 2px ring runs from 0 to 22px and is whole on all four sides for both buttons (checked by screenshot). Less 4 passes `:focus-visible` through unchanged.
- **Cypress**: `cypress/e2e/basic/smoke.cy.js` opens About and Share by `data-test` and closes them with `[data-test=close-modal]`; R10 and R12 keep these attributes, so the smoke tests need no change.
- **CI**: v5 runs on `node16`, v6 on `node20` and v7 on `node24`; v5 and v6 ship the same `src/ping.js` and got 11.8.6, and the HURR-70 failure was that ping ("Socket closed before the connection was established") on runner 2.338.2 with the action forced onto Node 24. A local run of v5's ping under Node 16, 20 and 24 against a server that starts late did not reproduce it, so the evidence is HURR-70's run, not a local repro. seismic-explorer's last CI run was 2026-09-11, before that runner. v7's README supports Node 22 to 26 for the action; the app's install and dev server still run on the runner's own Node, as today.
- **Logging**: no new log events.

## Out of Scope

- From the story: a third-party library acknowledgements list, usage tracking, changing the software license, localizing the legal copy, and a cookie banner.
- Converting Reload to a button (decision 4 covers About and Share only).
- Existing credit links in the About dialog, including their missing `rel` (geo-common "How links open").
- Embeds that set `showUserInterface=false`: no corner Terms of Use link or About control, so the About dialog and the copy stay unreachable there, as before (decision 3).
- The splash screen (decision 11).
- The top-bar text color: `#777` on white measures 4.48:1, just under WCAG AA's 4.5:1 for 15px text. R10 keeps the current look; changing the bar's colors is beyond this story.
- Other CI modernization (`actions/checkout@v3`, `actions/setup-node@v3`, Node 16 in the build job): not needed to run, and not part of this story.
- The other four Geo apps and Boreal Forest Fire Explorer.

## Open Questions

### RESOLVED: Judgment call: label the dialogs with `contentLabel` or `aria-labelledby`?
**Context**: geo-common decision 7 allows either for Seismic.

**Options considered**:
- A) `aria-labelledby` pointing at each content component's title `<div>`, so the name is the visible title and the title text has one source.
- B) Pass `contentLabel="About: Seismic Explorer"` from `top-controls.js`, which repeats each title string next to the one in the content component.

**Decision**: A. The visible title stays the only source of the name. R13 states the result, not the mechanism.

---

### RESOLVED: Judgment call: make the dialog fit the viewport in this story?
**Context**: The story does not mention dialog height, but the copy it adds is what pushes About off screen in the app's own embed size.

**Options considered**:
- A) Add R15: cap the dialog at the viewport and let it scroll.
- B) Leave it, and let the About title and close control sit above the iframe's top edge in 900 × 600 embeds.

**Decision**: A, confirmed by Doug on 2026-11-18, with the cap in `vh` so only small viewports scroll and with 40px of margin rather than 20px (R15). Story requirement 4 asks for the link to stay reachable embedded; B would make the copy this story adds the reason the dialog breaks there. It is a CSS rule in `basic-modal.less`.

---

### RESOLVED: Judgment call: upgrade the Cypress action in this story?
**Context**: The upgrade is not in the story, and it could not be reproduced locally.

**Options considered**:
- A) Move to `cypress-io/github-action@v7` in its own commit (R18).
- B) Push with v5 and upgrade only if CI fails.

**Decision**: A, confirmed by Doug on 2026-11-18. v5 shares the failing ping code and dependency with v6, runs on an older Node runtime than v6, and is listed as unsupported. A failed first CI run would cost a round trip before review; HURR-70 already made the same one-line move and went green.

---

### RESOLVED: Does Share become a button too? (geo-common decision 4)
**Context**: The story asks for keyboard-reachable links, which About as a button meets; Share opens the same copy from a `<span>` that Tab never reaches.

**Decision**: Yes. Doug on 2026-11-18, for all five Geo apps, after Teale Fristoe's review of HURR-70 asked for Share to be keyboard reachable. [beyond story]. R10, R14 and R17 cover Share as they cover About; Reload is not part of the decision.

---

### RESOLVED: Does opening a dialog put focus on Close? (geo-common decision 7)
**Context**: react-modal focuses the dialog's content `div` on open. A rule added to decision 7 has every Geo app focus Close instead, so focus lands inside the element that carries the dialog's name.

**Decision**: Yes. Doug on 2026-11-18, for all five Geo apps, after WM-67's and FM-5's self-reviews. [beyond story]. R14 and R17 cover it. Seismic has no backdrop click to test, since clicking outside does not close the dialog (R16).

## Self-Review

Roles: WCAG accessibility, QA engineer, senior engineer, and Kiley as acceptance reviewer. Each finding below was checked against the code before it was written down.

### WCAG Accessibility Expert

#### RESOLVED: Esc cannot close a dialog once focus has left it
react-modal 3.8.1 handles Esc in the dialog content's `onKeyDown` (`ModalPortal.js`), and Seismic's overlay has `pointer-events: none`, so a click on the map moves focus out of the dialog and Esc no longer reaches it. R11 now says Esc works while focus is inside the dialog, and why the rest stays as is (R16 keeps the map usable).

#### RESOLVED: Top-bar text contrast is just under AA
`#777` on white is 4.48:1 against AA's 4.5:1 for 15px text. It predates the story and applies to Reload and Share too; R10 keeps the look and Out of Scope now records it.

---

### QA Engineer

#### RESOLVED: Layout requirements had no stated check
R10's and R12's appearance and focus indicators, and R15's height cap, cannot be asserted in jsdom, which does no layout. R17 now says they are checked in the browser.

---

### Kiley (acceptance reviewer)

#### RESOLVED: The embedded review had no concrete setup
R19 said "inside an iframe" without saying how. Checked with the dev server: the Share dialog's own embed code in a plain HTML page loads the app with its top bar and About, so R19 now names that as the embedded check.

---

### Round 2

Roles: screen-reader user walking both dialogs, a student or teacher in the 900 × 600 embed, a reader of the specs a year from now, the implementer following the plan commit by commit, and a security reviewer of the links. Implementation.md holds this round's other entries.

### Student or teacher in the 900 × 600 embed

#### RESOLVED: R15's measurements were taken in a window, not in the embed
Technical Notes gave 13 to 573px for About at 900 × 600, which is a browser window with a horizontal scrollbar. Loaded through the Share dialog's own iframe snippet (`scrolling="no"`), About is 20 to 580px and scrolls to the copy by mouse wheel, PageDown and arrow keys, and Share is 76 to 524px. Dialog height now gives both.

---

### Reader of the specs a year from now

#### RESOLVED: Two decisions were recorded twice, once under the wrong heading
The stage 8 decisions on R15 and R18 sat at the end of Self-Review, under "Kiley (acceptance reviewer)" at the level of a role heading, although Doug made them, and they repeated the judgment calls in Open Questions. Doug's confirmation (and the 40px margin) now lives in those two judgment calls, and the duplicates are gone.

### Round 3

Roles: a PR reviewer, a cross-app reviewer against HURR-70, a cross-browser and visual reviewer, and Kiley as acceptance reviewer. Implementation.md holds this round's other entries.

### Kiley (acceptance reviewer)

#### RESOLVED: R19 covered only one of the acceptance criteria
R19 said where to review and how to embed, which serves "visible both standalone and embedded", but not what to check for the copy and wording criteria. It now lists them: both dialogs end with the copy, the wording matches codap#2758, and each link goes where it should. The four targets resolve today (HTTP 200 for the LICENSE file, the Terms of Use page and concord.org/licensing).
