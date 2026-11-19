import React, { PureComponent } from 'react'
import LicenseCopy from './license-copy'

import '../../css/share-modal-content.less'

function getURL () {
  return window.location.href
}

function getIframeString () {
  return `<iframe width="900px" height="600px" frameborder="no" scrolling="no" allowfullscreen="true" src="${getURL()}"></iframe>`
}

export default class ShareModalContent extends PureComponent {
  render () {
    return (
      <div className='share-modal-content'>
        <div className='title'>Share: Seismic Explorer</div>
        <div>
          <div>Paste this link in email or IM.</div>
          <textarea value={getURL()} readOnly />
          <div>Paste HTML to embed in website or blog.</div>
          <textarea value={getIframeString()} readOnly style={{ height: '4em' }} />
        </div>
        <LicenseCopy />
      </div>
    )
  }
}
