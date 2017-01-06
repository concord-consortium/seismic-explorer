import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/animation-buttons.less'

const UPDATE_INTERVAL = 150 // ms

@pureRender
export default class AnimationButtons extends Component {
  constructor(props) {
    super(props)
    this.animFrameID = null
    this.animCallback = this.animCallback.bind(this)
  }

  componentDidMount() {
    this.animationEnabledChanged()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.animationEnabled !== this.props.animationEnabled) {
      this.animationEnabledChanged()
    }
  }

  animationEnabledChanged() {
    if (this.props.animationEnabled) {
      this.startAnimation()
    } else {
      this.stopAnimation()
    }
  }

  componentWillUnmount() {
    this.stopAnimation()
  }

  startAnimation() {
    this.prevTimestamp = performance.now()
    this.animCallback()
  }

  stopAnimation() {
    if (this.animFrameID !== null) {
      window.cancelAnimationFrame(this.animFrameID)
      this.animFrameID = null
    }
  }

  animCallback(timestamp = performance.now()) {
    const { value, speed, onAnimationStep, animationEnabled } = this.props
    if (animationEnabled) {
      this.animFrameID = window.requestAnimationFrame(this.animCallback)
    }
    const progress = timestamp - this.prevTimestamp
    if (progress < UPDATE_INTERVAL) {
      return
    }
    // Alternatively, we could use a real progress value. But that doesn't work too well in slow browsers (Firefox).
    onAnimationStep(value + UPDATE_INTERVAL * speed)
    this.prevTimestamp = timestamp
  }

  get icon() {
    const { animationEnabled } = this.props
    // FontAwesome class name.
    return animationEnabled ? 'fa fa-stop' : 'fa fa-play'
  }

  render() {
    const { onPlayPause, onReset } = this.props
    return (
      <div>
        <div className='animation-button' onClick={onReset} title="Reset Animation">
          <i className='fa fa-step-backward'/>
        </div>
        <div className='animation-button' onClick={onPlayPause} title="Animate Earthquakes">
          <i className={this.icon}/>
        </div>
      </div>
    )
  }
}
