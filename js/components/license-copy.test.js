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

  it('drops the old 2016 copyright block', () => {
    renderContent()
    expect(container.textContent).not.toMatch(/Copyright © 2016|All rights reserved|Please provide attribution/)
    expect(container.querySelector('a[href*="opensource.org"]')).toBeNull()
  })
})
