import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import * as actions from '../actions'
import Controls from './controls'
import SeismicEruptionsMap from '../components/seismic-eruptions-map'
import CrossSection3D from '../components/cross-section-3d'
import LoadingIcon from '../components/loading-icon'
import { enableShutterbug, disableShutterbug } from '../shutterbug-support'
import filteredEarthquakes from '../core/filtered-earthquakes'

import '../../css/app.less'
import 'font-awesome/css/font-awesome.css'

const APP_CLASS_NAME = 'seismic-eruptions-app'

@pureRender
class App extends Component {
  constructor(props) {
    super(props)
    this.latLngToPoint = this.latLngToPoint.bind(this)
  }

  componentDidMount() {
    enableShutterbug(APP_CLASS_NAME)
    this.updateRegion()

    // TODO: DEBUG, remove it later.
    const { setMode } = this.props
    window.setMode = setMode
  }

  componentWillUnmount() {
    disableShutterbug()
  }

  componentDidUpdate(prevProps) {
    // params.regionPath is provided by react-router.
    if (prevProps.params.regionPath !== this.props.params.regionPath) {
      this.updateRegion()
    }
  }

  updateRegion() {
    const { params, requestData, updateRegionsHistory, setMode } = this.props
    // params.regionPath is provided by react-router.
    requestData(params.regionPath)
    updateRegionsHistory(params.regionPath)
    // Go back to 2D mode, 3D doesn't support region change.
    setMode('2d')
  }

  renderError() {
    const { error } = this.props
    return (
      <div className='error'>
        <h1>ERROR</h1>
        <div>{error.message}</div>
      </div>
    )
  }

  // Very important method in this app. It ensures that both 2D map and 3D view are perfectly aligned.
  // 3D view directly uses Leaflet latLng transformation. The only difference is that DOM elements have (0,0) point
  // in the top-left corner, while 3D view uses cartesian coordinate system, so we need to transform Y axis.
  // Also, there's an assumption that both Leaflet map and 3D view have the same dimensions.
  latLngToPoint(latLng) {
    return this.refs.map.latLngToPoint(latLng)
  }

  renderApp() {
    const { region, earthquakes, layers, dataFetching, crossSectionPoints,
            regionsHistory, mode, setMode, setCrossSectionPoint, setFilter } = this.props
    return (
      <div>
        {dataFetching && <LoadingIcon/>}
        <div className={`map-container mode-${mode}`}>
          <SeismicEruptionsMap ref='map' region={region} regionsHistory={regionsHistory} earthquakes={earthquakes}
                               layers={layers} crossSectionPoints={crossSectionPoints}
                               setCrossSectionPoint={setCrossSectionPoint}
                               mode={mode} setMode={setMode} setFilter={setFilter}/>
          {mode === '3d' &&
            <CrossSection3D earthquakes={earthquakes} crossSectionPoints={crossSectionPoints}
                            latLngToPoint={this.latLngToPoint} setMode={setMode}/>
          }
        </div>
        <div className='controls-container'>
          <Controls/>
        </div>
      </div>
    )
  }

  render() {
    const { error } = this.props
    return (
      <div className={APP_CLASS_NAME}>
        {error ? this.renderError() : this.renderApp()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    error: state.getIn(['dataStatus', 'error']),
    dataFetching: state.getIn(['dataStatus', 'isFetching']),
    mode: state.get('mode'),
    filters: state.get('filters'),
    region: state.get('region'),
    layers: state.get('layers'),
    earthquakes: filteredEarthquakes(state),
    regionsHistory: state.get('regionsHistory'),
    crossSectionPoints: state.get('crossSectionPoints')
  }
}

export default connect(mapStateToProps, actions)(App)
