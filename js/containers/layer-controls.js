import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'
import {connect} from 'react-redux'
import * as actions from '../actions'
import OverlayButton from '../components/overlay-button'
import {layerInfo} from '../map-layer-tiles'
import log from '../logger'

import '../../css/layer-controls.less'
import '../../css/settings-controls.less'

@pureRender
class LayerControls extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opened: false
    }
    this.toggle = this.toggle.bind(this)
    this.hide = this.hide.bind(this)

    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
    this.handleEarthquakeLayerChange = this.handleEarthquakeLayerChange.bind(this)
    this.handleVolcanoLayerChange = this.handleVolcanoLayerChange.bind(this)
  }

  toggle() {
    var currentState = this.state.opened;
    this.setState({opened: !currentState})
    log('LayerMenuClicked')
  }

  hide() {
    this.setState({opened: false})
  }

  handlePlateLayerChange(event) {
    const {setPlatesVisible} = this.props
    const visible = event.target.checked
    setPlatesVisible(visible)
    log('PlatesVisibilityChanged', {visible})
  }

  handleVolcanoLayerChange(event) {
    const {setVolcanosVisible} = this.props
    const visible = event.target.checked
    setVolcanosVisible(visible)
    log('VolcanosVisibilityChanged', {visible})
  }

  handleEarthquakeLayerChange(event) {
    const {setEarthquakesVisible} = this.props
    const visible = event.target.checked
    setEarthquakesVisible(visible)
    log("show earthquakes", {visible})
  }

  render() {
    const {layers, mode} = this.props
    const { opened } = this.state

    return (
      <div className='map-layer-controls'>
        <OverlayButton onClick={this.toggle}>Data type</OverlayButton>
        {opened &&
        <div className='modal-style map-layer-content'>
          <i onClick={this.hide} className='close-icon fa fa-close'/>
          <div>Data Available:</div>
          {mode !== '3d' &&
          <div title="Show Plate Boundaries Overlay">
            <input type='checkbox' checked={layers.get('plates') } onChange={this.handlePlateLayerChange}
                  id='plate-border-box'/>
            <label htmlFor='plate-border-box'>Plate boundaries</label>
          </div>
          }
          <div title="Show Volcanos">
            <input type='checkbox' checked={layers.get('volcanos') } onChange={this.handleVolcanoLayerChange}
                  id='volcano-box'/>
            <label htmlFor='volcano-box'>Volcanos</label>
          </div>
          <div className='toggle-earthquakes' title="Show or hide all earthquakes on the map">
          <input type="checkbox" id="earthquake-toggle" checked={layers.get('earthquakes')} onChange={this.handleEarthquakeLayerChange} />
          <label htmlFor='earthquake-toggle'>Earthquakes</label>
          </div>
        </div>
        }
      </div>
    )}
}

function mapStateToProps(state) {
  return {
    layers: state.get('layers'),
    mode: state.get('mode')
  }
}

export default connect(mapStateToProps, actions)(LayerControls)
