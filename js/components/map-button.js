import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/map-button.less'

@pureRender
export default class MapButton extends Component {
  render() {
    const { onClick, disabled, children } = this.props
    return (
      <div className={`map-button ${disabled ? 'disabled' : ''}`} onClick={onClick}>
        {children}
      </div>
    )
  }
}
