import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Modal from 'react-modal'

import '../../css/basic-modal.less'
import '../../css/modal-style.less'

@pureRender
export default class BasicModal extends Component {
  render() {
    const { isOpen, close, children, className, contentLabel } = this.props
    let contentLabelValue = contentLabel ? contentLabel : "";

    return (
      <Modal shouldCloseOnOverlayClick={false} className={`modal-style basic-modal ${className}`}
             overlayClassName='basic-modal-overlay' isOpen={isOpen} contentLabel={contentLabelValue}>
        <i onClick={close} className='close-icon fa fa-close'/>
        {children}
      </Modal>
    )
  }
}
