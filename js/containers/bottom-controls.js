import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import AnimationButtons from '../components/animation-buttons'
import LayerControls from './layer-controls'
import { Range, Handle } from 'rc-slider'
import ccLogoSrc from '../../images/cc-logo.png'
import screenfull from 'screenfull'
import { layerInfo } from '../map-layer-tiles'
import log from '../logger'

import '../../css/settings-controls.less'
import 'rc-slider/assets/index.css'
import '../../css/slider.less'

function sliderDateFormatter (value) {
  const date = new Date(value)
  // .getMoth() returns [0, 11] range.
  let month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  return `${month}/${day}/${date.getFullYear()}`
}

function sliderTickFormatter (valueMin, valueMax) {
  // Don't display decade labels if it's closer to the edge values than 4 years.
  // Labels would be too close to each other and probably overlap.
  const minDistFromEdgeValues = 4 // years
  const tickMarks = {}
  const minDate = new Date(valueMin)
  const minYear = (minDate.getFullYear() + minDistFromEdgeValues).toString()
  const maxDate = new Date(valueMax)
  maxDate.setFullYear(maxDate.getUTCFullYear() - minDistFromEdgeValues, 0, 1)

  const decade = new Date(minYear.substr(0, 2) + minYear.substr(2, 1) + '0')
  decade.setFullYear(decade.getUTCFullYear() + 10, 0, 1)
  while (decade.getTime() <= maxDate.getTime()) {
    tickMarks[decade.getTime()] = { label: decade.getUTCFullYear() }
    // increment decade by 10 years
    decade.setFullYear(decade.getUTCFullYear() + 10, 0, 1)
  }
  return tickMarks
}

function toggleFullscreen () {
  if (!screenfull.isFullscreen) {
    screenfull.request()
    log('FullscreenClicked')
  } else {
    screenfull.exit()
    log('ExitFullscreenClicked')
  }
}

function logPlaybackRangeChange (value) {
  log('PlaybackRangeChanged', { minTime: (new Date(value[0])).toString(), maxTime: (new Date(value[1])).toString() })
}

function logTimeSliderChange (value) {
  log('TimeSliderChanged', { time: (new Date(value[1])).toString() })
}

function logMagSliderChange (value) {
  log('MagnitudeSliderChanged', { minMag: value[0], maxMag: value[1] })
}

const rangeHandle = (props) => {
  const { index, offset } = props
  return (
    <div key={index} className='custom-handle' style={{ left: `${offset}%` }}>
      <svg height='100%' width='100%' viewBox='0 0 20 20'>
        <polygon points='0,0 10,20 20,0' />
      </svg>
    </div>
  )
}

const tooltipHandle = (alwaysVisible) => {
  return (props) => {
    const { value, index, dragging, ...restProps } = props
    return (
      <Handle key={index} value={value} {...restProps} >
        <div className={`tooltip ${alwaysVisible ? 'visible' : ''}`}>{ sliderDateFormatter(value) }</div>
      </Handle>
    )
  }
}

class BottomControls extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      fullscreen: false
    }
    this.handleCurrentTimeChange = this.handleCurrentTimeChange.bind(this)
    this.handlePlaybackRangeChange = this.handlePlaybackRangeChange.bind(this)
    this.handleMagRange = this.handleMagRange.bind(this)
    this.handleAnimStep = this.handleAnimStep.bind(this)
    this.handlePlayPauseBtnClick = this.handlePlayPauseBtnClick.bind(this)
    this.handleResetBtnClick = this.handleResetBtnClick.bind(this)
    this.handleBaseLayerChange = this.handleBaseLayerChange.bind(this)
  }

  componentDidMount () {
    if (screenfull.enabled) {
      document.addEventListener(screenfull.raw.fullscreenchange, () => {
        this.setState({ fullscreen: screenfull.isFullscreen })
      })
    }
  }

  get mapLayerOptions () {
    return layerInfo.map((m, idx) => <option key={idx} value={m.type}>{m.name}</option>)
  }

  handleBaseLayerChange (event) {
    const { setBaseLayer } = this.props
    const layer = event.target.value
    setBaseLayer(layer)
    log('MapLayerChanged', { layer })
  }

  handleCurrentTimeChange (value) {
    const { setFilter, filters } = this.props
    setFilter('maxTime', Math.min(value[1], filters.get('playbackMaxTime')))
  }

  handlePlaybackRangeChange (value) {
    const { setFilter, filters } = this.props
    setFilter('minTime', value[0])
    setFilter('playbackMaxTime', value[1])
    const newMaxTime = Math.max(value[0], Math.min(value[1], filters.get('maxTime')))
    if (newMaxTime !== filters.get('maxTime')) {
      setFilter('maxTime', newMaxTime)
    }
  }

  handleMagRange (value) {
    const { setFilter } = this.props
    setFilter('minMag', value[0])
    setFilter('maxMag', value[1])
  }

  handleAnimStep (newValue) {
    const { filters, setFilter, setAnimationEnabled } = this.props
    if (newValue > filters.get('playbackMaxTime')) {
      newValue = filters.get('playbackMaxTime')
      setAnimationEnabled(false)
    }
    setFilter('maxTime', newValue)
  }

  handlePlayPauseBtnClick () {
    const { animationEnabled, setAnimationEnabled } = this.props
    setAnimationEnabled(!animationEnabled)
    log(animationEnabled ? 'PauseClicked' : 'PlayClicked')
  }

  handleResetBtnClick () {
    const { reset } = this.props
    reset()
    log('ResetClicked')
  }

  get dateMarks () {
    const { filters } = this.props
    const min = filters.get('minTimeLimit')
    const max = filters.get('maxTimeLimit')
    let marks = {
      [min]: { label: sliderDateFormatter(min) },
      [max]: { label: sliderDateFormatter(max) }
    }
    if (min !== 0 && max !== 0) {
      // add tick marks for each decade between min and max
      Object.assign(marks, sliderTickFormatter(min, max))
    }
    return marks
  }

  get animSpeed () {
    const { filters } = this.props
    return (filters.get('maxTimeLimit') - filters.get('minTimeLimit')) / 15000
  }

  get fullscreenIconStyle () {
    return this.state.fullscreen ? 'fullscreen-icon fullscreen' : 'fullscreen-icon'
  }

  render () {
    const { animationEnabled, filters, layers, earthquakesCount, earthquakesCountVisible, magnitudeCutOff } = this.props
    const minMag = filters.get('minMag')
    const maxMag = filters.get('maxMag')
    let magFilter = magnitudeCutOff > 0

    return (
      <div>
        {layers.get('earthquakes') &&
          <div className='earthquake-playback'>
            <div>
              <AnimationButtons ref='playButton' animationEnabled={animationEnabled} value={filters.get('maxTime')}
                speed={this.animSpeed}
                onPlayPause={this.handlePlayPauseBtnClick} onReset={this.handleResetBtnClick}
                onAnimationStep={this.handleAnimStep}
                layers={layers}
              />
            </div>
            <div className='center'>
              <Range className='slider-range-only' allowCross={false} min={filters.get('minTimeLimit')} max={filters.get('maxTimeLimit')}
                step={86400} value={[filters.get('minTime'), filters.get('playbackMaxTime')]}
                onChange={this.handlePlaybackRangeChange} onAfterChange={logPlaybackRangeChange}
                handle={rangeHandle}
              />
              <Range className='slider-big' min={filters.get('minTimeLimit')} max={filters.get('maxTimeLimit')}
                step={86400} value={[filters.get('minTime'), filters.get('maxTime')]}
                handleStyle={[{ display: 'none' }, {}]}
                onChange={this.handleCurrentTimeChange} onAfterChange={logTimeSliderChange} marks={this.dateMarks}
                handle={tooltipHandle(animationEnabled)}
              />
            </div>
          </div>
        }

        <div className='settings'>
          <div>
            <img src={ccLogoSrc} data-test='cc-logo' />
          </div>
          <div title='Change the map rendering style'>
            Map type
            <select value={layers.get('base')} onChange={this.handleBaseLayerChange} data-test='map-type'>
              {this.mapLayerOptions}
            </select>
          </div>
          <LayerControls />
          {layers.get('earthquakes') &&
            <div className='stats'>
              <span>Displaying <strong>{earthquakesCountVisible}</strong> of <strong>{earthquakesCount}</strong> earthquakes </span>
              {magFilter && <span title='Zoom in to see weaker earthquakes.'><br />starting from magnitude <strong>{magnitudeCutOff}</strong></span>}
            </div>
          }
          {layers.get('earthquakes') &&
            <div className='mag-slider'>
              <div className='mag-label'>Magnitudes from <strong>{minMag.toFixed(1)}</strong> to <strong>{maxMag.toFixed(1)}</strong><br />
                <Range min={0} max={10} step={0.1} value={[minMag, maxMag]} onChange={this.handleMagRange}
                  onAfterChange={logMagSliderChange} marks={{ 0: 0, 5: 5, 10: 10 }} />
              </div>
            </div>
          }
          {screenfull.enabled &&
            <div className={this.fullscreenIconStyle} onClick={toggleFullscreen} title='Toggle Fullscreen' />
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    filters: state.get('filters'),
    layers: state.get('layers'),
    mode: state.get('mode'),
    animationEnabled: state.get('animationEnabled'),
    earthquakesCount: state.get('data').get('earthquakes').length,
    earthquakesCountVisible: state.get('data').get('earthquakes').filter(e => e.visible).length,
    magnitudeCutOff: state.get('data').get('magnitudeCutOff')
  }
}

export default connect(mapStateToProps, actions)(BottomControls)
