import initRollbar from './init-rollbar'
import 'babel-polyfill'
import './performance-now-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/app'
import Authoring from './components/authoring'
import configureStore from './store/configure-store'
import { Router, Route, browserHistory } from 'react-router'
import config from './config'

initRollbar();

const store = configureStore()

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/*' component={config.authoring ? Authoring : App} />
    </Router>
  </Provider>,
  document.getElementById('app')
)
