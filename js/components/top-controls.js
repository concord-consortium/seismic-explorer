import React, { PureComponent } from 'react'
import BasicModal from './basic-modal'
import ShareModalContent, { SHARE_TITLE_ID } from './share-modal-content'
import AboutModalContent, { ABOUT_TITLE_ID } from './about-modal-content'
import log from '../logger'

import '../../css/top-controls.less'

function reloadPage () {
  log('ReloadClicked')
  window.location.reload()
}

export default class TopControls extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      shareModalOpen: false,
      aboutModalOpen: false
    }
    this.openShareModal = this.openShareModal.bind(this)
    this.openAboutModal = this.openAboutModal.bind(this)
    this.closeShareModal = this.closeShareModal.bind(this)
    this.closeAboutModal = this.closeAboutModal.bind(this)
  }

  openShareModal (event) {
    // react-modal returns focus to what had it on open; some browsers do not focus a clicked button.
    event.currentTarget.focus()
    this.setState({ shareModalOpen: true, aboutModalOpen: false })
    log('ShareDialogOpened')
  }

  openAboutModal (event) {
    // react-modal returns focus to what had it on open; some browsers do not focus a clicked button.
    event.currentTarget.focus()
    this.setState({ aboutModalOpen: true, shareModalOpen: false })
    log('AboutDialogOpened')
  }

  closeShareModal () {
    this.setState({ shareModalOpen: false })
  }

  closeAboutModal () {
    this.setState({ aboutModalOpen: false })
  }

  render () {
    const { shareModalOpen, aboutModalOpen } = this.state

    return (
      <div className='top-controls'>
        <span className='top-link left' onClick={reloadPage} data-test='reload'>
          <i className='fa fa-repeat' />
        </span>
        <button type='button' className='top-link right' onClick={this.openAboutModal} data-test='about'>About</button>
        <button type='button' className='top-link right' onClick={this.openShareModal} data-test='share'>Share</button>

        <BasicModal className='narrow' isOpen={shareModalOpen} close={this.closeShareModal} labelledBy={SHARE_TITLE_ID}>
          <ShareModalContent />
        </BasicModal>

        <BasicModal isOpen={aboutModalOpen} close={this.closeAboutModal} labelledBy={ABOUT_TITLE_ID}>
          <AboutModalContent />
        </BasicModal>
      </div>
    )
  }
}
