import L from 'leaflet'
import { withLeaflet } from 'react-leaflet'
import WrappingMapLayer from './wrapping-map-layer'
import config from '../config'

import '../../css/pins-layer.less'

const getPinIcon = label => L.divIcon({
  className: `map-pin-icon ${!config.allowPinDrag && 'fixed-position'} ${config.clickToMoveSinglePin && 'colorful-pin'}`,
  html: `<div class="map-pin-content">${label}<div class='pin fa fa-map-pin' /></div>`
})

export default withLeaflet(class PinsLayer extends WrappingMapLayer {
  getData () {
    return this.props.pins.toJS() // config.pins.map(data => ({ lat: data[0], lng: data[1], label: data[2] }))
  }

  getElement (data, idx) {
    const { pins } = this.props
    const pinList = pins.toJS()
    const existingPin = pinList[idx] ? pinList[idx].marker : undefined
    const { lat, lng, label } = data
    if (!existingPin) {
      const el = new L.Marker([lat, lng], {
        icon: getPinIcon(label),
        draggable: config.allowPinDrag,
        bubblingMouseEvents: !config.allowPinDrag
      })
      el.lat = lat
      el.lng = lng
      this.props.onPinUpdated(idx, el, { lat, lng })
      return el
    } else {
      const newLatLng = new L.LatLng(lat, lng)
      existingPin.setLatLng(newLatLng)
      this.props.onPinUpdated(idx, existingPin, { lat, lng })
      return existingPin
    }
  }
})
