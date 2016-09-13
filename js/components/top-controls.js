import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'
import BasicModal from './basic-modal'
import ShareModalContent from './share-modal-content'
import AboutModalContent from './about-modal-content'

import '../../css/top-controls.less'

function reloadPage() {
  location.reload()
}

@pureRender
export default class TopControls extends Component {
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
  }

  openAboutModal() {
    this.setState({aboutModalOpen: true, shareModalOpen: false})
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

