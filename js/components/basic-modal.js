import React, { PureComponent } from 'react'
import Modal from 'react-modal'

import '../../css/basic-modal.less'
import '../../css/modal-style.less'

Modal.setAppElement('#app')

export default class BasicModal extends PureComponent {
  render () {
    const { isOpen, close, children, className, labelledBy } = this.props

    return (
      <Modal shouldCloseOnOverlayClick={false} className={`modal-style basic-modal ${className}`}
        overlayClassName='basic-modal-overlay' isOpen={isOpen} onRequestClose={close} aria={{ labelledby: labelledBy }}>
        <button type='button' autoFocus onClick={close} className='close-icon' aria-label='Close' data-test='close-modal'>
          <i className='fa fa-close' aria-hidden='true' />
        </button>
        {children}
      </Modal>
    )
  }
}
