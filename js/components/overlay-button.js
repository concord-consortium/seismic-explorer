import React, { PureComponent } from 'react'

import '../../css/overlay-button.less'

export default class OverlayButton extends PureComponent {
  render() {
    const { onClick, disabled, children, icon, className, title } = this.props
    return (
      <div className={`overlay-button ${className} ${disabled ? 'disabled' : ''} ${icon && !children ? 'icon-only' : ''}`}
           onClick={onClick} title={title}>
        {icon && <i className={`fa fa-${icon}`}/>}
        {children}
      </div>
    )
  }
}
