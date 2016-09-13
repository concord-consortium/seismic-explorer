import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Modal from 'react-modal'

import '../../css/basic-modal.less'
import '../../css/modal-style.less'

@pureRender
export default class BasicModal extends Component {
  render() {
    const { isOpen, close, children } = this.props

    return (
      <Modal shouldCloseOnOverlayClick={false} className='modal-style basic-modal' overlayClassName='basic-modal-overlay'
             isOpen={isOpen}>
        <i onClick={close} className='close-icon fa fa-close'/>
        {children}
      </Modal>
    )
  }
}
