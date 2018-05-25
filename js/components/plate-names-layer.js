import L from 'leaflet'
import WrappingMapLayer from './wrapping-map-layer'
import plateNames from '../data/plate-names'

import '../../css/plate-names-layer.less'

const DEFAULT_FONT_SIZE = 15

const nameIcons = plateNames.map(label => L.divIcon({
  className: 'plate-name-icon',
  html: `<div class="plate-name-content" style='font-size: ${label.fontSize || DEFAULT_FONT_SIZE}px;'>${label.name}</div>`
}))

export default class PlateNamesLayer extends WrappingMapLayer {
  getData () {
    return plateNames
  }

  getElement (data, idx) {
    const { lat, lng } = data
    const el = new L.Marker([lat, lng], {icon: nameIcons[idx]})
    el.lat = lat
    el.lng = lng
    return el
  }
}
