import React, { PureComponent } from 'react'
import { Map, TileLayer } from 'react-leaflet'
import { Circle } from 'leaflet'
import EarthquakesCanvasLayer from './earthquakes-canvas-layer'
import EarthquakePopup from './earthquake-popup'
import VolcanoPopup from './volcano-popup'
import {PlatesLayerSimple, PlatesLayerComplex} from './plates-layer'
import { PlatesArrowsLayer } from './plates-arrows-layer'
import VolcanoesLayer from './volcanoes-layer'
import PlateMovementLayer from './plate-movement-layer'
import CrossSectionDrawLayer from './cross-section-draw-layer'
import addTouchSupport from '../custom-leaflet/touch-support'
import { mapLayer } from '../map-layer-tiles'
import log from '../logger'
import config from '../config'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

const INITIAL_BOUNDS = [
  [config.minLat, config.minLng],
  [config.maxLat, config.maxLng]
]

// It delays download of earthquakes data on map moveend event, so user can pan or zoom map
// a few times quickly before the download starts.
const EARTQUAKES_DOWNLOAD_DELAY = 600 // ms

// Leaflet map doesn't support custom touch events by default.
addTouchSupport()

var zoomLevel = 2;

export default class SeismicEruptionsMap extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      selectedEarthquake: null,
      selectedVolcano: null
    }
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.handleEarthquakeClick = this.handleEarthquakeClick.bind(this)
    this.handleEarthquakePopupClose = this.handleEarthquakePopupClose.bind(this)
    this.handleVolcanoClick = this.handleVolcanoClick.bind(this)
    this.handleVolcanoPopupClose = this.handleVolcanoPopupClose.bind(this)
    this.handleMoveEnd = this.handleMoveEnd.bind(this)
    this.handleZoomEnd = this.handleZoomEnd.bind(this)
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
    // Initially Leaflet always triggers mapmove event, as probably real bounds are a bit different than
    // provided bounds (due to screen size etc.). That is causing mark2DViewModified to be called and reset view icon
    // being shown. This is unwanted, as there has been no user interaction. Mark this view unmodified again.
    const { mark2DViewModified } = this.props
    mark2DViewModified(false)
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
  }

  handleMoveStart() {
    this._mapBeingDragged = true
    const { mark2DViewModified } = this.props
    mark2DViewModified(true)
  }

  handleMoveEnd(event) {
    this._mapBeingDragged = false

    clearTimeout(this._tilesDownloadTimoutID)
    this._tilesDownloadTimoutID = setTimeout(() => {
      const { updateEarthquakesData } = this.props
      const map = event.target
      const bounds = map.getBounds()
      const region = [bounds.getSouthWest(), bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast()]
                      .map(p => [p.lat, p.lng])
      updateEarthquakesData(region, map.getZoom())
      log('MapRegionChanged', {
        minLat: bounds.getSouthWest().lat,
        minLng: bounds.getSouthWest().lng,
        maxLat: bounds.getNorthEast().lat,
        maxLng: bounds.getNorthEast().lng
      })
    }, EARTQUAKES_DOWNLOAD_DELAY)
  }

  handleZoomEnd(event) {
    const map = event.target
    log('MapZoomChanged', {zoom: map.getZoom()})

    zoomLevel = map.getZoom()
  }

  handleEarthquakeClick(event, earthquake) {
    // Do not open earthquake popup if click was part of the map dragging action.
    if (this._mapBeingDragged) return
    this.setState({selectedEarthquake: earthquake})
    log('EarthquakeClicked', earthquake)
  }

  handleEarthquakePopupClose() {
    this.setState({selectedEarthquake: null})
  }
  handleVolcanoPopupClose(){
    this.setState({selectedVolcano: null})
  }
  handleVolcanoClick(event, volcano){
    if (this._mapBeingDragged) return
    this.setState({selectedVolcano: volcano})
    log('Volcano Clicked', volcano)
  }


  fitBounds(bounds = INITIAL_BOUNDS) {
    const { mark2DViewModified } = this.props
    this.map.fitBounds(bounds)
    mark2DViewModified(false)
    log('ResetMapClicked')
  }

  renderBaseLayer() {
    // #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same
    // component instance when we switch between maps with subdomains and without.
    const { layers } = this.props
    const layer = mapLayer(layers.get('base'))
    return <TileLayer key={layers.get('base') } url={layer.url} subdomains={layer.subdomains} attribution={layer.attribution}/>
  }

  //Displays layer only if zoom level is > 4
  renderZoomLayerComplex() {
    const { layers } = this.props;
    const layer = new PlatesLayerComplex();
    if(zoomLevel > 4 && layers.get('plates')){
      return layer && <PlatesLayerComplex />
    } 
    else {
      return null
    }
   }
  //Displays layer only if zoom level is < 4
  renderZoomLayerSimple() {
    const { layers } = this.props;
    const layer = new PlatesLayerSimple()
    if(zoomLevel <= 4 && layers.get('plates')){
      return layer && <PlatesLayerSimple />
    } 
    else {
      return null
    }
  }

  render() {
    const { mode, earthquakes, layers, crossSectionPoints, setCrossSectionPoint } = this.props
    const { selectedEarthquake, selectedVolcano } = this.state
    return (
      <div className={`seismic-eruptions-map mode-${mode}`}>
        <Map ref='map' className='map' onLeafletMovestart={this.handleMoveStart} onLeafletMoveend={this.handleMoveEnd}
             onLeafletZoomend={this.handleZoomEnd}
             bounds={INITIAL_BOUNDS} minZoom={2} maxZoom={13}>
          {this.renderBaseLayer()}
          {this.renderZoomLayerSimple()}
          {this.renderZoomLayerComplex()}
          {layers.get('platearrows') && <PlatesArrowsLayer />}
          {layers.get('volcanoes') && <VolcanoesLayer volcanoClick={this.handleVolcanoClick}/>}
          {layers.get('platemovement') && <PlateMovementLayer />}
          {mode !== '3d' && layers.get('earthquakes') &&
            /* Performance optimization. Update of this component is expensive. Remove it when the map is invisible. */
            <EarthquakesCanvasLayer earthquakes={earthquakes} earthquakeClick={this.handleEarthquakeClick}/>
          }
          {mode === '2d' && selectedEarthquake &&
            <EarthquakePopup earthquake={selectedEarthquake} onPopupClose={this.handleEarthquakePopupClose}/>
          }
          {mode === '2d' && selectedVolcano &&
            <VolcanoPopup volcano={selectedVolcano} onPopupClose={this.handleVolcanoPopupClose}/>
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
