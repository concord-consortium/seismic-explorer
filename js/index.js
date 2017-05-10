import initRollbar from './init-rollbar'
import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/app'
import configureStore from './store/configure-store'
import { Router, Route, browserHistory } from 'react-router'

initRollbar();

const store = configureStore()

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/*" component={App} />

    </Router>
  </Provider>,
  document.getElementById('app')
)
