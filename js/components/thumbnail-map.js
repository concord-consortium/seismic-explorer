import React, { PureComponent } from 'react'
import L from 'leaflet'
import { Map, Marker, TileLayer } from 'react-leaflet'
import { mapLayer } from '../map-layer-tiles'

import '../../css/leaflet/leaflet.css'
import '../../css/thumbnail-map.less'

const INITIAL_CENTER = { lat: 0, lng: 0 }
const ZOOM_PAN_INTERVAL = 1000

const divIcon = (label) => {
  return (
    L.divIcon({
      className: `map-pin-icon small`,
      html: `<div class="map-pin-content">${label}<div class='pin fa fa-map-pin' /></div>`
    })
  )
}

export default class ThumbnailMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      center: INITIAL_CENTER
    }
    this.centerOnCrossSection = this.centerOnCrossSection.bind(this)
    this.crossSectionMarkers = this.crossSectionMarkers.bind(this)
  }

  get map () {
    if (this.refs.map) {
      return this.refs.map.leafletElement
    }
  }

  get baseLayer () {
    const { layers } = this.props
    return mapLayer(layers.get('base'))
  }

  latLngToPoint (latLng) {
    return this.map.latLngToContainerPoint(latLng)
  }

  centerOnCrossSection () {
    const { mode, crossSectionPoints } = this.props
    if (mode === '3d' && crossSectionPoints) {
      const p1LatLng = crossSectionPoints.get(0)
      const p2LatLng = crossSectionPoints.get(1)

      if (!p2LatLng) {
        p1LatLng && this.map.panTo(new L.LatLng(p1LatLng[0], p1LatLng[1]))
      } else {
        const bounds = L.latLngBounds([p1LatLng, p2LatLng])
        const maxZoom = Math.min(this.map.getBoundsZoom(bounds), 3)
        clearTimeout(this._zoomPanTimeoutId)
        this.map.setZoom(maxZoom - 1)
        // zoom needs to complete before we can pan
        this._zoomPanTimeoutId = setTimeout(() => {
          this.map.panTo(bounds.getCenter())
        }, ZOOM_PAN_INTERVAL)
      }
    }
  }

  crossSectionMarkers () {
    const { crossSectionPoints } = this.props
    if (crossSectionPoints) {
      const p1LatLng = crossSectionPoints.get(0)
      const p2LatLng = crossSectionPoints.get(1)
      const markers = []
      p1LatLng && markers.push(<Marker key={'p1'} position={p1LatLng} icon={divIcon('P1')} />)
      p2LatLng && markers.push(<Marker key={'p2'} position={p2LatLng} icon={divIcon('P2')} />)

      return markers
    }
  }
  render () {
    const { mode } = this.props
    const baseLayer = this.baseLayer
    let url = baseLayer.url
    if (baseLayer.url.indexOf('{c}') > -1) {
      // If screen scaled display has higher than 1 pixel ratio, request scaled tiles, otherwise just request regular tiles
      // Since devicePixelRatio can change between displays and we can't guarantee how many versions of the base tiles there are available,
      // limit the request scaling to 2x if the user has any scale of higher dpi display.
      // There's no visible issue in requesting 2x on a regular dpi display aside from bandwidth
      url = window.devicePixelRatio && window.devicePixelRatio !== 1 ? baseLayer.url.replace('{c}', '@2x') : baseLayer.url.replace('{c}', '')
    }

    this.centerOnCrossSection()

    return (
      <div className={`thumbnail-map mode-${mode}`}>
        <Map ref='map' className='map'
          dragging={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          zoom={1}
          center={INITIAL_CENTER}
        >
          {/* #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same */}
          {/* component instance when we switch between maps with subdomains and without. */}
          <TileLayer key={baseLayer.type} url={url} subdomains={baseLayer.subdomains} attribution={baseLayer.attribution} />
          {this.crossSectionMarkers()}
        </Map>
      </div>
    )
  }
}
