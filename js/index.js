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
      <Route path="/" component={App} dataLayerConfig={4}>
        <Route path="p1" component={App} dataLayerConfig={1} />
        <Route path="p2" component={App} dataLayerConfig={2} />
        <Route path="p3" component={App} dataLayerConfig={3} />
        <Route path="p4" component={App} dataLayerConfig={4} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
)
