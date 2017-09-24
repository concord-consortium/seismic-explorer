import { MapLayer } from 'react-leaflet'
import 'leaflet-plugins/layer/vector/KML'
import L from 'leaflet'

let _cachedKMLComplex
export function getKMLComplex () {
  if (!_cachedKMLComplex) {
    _cachedKMLComplex = new L.KML('plates_modified_complex.kml', {async: true})
  }
  return _cachedKMLComplex
}

let _cachedKMLSimple
export function getKMLSimple () {
  if (!_cachedKMLSimple) {
    _cachedKMLSimple = new L.KML('plates_modified_simple.kml', {async: true})
  }
  return _cachedKMLSimple
}

export class PlatesLayerSimple extends MapLayer {
  createLeafletElement (props) {
    return getKMLSimple()
  }
}

export class PlatesLayerComplex extends MapLayer {
  createLeafletElement (props) {
    return getKMLComplex()
  }
}
