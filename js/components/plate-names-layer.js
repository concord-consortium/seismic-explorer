import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import plateNames from '../data/plate-names'
import mapAreaMultipliers from '../core/map-area-multipliers'

import '../../css/plate-names-layer.less'

const DEFAULT_FONT_SIZE = 15

const nameIcons = plateNames.map(label => L.divIcon({
  className: 'plate-name-icon',
  html: `<div class="plate-name-content" style='font-size: ${label.fontSize || DEFAULT_FONT_SIZE}px;'>${label.name}</div>`
}))

const _cachedMarkers = {}
function nameMarker (data, idx) {
  const { lat, lng } = data
  const key = `${lat}:${lng}`
  if (!_cachedMarkers[key]) {
    _cachedMarkers[key] = new L.Marker([lat, lng], {icon: nameIcons[idx]})
  }
  return _cachedMarkers[key]
}

export default class PlateNamesLayer extends MapLayer {
  createLeafletElement (props) {
    this.group = new L.FeatureGroup()
    this.visibleNames = {}
    this.updateLeafletElement(null, props)
    return this.group
  }

  updateLeafletElement (fromProps, toProps) {
    const { mapRegion } = toProps
    const areas = mapAreaMultipliers(mapRegion.minLng, mapRegion.maxLng)
    areas.forEach(multiplier => {
      plateNames.map((data, idx) => {
        const dataCopy = Object.assign({}, data)
        dataCopy.lng += multiplier * 360
        const lng = dataCopy.lng
        const key = `${dataCopy.lat}:${lng}`
        if (lng >= mapRegion.minLng && lng <= mapRegion.maxLng && !this.visibleNames[key]) {
          const name = nameMarker(dataCopy, idx)
          this.group.addLayer(name)
          this.visibleNames[key] = name
        }
      })
    })
    Object.keys(this.visibleNames).forEach(key => {
      const name = this.visibleNames[key]
      const { lat, lng } = name
      if (lat > mapRegion.maxLat || lat < mapRegion.minLat || lng > mapRegion.maxLng || lng < mapRegion.minLng) {
        this.group.removeLayer(name)
        delete this.visibleNames[key]
      }
    })
  }
}
