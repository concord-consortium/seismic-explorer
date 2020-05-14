import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import LayerControls from './layer-controls'
import MapControls from './map-controls'
import { layerInfo } from '../map-layer-tiles'
import log from '../logger'
import * as actions from '../actions'

import '../../css/simplified-controls.less'

class SimplifiedControls extends PureComponent {
  constructor (props) {
    super(props)
    this.handleBaseLayerChange = this.handleBaseLayerChange.bind(this)
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
  render () {
    return (
      <div className='simplified-controls'>
        <MapControls mapTypeFilters={['street', 'satellite']} />
        <LayerControls />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    filters: state.get('filters'),
    layers: state.get('layers'),
    mode: state.get('mode'),
    pins: state.get('pins')
  }
}

export default connect(mapStateToProps, actions)(SimplifiedControls)
