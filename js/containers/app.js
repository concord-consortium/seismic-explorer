import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import * as actions from '../actions'
import Controls from './controls'
import SeismicEruptionsMap from '../components/seismic-eruptions-map'
import LoadingIcon from '../components/loading-icon'
import { enableShutterbug, disableShutterbug } from '../shutterbug-support'

import '../../css/app.less'
import 'font-awesome/css/font-awesome.css'

const APP_CLASS_NAME = 'seismic-eruptions-app'

@pureRender
class App extends Component {
  componentDidMount() {
    enableShutterbug(APP_CLASS_NAME)
    this.updateRegion()
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
    const { params, requestData, updateRegionsHistory } = this.props
    // params.regionPath is provided by react-router.
    requestData(params.regionPath)
    updateRegionsHistory(params.regionPath)
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

  renderApp() {
    const { region, earthquakes, layers, animationEnabled, dataFetching, crossSectionPoints,
            regionsHistory, mode, setMode, setCrossSectionPoint } = this.props
    // 'with-animation' class enables fancy animation of earthquakes when they are hidden or show.
    // Enable it only when user started animation using play button, as it's too slow for manual
    // filtering using sliders.
    return (
      <div>
        {dataFetching && <LoadingIcon/>}
        <div className={`map-container ${animationEnabled ? ' with-animation' : ''}`}>
          <SeismicEruptionsMap region={region} regionsHistory={regionsHistory} earthquakes={earthquakes} layers={layers}
                               crossSectionPoints={crossSectionPoints} setCrossSectionPoint={setCrossSectionPoint}
                               mode={mode} setMode={setMode}/>
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
    animationEnabled: state.get('animationEnabled'),
    earthquakes: state.get('filteredEarthquakes'),
    regionsHistory: state.get('regionsHistory'),
    crossSectionPoints: state.get('crossSectionPoints')
  }
}

export default connect(mapStateToProps, actions)(App)
