import React, { PureComponent } from 'react'
import { Map, TileLayer, ScaleControl } from 'react-leaflet'

import { mapLayer } from '../map-layer-tiles'
import config from '../config'

import '../../css/leaflet/leaflet.css'
import '../../css/thumbnail-map.less'

const INITIAL_BOUNDS = [
  [config.minLat, config.minLng],
  [config.maxLat, config.maxLng]
]
const INITIAL_CENTER = { lat: 0, lng: 0 }

export default class ThumbnailMap extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      center: INITIAL_CENTER
    }
    // this.handleInitialBoundsSetup = this.handleInitialBoundsSetup.bind(this)
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

  componentDidMount () {
    window.addEventListener('resize', this.handleInitialBoundsSetup)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleInitialBoundsSetup)
  }

  // This method is called on window.resize.
  handleInitialBoundsSetup () {
    if (!this.props.mapModified) {
      this.map.invalidateSize()
      //this.map.fitBounds(this.props.mapStatus.region)
    }
  }

  render () {
    const { mode, crossSectionPoints } = this.props
    const baseLayer = this.baseLayer
    let url = baseLayer.url
    if (baseLayer.url.indexOf('{c}') > -1) {
      // If screen scaled display has higher than 1 pixel ratio, request scaled tiles, otherwise just request regular tiles
      // Since devicePixelRatio can change between displays and we can't guarantee how many versions of the base tiles there are available,
      // limit the request scaling to 2x if the user has any scale of higher dpi display.
      // There's no visible issue in requesting 2x on a regular dpi display aside from bandwidth
      url = window.devicePixelRatio && window.devicePixelRatio !== 1 ? baseLayer.url.replace('{c}', '@2x') : baseLayer.url.replace('{c}', '')
    }
    let center = INITIAL_CENTER
    if (mode === "3d" && crossSectionPoints) {
      const p1LatLng = crossSectionPoints.get(0)
      if (p1LatLng) {
        this.map.panTo(new L.LatLng(p1LatLng[0], p1LatLng[1]))
      }
    }

    return (
      <div className={`thumbnail-map mode-${mode}`}>
        <Map ref='map' className='map'
          dragging={false}
          zoom={2}
          center={center}
        >
          {/* #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same */}
          {/* component instance when we switch between maps with subdomains and without. */}
          <TileLayer key={baseLayer.type} url={url} subdomains={baseLayer.subdomains} attribution={baseLayer.attribution} />
        </Map>
      </div>
    )
  }
}
