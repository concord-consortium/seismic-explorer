import React, { PureComponent } from 'react'
import config from '../config'

import '../../css/authoring.less'

function camelCaseToWords (name) {
  return name.replace(/([A-Z])/g, ` $1`).toLowerCase()
}

const HIDDEN_OPTIONS = [ 'authoring' ]
const SEPARATOR_AFTER = [ 'pins', 'logging', 'endTime' ]

const OPTIONS_WITH_SEPARATORS = (function () {
  const result = []
  Object.keys(config).forEach(name => {
    if (HIDDEN_OPTIONS.indexOf(name) !== -1) {
      return
    }
    result.push(name)
    if (SEPARATOR_AFTER.indexOf(name) !== -1) {
      result.push('___separator___')
    }
  })
  return result
}())

export default class Authoring extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      iframeSrc: ''
    }
    Object.keys(config).forEach(name => {
      let value = config[name]
      if (name === 'startTime' || name === 'endTime') {
        value = (new Date(value)).toISOString()
      }
      this.state[name] = value
    })
  }

  componentDidMount () {
    this.setState({
      iframeSrc: this.finalUrl()
    })
  }

  componentDidUpdate () {
    window.clearTimeout(this._iframeUpdate)
    this._iframeUpdate = setTimeout(() => {
      this.setState({
        iframeSrc: this.finalUrl()
      })
    }, 2000)
  }

  renderCheckbox (name) {
    const toggleOption = () => {
      this.setState({[name]: !this.state[name]})
    }
    return (
      <div key={name}><label><input type='checkbox' checked={this.state[name]} onChange={toggleOption} /> { camelCaseToWords(name) }</label></div>
    )
  }

  renderTextInput (name) {
    const setOption = (event) => {
      this.setState({[name]: event.target.value})
    }
    return (
      <div key={name}><label>{ camelCaseToWords(name) } <input type='text' value={this.state[name]} onChange={setOption} /></label></div>
    )
  }

  renderPinsAuthoring () {
    const addPin = () => {
      const { pins } = this.state
      this.setState({pins: pins.concat([[0, 0, 'label']])})
    }
    const removePin = idx => {
      const { pins } = this.state
      const newPins = pins.concat()
      newPins.splice(idx, 1)
      this.setState({pins: newPins})
    }
    const setProp = (idx, prop, event) => {
      const { pins } = this.state
      const newPins = pins.concat()
      newPins[idx][prop] = event.target.value
      this.setState({pins: newPins})
    }
    const { pins } = this.state
    return (
      <div key='pins' className='pins'>
        map pins
        { pins.map((pin, idx) =>
          <div key={idx}>
            <label>lat <input type='text' className='coords' value={pins[idx][0]} onChange={setProp.bind(null, idx, 0)} /></label>
            <label>lng <input type='text' className='coords' value={pins[idx][1]} onChange={setProp.bind(null, idx, 1)} /></label>
            <label>label <input type='text' value={pins[idx][2]} onChange={setProp.bind(null, idx, 2)} /></label>
            <span className='remove' onClick={removePin.bind(idx)}><i className='fa fa-minus-circle' /></span>
          </div>
        )}
        <div><span className='add' onClick={addPin}><i className='fa fa-plus-circle' /></span></div>
      </div>
    )
  }

  renderConfig () {
    return OPTIONS_WITH_SEPARATORS.map((name, idx) => {
      const value = this.state[name]
      if (name === '___separator___') {
        return <hr key={'sep' + idx} />
      }
      if (name === 'pins') {
        return this.renderPinsAuthoring()
      }
      if (typeof value === 'boolean') {
        return this.renderCheckbox(name)
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return this.renderTextInput(name)
      }
    })
  }

  finalUrl () {
    let url = window.location.href.slice()
    url = url.replace('?authoring', '')

    OPTIONS_WITH_SEPARATORS.forEach(name => {
      let value = this.state[name]
      let configValue = config[name]
      if (name === 'startTime' || name === 'endTime') {
        configValue = (new Date(configValue)).toISOString()
      }
      if (name === 'pins') {
        configValue = JSON.stringify(configValue)
        // Make sure that coordinates have numeric format.
        value = JSON.stringify(value.map(a => [parseFloat(a[0]), parseFloat(a[1]), a[2]]))
      }
      if (value !== configValue) {
        if (value === true) {
          url += `&${name}`
        } else {
          url += `&${name}=${value}`
        }
      }
    })
    // Remove first &, as it's unnecessary and make sure there's ?
    url = url.replace('&', '?')
    return url
  }

  render () {
    const { iframeSrc } = this.state
    return (
      <div className='authoring'>
        <h2>Authoring</h2>
        { this.renderConfig() }
        <h3>Final URL</h3>
        <textarea value={this.finalUrl()} readOnly />

        <h3>Preview</h3>
        <iframe allowFullScreen width='1000' height='600' src={iframeSrc} />
      </div>
    )
  }
}
