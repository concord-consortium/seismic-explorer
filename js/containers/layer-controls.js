import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'
import {connect} from 'react-redux'
import * as actions from '../actions'
import OverlayButton from '../components/overlay-button'
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
    this.handlePlateArrowLayerChange = this.handlePlateArrowLayerChange.bind(this)


  }
  componentWillMount() {
    this.setInitialState()
  }
  setInitialState() {
    // Earthquakes are the default on the map, so on configurations that do not include that layer,
    // disable the earthquake layer controls at the start.
    const {setEarthquakesVisible} = this.props
    const conf = layerConfig[this.state.config]
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
    const {setPlatesVisible, setPlateMovementVisible, setPlateArrowsVisible} = this.props
    const visible = event.target.checked
    setPlatesVisible(visible)
    //set arrows layers invisible when plate layer invisible
    if (!visible) {
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
    log('PlatesVisibilityChanged', {visible})
  }

  handleVolcanoLayerChange(event) {
    const {setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlateArrowsVisible} = this.props
    const visible = event.target.checked
    setVolcanoesVisible(visible)
    log('VolcanoesVisibilityChanged', {visible})
    if (visible && this.state.exclusiveLayers) {
      setEarthquakesVisible(false)
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
  }

  handleEarthquakeLayerChange(event) {
    const {setAnimationEnabled, setFilter, filters, setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlateArrowsVisible} = this.props
    const visible = event.target.checked
    setEarthquakesVisible(visible)
    log("show earthquakes", {visible})
    if (visible && this.state.exclusiveLayers) {
      setVolcanoesVisible(false)
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
    
    if(visible) {
      setAnimationEnabled(true)
      setFilter('animEndTime', filters.get('maxTimeLimit'))
      setFilter('maxTime', filters.get('minTime'))
    }
    else {
      setAnimationEnabled(false)
    }
  }
  handlePlateMovementLayerChange(event) {
    const {layers, setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlatesVisible, setPlateArrowsVisible} = this.props
    const visible = event.target.checked
    setPlateMovementVisible(visible)

    log("show plate movement", { visible })
    // show plate borders when movement layer is visible
    setPlatesVisible(visible || layers.get('platearrows'))
    if (visible && this.state.exclusiveLayers) {
      setVolcanoesVisible(false)
      setEarthquakesVisible(false)
      setPlateArrowsVisible(false)
    }
  }
  handlePlateArrowLayerChange(event) {
    const {layers, setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlatesVisible, setPlateArrowsVisible} = this.props
    const visible = event.target.checked
    setPlateArrowsVisible(visible)
    log("show plate arrows", { visible })
    // show plate borders when arrows layer is visible
    setPlatesVisible(visible || layers.get('platemovement'))
    if (visible && this.state.exclusiveLayers) {
      setVolcanoesVisible(false)
      setEarthquakesVisible(false)
      setPlateMovementVisible(false)
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
          { mode !== '3d' && layerConfig[config].plateOutlines.available &&
          <div title="Show Plate Boundaries Overlay">
            <input type='checkbox' checked={layers.get('plates') } onChange={this.handlePlateLayerChange}
                  id='plate-border-box'/>
            <label htmlFor='plate-border-box'>Plate boundaries</label>
          </div>
          }
          { layerConfig[config].plateOutlines.available && <div><hr /></div> }
          { layerConfig[config].volcanoes.available &&
            <div title="Show Volcanoes">
              <input type={inputType} checked={layers.get('volcanoes')} onChange={this.handleVolcanoLayerChange}
                id='volcano-box' value='volcanoes' name='datatype' />
              <label htmlFor='volcano-box'>Volcanoes</label>
            </div>
          }
          { layerConfig[config].earthquakes.available &&
            <div className='toggle-earthquakes' title="Show or hide all earthquakes on the map">
              <input type={inputType} id="earthquake-toggle" checked={layers.get('earthquakes')} onChange={this.handleEarthquakeLayerChange} value='earthquakes' name='datatype' />
              <label htmlFor='earthquake-toggle'>Earthquakes</label>
            </div>
          }
          { layerConfig[config].plateMovement.available &&
            <div className='toggle-plate-movement' title="Show or hide plate movement vectors">
              <input type={inputType} id="plate-movement-toggle" checked={layers.get('platemovement')} onChange={this.handlePlateMovementLayerChange} value='platemovement' name='datatype' />
              <label htmlFor='plate-movement-toggle'>Plate Movement</label>
            </div>
          }
          { layerConfig[config].plateArrows.available &&
            <div className='toggle-arrow-movement' title="Show or hide plate movement arrows">
              <input type={inputType} id="plate-arrow-toggle" checked={layers.get('platearrows')} onChange={this.handlePlateArrowLayerChange} value='platearrows' name='datatype'/>
              <label htmlFor='plate-arrow-toggle'>Plate Arrows</label>
            </div>
          }
        </div>
        }
      </div>
    )}
}

function mapStateToProps(state) {
  return {
    filters: state.get('filters'),
    layers: state.get('layers'),
    mode: state.get('mode')
  }
}

export default connect(mapStateToProps, actions)(LayerControls)
