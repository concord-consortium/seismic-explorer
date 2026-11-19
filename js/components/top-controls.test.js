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

  // macOS Safari and Firefox do not focus a button when it is clicked.
  it.each([
    ['Esc', () => act(() => { Simulate.keyDown(dialog(), ESC) })],
    ['Close', () => act(() => { Simulate.click(dialog().querySelector('[data-test="close-modal"]')) })]
  ])('gets focus back by %s after a click that did not focus it', (_how, close) => {
    document.activeElement.blur()
    act(() => { Simulate.click(button()) })
    close()
    expect(document.activeElement).toBe(button())
  })
})
