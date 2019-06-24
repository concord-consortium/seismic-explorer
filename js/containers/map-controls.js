import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import log from '../logger'
import Button from '@material-ui/core/Button'
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

  render () {
    const { layers } = this.props
    const { opened } = this.state
    return (
      <div className='map-layer-controls'>
        <Button variant='contained' color='primary' onClick={this.toggle} data-test='map-type'>Map Type</Button>
        { opened &&
          <div className='modal-style map-layer-content'>
            <i onClick={this.hide} className='close-icon fa fa-close' />
            <div className='title'>Maps:</div>
            <div title='Change the map rendering style'>
              <RadioGroup value={layers.get('base')} onChange={this.handleBaseLayerChange}>
                {
                  layerInfo.map((m, idx) =>
                    <FormControlLabel key={idx} value={m.type} control={<Radio />} label={m.name}
                    />
                  )
                }
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
