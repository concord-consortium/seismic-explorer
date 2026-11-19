# Implementation Plan: Terms of Use Link and Licensing Copy for Seismic Explorer

**Jira**: https://concord-consortium.atlassian.net/browse/SE-4
**Requirements Spec**: [requirements.md](requirements.md)
**Status**: **In Development**

## Implementation Plan

Three steps, each its own commit: the CI action upgrade (R18), the license copy in both dialogs (R1 to R7, R17's copy tests), and the dialog and About-button fixes (R10 to R15, R17's top-bar tests). R8, R9 and R16 need no code: nothing reads `showUserInterface` differently, no surface is added, and the about text, splash screen and overlay settings are untouched. R19 is Kiley's review of the branch deploy.

All code below was built on master as throwaway code and run before this plan was written (see Verification). Run Node 16 (as CI's build job does): `npm ci --legacy-peer-deps`, `npx jest`, `npx standard js`.

### Move CI's Cypress action to v7

**Summary**: R18. One line in `.github/workflows/ci.yml`, alone in its commit so a CI problem bisects to it and not to the app change.

**Files affected**:
- `.github/workflows/ci.yml`: `cypress-io/github-action@v5` to `@v7`.

**Estimated diff size**: 1 line.

```yaml
      - uses: cypress-io/github-action@v7
        with:
          install-command: npm ci --legacy-peer-deps
          browser: chrome
          start: npm start
          wait-on: 'http://localhost:8080'
```

No other input changes: `install-command`, `browser`, `start` and `wait-on` keep their meaning in v7, whose only breaking change is the action's own Node 24 runtime. The job has no `actions/setup-node`, so `npm ci` and the dev server run on the runner's default Node, as they do today.

---

### Show the license copy in About and Share

**Summary**: R1 to R7 and the copy half of R17. Adds the link constants, an `ExternalLink` component, the `LicenseCopy` component and its styles; renders `LicenseCopy` last in both dialogs; deletes Share's 2016 block and its `.copyright` rule. Also adds the Jest config that lets component tests import modules that import Less, and a small date-pinning helper, because these are the repo's first component tests.

**Files affected**:
- `js/license-constants.js` (new): the four link targets (R5).
- `js/components/external-link.js` (new) and `css/external-link.less` (new): new-tab link with the hidden hint (R6).
- `js/components/license-copy.js` (new) and `css/license-copy.less` (new): the copy (R2, R3, R7).
- `js/components/about-modal-content.js`: render `<LicenseCopy />` last.
- `js/components/share-modal-content.js`: delete the 2016 `copyright` div, render `<LicenseCopy />` last (R4).
- `css/share-modal-content.less`: delete the orphaned `.copyright` rule.
- `package.json`: `jest.moduleNameMapper` for `.less`/`.css`.
- `js/test/style-stub.js` (new), `js/test/pin-date.js` (new): test helpers.
- `js/components/license-copy.test.js` (new): R17's copy tests over both dialogs.

**Estimated diff size**: ~195 lines (98 of them the test).

`js/license-constants.js`:

```js
export const MIT_LICENSE_URL = 'https://github.com/concord-consortium/seismic-explorer/blob/master/LICENSE'
export const TERMS_OF_USE_URL = 'https://concord.org/terms-of-use/'
export const LICENSING_URL = 'https://concord.org/licensing'
export const LICENSING_EMAIL = 'licensing@concord.org'
```

`js/components/external-link.js`:

```js
import React from 'react'

import '../../css/external-link.less'

export default function ExternalLink ({ href, children }) {
  return (
    <a className='external-link' href={href} target='_blank' rel='noopener noreferrer'>
      {children}
      <span className='visually-hidden'> (opens in a new tab)</span>
    </a>
  )
}
```

It takes only `href` and `children`, so no caller can drop `rel` or `target`.

`css/external-link.less`:

```less
.external-link {
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
```

The class is scoped under the link's own `external-link` class, as the README's "CSS styles" section asks of every component's styles; every top-level class in `css/` is a component's root class.

`js/components/license-copy.js`:

```js
import React from 'react'
import ExternalLink from './external-link'
import { LICENSING_EMAIL, LICENSING_URL, MIT_LICENSE_URL, TERMS_OF_USE_URL } from '../license-constants'

import '../../css/license-copy.less'

export default function LicenseCopy () {
  return (
    <div className='license-copy' data-test='license-copy'>
      <p>
        <strong>Seismic Explorer is free, open-source software.</strong> The Seismic Explorer source code is
        released under the <ExternalLink href={MIT_LICENSE_URL}>MIT License</ExternalLink>, so you’re welcome to use,
        modify, and build on it.
      </p>
      <p>
        <strong>Your use of Seismic Explorer at seismic-explorer.concord.org</strong> is governed by
        our <ExternalLink href={TERMS_OF_USE_URL}>Terms of Use</ExternalLink>. The hosted version is free for
        non-commercial use; commercial use requires a separate written agreement. For more information,
        visit <ExternalLink href={LICENSING_URL}>concord.org/licensing</ExternalLink> or
        contact <a href={`mailto:${LICENSING_EMAIL}`}>{LICENSING_EMAIL}</a>.
      </p>
      <p className='copyright'>© {new Date().getFullYear()} The Concord Consortium, Inc.</p>
    </div>
  )
}
```

`css/license-copy.less`:

```less
.license-copy {
  p {
    margin-top: 0.5em;
  }

  a {
    text-decoration: underline;
  }

  .copyright {
    font-size: 0.65em;
  }
}
```

`p` gets only a top margin: Seismic's base styles zero paragraph margins, so without it the copy's paragraphs run together in Share; in About it collapses into `.about-modal-content p`'s existing 1em bottom margin, so About's spacing is unchanged. 0.65em is the old Share block's size. The links are underlined explicitly because Share had no rule of its own for them.

`js/components/about-modal-content.js`: import `LicenseCopy` from `./license-copy` after the React import, and render it as the last child of the root `.about-modal-content` div, after the `<div>` holding the paragraphs:

```js
          </p>
        </div>
        <LicenseCopy />
      </div>
```

`js/components/share-modal-content.js`: import `LicenseCopy` the same way, delete the `<div className='copyright'>…</div>` block (lines 23 to 27 on master), and render `<LicenseCopy />` as the last child of the root `.share-modal-content` div, after the `<div>` holding the textareas.

`css/share-modal-content.less`: delete the `.copyright { margin-top: 0.5em; font-size: 0.65em; }` block; nothing else uses the class there.

`package.json`, a new top-level `jest` key beside `standard`:

```json
  "jest": {
    "moduleNameMapper": {
      "\\.(less|css)$": "<rootDir>/js/test/style-stub.js"
    }
  },
```

`js/test/style-stub.js`:

```js
module.exports = {}
```

`js/test/pin-date.js` (Jest 24 has no `setSystemTime`):

```js
const RealDate = Date

// Makes `new Date()` with no arguments return the given moment; returns a function that undoes it.
export default function pinDate (isoString) {
  global.Date = class extends RealDate {
    constructor (...args) {
      if (args.length) return new RealDate(...args)
      return new RealDate(isoString)
    }
  }
  return () => { global.Date = RealDate }
}
```

`js/components/license-copy.test.js`:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import AboutModalContent from './about-modal-content'
import ShareModalContent from './share-modal-content'
import pinDate from '../test/pin-date'

const webLinks = [
  ['MIT License', 'https://github.com/concord-consortium/seismic-explorer/blob/master/LICENSE'],
  ['Terms of Use', 'https://concord.org/terms-of-use/'],
  ['concord.org/licensing', 'https://concord.org/licensing']
]

const normalize = text => text.replace(/\s+/g, ' ').trim()

describe.each([
  ['About', AboutModalContent],
  ['Share', ShareModalContent]
])('license copy in the %s dialog', (_name, Content) => {
  let container, unpin

  const renderContent = () => {
    act(() => { ReactDOM.render(<Content />, container) })
    return container.querySelector('[data-test="license-copy"]')
  }

  beforeEach(() => {
    unpin = pinDate('2031-03-04T12:00:00Z')
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    container.remove()
    unpin()
  })

  it('links the MIT License, Terms of Use and licensing page in a new tab', () => {
    const links = Array.from(renderContent().querySelectorAll('a'))
    expect(links).toHaveLength(4)
    webLinks.forEach(([text, href]) => {
      const link = links.find(a => a.getAttribute('href') === href)
      expect(link).toBeDefined()
      // A link with no aria-label is named by its text, hidden hint included.
      expect(link.hasAttribute('aria-label')).toBe(false)
      expect(normalize(link.textContent)).toBe(`${text} (opens in a new tab)`)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    })
  })

  it('links the licensing email in the same tab', () => {
    const mail = renderContent().querySelector('a[href="mailto:licensing@concord.org"]')
    expect(mail).not.toBeNull()
    expect(mail.textContent).toBe('licensing@concord.org')
    expect(mail.hasAttribute('target')).toBe(false)
    expect(mail.hasAttribute('rel')).toBe(false)
  })

  it('shows the approved copy and the current year', () => {
    const copy = renderContent()
    expect(Array.from(copy.querySelectorAll('p')).map(p => normalize(p.textContent))).toEqual([
      'Seismic Explorer is free, open-source software. The Seismic Explorer source code is released under ' +
      'the MIT License (opens in a new tab), so you’re welcome to use, modify, and build on it.',
      'Your use of Seismic Explorer at seismic-explorer.concord.org is governed by our Terms of Use (opens in a ' +
      'new tab). The hosted version is free for non-commercial use; commercial use requires a separate written ' +
      'agreement. For more information, visit concord.org/licensing (opens in a new tab) or contact ' +
      'licensing@concord.org.',
      '© 2031 The Concord Consortium, Inc.'
    ])
    expect(Array.from(copy.querySelectorAll('strong')).map(s => s.textContent)).toEqual([
      'Seismic Explorer is free, open-source software.',
      'Your use of Seismic Explorer at seismic-explorer.concord.org'
    ])
  })

  it('computes the copyright year when it renders', () => {
    unpin()
    unpin = pinDate('2047-11-20T12:00:00Z')
    expect(renderContent().textContent).toContain('© 2047 The Concord Consortium, Inc.')
  })

  it('is the last block in the dialog', () => {
    const copy = renderContent()
    expect(copy.nextElementSibling).toBeNull()
    expect(copy.parentElement).toBe(container.firstElementChild)
  })
})

it('drops the old 2016 copyright block from the Share dialog', () => {
  const container = document.createElement('div')
  act(() => { ReactDOM.render(<ShareModalContent />, container) })
  expect(container.querySelector('[data-test="license-copy"]')).not.toBeNull()
  expect(container.textContent).not.toMatch(/Copyright © 2016|All rights reserved|Please provide attribution/)
  expect(container.querySelector('a[href*="opensource.org"]')).toBeNull()
  ReactDOM.unmountComponentAtNode(container)
})
```

The 2016 block was only ever in Share, so its absence is checked there alone; run for About too, the check could not fail.

The accessible-name assertion uses the link's text: with no `aria-label` or `aria-labelledby`, a link's name is its text content, the visually hidden hint included. The repo has no Testing Library, and adding it for one assertion would be a dependency change (React 16.8.3, jsdom 11).

---

### Make the dialogs and About keyboard- and screen-reader-ready

**Summary**: R10 to R15 and the top-bar half of R17. `BasicModal` closes on Esc, its close control becomes a named button that takes focus when the dialog opens, it takes the id of the title that names it, and it fits the viewport. About and Share become buttons. Both dialogs get this, since both use `BasicModal`.

**Files affected**:
- `js/components/basic-modal.js`: `onRequestClose`, `aria.labelledby`, close `<button>` with `autoFocus`; the unused `contentLabel` prop goes (no caller passes it).
- `js/components/about-modal-content.js`, `js/components/share-modal-content.js`: export a title id and put it on the title `<div>`.
- `js/components/top-controls.js`: About and Share as `<button>`s, pass `labelledBy` to each `BasicModal`.
- `css/top-controls.less`: button reset and focus ring for `.top-link`.
- `css/modal-style.less`: button reset and focus ring for `.close-icon`.
- `css/basic-modal.less`: `box-sizing: border-box; max-height: calc(100vh - 40px)` (R15).
- `js/components/top-controls.test.js` (new): R17's top-bar tests.

**Estimated diff size**: ~125 lines (73 of them the test).

`js/components/basic-modal.js`:

```js
import React, { PureComponent } from 'react'
import Modal from 'react-modal'

import '../../css/basic-modal.less'
import '../../css/modal-style.less'

Modal.setAppElement('#app')

export default class BasicModal extends PureComponent {
  render () {
    const { isOpen, close, children, className, labelledBy } = this.props

    return (
      <Modal shouldCloseOnOverlayClick={false} className={`modal-style basic-modal ${className}`}
        overlayClassName='basic-modal-overlay' isOpen={isOpen} onRequestClose={close} aria={{ labelledby: labelledBy }}>
        <button type='button' autoFocus onClick={close} className='close-icon' aria-label='Close' data-test='close-modal'>
          <i className='fa fa-close' aria-hidden='true' />
        </button>
        {children}
      </Modal>
    )
  }
}
```

react-modal's `shouldCloseOnEsc` defaults to true and calls `onRequestClose`; `shouldCloseOnOverlayClick={false}` stays, so a click outside still does nothing (R16). With no `contentLabel`, react-modal writes no `aria-label`, and `aria-labelledby` names the dialog.

`autoFocus` puts focus on Close when the dialog opens (R14, geo-common decision 7). It works with react-modal 3.8.1's own focus handling, without `onAfterOpen`. When `isOpen` turns true, react-modal first records the focused element, the opener, for focus return, and only then renders the content. React then focuses Close as it mounts. react-modal's own `focusContent()` runs next and does nothing, because focus is already inside the content. Without `autoFocus` it focuses the content `div` instead.

`js/components/about-modal-content.js`, above the class:

```js
export const ABOUT_TITLE_ID = 'about-modal-title'
```

and the title becomes `<div className='title' id={ABOUT_TITLE_ID}>About: Seismic Explorer</div>`. `js/components/share-modal-content.js` gets `export const SHARE_TITLE_ID = 'share-modal-title'` and `<div className='title' id={SHARE_TITLE_ID}>Share: Seismic Explorer</div>` the same way.

`js/components/top-controls.js`: import the ids with the content components,

```js
import ShareModalContent, { SHARE_TITLE_ID } from './share-modal-content'
import AboutModalContent, { ABOUT_TITLE_ID } from './about-modal-content'
```

and in `render`:

```js
        <button type='button' className='top-link right' onClick={this.openAboutModal} data-test='about'>About</button>
        <button type='button' className='top-link right' onClick={this.openShareModal} data-test='share'>Share</button>

        <BasicModal className='narrow' isOpen={shareModalOpen} close={this.closeShareModal} labelledBy={SHARE_TITLE_ID}>
          <ShareModalContent />
        </BasicModal>

        <BasicModal isOpen={aboutModalOpen} close={this.closeAboutModal} labelledBy={ABOUT_TITLE_ID}>
          <AboutModalContent />
        </BasicModal>
```

`css/top-controls.less`, inside `.top-controls`: the existing `.top-link` rule gains the `&:focus-visible` block, and `button.top-link` follows it:

```less
  .top-link {
    color: #777;
    cursor: pointer;

    &:hover {
      color: #111;
    }

    &:focus-visible {
      outline: 2px solid #111;
      outline-offset: 0;
    }
  }

  button.top-link {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    line-height: inherit;
  }
```

The offset is 0 because both buttons sit 2px below the viewport's top edge, which clips a ring drawn further out; at 0 the 2px ring runs from 0 to 22px, inside the 22px bar on all four sides. Share is unchanged in size by the reset: (785.3, 2, 37.8 × 18) at 900px wide, as its span measures.

`css/modal-style.less`, inside `.close-icon`: the button reset goes after the existing `float: right;`, and `&:focus-visible` after the existing `&:hover` (size, position, color and hover are unchanged):

```less
    float: right;
    padding: 0;
    border: 0;
    background: none;
    line-height: 1;
    &:hover {
      color: #000;
    }
    &:focus-visible {
      outline: 2px solid #000;
      outline-offset: 2px;
    }
```

`css/basic-modal.less`, in `.basic-modal` after `margin-right: -50%;`:

```less
  box-sizing: border-box;
  max-width: 70%;
  max-height: calc(100vh - 40px);
```

(`max-width: 70%` is the existing line.) `border-box` makes the cap include the modal's padding. It also applies to the existing `max-width` caps, so every dialog is 38.4px (2.4em of side padding) narrower than today: About 630px and Share 405px at 900 × 600, About 896px at 1280 × 800. `overflow: auto` is already set, so the dialog scrolls only when its content is taller than the cap, and larger viewports show it whole (R15).

`js/components/top-controls.test.js`:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'

jest.mock('../logger', () => jest.fn())

// basic-modal.js points react-modal at #app when it is imported, so #app has to exist first.
const app = document.createElement('div')
app.id = 'app'
document.body.appendChild(app)
const TopControls = require('./top-controls').default

const ESC = { key: 'Escape', keyCode: 27, which: 27 }

const dialog = () => document.querySelector('[role="dialog"]')
const dialogName = d => document.getElementById(d.getAttribute('aria-labelledby')).textContent

describe.each([
  ['About', 'about', 'About: Seismic Explorer'],
  ['Share', 'share', 'Share: Seismic Explorer']
])('the %s button', (_name, testId, title) => {
  beforeEach(() => {
    act(() => { ReactDOM.render(<TopControls />, app) })
  })

  afterEach(() => {
    act(() => { ReactDOM.unmountComponentAtNode(app) })
  })

  const button = () => app.querySelector(`[data-test="${testId}"]`)

  const open = () => {
    button().focus()
    act(() => { Simulate.click(button()) })
  }

  it('is a button that can take keyboard focus', () => {
    expect(button().tagName).toBe('BUTTON')
    expect(button().getAttribute('type')).toBe('button')
    button().focus()
    expect(document.activeElement).toBe(button())
  })

  it('opens a dialog named by its title', () => {
    open()
    expect(dialog().hasAttribute('aria-label')).toBe(false)
    expect(dialogName(dialog())).toBe(title)
  })

  it('opens with focus on its Close button', () => {
    open()
    expect(document.activeElement).toBe(dialog().querySelector('[data-test="close-modal"]'))
  })

  it('closes its dialog on Esc and gets focus back', () => {
    open()
    act(() => { Simulate.keyDown(dialog(), ESC) })
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(button())
  })

  it('closes its dialog with a Close button and gets focus back', () => {
    open()
    const close = dialog().querySelector('[data-test="close-modal"]')
    expect(close.tagName).toBe('BUTTON')
    expect(close.getAttribute('type')).toBe('button')
    expect(close.getAttribute('aria-label')).toBe('Close')
    expect(close.querySelector('i').getAttribute('aria-hidden')).toBe('true')
    act(() => { Simulate.click(close) })
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(button())
  })
})
```

`require` after creating `#app` is deliberate: an `import` would be hoisted above it, and `Modal.setAppElement('#app')` throws when no element matches. The logger is mocked so tests send no analytics and print no log lines. `describe.each` runs the same five tests for About and Share. "Opens with the keyboard" is tested as a focusable native `type="button"` plus click, so the focus-on-Close test opens the dialog the way Enter does on a focused button: focus on the opener, then a click. Enter itself is in the browser check: jsdom 11 does not turn Enter on a focused `<button>` into a click, Cypress 13's `type('{enter}')` does not activate a native button, and a key press sent from Cypress through the Chrome DevTools protocol (`Input.dispatchKeyEvent`) did not open the dialog in Electron or Chrome. An automated Enter test would need a new dependency such as cypress-real-events.

## Verification

Run on master with all three steps applied as throwaway code, then removed:

- `npx jest`: 3 suites, 22 tests pass (the existing reducer test, 11 copy tests, 10 top-bar tests: five each for About and Share).
- `npx standard js`: clean. `npm run lint:test` (whole repo) already fails on master, in `cypress/`, `cypress.config.js` and `webpack.config.js`, which this plan does not touch; CI does not run lint.
- `npm run build-production`: compiles with 9 warnings, all from files this plan does not touch: bundle-size limits and import warnings in `js/3d/camera.js` and three's `OrbitControls.js`.
- The license-copy step alone (dialog step not applied): `npx jest` 12 tests pass and `npx standard js` is clean, so it can be committed and reviewed by itself.
- Cypress `cypress/e2e/basic/smoke.cy.js` (13.6.3, Electron, against the dev server): 10/10 pass, including its About and Share tests, which open by `data-test` and close with `[data-test=close-modal]`. No Cypress spec changes.
- Each test fails when the line it guards is broken: dropping `<LicenseCopy />` from About (5 fail) or Share (6), Share's 2016 block put back (1), a hardcoded year (2), a straight apostrophe (2), `rel="noopener"` only (2), no new-tab hint (4), a wrong MIT constant (2), the mailto link through `ExternalLink` (4), a block after the copy (1); and in the top-bar tests: About back to a span (3), Share back to a span (3), Share without `type='button'` (1), no `onRequestClose` (2), `shouldReturnFocusAfterClose={false}` (4), Close without `autoFocus` (2), no `aria.labelledby` (2), Share unlabeled (1), Share's Close doing nothing (2), Close without its name (2), Close without `type='button'` (2).
- Browser (dev server, Chromium, 900 × 600, the Share embed size): About is a button in the same box as today's span (841, 2, 40.9 × 18); Tab shows a whole focus ring on it; the About dialog scrolls to the copy within the cap (13 to 573px with `calc(100vh - 40px)`; unscrolled at 1024 × 768, 69 to 699px, and 1280 × 800, 104 to 696px), named "About: Seismic Explorer"; Enter (and Space) on the focused About button opens the dialog with focus on Close, which shows its ring; Tab from Close moves to the first link; Esc closes and focus returns to About; a mouse click on About opens it with focus on Close and no ring, and clicking Close returns focus to About with no ring; Share is a button in the same box as today's span (785.3, 2, 37.8 × 18), Tab reaches it after About, its focus ring runs 0 to 22px and is whole on all four sides inside the 22px bar, Enter opens "Share: Seismic Explorer" with focus on Close and its ring showing (by mouse, no ring), and Esc, and Enter on Close, each return focus to Share; all four copy links are underlined; the copyright line is 10.4px; Share is 68 to 517px with the copy last and 8px between its paragraphs; both dialogs are 38.4px narrower than on master (About 630px, Share 405px), from `border-box`. In the Share dialog's own embed snippet (900 × 600 iframe, `scrolling="no"`, so no page scrollbar), About is 20 to 580px and scrolls to the copy by mouse wheel, PageDown and arrow keys, and Share is 76 to 524px. Firefox (Playwright's Firefox build) matches Chromium: About and Share are pixel-identical to master in the top bar, the × is the same glyph, size and offset from the dialog's corner, Tab reaches About with its ring, Enter on About or Share opens the dialog with focus on Close and its ring showing (by mouse, no ring), Esc and Enter on Close return focus to the opener, the four links have the same accessible names, and About scrolls within the cap at 900 × 600 (20 to 580px). Not checked: Safari (WebKit would not launch here).

## Open Questions

### RESOLVED: Judgment call: test with react-dom's test utilities, or add Testing Library?
**Options considered**:
- A) `react-dom/test-utils` (`act`, `Simulate`) and DOM queries, no new dependency.
- B) Add `@testing-library/react` for `getByRole` and accessible-name queries.

**Decision**: A. React is 16.8.3 and Jest 24 ships jsdom 11; Testing Library would be a new dependency and lockfile change for a two-point story, and every R17 assertion was written and run without it.

---

### RESOLVED: Judgment call: where the new files go
**Options considered**:
- A) Flat, as the repo is: `js/components/license-copy.js`, `js/components/external-link.js`, `js/license-constants.js`, styles in `css/`.
- B) A `js/components/license/` folder as in HURR-70.

**Decision**: A. Seismic keeps every component in `js/components/` and every stylesheet in `css/`; a folder for two components would be the only one.

---

### RESOLVED: Judgment call: one commit for the Jest config and the first component tests?
**Options considered**:
- A) The `jest` key and helpers ship with the license-copy step that first needs them.
- B) A separate test-setup commit.

**Decision**: A. The config changes no dependency or lockfile, and a commit with the config but no test using it could not show it works.

## Self-Review

Roles: commit reviewer, test writer, accessibility, operator. Each finding was checked against the throwaway build before it was written down.

### Commit reviewer

#### RESOLVED: Diff estimates did not match the built code
The plan said ~230 and ~125 lines; the built steps measure 193 and 127 lines added plus deleted (`git diff --numstat`), so ~195 and ~125. Corrected. Also checked that the license-copy step stands alone: with the dialog step's changes removed, Jest passes 13 tests and lint is clean.

---

### Test writer

#### RESOLVED: R17's "opens with the keyboard" is not something jsdom can show
A throwaway test confirmed that jsdom 11 fires no click for Enter on a focused `<button>` (0 clicks). The plan already tests focusability plus click and explains why; the browser check now records Enter opening the dialog in Chromium, and requirements.md's R17 says which half is checked where.

---

### Operator

#### RESOLVED: The Cypress smoke spec was not part of Verification
The About and Share smoke tests rely on `data-test="about"` and `[data-test=close-modal]`, which now sit on buttons. Run against the throwaway build: 10/10 pass. Verification lists it.

---

### Accessibility

No new findings. Tab order in the top bar is Reload (not focusable, unchanged), About, Share (geo-common decision 4). Opening a dialog puts focus on Close, and react-modal keeps Tab inside the dialog.

### Round 1

Roles: senior engineer applying the plan's blocks to master as written, QA engineer (mutation checks), WCAG accessibility (Chromium at 900 × 600), DevOps (CI action and branch deploy path), product manager (scope against Jira). Requirements.md drew no findings this round.

### Senior Engineer

#### RESOLVED: Two CSS blocks did not say they extend existing rules
The `css/top-controls.less` block repeated the whole existing `.top-link` rule under "inside `.top-controls`", and the `css/modal-style.less` block repeated `.close-icon`'s existing `&:hover`, so pasting either as written duplicates a rule. Both now say what they extend and where the new lines go; the resulting CSS is the same as the build that was verified.

---

### QA Engineer

#### RESOLVED: Close's `type="button"` (R12) had no test
Dropping `type='button'` from the Close button left all 19 tests green. The Close test now asserts `type`; with that line removed, 1 test fails. The test step is 77 lines and the Verification mutation list includes it.

#### RESOLVED: Verification numbers did not match the build
Measured as added plus deleted lines, the steps are 193 and 127 (the dialog step was listed as ~115), and the production build's 9 warnings include import warnings from `js/3d/camera.js` and three's `OrbitControls.js`, not only bundle size. Both corrected.

### Round 2

Roles: screen-reader user walking both dialogs, a student or teacher in the 900 × 600 embed, a reader of the specs a year from now, the implementer applying each step's blocks to master in order, and a security reviewer of the links. Requirements.md holds this round's other entries.

### Reader of the specs a year from now

#### RESOLVED: The height-cap step cited a process stage instead of the requirement
The `css/basic-modal.less` note justified "no scrolling on larger viewports" as "Doug's choice at stage 8", which means nothing outside this spec's history. It now points at R15, which states the behavior.

---

### Student or teacher in the 900 × 600 embed

#### RESOLVED: Verification did not cover the embed itself
Verification measured a 900 × 600 window, not the iframe the Share dialog suggests. Added the embed's figures (About 20 to 580px and scrollable by wheel and keyboard, Share 76 to 524px); requirements.md's Dialog height note matches.

---

### Screen-reader user, implementer, security reviewer

No new findings. The dialog's accessibility tree reads Close, the title, About's paragraphs, then the copy with each web link named with its hint and the mailto link by its text; `#app` is `aria-hidden` while it is open, and Esc returns focus to About. Each step's blocks applied to master as written, and the counts in Verification held. The four hrefs are static constants, every `target="_blank"` link carries `noopener noreferrer`, and `ExternalLink` gives callers no way to drop either.


### Round 3

Roles: a PR reviewer reading the eventual diff against the house review rules and the repo's README, a cross-app reviewer comparing with HURR-70's branch and geo-common's Tests paragraph, a cross-browser and visual reviewer (Firefox and Chromium through Playwright, against master), and Kiley as acceptance reviewer. Requirements.md holds this round's Kiley entry.

### PR reviewer

#### RESOLVED: `.visually-hidden` was a global class
The README's "CSS styles" section asks that each component's styles be scoped to its top-level class, and every top-level class in `css/` is a component root; the plan's `css/external-link.less` declared `.visually-hidden` at the top level. `ExternalLink`'s `<a>` now has `className='external-link'` and the rule sits under it. Applied and checked: 19 tests pass, `npx standard js` is clean, and in Chromium and Firefox each hint span is still 1 × 1px with the links named "MIT License (opens in a new tab)" and so on.

---

### Cross-browser and visual reviewer

#### RESOLVED: Verification listed Firefox as unchecked
Ran the plan in Firefox through Playwright and recorded the results in Verification; it behaves as Chromium does, and the top bar and the × match master pixel for pixel apart from subpixel antialiasing.

#### RESOLVED: `box-sizing: border-box` also narrows both dialogs by their side padding
`border-box` applies to `max-width` as well as `max-height`, so the 2.4em of side padding (`.modal-style`'s `padding: 0.5em 1.2em`) now comes out of the existing 70% and 45% caps. Measured in Chromium against master, every dialog is 38.4px narrower at every viewport size (About 668.4 to 630px and Share 443.4 to 405px at 900 × 600; About 934.4 to 896px at 1280 × 800); the Share textareas narrow with it. Nothing in the specs mentions it, and R10, R12 and R16 otherwise keep today's look.

**Options considered**:
- A) Keep `border-box` and record the narrowing in Technical Notes (Dialog height) and Verification. No new value; the figures already measured stand.
- B) Drop `box-sizing` and use `max-height: calc(100vh - 40px - 1em)`, where `1em` is the vertical padding. Measured: widths are master's, About is 20 to 580px at 900 × 600 and unscrolled at 1024 × 768 and 1280 × 800. Costs a second copy of the padding value, in a different file from `.modal-style`, that no test can check.
- C) Leave the spec as is.

**Recommendation**: A. The change is a uniform 2.4em, the dialogs get taller by the new copy anyway, and B adds a duplicated value that only a browser could catch drifting. The cap itself (R15) is unchanged under either.

**Decision**: A, Doug on 2026-11-18. `border-box` stays, and the narrowing is recorded in requirements.md's Dialog height note, the `basic-modal.less` step and Verification.

---

### Cross-app reviewer and Kiley

No new findings in this file. The copy, the four link targets, `ExternalLink`'s shape and comment, and the copy tests match HURR-70's branch apart from the product, host, repo and each repo's naming (`MIT_LICENSE_URL` against `kMitLicenseUrl`, following Seismic's upper-case constants), and the test list covers every bullet of geo-common's Tests paragraph. HURR-70's CI fix landed on the floating `@v7` tag (its retrying ping is in v7.4.4 and later), which is the tag R18 uses.
