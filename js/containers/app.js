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
  }

  componentDidMount() {
    const { requestData } = this.props
    requestData('regions/world.json')
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

  render() {
    const { region, earthquakes, filters } = this.props
    return (
      <div className='seismic-eruptions-app'>
        <div className='map-container'>
          <SeismicEruptionsMap region={region} earthquakes={earthquakes}/>
        </div>
        <div className='controls-container'>
          <div className='filters'>
            <label>Min mag: <input type='range' min='0' max='10' step='0.1' value={filters.get('minMag')} onChange={this.handleMinMag}/></label>
            <label>Max mag: <input type='range' min='0' max='10' step='0.1' value={filters.get('maxMag')} onChange={this.handleMaxMag}/></label>
            <label>Min time: <input type='range' min='-347155200000' max='1458142681658' step='86400' value={filters.get('minTime')} onChange={this.handleMinTime}/></label>
            <label>Max time: <input type='range' min='-347155200000' max='1458142681658' step='86400' value={filters.get('maxTime')} onChange={this.handleMaxTime}/></label>
          </div>
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
    earthquakes: state.get('filteredEarthquakes')
  }
}

export default connect(mapStateToProps, actions)(App)
