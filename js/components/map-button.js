import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/map-button.less'

@pureRender
export default class MapButton extends Component {
  render() {
    const { onClick, disabled, children, icon } = this.props
    console.log(children)
    return (
      <div className={`map-button ${disabled ? 'disabled' : ''} ${icon && !children ? 'icon-only' : ''}`} onClick={onClick}>
        {icon && <i className={`fa fa-${icon}`}/>}
        {children}
      </div>
    )
  }
}
