import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import * as actions from '../actions'
import SeismicEruptionsMap from '../components/seismic-eruptions-map'
import AnimationButton from '../components/animation-button'

import '../../css/app.less'

@pureRender
class App extends Component {
  constructor(props) {
    super(props)
    this.handleMaxTime = this.handleMaxTime.bind(this)
    this.handleBaseLayerChange = this.handleBaseLayerChange.bind(this)
    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
    this.handleAnimStep = this.handleAnimStep.bind(this)
    this.handleAnimBtnClick = this.handleAnimBtnClick.bind(this)
  }

  componentDidMount() {
    this.updateRegion()
  }

  componentDidUpdate(prevProps) {
    // params.regionPath is provided by react-router.
    if (prevProps.params.regionPath !== this.props.params.regionPath) {
      this.updateRegion()
    }
  }

  updateRegion() {
    const { params, requestData } = this.props
    // params.regionPath is provided by react-router.
    requestData(params.regionPath)
  }

  handleMaxTime(event) {
    const { setFilter } = this.props
    setFilter('maxTime', Number.parseInt(event.target.value))
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
    const { animation, setAnimationEnabled } = this.props
    setAnimationEnabled(!animation)
  }

  get animSpeed() {
    const { filters } = this.props
    return (filters.get('maxTimeLimit') - filters.get('minTimeLimit')) / 15000
  }

  render() {
    const { region, earthquakes, layers, filters, animation } = this.props
    return (
      <div className='seismic-eruptions-app'>
        <div className={`map-container ${animation ? ' with-animation' : ''}`}>
          <SeismicEruptionsMap region={region} earthquakes={earthquakes} layers={layers}/>
        </div>
        <div className='controls-container'>
          <AnimationButton ref='playButton' animationEnabled={animation} speed={this.animSpeed} value={filters.get('maxTime')}
                           onClick={this.handleAnimBtnClick} onAnimationStep={this.handleAnimStep}/>
          <div className='filters'>
            <input type='range' min={filters.get('minTimeLimit')} max={filters.get('maxTimeLimit')} step='86400' value={filters.get('maxTime')} onChange={this.handleMaxTime}/>
          </div>
          <select value={layers.get('base')} onChange={this.handleBaseLayerChange}>
            <option value='satellite'>Satellite</option>
            <option value='street'>Street</option>
            <option value='earthquake-density'>Earthquake density</option>
          </select>
          <label>Plates: <input type='checkbox' checked={layers.get('plates')} onChange={this.handlePlateLayerChange}/></label>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const dataStatus = state.get('dataStatus')
  return {
    isFetching: dataStatus.get('isFetching'),
    lastUpdated: dataStatus.get('lastUpdated'),
    error: dataStatus.get('error'),
    filters: state.get('filters'),
    region: state.get('region'),
    layers: state.get('layers'),
    animation: state.get('animation'),
    earthquakes: state.get('filteredEarthquakes')
  }
}

export default connect(mapStateToProps, actions)(App)
