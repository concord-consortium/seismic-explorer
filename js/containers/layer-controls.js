import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import log from '../logger'
import config from '../config'
import Checkbox from '@material-ui/core/Checkbox'
import Radio from '@material-ui/core/Radio'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import OverlayButton from '../components/overlay-button'

import '../../css/layer-controls.less'
import '../../css/settings-controls.less'

const CheckboxOrRadio = config.exclusiveDataLayers ? Radio : Checkbox

class LayerControls extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      opened: false
    }
    this.toggle = this.toggle.bind(this)
    this.hide = this.hide.bind(this)

    this.handlePlateBoundariesChange = this.handlePlateBoundariesChange.bind(this)
    this.handlePlateNamesChange = this.handlePlateNamesChange.bind(this)
    this.handleContinentOceanNamesChange = this.handleContinentOceanNamesChange.bind(this)
    this.handleEarthquakeLayerChange = this.handleEarthquakeLayerChange.bind(this)
    this.handleEruptionLayerChange = this.handleEruptionLayerChange.bind(this)
    this.handleVolcanoLayerChange = this.handleVolcanoLayerChange.bind(this)
    this.handlePlateMovementLayerChange = this.handlePlateMovementLayerChange.bind(this)
    this.handlePlateArrowLayerChange = this.handlePlateArrowLayerChange.bind(this)
    this.handleToggleHistoricEruptions = this.handleToggleHistoricEruptions.bind(this)
  }

  toggle () {
    this.setState({ opened: !this.state.opened })
    log('LayerMenuClicked')
  }

  hide () {
    this.setState({ opened: false })
  }

  handlePlateBoundariesChange (event) {
    const { setPlateBoundariesVisible, setPlateMovementVisible, setPlateArrowsVisible } = this.props
    const visible = event.target.checked
    setPlateBoundariesVisible(visible)
    // set arrows layers invisible when plate layer invisible
    if (!visible) {
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
    log('PlatesVisibilityChanged', { visible })
  }

  handlePlateNamesChange (event) {
    const { setPlateNamesVisible } = this.props
    const visible = event.target.checked
    setPlateNamesVisible(visible)
    log('PlatesNamesVisibilityChanged', { visible })
  }

  handleContinentOceanNamesChange (event) {
    const { setContinentOceanNamesVisible } = this.props
    const visible = event.target.checked
    setContinentOceanNamesVisible(visible)
    log('ContinentOceanNamesVisibilityChanged', { visible })
  }

  handleVolcanoLayerChange (event) {
    const { setEarthquakesVisible, setVolcanoesVisible, setPlateMovementVisible, setEruptionsVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setVolcanoesVisible(visible)
    log('VolcanoesVisibilityChanged', { visible })
    if (visible && config.exclusiveDataLayers) {
      setEarthquakesVisible(false, mapRegion, mapZoom)
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
      setEruptionsVisible(false)
    }
  }

  handleEarthquakeLayerChange (event) {
    const { setAnimationEnabled, setEarthquakesVisible, setVolcanoesVisible, setEruptionsVisible, setPlateMovementVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setEarthquakesVisible(visible, mapRegion, mapZoom)
    log('ShowEarthquakes', { visible })
    if (visible && config.exclusiveDataLayers) {
      setVolcanoesVisible(false)
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
      setEruptionsVisible(false)
    }
    if (!visible) {
      // Stop earthquakes animation when earthquakes layer is hidden.
      setAnimationEnabled(false)
    }
  }
  handleEruptionLayerChange (event) {
    const { setAnimationEnabled, setEarthquakesVisible, setVolcanoesVisible, setEruptionsVisible, setPlateMovementVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setEruptionsVisible(visible, mapRegion, mapZoom)
    log('ShowEruptions', { visible })
    if (visible && config.exclusiveDataLayers) {
      setEarthquakesVisible(false, mapRegion, mapZoom)
      setVolcanoesVisible(false)
      setPlateMovementVisible(false)
      setPlateArrowsVisible(false)
    }
    if (!visible) {
      // Stop eruptions animation when eruptions layer is hidden.
      setAnimationEnabled(false)
    }
  }

  handlePlateMovementLayerChange (event) {
    const { layers, setEarthquakesVisible, setVolcanoesVisible, setEruptionsVisible, setPlateMovementVisible, setPlateBoundariesVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setPlateMovementVisible(visible)
    log('ShowPlateMovement', { visible })
    // show plate borders when movement layer is visible
    setPlateBoundariesVisible(visible || layers.get('plateArrows'))
    if (visible && config.exclusiveDataLayers) {
      setVolcanoesVisible(false)
      setEarthquakesVisible(false, mapRegion, mapZoom)
      setPlateArrowsVisible(false)
      setEruptionsVisible(false)
    }
  }

  handlePlateArrowLayerChange (event) {
    const { layers, setEarthquakesVisible, setVolcanoesVisible, setEruptionsVisible, setPlateMovementVisible, setPlateBoundariesVisible, setPlateArrowsVisible, mapRegion, mapZoom } = this.props
    const visible = event.target.checked
    setPlateArrowsVisible(visible)
    log('ShowPlateArrows', { visible })
    // show plate borders when arrows layer is visible
    setPlateBoundariesVisible(visible || layers.get('plateMovement'))
    if (visible && config.exclusiveDataLayers) {
      setVolcanoesVisible(false)
      setEarthquakesVisible(false, mapRegion, mapZoom)
      setPlateMovementVisible(false)
      setEruptionsVisible(false)
    }
  }

  handleToggleHistoricEruptions (event) {
    const { setFilter } = this.props
    setFilter('historicEruptions', event.target.checked)
  }

  render () {
    const { layers, filters, mode } = this.props
    const { opened } = this.state
    const dateFormatter = (value) => {
      const date = new Date(value)
      // .getMonth() returns [0, 11] range.
      let month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      return `${month}/${day}/${date.getFullYear()}`
    }
    return (
      <div className='map-layer-controls'>
        <OverlayButton onClick={this.toggle} dataTest='data-type'>Data Type</OverlayButton>
        { opened &&
        <div className='modal-style map-layer-content'>
          <i onClick={this.hide} className='close-icon fa fa-close' />
          <div className='title'>Data Available:</div>
          { config.plateBoundariesAvailable && mode !== '3d' &&
            <div title='Show Plate Boundaries Overlay'>
              <FormControlLabel
                control={<Checkbox checked={layers.get('plateBoundaries')} onChange={this.handlePlateBoundariesChange} />}
                label='Plate Boundaries'
              />
            </div>
          }
          { config.plateNamesAvailable && mode !== '3d' &&
            <div title='Show Plate Names Overlay'>
              <FormControlLabel
                control={<Checkbox checked={layers.get('plateNames')} onChange={this.handlePlateNamesChange} />}
                label='Plate Names'
              />
            </div>
          }
          { config.continentOceanNamesAvailable && mode !== '3d' &&
          <div title='Show Continent and Ocean Names Overlay'>
            <FormControlLabel
              control={<Checkbox checked={layers.get('continentOceanNames')} onChange={this.handleContinentOceanNamesChange} />}
              label='Continent and Ocean Names'
            />
          </div>
          }
          { (config.plateBoundariesAvailable || config.plateNamesAvailable || config.continentOceanNamesAvailable) && mode !== '3d' &&
            <div><hr /></div>
          }
          { config.earthquakesAvailable &&
            <div className='toggle-earthquakes' title='Show or hide all earthquakes on the map'>
              <FormControlLabel
                control={<CheckboxOrRadio checked={layers.get('earthquakes')} onChange={this.handleEarthquakeLayerChange} />}
                label='Earthquakes'
              />
            </div>
          }
          {config.eruptionsAvailable &&
            <div>
              <div className='toggle-eruptions' title='Show or hide all volcanic eruptions on the map'>
                <FormControlLabel
                  control={<CheckboxOrRadio checked={layers.get('eruptions')} onChange={this.handleEruptionLayerChange} />}
                  label='Volcanic Eruptions'
                />
              </div>
              {config.volcanoesAvailable &&
              <div className='toggle-historic-eruptions' title='Show historic eruptions'>
                <FormControlLabel
                  control={<CheckboxOrRadio checked={filters.get('volcanoes')} onChange={this.handleVolcanoLayerChange} />}
                  label={`Eruptions prior to ${dateFormatter(filters.get('minTime'))}`}
                />
              </div>
              }
            </div>
          }
          { config.plateMovementAvailable && mode !== '3d' &&
          <div className='toggle-arrow-movement' title='Show or hide plate movement arrows'>
            <FormControlLabel
              control={<CheckboxOrRadio checked={layers.get('plateArrows')} onChange={this.handlePlateArrowLayerChange} />}
              label='Plate Movement'
            />
          </div>
          }
          { config.detailedPlateMovementAvailable && mode !== '3d' &&
            <div className='toggle-arrow-movement' title='Show or hide plate movement arrows'>
              <FormControlLabel
                control={<CheckboxOrRadio checked={layers.get('plateMovement')} onChange={this.handlePlateMovementLayerChange} />}
                label='Plate Movement (Detailed)'
              />
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
