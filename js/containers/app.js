import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import TopControls from '../components/top-controls'
import OverlayControls from './overlay-controls'
import BottomControls from './bottom-controls'
import SeismicEruptionsMap from '../components/seismic-eruptions-map'
import CrossSection3D from '../components/cross-section-3d'
import LoadingIcon from '../components/loading-icon'
import SplashScreen from '../components/splash-screen'
import SimplifiedControls from './simplified-controls'
import { enableShutterbug, disableShutterbug } from '../shutterbug-support'
import { getVisibleEarthquakes, getVisibleVolcanoes } from '../selectors'
import config from '../config'

import '../../css/app.less'
import 'font-awesome/css/font-awesome.css'

const APP_CLASS_NAME = 'seismic-explorer-app'

class App extends PureComponent {
  constructor (props) {
    super(props)
    this.latLngToPoint = this.latLngToPoint.bind(this)
    this.resetView = this.resetView.bind(this)
  }

  componentDidMount () {
    enableShutterbug(APP_CLASS_NAME)
  }

  componentWillUnmount () {
    disableShutterbug()
  }

  renderError () {
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
  latLngToPoint (latLng) {
    return this.refs.map.latLngToPoint(latLng)
  }

  resetView () {
    const { mode } = this.props
    if (mode !== '3d') {
      this.refs.map.fitBounds()
    } else {
      this.refs.view3d.resetCamera()
    }
  }

  renderApp () {
    const { dataFetching, earthquakes, volcanoes, layers, crossSectionPoints, mapStatus, setMapStatus, updateEarthquakesData,
      mark2DViewModified, mark3DViewModified, mode, setCrossSectionPoint, changedViews, pins, setPin } = this.props
    const showUI = config.showUserInterface
    const simplifiedUI = config.simplifiedUI
    return (
      <div>
        {dataFetching && <LoadingIcon />}
        {showUI &&
          <div className='top-controls-container'>
            <TopControls />
          </div>
        }
        <div className={`map-container mode-${mode} ${showUI === false ? 'full-height' : ''}`}>
          <SeismicEruptionsMap ref='map' earthquakes={earthquakes} volcanoes={volcanoes}
            mode={mode} layers={layers} crossSectionPoints={crossSectionPoints} mapStatus={mapStatus} mapModified={changedViews.has('2d')}
            setMapStatus={setMapStatus} setCrossSectionPoint={setCrossSectionPoint} mark2DViewModified={mark2DViewModified}
            updateEarthquakesData={updateEarthquakesData}
            pins={pins} setPin={setPin} />
          {mode === '3d' &&
            <CrossSection3D ref='view3d' earthquakes={earthquakes} volcanoes={volcanoes} crossSectionPoints={crossSectionPoints}
              mapType={layers.get('base')} latLngToPoint={this.latLngToPoint}
              mark3DViewModified={mark3DViewModified} />
          }
          {showUI &&
            <OverlayControls resetView={this.resetView} />
          }
        </div>
        {showUI &&
          <div className='bottom-controls-container'>
            <BottomControls />
          </div>
        }
        {simplifiedUI &&
          <SimplifiedControls />
        }
      </div>
    )
  }

  render () {
    const { error } = this.props
    return (
      <div className={APP_CLASS_NAME}>
        <SplashScreen />
        {error ? this.renderError() : this.renderApp()}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    error: state.getIn(['dataStatus', 'error']),
    dataFetching: state.getIn(['downloadStatus', 'requestsInProgress']),
    mode: state.get('mode'),
    changedViews: state.get('changedViews'),
    filters: state.get('filters'),
    layers: state.get('layers'),
    earthquakes: getVisibleEarthquakes(state),
    volcanoes: getVisibleVolcanoes(state),
    crossSectionPoints: state.get('crossSectionPoints'),
    mapStatus: state.get('mapStatus'),
    pins: state.get('pins')
  }
}

export default connect(mapStateToProps, actions)(App)
