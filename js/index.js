import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/app'
import configureStore from './store/configure-store'

const store = configureStore()
window.store = store;

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('app')
)
