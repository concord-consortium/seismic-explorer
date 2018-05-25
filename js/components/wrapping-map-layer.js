import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import mapAreaMultipliers from '../core/map-area-multipliers'

// This class is meant to be subclassed. It provides an easy way to render custom Leaflet elements on the map and make
// sure they wrap around when user keeps scrolling horizontally. Caching ensures that elements are reused when possible.
// Check plate-arrows-layer.js or plate-names-layer.js for example implementations.
export default class WrappingMapLayer extends MapLayer {
  // OVERWRITE in subclass
  // Array of any data useful for rendering. The only assumption is that data element provides .lat and .lng properties.
  getData () {
    return []
  }

  // OVERWRITE in subclass
  // Returned object should be a Leaflet element that can be added to map layer.
  // Also, it should have .lat and .lng properties available.
  getElement (data, idx) {
    return null
  }

  // Private methods, do not overwrite:

  createLeafletElement (props) {
    this.group = new L.FeatureGroup()
    this.visibleElements = {}
    this.cachedElements = {}
    this.updateLeafletElement(null, props)
    return this.group
  }

  updateLeafletElement (fromProps, toProps) {
    const { mapRegion } = toProps
    const areas = mapAreaMultipliers(mapRegion.minLng, mapRegion.maxLng)
    areas.forEach(multiplier => {
      this.getData().map((data, idx) => {
        const dataCopy = Object.assign({}, data)
        dataCopy.lng += multiplier * 360
        const lng = dataCopy.lng
        const key = `${dataCopy.lat}:${lng}`
        if (lng >= mapRegion.minLng && lng <= mapRegion.maxLng && !this.visibleElements[key]) {
          if (!this.cachedElements[key]) {
            this.cachedElements[key] = this.getElement(dataCopy, idx)
          }
          const el = this.cachedElements[key]
          this.group.addLayer(el)
          this.visibleElements[key] = el
        }
      })
    })
    Object.keys(this.visibleElements).forEach(key => {
      const el = this.visibleElements[key]
      const { lat, lng } = el
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Map layer element does not provide coordinates. Check subclass of WrappingMapLayer.')
      }
      if (lat > mapRegion.maxLat || lat < mapRegion.minLat || lng > mapRegion.maxLng || lng < mapRegion.minLng) {
        this.group.removeLayer(el)
        delete this.visibleElements[key]
      }
    })
  }
}
