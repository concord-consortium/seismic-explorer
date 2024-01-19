function beforeTest() {
  cy.visit('/?endTime=2018-01-01T12:00:00.000Z');
}

// context('Smoke Test', () => {
//   context('Loading screen and initialization of app', () => {
//     it('Makes sure splash screen renders and disappears', () => {
//       cy.waitForSplashscreen()
//     })

//     it('Makes sure data loading icon renders and disappears', () => {
//       cy.waitForSpinner()
//     })

//     it('verifies the logo', () => {
//       cy.get('[data-test=cc-logo]')
//         .should('exist')
//         .and('be.visible')
//     })

//     it('verifies the start and end data', () => {
//       cy.get('.rc-slider-mark')
//         .should('contain', '01/01/1980')
//         .and('contain', '1990')
//         .and('contain', '2000')
//         .and('contain', '2010')
//         .and('contain', '01/01/2018')
//     })
//   })

//   context('Cross section interactions', () => {
//     it('ensures user can enter and exit cross-section mode', () => {
//       cy.get('[data-test=draw-cross-section]').click()
//       cy.get('[data-test=open-3d-view]').should('be.visible')
//       cy.get('[data-test=cancel-drawing]').should('be.visible')

//       cy.drag('.map', [ { x: 700, y: 500 }, { x: 800, y: 500 } ])
//       cy.contains('.leaflet-marker-icon', 'P1')
//       cy.contains('.leaflet-marker-icon', 'P2')

//       cy.get('[data-test=open-3d-view]').click()

//       cy.get('.cross-section-3d').should('be.visible')
//       cy.get('[data-test=exit-3d-view]').should('be.visible')

//       cy.get('[data-test=exit-3d-view]').click()
//       cy.get('.cross-section-3d').should('not.exist')

//       cy.get('[data-test=cancel-drawing]').click()
//       cy.get('.leaflet-marker-icon').should('not.exist')
//     })
//   })

//   context('Earthquakes slider', () => {
//     it('ensures user can show earthquakes', () => {
//       cy.wait(1000)
//       // text will be similar to "Displaying 0 of 80000 earthquakes"
//       cy.get('.stats').then(statText => {
//         const num1 = parseInt(statText.text().split(' ')[1])
//         const num2 = parseInt(statText.text().split(' ')[3])
//         expect(num1).to.eq(0)
//         expect(num2 > 10000).to.eq(true)
//       })
//       cy.contains(' earthquakes')
//       cy.get('.earthquake-playback .slider-big .rc-slider-rail').click()
//       // total number of earthquakes may vary, it's in the 20-30k range
//       cy.contains('Displaying ')
//       cy.get('.stats').then(statText => {
//         const num1 = parseInt(statText.text().split(' ')[1])
//         const num2 = parseInt(statText.text().split(' ')[3])
//         expect(num1 > 0).to.eq(true)
//         expect(num2 > 10000).to.eq(true)
//         expect(num2 > num1).to.eq(true)
//       })
//       cy.contains(' earthquakes')
//     })
//   })

//   context('Magnitude slider', () => {
//     it('ensures user can limit earthquakes magnitude', () => {
//       cy.contains('Magnitudes from 0.0 to 10.0')
//       cy.get('.mag-slider .rc-slider-rail').click(60, 2, { force: true })
//       cy.contains('Magnitudes from 3.5 to 10.0')
//     })
//   })

//   context('Data type menu', () => {
//     it('ensures user can display various data on the map', () => {
//       cy.get('[data-test=data-type]').click()
//       cy.get('.map-layer-content')
//         .should('contain', 'Plate Boundaries')
//         .and('contain', 'Plate Names')
//         .and('contain', 'Continent and Ocean Names')
//         .and('contain', 'Eruptions')
//         .and('contain', 'Earthquakes')
//         .and('contain', 'Plate Movement')

//       cy.get('.map-layer-content .close-icon').click()
//       cy.get('.map-layer-content').should('not.exist')
//     })
//   })

//   context('Map type', () => {
//     it('ensures user can change map type', () => {
//       cy.window().then(win => {
//         cy.get('[data-test=map-type]').click()
//         cy.get('.map-layer-content')
//           .should('contain', 'Relief')
//           .and('contain', 'Street')
//           .and('contain', 'Satellite')
//         cy.get('input[value=street]').click()
//         cy.get(`.leaflet-tile-pane img[src="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/2/1/1"]`).should('exist')
//         cy.get('input[value=relief]').click()
//         cy.get('.leaflet-tile-pane img[src="https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/ETOPO1_Global_Relief_Model_Color_Shaded_Relief/MapServer/tile/2/1/1"]').should('exist')
//         cy.get('input[value=satellite]').click()
//         cy.get('.leaflet-tile-pane img[src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/2/1/1"]').should('exist')

//         cy.get('.map-layer-content .close-icon').click()
//         cy.get('.map-layer-content').should('not.exist')
//       })
//     })
//   })

//   context('Key button', () => {
//     it('ensures user can open the key', () => {
//       cy.get('[data-test=key]').click()
//       cy.get('.map-key-content')
//         .should('contain', 'Magnitude')
//         .and('contain', 'Depth')
//         .and('contain', '3')
//         .and('contain', '5')
//         .and('contain', '9')
//         .and('contain', '0-30 km')
//         .and('contain', '300-500 km')
//         .and('contain', '> 500 km')
//         .and('not.contain', 'Years since last volcanic eruption')

//       cy.get('[data-test=data-type]').click()
//       cy.get('.toggle-eruptions').click()

//       cy.get('.map-key-content')
//         .should('contain', 'Years since last volcanic eruption')
//         .and('contain', '< 100')
//         .and('contain', '400-1600')
//         .and('contain', '> 6400')
//         .and('contain', 'Unknown')
//     })
//   })

//   context('About button', () => {
//     it('ensures user can see the about box', () => {
//       cy.get('[data-test=about]').click()
//       cy.get('.about-modal-content')
//         .should('contain', 'About: Seismic Explorer')
//         .and('contain', 'Geologists collect earthquake data every day. What are the patterns of earthquake magnitude, depth, location, and frequency? What are the patterns of earthquakes along plate boundaries?')

//       cy.get('[data-test=close-modal]').click()
//       cy.get('.about-modal-content').should('not.exist')
//     })
//   })

//   context('Share button', () => {
//     it('ensures user can see the share box', () => {
//       cy.get('[data-test=share]').click()
//       cy.get('.share-modal-content')
//         .should('contain', 'Share: Seismic Explorer')
//         .and('contain', 'Paste this link in email or IM.')
//         .and('contain', 'Paste HTML to embed in website or blog.')

//       cy.get('[data-test=close-modal]').click()
//       cy.get('.about-modal-content').should('not.exist')
//     })
//   })

//   context('Reload button', () => {
//     it('ensures user can reload the app', () => {
//       cy.get('[data-test=reload]').click()
//       cy.waitForSplashscreen()
//     })
//   })
// })

context('Smoke Test', () => {
  context('Loading screen and initialization of app', () => {
    it('Loading screen and initialization of app', () => {
      beforeTest();

      cy.log("Makes sure splash screen renders and disappears");
      cy.waitForSplashscreen()

      cy.log("Makes sure data loading icon renders and disappears");
      cy.waitForSpinner()

      cy.log("verifies the logo");
      cy.get('[data-test=cc-logo]')
        .should('exist')
        .and('be.visible')

      cy.log("verifies the start and end data");
      cy.get('.rc-slider-mark')
        .should('contain', '01/01/1980')
        .and('contain', '1990')
        .and('contain', '2000')
        .and('contain', '2010')
        .and('contain', '01/01/2018')
  })
})

  context('Cross section interactions', () => {
    it('ensures user can enter and exit cross-section mode', () => {
      beforeTest();
      cy.get('[data-test=draw-cross-section]').click()
      cy.get('[data-test=open-3d-view]').should('be.visible')
      cy.get('[data-test=cancel-drawing]').should('be.visible')

      cy.drag('.map', [ { x: 700, y: 500 }, { x: 800, y: 500 } ])
      cy.contains('.leaflet-marker-icon', 'P1')
      cy.contains('.leaflet-marker-icon', 'P2')

      cy.get('[data-test=open-3d-view]').click()

      cy.get('.cross-section-3d').should('be.visible')
      cy.get('[data-test=exit-3d-view]').should('be.visible')

      cy.get('[data-test=exit-3d-view]').click()
      cy.get('.cross-section-3d').should('not.exist')

      cy.get('[data-test=cancel-drawing]').click()
      cy.get('.leaflet-marker-icon').should('not.exist')
    })
  })

  context('Earthquakes slider', () => {
    it('ensures user can show earthquakes', () => {
      beforeTest();
      cy.wait(1000)
      // text will be similar to "Displaying 0 of 80000 earthquakes"
      cy.get('.stats').then(statText => {
        const num1 = parseInt(statText.text().split(' ')[1])
        const num2 = parseInt(statText.text().split(' ')[3])
        expect(num1).to.eq(0)
        expect(num2 > 10000).to.eq(true)
      })
      cy.contains(' earthquakes')
      cy.get('.earthquake-playback .slider-big .rc-slider-rail').click()
      // total number of earthquakes may vary, it's in the 20-30k range
      cy.contains('Displaying ')
      cy.get('.stats').then(statText => {
        const num1 = parseInt(statText.text().split(' ')[1])
        const num2 = parseInt(statText.text().split(' ')[3])
        expect(num1 > 0).to.eq(true)
        expect(num2 > 10000).to.eq(true)
        expect(num2 > num1).to.eq(true)
      })
      cy.contains(' earthquakes')
    })
  })

  context('Magnitude slider', () => {
    it('ensures user can limit earthquakes magnitude', () => {
      beforeTest();
      cy.contains('Magnitudes from 0.0 to 10.0')
      cy.get('.mag-slider .rc-slider-rail').click(60, 2, { force: true })
      cy.contains('Magnitudes from 3.5 to 10.0')
    })
  })

  context('Data type menu', () => {
    it('ensures user can display various data on the map', () => {
      beforeTest();
      cy.get('[data-test=data-type]').click()
      cy.get('.map-layer-content')
        .should('contain', 'Plate Boundaries')
        .and('contain', 'Plate Names')
        .and('contain', 'Continent and Ocean Names')
        .and('contain', 'Eruptions')
        .and('contain', 'Earthquakes')
        .and('contain', 'Plate Movement')

      cy.get('.map-layer-content .close-icon').click()
      cy.get('.map-layer-content').should('not.exist')
    })
  })

  context('Map type', () => {
    it('ensures user can change map type', () => {
      beforeTest();
      cy.window().then(win => {
        cy.get('[data-test=map-type]').click()
        cy.get('.map-layer-content')
          .should('contain', 'Relief')
          .and('contain', 'Street')
          .and('contain', 'Satellite')
        cy.get('input[value=street]').click()
        cy.get(`.leaflet-tile-pane img[src="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/2/1/1"]`).should('exist')
        cy.get('input[value=relief]').click()
        cy.get('.leaflet-tile-pane img[src="https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/ETOPO1_Global_Relief_Model_Color_Shaded_Relief/MapServer/tile/2/1/1"]').should('exist')
        cy.get('input[value=satellite]').click()
        cy.get('.leaflet-tile-pane img[src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/2/1/1"]').should('exist')

        cy.get('.map-layer-content .close-icon').click()
        cy.get('.map-layer-content').should('not.exist')
      })
    })
  })

  context('Key button', () => {
    it('ensures user can open the key', () => {
      beforeTest();
      cy.get('[data-test=key]').click()
      cy.get('.map-key-content')
        .should('contain', 'Magnitude')
        .and('contain', 'Depth')
        .and('contain', '3')
        .and('contain', '5')
        .and('contain', '9')
        .and('contain', '0-30 km')
        .and('contain', '300-500 km')
        .and('contain', '> 500 km')
        .and('not.contain', 'Years since last volcanic eruption')

      cy.get('[data-test=data-type]').click()
      cy.get('.toggle-eruptions').click()

      cy.get('.map-key-content')
        .should('contain', 'Years since last volcanic eruption')
        .and('contain', '< 100')
        .and('contain', '400-1600')
        .and('contain', '> 6400')
        .and('contain', 'Unknown')
    })
  })

  context('About button', () => {
    it('ensures user can see the about box', () => {
      beforeTest();
      cy.get('[data-test=about]').click()
      cy.get('.about-modal-content')
        .should('contain', 'About: Seismic Explorer')
        .and('contain', 'Geologists collect earthquake data every day. What are the patterns of earthquake magnitude, depth, location, and frequency? What are the patterns of earthquakes along plate boundaries?')

      cy.get('[data-test=close-modal]').click()
      cy.get('.about-modal-content').should('not.exist')
    })
  })

  context('Share button', () => {
    it('ensures user can see the share box', () => {
      beforeTest();
      cy.get('[data-test=share]').click()
      cy.get('.share-modal-content')
        .should('contain', 'Share: Seismic Explorer')
        .and('contain', 'Paste this link in email or IM.')
        .and('contain', 'Paste HTML to embed in website or blog.')

      cy.get('[data-test=close-modal]').click()
      cy.get('.about-modal-content').should('not.exist')
    })
  })

  context('Reload button', () => {
    it('ensures user can reload the app', () => {
      beforeTest();
      cy.get('[data-test=reload]').click()
      cy.waitForSplashscreen()
    })
  })
})