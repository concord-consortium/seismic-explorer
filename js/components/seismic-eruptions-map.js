import React, { PureComponent } from 'react'
import { Map, TileLayer } from 'react-leaflet'
import { Circle } from 'leaflet'
import SpritesLayer from './sprites-layer'
import EarthquakePopup from './earthquake-popup'
import VolcanoPopup from './volcano-popup'
import PlateBoundariesLayer from './plate-boundaries-layer'
import PlateArrowsLayer from './plate-arrows-layer'
import LabelsLayer from './labels-layer'
import PinsLayer from './pins-layer'
import PlateMovementLayer from './plate-movement-layer'
import CrossSectionDrawLayer from './cross-section-draw-layer'
import addTouchSupport from '../custom-leaflet/touch-support'
import { mapLayer } from '../map-layer-tiles'
import log from '../logger'
import plateNames from '../data/plate-names'
import continentOceanNames from '../data/continent-ocean-names'
import config from '../config'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

const INITIAL_BOUNDS = [
  [config.minLat, config.minLng],
  [config.maxLat, config.maxLng]
]

const INITIAL_CENTER = { lat: config.centerLat, lng: config.centerLng }

// It delays download of earthquakes data on map moveend event, so user can pan or zoom map
// a few times quickly before the download starts.
const BOUNDS_UPDATE_DELAY = 600 // ms

const DEFAULT_MAX_ZOOM = 13

let scaleWidth = 0
let scaleHeight = 0

// Leaflet map doesn't support custom touch events by default.
addTouchSupport()

export default class SeismicEruptionsMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectedEarthquake: null,
      selectedVolcano: null
    }
    this.handleEarthquakeClick = this.handleEarthquakeClick.bind(this)
    this.handleEarthquakePopupClose = this.handleEarthquakePopupClose.bind(this)
    this.handleVolcanoClick = this.handleVolcanoClick.bind(this)
    this.handleVolcanoPopupClose = this.handleVolcanoPopupClose.bind(this)
    this.handleMapViewportChanged = this.handleMapViewportChanged.bind(this)
    this.handleInitialBoundsSetup = this.handleInitialBoundsSetup.bind(this)
    this.handleZoom = this.handleZoom.bind(this)
  }

  get map () {
    if (this.refs.map) {
      return this.refs.map.leafletElement
    }
  }

  get mapRegion () {
    const bounds = this.map.getBounds()
    return {
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth()
    }
  }

  get mapZoom () {
    if (this.map) {
      return this.map.getZoom()
    }
  }

  get baseLayer () {
    const { layers } = this.props
    return mapLayer(layers.get('base'))
  }

  latLngToPoint (latLng) {
    return this.map.latLngToContainerPoint(latLng)
  }

  componentDidMount () {
    // Make sure that SVG overlay layer exists from the very beginning. It's created dynamically when the first
    // SVG object is added to the map. It solves / simplifies some issues. For example we don't want earthquakes
    // to be clickable when we enter cross-section drawing mode. The simplest solution is to set Canvas z-index
    // lower than SVG z-index, but it won't work if the SVG layer hasn't been created yet.
    createSVGOverlayLayer(this.map)
    // Initially Leaflet always triggers mapmove event, as probably real bounds are a bit different than
    // provided bounds (due to screen size etc.). That is causing mark2DViewModified to be called and reset view icon
    // being shown. This is unwanted, as there has been no user interaction. Mark this view unmodified again.
    const { mark2DViewModified, setMapStatus } = this.props
    mark2DViewModified(false)
    setMapStatus(this.mapRegion, this.mapZoom)

    this.map.on('click', (e) => {
      // TOOD: remove, it can be useful to tweak position of plate arrows.
      console.log('lat:', e.latlng.lat, 'lng:', e.latlng.lng)
    })
    if (!config.sizeToFitBounds) {
      // if we are not using bounds, and instead using a center point, force a refresh of the viewport to
      // get the earthquakes to render on first load
      this.handleMapViewportChanged()
    }
    window.addEventListener('resize', this.handleInitialBoundsSetup)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleInitialBoundsSetup)
  }

  componentDidUpdate () {
    // This maxZoom option is not handled by react-leaftlet as a dynamic react property (it doesn't update after
    // Map component is created), so we need to use raw Leaflet API to dynamically change it.
    let maxZoom = config.zoomMax > -1 ? config.zoomMax : DEFAULT_MAX_ZOOM
    if (this.baseLayer.maxZoom && maxZoom > this.baseLayer.maxZoom) maxZoom = this.baseLayer.maxZoom
    this.refs.map.leafletElement.setMaxZoom(maxZoom)
  }

  // This method is called on window.resize. For some reason, when Seismic Explorer is embedded in iframe,
  // and this iframe size is updated by parent page, Leaflet gets lost and doesn't set initial bounds correctly.
  // Related PT story: https://www.pivotaltracker.com/n/projects/1929933/stories/167580182/comments/205160884
  // I can't explain why it happens, but that's the only reliable workaround I've found -> call Leaflet's
  // invalidateSize() method and then fit bounds again. Note that we do that ONLY when map hasn't been modified
  // the user explicitely. Otherwise, any resize of the window would cause the view to reset. It could be unexpected
  // and annoying to users.
  handleInitialBoundsSetup () {
    if (!this.props.mapModified) {
      this.map.invalidateSize()
      if (config.sizeToFitBounds) {
        this.fitBounds()
      }
    }
  }

  handleMapViewportChanged (e) {
    const { mark2DViewModified } = this.props
    mark2DViewModified(true)
    this._mapBeingDragged = false

    clearTimeout(this._boundsUpdateTimeoutID)
    this._boundsUpdateTimeoutID = setTimeout(() => {
      const { layers, setMapStatus } = this.props
      setMapStatus(this.mapRegion, this.mapZoom, layers.get('earthquakes'))

      const bounds = this.map.getBounds()

      log('MapRegionChanged', {
        minLat: bounds.getSouthWest().lat,
        minLng: bounds.getSouthWest().lng,
        maxLat: bounds.getNorthEast().lat,
        maxLng: bounds.getNorthEast().lng,
        zoom: this.mapZoom
      })
    }, BOUNDS_UPDATE_DELAY)
  }

  handleZoom (e) {
    // After zooming, if we are showing a scale, recalculate the properties
    const bounds = this.map.getBounds()
    const widthKm = Math.round(bounds.getSouthWest().distanceTo(bounds.getSouthEast()) / 1000) // m -> km
    const heightKm = Math.round(bounds.getNorthEast().distanceTo(bounds.getSouthEast()) / 1000) // m -> km

    scaleWidth = widthKm.toLocaleString(navigator.language, { minimumFractionDigits: 0 })
    scaleHeight = heightKm.toLocaleString(navigator.language, { minimumFractionDigits: 0 })
  }

  handleEarthquakeClick (event, earthquake) {
    // Do not open earthquake popup if click was part of the map dragging action.
    if (this._mapBeingDragged) return
    this.setState({ selectedEarthquake: earthquake })
    log('EarthquakeClicked', earthquake)
  }

  handleEarthquakePopupClose () {
    this.setState({ selectedEarthquake: null })
  }

  handleVolcanoClick (event, volcano) {
    if (this._mapBeingDragged) return
    this.setState({ selectedVolcano: volcano })
    log('Volcano Clicked', volcano)
  }

  handleVolcanoPopupClose () {
    this.setState({ selectedVolcano: null })
  }

  fitBounds (bounds = INITIAL_BOUNDS) {
    const { mark2DViewModified } = this.props
    this.map.fitBounds(bounds)
    mark2DViewModified(false)
    // Reset this flag again after some time, as Leaflet will call view updated event at the end of animation.
    setTimeout(() => mark2DViewModified(false), 400)
    log('ResetMapClicked')
  }

  render () {
    const { mode, earthquakes, volcanoes, layers, crossSectionPoints, mapStatus, setCrossSectionPoint } = this.props
    const { selectedEarthquake, selectedVolcano } = this.state
    const baseLayer = this.baseLayer
    let url = baseLayer.url
    if (baseLayer.url.indexOf('{c}') > -1) {
      // If screen scaled display has higher than 1 pixel ratio, request scaled tiles, otherwise just request regular tiles
      // Since devicePixelRatio can change between displays and we can't guarantee how many versions of the base tiles there are available,
      // limit the request scaling to 2x if the user has any scale of higher dpi display.
      // There's no visible issue in requesting 2x on a regular dpi display aside from bandwidth
      url = window.devicePixelRatio && window.devicePixelRatio !== 1 ? baseLayer.url.replace('{c}', '@2x') : baseLayer.url.replace('{c}', '')
    }

    const allowDragging = config.allowDrag
    const allowFreeMouseZoom = config.sizeToFitBounds ? true : 'center'
    const bounds = config.sizeToFitBounds ? INITIAL_BOUNDS : undefined
    const center = config.sizeToFitBounds ? undefined : INITIAL_CENTER
    const zoom = this.map ? this.mapZoom : config.centeredInitialZoom

    const scaleText = zoom > 3 ? `Scale: ${scaleWidth}km x ${scaleHeight}km   Zoom level: ${zoom}` : ''
    return (
      <div className={`seismic-eruptions-map mode-${mode}`}>
        <Map ref='map' className='map'
          onViewportChanged={this.handleMapViewportChanged}
          bounds={bounds}
          minZoom={config.zoomMin > -1 ? config.zoomMin : 2}
          dragging={allowDragging}
          zoom={zoom}
          center={center}
          doubleClickZoom={allowFreeMouseZoom}
          scrollWheelZoom={allowFreeMouseZoom}
          onzoomend={this.handleZoom}
        >
          {/* #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same */}
          {/* component instance when we switch between maps with subdomains and without. */}
          <TileLayer key={baseLayer.type} url={url} subdomains={baseLayer.subdomains} attribution={baseLayer.attribution} />
          {layers.get('plateBoundaries') && <PlateBoundariesLayer mapRegion={mapStatus.get('region')} mapZoom={mapStatus.get('zoom')} />}
          {layers.get('continentOceanNames') && <LabelsLayer mapRegion={mapStatus.get('region')} labels={continentOceanNames} />}
          {layers.get('plateNames') && <LabelsLayer mapRegion={mapStatus.get('region')} labels={plateNames} />}
          {layers.get('plateArrows') && <PlateArrowsLayer mapRegion={mapStatus.get('region')} />}
          {layers.get('plateMovement') && <PlateMovementLayer />}
          {config.pins && config.pins.length > 0 && <PinsLayer mapRegion={mapStatus.get('region')} />}
          {mode !== '3d' &&
            /* Performance optimization. Update of this component is expensive. Remove it when the map is invisible. */
            <SpritesLayer earthquakes={earthquakes} volcanoes={volcanoes}
              onEarthquakeClick={this.handleEarthquakeClick} onVolcanoClick={this.handleVolcanoClick} />
          }
          {mode === '2d' && selectedEarthquake &&
            <EarthquakePopup earthquake={selectedEarthquake} onPopupClose={this.handleEarthquakePopupClose} />
          }
          {mode === '2d' && selectedVolcano &&
            <VolcanoPopup volcano={selectedVolcano} onPopupClose={this.handleVolcanoPopupClose} />
          }
          {mode === 'cross-section' &&
            <CrossSectionDrawLayer crossSectionPoints={crossSectionPoints} setCrossSectionPoint={setCrossSectionPoint} />
          }
        </Map>
        {!config.showUserInterface &&
          <div className='scale-markers'>{scaleText}</div>
        }
      </div>
    )
  }
}

function createSVGOverlayLayer (map) {
  map.addLayer(new Circle([0, 0], 0, { opacity: 0, fillOpacity: 0 }))
}
