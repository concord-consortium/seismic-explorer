import React, { PureComponent } from 'react'
import {connect} from 'react-redux'
import * as actions from '../actions'
import OverlayButton from '../components/overlay-button'
import log from '../logger'
import config from '../config'

import '../../css/layer-controls.less'
import '../../css/settings-controls.less'

const inputType = config.exclusiveDataLayers ? 'radio' : 'checkbox'

class LayerControls extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      opened: false
    }
    this.toggle = this.toggle.bind(this)
    this.hide = this.hide.bind(this)

    this.handlePlateLayerChange = this.handlePlateLayerChange.bind(this)
    this.handleEarthquakeLayerChange = this.handleEarthquakeLayerChange.bind(this)
    this.handleVolcanoLayerChange = this.handleVolcanoLayerChange.bind(this)
    this.handlePlateMovementLayerChange = this.handlePlateMovementLayerChange.bind(this)
    this.handlePlateArrowLayerChange = this.handlePlateArrowLayerChange.bind(this)
  }

  toggle () {
    this.setState({opened: !this.state.opened})
    log('LayerMenuClicked')
  }

  hide () {
    this.setState({opened: false})
  }

  handlePlateLayerChange (event) {
    const { setPlatesVisible, setPlateMovementVisible, setPlateArrowsVisible } = this.props
    const visible = event.target.checked
    setPlatesVisible(visible)
    // set arrows layers invisible when plate layer invisible
    if (!visible) {
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
    log('PlatesVisibilityChanged', {visible})
  }

  handleVolcanoLayerChange (event) {
    const { setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setVolcanoesVisible(visible)
    log('VolcanoesVisibilityChanged', { visible })
    if (visible && config.exclusiveDataLayers) {
      setEarthquakesVisible(false, mapRegion, mapZoom)
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
  }

  handleEarthquakeLayerChange (event) {
    const { setAnimationEnabled, setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setEarthquakesVisible(visible, mapRegion, mapZoom)
    log('ShowEarthquakes', { visible })
    if (visible && config.exclusiveDataLayers) {
      setVolcanoesVisible(false)
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
    if (!visible) {
      // Stop earthquakes animation when earthquakes layer is hidden.
      setAnimationEnabled(false)
    }
  }

  handlePlateMovementLayerChange (event) {
    const { layers, setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlatesVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setPlateMovementVisible(visible)
    log('ShowPlateMovement', { visible })
    // show plate borders when movement layer is visible
    setPlatesVisible(visible || layers.get('platearrows'))
    if (visible && config.exclusiveDataLayers) {
      setVolcanoesVisible(false)
      setEarthquakesVisible(false, mapRegion, mapZoom)
      setPlateArrowsVisible(false)
    }
  }

  handlePlateArrowLayerChange (event) {
    const { layers, setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setPlatesVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setPlateArrowsVisible(visible)
    log('ShowPlateArrows', { visible })
    // show plate borders when arrows layer is visible
    setPlatesVisible(visible || layers.get('platemovement'))
    if (visible && config.exclusiveDataLayers) {
      setVolcanoesVisible(false)
      setEarthquakesVisible(false, mapRegion, mapZoom)
      setPlateMovementVisible(false)
    }
  }

  render () {
    const { layers, mode } = this.props
    const { opened } = this.state
    return (
      <div className='map-layer-controls'>
        <OverlayButton onClick={this.toggle}>Data type</OverlayButton>
        { opened &&
        <div className='modal-style map-layer-content'>
          <i onClick={this.hide} className='close-icon fa fa-close' />
          <div>Data Available:</div>
          { config.plateBoundariesAvailable && mode !== '3d' &&
          <div title='Show Plate Boundaries Overlay'>
            <input type='checkbox' checked={layers.get('plates')} onChange={this.handlePlateLayerChange}
              id='plate-border-box' />
            <label htmlFor='plate-border-box'>Plate boundaries</label>
          </div>
          }
          { config.plateBoundariesAvailable && mode !== '3d' && <div><hr /></div> }
          { config.volcanoesAvailable &&
            <div title='Show Volcanoes'>
              <input type={inputType} checked={layers.get('volcanoes')} onChange={this.handleVolcanoLayerChange}
                id='volcano-box' value='volcanoes' name='datatype' />
              <label htmlFor='volcano-box'>Volcanoes</label>
            </div>
          }
          { config.earthquakesAvailable &&
            <div className='toggle-earthquakes' title='Show or hide all earthquakes on the map'>
              <input type={inputType} id='earthquake-toggle' checked={layers.get('earthquakes')} onChange={this.handleEarthquakeLayerChange} value='earthquakes' name='datatype' />
              <label htmlFor='earthquake-toggle'>Earthquakes</label>
            </div>
          }
          { config.plateMovementAvailable && mode !== '3d' &&
          <div className='toggle-arrow-movement' title='Show or hide plate movement arrows'>
            <input type={inputType} id='plate-arrow-toggle' checked={layers.get('platearrows')} onChange={this.handlePlateArrowLayerChange} value='platearrows' name='datatype' />
            <label htmlFor='plate-arrow-toggle'>Plate movement</label>
          </div>
          }
          { config.detailedPlateMovementAvailable && mode !== '3d' &&
            <div className='toggle-plate-movement' title='Show or hide plate movement arrows'>
              <input type={inputType} id='plate-movement-toggle' checked={layers.get('platemovement')} onChange={this.handlePlateMovementLayerChange} value='platemovement' name='datatype' />
              <label htmlFor='plate-movement-toggle'>Plate movement (detailed)</label>
            </div>
          }
        </div>
        }
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    mapRegion: state.get('mapStatus').get('region'),
    mapZoom: state.get('mapStatus').get('zoom'),
    filters: state.get('filters'),
    layers: state.get('layers'),
    mode: state.get('mode')
  }
}

export default connect(mapStateToProps, actions)(LayerControls)
