import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/loading-icon.less'

const STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

@pureRender
export default class LoadingIcon extends Component {
  render() {
    return (
      <div className='loading-icon-container'>
        <div className='loading-icon'>
          {STEPS.map(angle => <div key={angle} className='element' style={{transform: `rotate(${angle}deg) translate(0,-60px)`}}></div>)}
        </div>
      </div>
    )
  }
}
