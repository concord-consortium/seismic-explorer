import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'
import {connect} from 'react-redux'
import * as actions from '../actions'
import AnimationButtons from '../components/animation-buttons'
import Slider from 'rc-slider'
import ccLogoSrc from '../../images/cc-logo.png'
import screenfull from 'screenfull'
import {layerInfo} from '../map-layer-tiles'

import '../../css/bottom-controls.less'
import '../../css/settings-controls.less'
import 'rc-slider/assets/index.css'
import '../../css/slider.less'

function sliderDateFormatter(value) {
  const date = new Date(value)
  // .getMoth() returns [0, 11] range.
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

function sliderTickFormatter(valueMin, valueMax) {
  const minDate = new Date(valueMin)
  const maxDate = new Date(valueMax)

  const minDecadeString = minDate.getFullYear().toString().substr(0, 2) + minDate.getFullYear().toString().substr(2, 1) + '0'
  let minDecade = new Date(minDecadeString)
  minDecade.setFullYear(minDecade.getUTCFullYear() + 10, 0, 1)

  let tickMarks = {}
  let decade = minDecade

  while (decade <= maxDate) {
    tickMarks[decade.getTime()] = {label: decade.getUTCFullYear()}
    // increment decade by 10 years
    decade.setFullYear(decade.getUTCFullYear() + 10, 0, 1)
  }
  return tickMarks
}

function toggleFullscreen() {
  if (!screenfull.isFullscreen) {
    screenfull.request()
  } else {
    screenfull.exit()
  }
}

@pureRender
class BottomControls extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fullscreen: false
    }
    this.handleTimeRange = this.handleTimeRange.bind(this)
    this.handleMagRange = this.handleMagRange.bind(this)
    this.handleBaseLayerChange = this.handleBaseLayerChange.bind(this)
    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
    this.handleAnimStep = this.handleAnimStep.bind(this)
    this.handlePlayPauseBtnClick = this.handlePlayPauseBtnClick.bind(this)
    this.handleResetBtnClick = this.handleResetBtnClick.bind(this)
  }

  componentDidMount() {
    if (screenfull.enabled) {
      document.addEventListener(screenfull.raw.fullscreenchange, () => {
        this.setState({fullscreen: screenfull.isFullscreen})
      })
    }
  }

  handleTimeRange(value) {
    const {setFilter} = this.props
    setFilter('minTime', value[0])
    setFilter('maxTime', value[1])
  }

  handleMagRange(value) {
    const {setFilter} = this.props
    setFilter('minMag', value[0])
    setFilter('maxMag', value[1])
  }

  handleBaseLayerChange(event) {
    const {setBaseLayer} = this.props
    setBaseLayer(event.target.value)
  }

  handlePlateLayerChange(event) {
    const {setPlatesVisible} = this.props
    setPlatesVisible(event.target.checked)
  }

  handleAnimStep(newValue) {
    const {filters, setFilter, setAnimationEnabled} = this.props
    if (newValue > filters.get('maxTimeLimit')) {
      newValue = filters.get('maxTimeLimit')
      setAnimationEnabled(false)
    }
    setFilter('maxTime', newValue)
  }

  handlePlayPauseBtnClick() {
    const {animationEnabled, setAnimationEnabled} = this.props
    setAnimationEnabled(!animationEnabled)
  }

  handleResetBtnClick() {
    const {reset} = this.props
    reset()
  }

  get dateMarks() {
    const {filters} = this.props
    const min = filters.get('minTimeLimit')
    const max = filters.get('maxTimeLimit')
    let marks = {
      [min]: {label: sliderDateFormatter(min)},
      [max]: {label: sliderDateFormatter(max)}
    }
    if (min != 0 && max != 0) {
      // add tick marks for each decade between min and max
      Object.assign(marks, sliderTickFormatter(min, max))
    }
    return marks
  }

  get mapLayerOptions() {
    return layerInfo.map((m, idx) => <option key={idx} value={m.type}>{m.name}</option>)
  }

  get animSpeed() {
    const {filters} = this.props
    return (filters.get('maxTimeLimit') - filters.get('minTimeLimit')) / 15000
  }

  get fullscreenIconStyle() {
    return this.state.fullscreen ? 'fullscreen-icon fullscreen' : 'fullscreen-icon';
  }

  render() {
    const {animationEnabled, filters, layers, mode} = this.props
    const minMag = filters.get('minMag')
    const maxMag = filters.get('maxMag')

    return (
      <div>
        <div className='bottom-controls'>
          <div>
            <AnimationButtons ref='playButton' animationEnabled={animationEnabled} value={filters.get('maxTime')}
                              speed={this.animSpeed}
                              onPlayPause={this.handlePlayPauseBtnClick} onReset={this.handleResetBtnClick}
                              onAnimationStep={this.handleAnimStep}/>
          </div>
          <div className='center'>
            <Slider className='slider-big' range min={filters.get('minTimeLimit')} max={filters.get('maxTimeLimit')}
                    step={86400}
                    value={[filters.get('minTime'), filters.get('maxTime')]} onChange={this.handleTimeRange}
                    tipFormatter={sliderDateFormatter} marks={this.dateMarks}/>
          </div>
          {screenfull.enabled &&
          <div className={this.fullscreenIconStyle} onClick={toggleFullscreen}>
          </div>
          }
        </div>
        <div className='settings'>
          <div>
            <img src={ccLogoSrc}/>
          </div>
          <div>
            Map type
            <select value={layers.get('base') } onChange={this.handleBaseLayerChange}>
              {this.mapLayerOptions}
            </select>
          </div>
          {mode !== '3d' &&
          <div>
            <label htmlFor='plate-border-box'>Plate boundaries</label>
            <input type='checkbox' checked={layers.get('plates') } onChange={this.handlePlateLayerChange}
                   id='plate-border-box'/>
          </div>
          }
          <div>
            <div className='mag-label'>Magnitudes from <strong>{minMag.toFixed(1)}</strong> to <strong>{maxMag.toFixed(1)}</strong></div>
            <div className='mag-slider'>
              <Slider range min={0} max={10} step={0.1} value={[minMag, maxMag]}
                      onChange={this.handleMagRange} marks={{0: 0, 5: 5, 10: 10}}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    filters: state.get('filters'),
    layers: state.get('layers'),
    mode: state.get('mode'),
    animationEnabled: state.get('animationEnabled')
  }
}

export default connect(mapStateToProps, actions)(BottomControls)
