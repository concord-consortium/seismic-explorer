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
      config: props.dataLayerConfig ? props.dataLayerConfig : 2,
      exclusiveLayers:  props.dataLayerConfig ? layerConfig[props.dataLayerConfig].exclusiveLayers : true
    }
    this.toggle = this.toggle.bind(this)
    this.hide = this.hide.bind(this)

    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
    this.handleEarthquakeLayerChange = this.handleEarthquakeLayerChange.bind(this)
    this.handleVolcanoLayerChange = this.handleVolcanoLayerChange.bind(this)
    this.handlePlateMovementLayerChange = this.handlePlateMovementLayerChange.bind(this)

  }
  componentWillMount() {
    this.setInitialState()
  }
  setInitialState() {
    // Earthquakes are the default on the map, so on configurations that do not include that layer,
    // disable the earthquake layer controls at the start.
    const {setEarthquakesVisible} = this.props
    const conf = layerConfig[this.state.config]

    if (!conf.earthquakes) {
      setEarthquakesVisible(conf.earthquakes)
    }
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
    const {setEarthquakesVisible, setVolcanosVisible, setPlateMovementVisible} = this.props
    const visible = event.target.checked
    setVolcanosVisible(visible)
    log('VolcanosVisibilityChanged', {visible})
    if (visible && this.state.exclusiveLayers) {
      setEarthquakesVisible(false)
      setPlateMovementVisible(false)
    }
  }

  handleEarthquakeLayerChange(event) {
    const {setEarthquakesVisible, setVolcanosVisible, setPlateMovementVisible} = this.props
    const visible = event.target.checked
    setEarthquakesVisible(visible)
    log("show earthquakes", {visible})
    if (visible && this.state.exclusiveLayers) {
      setVolcanosVisible(false)
      setPlateMovementVisible(false)
    }
  }
  handlePlateMovementLayerChange(event) {
    const {setEarthquakesVisible, setVolcanosVisible, setPlateMovementVisible, setPlatesVisible} = this.props
    const visible = event.target.checked
    setPlateMovementVisible(visible)
    log("show plate movement", { visible })
    // show plate borders when movement layer is visible
    setPlatesVisible(visible)
    if (visible && this.state.exclusiveLayers) {
      setVolcanosVisible(false)
      setEarthquakesVisible(false)
    }
  }

  render() {
    const {layers, mode} = this.props
    const { opened, config } = this.state
    const inputType = layerConfig[config].exclusiveLayers ? 'radio' : 'checkbox'
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
              <input type={inputType} checked={layers.get('volcanos')} onChange={this.handleVolcanoLayerChange}
                id='volcano-box' value='volcanos' name='datatype' />
              <label htmlFor='volcano-box'>Volcanos</label>
            </div>
          }
          { layerConfig[config].earthquakes &&
            <div className='toggle-earthquakes' title="Show or hide all earthquakes on the map">
              <input type={inputType} id="earthquake-toggle" checked={layers.get('earthquakes')} onChange={this.handleEarthquakeLayerChange} value='earthquakes' name='datatype' />
              <label htmlFor='earthquake-toggle'>Earthquakes</label>
            </div>
          }
          { layerConfig[config].plateMovement &&
            <div className='toggle-plate-movement' title="Show or hide plate movement vectors">
              <input type={inputType} id="plate-movement-toggle" checked={layers.get('platemovement')} onChange={this.handlePlateMovementLayerChange} value='platemovement' name='datatype' />
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
