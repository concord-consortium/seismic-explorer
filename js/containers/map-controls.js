import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import log from '../logger'
import OverlayButton from '../components/overlay-button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { layerInfo } from '../map-layer-tiles'

import '../../css/layer-controls.less'

class MapControls extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      opened: false
    }
    this.toggle = this.toggle.bind(this)
    this.hide = this.hide.bind(this)
    this.handleBaseLayerChange = this.handleBaseLayerChange.bind(this)
  }

  toggle () {
    this.setState({ opened: !this.state.opened })
    log('MapTypeMenuClicked')
  }

  hide () {
    this.setState({ opened: false })
  }

  handleBaseLayerChange (event) {
    const { setBaseLayer } = this.props
    const layer = event.target.value
    setBaseLayer(layer)
    log('MapLayerChanged', { layer })
  }

  getMapTypes() {
    const { mapTypeFilters } = this.props
    if (mapTypeFilters) {
      const maps = [];
      layerInfo.map((m, idx) => {
        if (mapTypeFilters.indexOf(m.type) > -1) {
          const name = m.name.indexOf(' ') > -1 ? m.name.substring(0, m.name.indexOf(' ')) : m.name
          maps.push(<FormControlLabel key={idx} value={m.type} control={<Radio />} label={name}
          />)
        }
      })
      return maps
    } else {
      return layerInfo.map((m, idx) =>
        <FormControlLabel key={idx} value={m.type} control={<Radio />} label={m.name}
        />
      )
    }
  }

  render () {
    const { layers } = this.props
    const { opened } = this.state
    return (
      <div className='map-layer-controls'>
        <OverlayButton onClick={this.toggle} dataTest='map-type'>Map Type</OverlayButton>
        { opened &&
          <div className='modal-style map-layer-content'>
            <i onClick={this.hide} className='close-icon fa fa-close' />
            <div className='title'>Maps:</div>
            <div title='Change the map rendering style'>
              <RadioGroup value={layers.get('base')} onChange={this.handleBaseLayerChange}>
                {this.getMapTypes()}
              </RadioGroup>
            </div>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    layers: state.get('layers')
  }
}

export default connect(mapStateToProps, actions)(MapControls)
