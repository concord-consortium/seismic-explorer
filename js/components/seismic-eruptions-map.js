import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer } from 'react-leaflet'
import { Circle } from 'leaflet'
import EarthquakesCanvasLayer from './earthquakes-canvas-layer'
import EarthquakePopup from './earthquake-popup'
import PlatesLayer from './plates-layer'
import CrossSectionDrawLayer from './cross-section-draw-layer'
import addTouchSupport from '../custom-leaflet/touch-support'
import { mapLayer } from '../map-layer-tiles'
import { tilesList, tileInvalid, tileOutOfBounds } from '../map-tile-helpers'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

const INITIAL_BOUNDS = [
  [-60, -120],
  [60, 120]
]

// It delays download of earthquakes data on map moveend event, so user can pan or zoom map
// a few times quickly before the download starts.
const EARTQUAKES_DOWNLOAD_DELAY = 600 // ms

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
    this.handleMoveEnd = this.handleMoveEnd.bind(this)
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
    this._mapBeingDragged = true
    const { mark2DViewModified } = this.props
    if (!this._ignoreMovestart) {
      mark2DViewModified(true)
    }
  }

  handleMoveEnd(event) {
    this._mapBeingDragged = false

    clearTimeout(this._tilesDownloadTimoutID)
    this._tilesDownloadTimoutID = setTimeout(() => {
      const { setEarthquakeDataTiles } = this.props
      const map = event.target
      const bounds = map.getBounds()
      const rect = [bounds.getSouthWest(), bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast()]
      // tilesList expects an array of arrays: [[lat, lng], [lat, lng], ...]
      const tiles = tilesList(rect.map(p => [p.lat, p.lng]), map.getZoom())
      // Remove invalid tiles (x, y values < 0 or > max allowed value).
      const validTiles = tiles.filter(t => !tileInvalid(t) && !tileOutOfBounds(t))
      setEarthquakeDataTiles(validTiles)
    }, EARTQUAKES_DOWNLOAD_DELAY)
  }

  handleEarthquakeClick(event, earthquake) {
    // Do not open earthquake popup if click was part of the map dragging action.
    if (this._mapBeingDragged) return
    this.setState({selectedEarthquake: earthquake})
  }

  handleEarthquakePopupClose() {
    this.setState({selectedEarthquake: null})
  }

  fitBounds() {
    const { mark2DViewModified } = this.props
    this.map.fitBounds(INITIAL_BOUNDS)
    mark2DViewModified(false)
  }

  renderBaseLayer() {
    // #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same
    // component instance when we switch between maps with subdomains and without.
    const { layers } = this.props
    const layer = mapLayer(layers.get('base'))
    return <TileLayer key={layers.get('base') } url={layer.url} subdomains={layer.subdomains} attribution={layer.attribution}/>
  }

  render() {
    const { mode, earthquakes, layers, crossSectionPoints, setCrossSectionPoint } = this.props
    const { selectedEarthquake } = this.state
    return (
      <div className={`seismic-eruptions-map mode-${mode}`}>
        <Map ref='map' className='map' onLeafletMovestart={this.handleMoveStart} onLeafletMoveend={this.handleMoveEnd} 
             bounds={INITIAL_BOUNDS} zoom={3} minZoom={2} maxZoom={13}>
          {this.renderBaseLayer()}
          {layers.get('plates') && <PlatesLayer/>}
          {mode !== '3d' &&
            /* Performance optimization. Update of this component is expensive. Remove it when the map is invisible. */
            <EarthquakesCanvasLayer earthquakes={earthquakes} earthquakeClick={this.handleEarthquakeClick}/>
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
