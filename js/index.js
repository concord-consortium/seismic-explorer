import initRollbar from './init-rollbar'
import './performance-now-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/app'
import Authoring from './components/authoring'
import configureStore from './store/configure-store'
import config from './config'
import theme from './material-ui-theme'
import { MuiThemeProvider } from '@material-ui/core/styles'

initRollbar()

const store = configureStore()

render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      {config.authoring ? <Authoring /> : <App />}
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('app')
)
