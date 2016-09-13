import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/share-modal-content.less'

function getURL() {
  return window.location.href
}

function getIframeString() {
  return `<iframe width="900px" height="600px" frameborder="no" scrolling="no" allowfullscreen="true" src="${getURL()}"></iframe>`
}

@pureRender
export default class ShareModalContent extends Component {
  render() {
    return (
      <div className='share-modal-content'>
        <div className='title'>Share: Seismic Explorer</div>
        <div>
          <div>Paste this link in email or IM.</div>
          <textarea value={getURL()} readOnly/>
          <div>Paste HTML to embed in website or blog.</div>
          <textarea value={getIframeString()} readOnly style={{height: '4em'}}/>
          <div className='copyright'>
            <b>Copyright © 2016</b> <a href='http://concord.org' target='_blank'>The Concord Consortium</a>. All rights
            reserved. The software is licensed under the <a href='http://opensource.org/licenses/MIT' target='_blank'>MIT</a> license.
            Please provide attribution to the Concord Consortium and the URL <a href='http://concord.org' target='_blank'>http://concord.org</a>.
          </div>
        </div>
      </div>
    )
  }
}
