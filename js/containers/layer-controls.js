import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'
import {connect} from 'react-redux'
import * as actions from '../actions'
import OverlayButton from '../components/overlay-button'
import {layerInfo} from '../map-layer-tiles'
import log from '../logger'
import layerConfig from '../layer-data-config'

import '../../css/layer-controls.less'
import '../../css/settings-controls.less'

@pureRender
class LayerControls extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opened: false,
      config: props.dataLayerConfig ? props.dataLayerConfig : 3
    }
    this.toggle = this.toggle.bind(this)
    this.hide = this.hide.bind(this)

    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
    this.handleEarthquakeLayerChange = this.handleEarthquakeLayerChange.bind(this)
    this.handleVolcanoLayerChange = this.handleVolcanoLayerChange.bind(this)
    this.handlePlateMovementLayerChange = this.handlePlateMovementLayerChange.bind(this)
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
    const {setVolcanosVisible, setEarthquakesVisible} = this.props
    const visible = event.target.checked
    setVolcanosVisible(visible)
    log('VolcanosVisibilityChanged', {visible})
    if (visible) {
      setEarthquakesVisible(false)
    }
  }

  handleEarthquakeLayerChange(event) {
    const {setEarthquakesVisible, setVolcanosVisible} = this.props
    const visible = event.target.checked
    setEarthquakesVisible(visible)
    log("show earthquakes", {visible})
    if (visible) {
      setVolcanosVisible(false)
    }
  }
  handlePlateMovementLayerChange(event) {
    console.log("not yet implemented")
  }

  render() {
    const {layers, mode} = this.props
    const { opened, config } = this.state

    return (
      <div className='map-layer-controls'>
        <OverlayButton onClick={this.toggle}>Data type</OverlayButton>
        { opened &&
        <div className='modal-style map-layer-content'>
          <i onClick={this.hide} className='close-icon fa fa-close'/>
          <div>Data Available:</div>
          { mode !== '3d' && layerConfig[config].plateOutlines &&
          <div title="Show Plate Boundaries Overlay">
            <input type='checkbox' checked={layers.get('plates') } onChange={this.handlePlateLayerChange}
                  id='plate-border-box'/>
            <label htmlFor='plate-border-box'>Plate boundaries</label>
          </div>
          }
          { layerConfig[config].plateOutlines && <div><hr /></div> }
          { layerConfig[config].volcanos &&
            <div title="Show Volcanos">
              <input type='radio' checked={layers.get('volcanos')} onChange={this.handleVolcanoLayerChange}
                id='volcano-box' value='volcanos' name='datatype' />
              <label htmlFor='volcano-box'>Volcanos</label>
            </div>
          }
          { layerConfig[config].earthquakes &&
            <div className='toggle-earthquakes' title="Show or hide all earthquakes on the map">
              <input type="radio" id="earthquake-toggle" checked={layers.get('earthquakes')} onChange={this.handleEarthquakeLayerChange} value='earthquakes' name='datatype' />
              <label htmlFor='earthquake-toggle'>Earthquakes</label>
            </div>
          }
          { layerConfig[config].plateMovement &&
            <div className='toggle-plate-movement' title="Show or hide plate movement vectors">
              <input type="radio" id="plate-movement-toggle" checked={false} onChange={this.handlePlateMovementLayerChange} value='platemovement' name='datatype' />
              <label htmlFor='plate-movement-toggle'>Plate Movement</label>
            </div>
          }
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
