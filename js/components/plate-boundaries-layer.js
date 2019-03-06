import { MapLayer, withLeaflet } from 'react-leaflet'
import 'leaflet-plugins/layer/vector/KML'
import L from 'leaflet'
import boundariesSimpleKML from '../data/plate-boundaries-simple.kml'
import boundariesComplexKML from '../data/plate-boundaries-complex.kml'
import mapAreaMultipliers from '../core/map-area-multipliers'

// When zoom level is >= than this value, plate boundaries will be rendered using more detailed data.
const COMPLEX_BOUNDARIES_MIN_ZOOM_LEVEL = 4

function shiftLongitudeInKML (kml, multiplier) {
  return kml.replace(/(-?\d+\.?\d+),(-?\d+\.?\d+),0/g, function (match, lng, lat) {
    return `${Number(lng) + 360 * multiplier},${lat},0`
  })
}

const parser = new window.DOMParser()

let _cachedKML = []
export function getKMLLayers (areaMultiplier, type) {
  const key = areaMultiplier + type
  if (!_cachedKML[key]) {
    const file = type === 'simple' ? boundariesSimpleKML : boundariesComplexKML
    const doc = parser.parseFromString(shiftLongitudeInKML(file, areaMultiplier), 'text/xml')
    _cachedKML[key] = new L.FeatureGroup(L.KML.parseKML(doc))
  }
  return _cachedKML[key]
}

export default withLeaflet(class PlateBoundariesLayer extends MapLayer {
  createLeafletElement (props) {
    this.group = new L.FeatureGroup()
    this.visibleAreas = {}
    this.type = {}
    this.updateLeafletElement(null, props)
    return this.group
  }

  updateLeafletElement (fromProps, toProps) {
    const { mapRegion, mapZoom } = toProps
    const areas = mapAreaMultipliers(mapRegion.minLng, mapRegion.maxLng)
    const type = mapZoom >= COMPLEX_BOUNDARIES_MIN_ZOOM_LEVEL ? 'complex' : 'simple'
    areas.forEach(multiplier => {
      const key = `${multiplier}:${type}`
      if (!this.visibleAreas[key]) {
        const layer = getKMLLayers(multiplier, type)
        this.group.addLayer(layer)
        this.visibleAreas[key] = layer
      }
    })
    Object.keys(this.visibleAreas).forEach(key => {
      const multiplier = Number(key.split(':')[0])
      const layerType = key.split(':')[1]
      if (layerType !== type || areas.indexOf(multiplier) === -1) {
        // Remove layer if it's wrong type or given area is not visible now.
        this.group.removeLayer(this.visibleAreas[key])
        delete this.visibleAreas[key]
      }
    })
  }
})
