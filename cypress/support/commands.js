// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command'

addMatchImageSnapshotCommand({
  customDiffDir: 'cypress/snapshots-diff',
  failureThreshold: 0.04, // threshold for entire image
  failureThresholdType: 'percent', // percent of image or number of pixels
  customDiffConfig: { threshold: 0.1 }, // threshold for each pixel
  capture: 'viewport' // capture viewport in screenshot
})

Cypress.Commands.add('waitForSplashscreen', () => {
  // Lading can be long on TravisCI.
  cy.get('[data-test=splash-screen]', { timeout: 60000 }).should('not.exist')
})

Cypress.Commands.add('waitForSpinner', () => {
  // Lading can be long on TravisCI.
  cy.get('[data-test=spinner]', { timeout: 60000 }).should('not.exist')
})

// Accepts array of page coordinates, e.g.:
// cy.drag('.map', [ { x: 700, y: 500 }, { x: 800, y: 500 } ])
Cypress.Commands.add('drag', (element, positions) => {
  const options = positions.map(pos => (
    { button: 0, clientX: pos.x, clientY: pos.y, pageX: pos.x, pageY: pos.y }
  ))
  options.forEach((opt, idx) => {
    cy.get(element).first().trigger(idx === 0 ? 'mousedown' : 'mousemove', opt)
    cy.wait(20)
  })
  cy.get(element).first().trigger('mouseup')
  cy.wait(20)
})
