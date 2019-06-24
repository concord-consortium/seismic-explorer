// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin')

module.exports = (on, config) => {
  on('before:browser:launch', browser => {
    // Note that it needs to match or exceed viewportHeight and viewportWidth values specified in cypress.json.
    if (browser.name === 'electron') {
      return {
        width: 1400,
        height: 1000
      }
    }
  })

  addMatchImageSnapshotPlugin(on, config)
}