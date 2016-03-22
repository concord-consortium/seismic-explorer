import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import * as actions from '../actions'
import SeismicEruptionsMap from '../components/seismic-eruptions-map'

import '../../css/app.less'

@pureRender
class App extends Component {
  constructor(props) {
    super(props)
    this.handleMinMag = this.handleMinMag.bind(this)
    this.handleMaxMag = this.handleMaxMag.bind(this)
    this.handleMinTime = this.handleMinTime.bind(this)
    this.handleMaxTime = this.handleMaxTime.bind(this)
    this.handleBaseLayerChange = this.handleBaseLayerChange.bind(this)
    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
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

  handleMinMag(event) {
    const { setMinMag } = this.props
    setMinMag(event.target.value)
  }

  handleMaxMag(event) {
    const { setMaxMag } = this.props
    setMaxMag(event.target.value)
  }

  handleMinTime(event) {
    const { setMinTime } = this.props
    setMinTime(event.target.value)
  }

  handleMaxTime(event) {
    const { setMaxTime } = this.props
    setMaxTime(event.target.value)
  }

  handleBaseLayerChange(event) {
    const { setBaseLayer } = this.props
    setBaseLayer(event.target.value)
  }

  handlePlateLayerChange(event) {
    const { setPlatesVisible } = this.props
    setPlatesVisible(event.target.checked)
  }

  render() {
    const { region, earthquakes, layers, filters } = this.props
    return (
      <div className='seismic-eruptions-app'>
        <div className='map-container'>
          <SeismicEruptionsMap region={region} earthquakes={earthquakes} layers={layers}/>
        </div>
        <div className='controls-container'>
          <div className='filters'>
            <label>Max time: <input type='range' min='-347155200000' max='1458142681658' step='86400' value={filters.get('maxTime')} onChange={this.handleMaxTime}/></label>
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
    earthquakes: state.get('filteredEarthquakes')
  }
}

export default connect(mapStateToProps, actions)(App)
