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
  on('before:browser:launch', (browser, launchOptions) => {
    // Note that it needs to match or exceed viewportHeight and viewportWidth values specified in cypress.json.
    if (browser.name === 'electron') {
      launchOptions.args.width = 1400
      launchOptions.args.height = 1000
      // open issue for Cypress screenshot, fix sizes https://github.com/cypress-io/cypress/issues/587
      launchOptions.preferences['width'] = 1400
      launchOptions.preferences['height'] = 1000
      launchOptions.preferences['resizable'] = false
      return launchOptions
    }
  })

  addMatchImageSnapshotPlugin(on, config)
}
