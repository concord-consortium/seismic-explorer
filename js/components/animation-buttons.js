import React, { PureComponent } from 'react'
import Button from '@material-ui/core/Button'
import StartSVG from '../../images/start.svg'
import StopSVG from '../../images/stop.svg'
import RestartSVG from '../../images/restart.svg'

import '../../css/animation-buttons.less'

const UPDATE_INTERVAL = 150 // ms

export default class AnimationButtons extends PureComponent {
  constructor (props) {
    super(props)
    this.animFrameID = null
    this.animCallback = this.animCallback.bind(this)
  }

  componentDidMount () {
    this.animationEnabledChanged()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.animationEnabled !== this.props.animationEnabled) {
      this.animationEnabledChanged()
    }
  }

  animationEnabledChanged () {
    if (this.props.animationEnabled) {
      this.startAnimation()
    } else {
      this.stopAnimation()
    }
  }

  componentWillUnmount () {
    this.stopAnimation()
  }

  startAnimation () {
    this.prevTimestamp = window.performance.now()
    this.animCallback()
  }

  stopAnimation () {
    if (this.animFrameID !== null) {
      window.cancelAnimationFrame(this.animFrameID)
      this.animFrameID = null
    }
  }

  animCallback (timestamp = window.performance.now()) {
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

  render () {
    const { onPlayPause, onReset, layers, animationEnabled } = this.props
    const hintText = layers.get('earthquakes') ? 'Animate Earthquakes' : 'Animate'
    return (
      <div className='animation-buttons'>
        <Button color='primary' className='animation-button' onClick={layers.get('earthquakes') ? onReset : null} title='Reset Animation'>
          <RestartSVG />
          <div>Restart</div>
        </Button>
        <Button color='primary' className='animation-button' onClick={layers.get('earthquakes') ? onPlayPause : null} title={hintText}>
          { animationEnabled ? <StopSVG /> : <StartSVG /> }
          <div>{ animationEnabled ? 'Stop' : 'Start' }</div>
        </Button>
      </div>
    )
  }
}
