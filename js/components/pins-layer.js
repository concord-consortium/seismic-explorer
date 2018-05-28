import L from 'leaflet'
import WrappingMapLayer from './wrapping-map-layer'
import config from '../config'

import '../../css/pins-layer.less'

const getPinIcon = label => L.divIcon({
  className: 'map-pin-icon',
  html: `<div class="map-pin-content">${label}<div class='pin fa fa-map-pin' /></div>`
})

export default class PinsLayer extends WrappingMapLayer {
  getData () {
    return config.pins.map(data => ({lat: data[0], lng: data[1], label: data[2]}))
  }

  getElement (data, idx) {
    const { lat, lng, label } = data
    const el = new L.Marker([lat, lng], {icon: getPinIcon(label)})
    el.lat = lat
    el.lng = lng
    return el
  }
}
