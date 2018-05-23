import React, { PureComponent } from 'react'
import config from '../config'

import '../../css/authoring.less'

function camelCaseToWords (name) {
  return name.replace(/([A-Z])/g, ` $1`).toLowerCase()
}

const HIDDEN_OPTIONS = [ 'authoring' ]
const SEPARATOR_AFTER = [ 'logging', 'endTime' ]

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
      <label key={name}><input type='checkbox' checked={this.state[name]} onChange={toggleOption} /> { camelCaseToWords(name) }</label>
    )
  }

  renderTextInput (name) {
    const setOption = (event) => {
      this.setState({[name]: event.target.value})
    }
    return (
      <label key={name}>{ camelCaseToWords(name) } <input type='text' value={this.state[name]} onChange={setOption} /></label>
    )
  }

  renderConfig () {
    return OPTIONS_WITH_SEPARATORS.map((name, idx) => {
      const value = this.state[name]
      if (name === '___separator___') {
        return <hr key={'sep' + idx} />
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
