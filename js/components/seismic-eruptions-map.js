import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer } from 'react-leaflet'
import { Circle } from 'leaflet'
import EarthquakesCanvasLayer from './earthquakes-canvas-layer'
import EarthquakePopup from './earthquake-popup'
import PlatesLayer from './plates-layer'
import SubregionButtons from './subregion-buttons'
import CrossSectionDrawLayer from './cross-section-draw-layer'
import addTouchSupport from '../custom-leaflet/touch-support'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

// Leaflet map doesn't support custom touch events by default.
addTouchSupport()

@pureRender
export default class SeismicEruptionsMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedEarthquake: null
    }
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.handleEarthquakeClick = this.handleEarthquakeClick.bind(this)
    this.handleEarthquakePopupClose = this.handleEarthquakePopupClose.bind(this)
  }

  get map() {
    return this.refs.map.getLeafletElement()
  }

  latLngToPoint(latLng) {
    return this.map.latLngToContainerPoint(latLng)
  }

  componentDidMount() {
    // Make sure that SVG overlay layer exists from the very beginning. It's created dynamically when the first
    // SVG object is added to the map. It solves / simplifies some issues. For example we don't want earthquakes
    // to be clickable when we enter cross-section drawing mode. The simplest solution is to set Canvas z-index
    // lower than SVG z-index, but it won't work if the SVG layer hasn't been created yet.
    createSVGOverlayLayer(this.map)
  }

  componentWillUpdate(nextProps) {
    const { region, mark2DViewModified } = this.props
    if (region.get('bounds') !== nextProps.region.get('bounds')) {
      // This event is fired also when we change bounds property using API call (e.g. when user changes the region).
      this._ignoreMovestart = true
      mark2DViewModified(false)
    }
  }

  componentDidUpdate() {
    const { selectedEarthquake } = this.state
    const { earthquakes } = this.props
    if (selectedEarthquake) {
      let found = false
      // Check if selected earthquake is still present and visible.
      earthquakes.forEach(e => {
        if (e.id === selectedEarthquake.id && e.visible) found = true
      })
      // Reset it if not.
      if (!found) this.setState({selectedEarthquake: null})
    }
    // Listen to movestart events triggered by user again.
    this._ignoreMovestart = false
  }

  handleMoveStart() {
    const { mark2DViewModified } = this.props
    if (!this._ignoreMovestart) {
      mark2DViewModified(true)
    }
  }

  handleEarthquakeClick(event, earthquake) {
    this.setState({selectedEarthquake: earthquake})
  }

  handleEarthquakePopupClose() {
    this.setState({selectedEarthquake: null})
  }

  fitBounds() {
    const { region, mark2DViewModified } = this.props
    this.map.fitBounds(region.get('bounds'))
    mark2DViewModified(false)
  }

  renderBaseLayer() {
    // #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same
    // component instance when we switch between maps with subdomains and without.
    const { layers } = this.props
    switch(layers.get('base')) {
      case 'satellite':
        return <TileLayer key='with-subdomains' url='http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
                          subdomains={['otile1', 'otile2', 'otile3', 'otile4']}/>
      case 'street':
        return <TileLayer key='no-subdomains' url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'/>
      case 'earthquake-density':
        return <TileLayer key='no-subdomains' url='http://{s}.tiles.mapbox.com/v3/bclc-apec.map-rslgvy56/{z}/{x}/{y}.png'/>
    }
  }

  render() {
    const { mode, region, earthquakes, layers, crossSectionPoints, setCrossSectionPoint } = this.props
    const { selectedEarthquake } = this.state
    const bounds = region.get('bounds')
    return (
      <div className={`seismic-eruptions-map mode-${mode}`}>
        <Map ref='map' className='map' bounds={bounds} onLeafletMovestart={this.handleMoveStart}>
          {this.renderBaseLayer()}
          {layers.get('plates') && <PlatesLayer/>}
          {mode !== '3d' &&
            /* Performance optimization. Update of this component is expensive. Remove it when the map is invisible. */
            <EarthquakesCanvasLayer earthquakes={earthquakes} earthquakeClick={this.handleEarthquakeClick}/>
          }
          {mode === '2d' &&
            <SubregionButtons subregions={region.get('subregions')}/>
          }
          {mode === '2d' && selectedEarthquake &&
            <EarthquakePopup earthquake={selectedEarthquake} onPopupClose={this.handleEarthquakePopupClose}/>
          }
          {mode === 'cross-section' &&
            <CrossSectionDrawLayer crossSectionPoints={crossSectionPoints} setCrossSectionPoint={setCrossSectionPoint}/>
          }
        </Map>
      </div>
    )
  }
}

function createSVGOverlayLayer(map) {
  map.addLayer(new Circle([0,0], 0, {opacity: 0, fillOpacity: 0}))
}
