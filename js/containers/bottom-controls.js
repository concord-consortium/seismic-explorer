import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import * as actions from '../actions'
import AnimationButton from '../components/animation-button'
import Slider from 'rc-slider'
import ccLogoSrc from '../../images/cc-logo.png'
import screenfull from 'screenfull'

import '../../css/bottom-controls.less'
import 'rc-slider/assets/index.css'
import '../../css/slider.less'

function sliderDateFormatter(value) {
  const date = new Date(value)
  // .getMoth() returns [0, 11] range.
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
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
      settingsVisible: false,
      fullscreen: false
    }
    this.handleTimeRange = this.handleTimeRange.bind(this)
    this.handleMagRange = this.handleMagRange.bind(this)
    this.handleBaseLayerChange = this.handleBaseLayerChange.bind(this)
    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
    this.handleAnimStep = this.handleAnimStep.bind(this)
    this.handleAnimBtnClick = this.handleAnimBtnClick.bind(this)
    this.toggleSettings = this.toggleSettings.bind(this)
  }

  componentDidMount() {
    if (screenfull.enabled) {
      document.addEventListener(screenfull.raw.fullscreenchange, () => {
        this.setState({fullscreen: screenfull.isFullscreen})
      })
    }
  }

  handleTimeRange(value) {
    const { setFilter } = this.props
    setFilter('minTime', value[0])
    setFilter('maxTime', value[1])
  }

  handleMagRange(value) {
    const { setFilter } = this.props
    setFilter('minMag', value[0])
    setFilter('maxMag', value[1])
  }

  handleBaseLayerChange(event) {
    const { setBaseLayer } = this.props
    setBaseLayer(event.target.value)
  }

  handlePlateLayerChange(event) {
    const { setPlatesVisible } = this.props
    setPlatesVisible(event.target.checked)
  }

  handleAnimStep(newValue) {
    const { filters, setFilter, setAnimationEnabled } = this.props
    if (newValue > filters.get('maxTimeLimit')) {
      newValue = filters.get('maxTimeLimit')
      setAnimationEnabled(false)
    }
    setFilter('maxTime', newValue)
  }

  handleAnimBtnClick() {
    const { animationEnabled, setAnimationEnabled } = this.props
    setAnimationEnabled(!animationEnabled)
  }

  toggleSettings() {
    const { settingsVisible } = this.state
    this.setState({settingsVisible: !settingsVisible})
  }

  get dateMarks() {
    const { filters } = this.props
    const min = filters.get('minTimeLimit')
    const max = filters.get('maxTimeLimit')
    return {
      [min]: sliderDateFormatter(min),
      [max]: sliderDateFormatter(max)
    }
  }

  get animSpeed() {
    const { filters } = this.props
    return (filters.get('maxTimeLimit') - filters.get('minTimeLimit')) / 15000
  }

  render() {
    const { animationEnabled, filters, layers, mode } = this.props
    const { settingsVisible, fullscreen } = this.state

    return (
      <div className='bottom-controls'>
        <img src={ccLogoSrc}/>
        <AnimationButton ref='playButton' animationEnabled={animationEnabled} speed={this.animSpeed} value={filters.get('maxTime')}
                         onClick={this.handleAnimBtnClick} onAnimationStep={this.handleAnimStep}/>
        <div className='center'>
          <Slider className='slider-big' range min={filters.get('minTimeLimit')} max={filters.get('maxTimeLimit')} step={86400}
                  value={[filters.get('minTime'), filters.get('maxTime')]} onChange={this.handleTimeRange}
                  tipFormatter={sliderDateFormatter} marks={this.dateMarks}/>
        </div>
        <div className='settings-icon' onClick={this.toggleSettings}>
          <i className='fa fa-gear'/>
        </div>
        {screenfull.enabled &&
          <div className='fullscreen-icon' onClick={toggleFullscreen}>
            <i className={`fa ${fullscreen ? 'fa-compress' : 'fa-arrows-alt'}`}/>
          </div>
        }
        <div className={`settings ${settingsVisible ? '' : 'hidden'}`}>
          <h2>Settings</h2>
          <div>
            Displayed map type
            <select value={layers.get('base')} onChange={this.handleBaseLayerChange}>
              <option value='satellite'>Satellite</option>
              <option value='street'>Street</option>
              <option value='earthquake-density'>Earthquake density</option>
            </select>
          </div>
          {mode !== '3d' &&
            <div>
              <input type='checkbox' checked={layers.get('plates')} onChange={this.handlePlateLayerChange}/> Show plate boundaries
            </div>
          }
          <div>
            <div>
              Show earthquakes with magnitude between <strong>{filters.get('minMag').toFixed(1)}</strong> and <strong>{filters.get('maxMag').toFixed(1)}</strong>
            </div>
            <Slider range min={0} max={10} step={0.1} value={[filters.get('minMag'), filters.get('maxMag')]}
                    onChange={this.handleMagRange} marks={{0: 0, 10: 10}}/>
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
