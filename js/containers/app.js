import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import * as actions from '../actions'
import SeismicEruptionsMap from '../components/seismic-eruptions-map'
import Controls from './controls'

import '../../css/app.less'

@pureRender
class App extends Component {
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

  render() {
    const { region, earthquakes, layers, animationEnabled } = this.props
    return (
      <div className='seismic-eruptions-app'>
        /* 'with-animation' class enables fancy animation of earthquakes when they are hidden or show.
           Enable it only when user started animation using play button, as it's too slow for manual
           filtering using sliders.  */
        <div className={`map-container ${animationEnabled ? ' with-animation' : ''}`}>
          <SeismicEruptionsMap region={region} earthquakes={earthquakes} layers={layers}/>
        </div>
        <div className='controls-container'>
          <Controls/>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    filters: state.get('filters'),
    region: state.get('region'),
    layers: state.get('layers'),
    animationEnabled: state.get('animationEnabled'),
    earthquakes: state.get('filteredEarthquakes')
  }
}

export default connect(mapStateToProps, actions)(App)
