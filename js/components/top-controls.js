import React, { PureComponent } from 'react'
import BasicModal from './basic-modal'
import ShareModalContent from './share-modal-content'
import AboutModalContent from './about-modal-content'
import log from '../logger'

import '../../css/top-controls.less'

function reloadPage() {
  log('ReloadClicked')
  location.reload()
}

export default class TopControls extends PureComponent {
  constructor(props) {
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

  openShareModal() {
    this.setState({shareModalOpen: true, aboutModalOpen: false})
    log('ShareDialogOpened')
  }

  openAboutModal() {
    this.setState({aboutModalOpen: true, shareModalOpen: false})
    log('AboutDialogOpened')
  }

  closeShareModal() {
    this.setState({shareModalOpen: false})
  }

  closeAboutModal() {
    this.setState({aboutModalOpen: false})
  }

  render() {
    const {shareModalOpen, aboutModalOpen} = this.state

    return (
      <div className='top-controls'>
        <span className='top-link left' onClick={reloadPage}>
          <i className='fa fa-repeat'/>
        </span>
        <span className='top-link right' onClick={this.openAboutModal}>About</span>
        <span className='top-link right' onClick={this.openShareModal}>Share</span>

        <BasicModal className='narrow' isOpen={shareModalOpen} close={this.closeShareModal}>
          <ShareModalContent/>
        </BasicModal>

        <BasicModal isOpen={aboutModalOpen} close={this.closeAboutModal}>
          <AboutModalContent/>
        </BasicModal>
      </div>
    )
  }
}

