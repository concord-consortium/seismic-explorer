import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/app'
import layerControls from './containers/layer-controls'
import configureStore from './store/configure-store'
import { Router, Route, browserHistory } from 'react-router'

const store = configureStore()

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} />
      <Route path="/index.html" component={App} />
    </Router>
  </Provider>,
  document.getElementById('app')
)
