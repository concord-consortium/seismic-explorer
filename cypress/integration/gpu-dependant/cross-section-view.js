context('Snapshot-based tests', () => {
  beforeEach(function () {
    cy.visit('/?endTime=2018-01-01T12:00:00.000Z')
    cy.waitForSplashscreen()
    cy.waitForSpinner()
  })

  context('Cross section interactions', () => {
    it('ensures user can enter and exit cross-section mode', () => {
      // Show some earthquakes
      cy.get('.earthquake-playback .slider-big .rc-slider-rail').click()
      cy.wait(1500) // animation

      cy.get('[data-test=draw-cross-section]').click()
      cy.drag('.map', [ { x: 250, y: 650 }, { x: 400, y: 650 } ])
      cy.wait(500)
      cy.matchImageSnapshot('cross-section-1-line-visible')

      cy.get('[data-test=open-3d-view]').click()
      cy.wait(3000) // animation

      cy.matchImageSnapshot('cross-section-2-3d-view')

      cy.drag('.canvas-3d', [ { x: 900, y: 500 }, { x: 800, y: 600 } ])

      cy.matchImageSnapshot('cross-section-3-rotated-3d-view')

      cy.get('[data-test=exit-3d-view]').click()
      cy.wait(1000)
      cy.matchImageSnapshot('cross-section-4-map-again')

      cy.get('[data-test=cancel-drawing]').click()

      cy.wait(1000)
      cy.matchImageSnapshot('cross-section-5-no-cross-section-line')
    })
  })
})
