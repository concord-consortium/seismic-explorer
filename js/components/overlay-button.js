import React, { PureComponent } from 'react'
import Button from '@material-ui/core/Button'

import '../../css/overlay-button.less'

export default class OverlayButton extends PureComponent {
  render () {
    const { onClick, disabled, children, icon, className, title, dataTest, color } = this.props
    const iconComponent = typeof icon === 'string' ? <i className={`fa fa-${icon}`} /> : icon
    return (
      <Button
        variant='contained' color={color} className={`overlay-button ${className} ${icon && !children ? 'icon-only' : ''}`}
        title={title} disabled={disabled} onClick={onClick} data-test={dataTest}
      >
        {iconComponent}
        {children}
      </Button>
    )
  }
}

OverlayButton.defaultProps = {
  color: 'secondary'
}
