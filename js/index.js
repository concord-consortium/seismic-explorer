import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, Redirect, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import App from './containers/app'
import configureStore from './store/configure-store'

const store = configureStore()
const appHistory = useRouterHistory(createHashHistory)({ queryKey: false })

const DEFAULT_REGION = 'regions/world.json'

render(
  <Provider store={store}>
    <Router history={appHistory}>
      <Route path='/:regionPath' component={App}/>
      <Redirect from='/' to={`/${window.encodeURIComponent(DEFAULT_REGION)}`}/>
    </Router>
  </Provider>,
  document.getElementById('app')
)
