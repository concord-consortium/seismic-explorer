import L from 'leaflet'
import WrappingMapLayer from './wrapping-map-layer'

import '../../css/labels-layer.less'

function getLabelStyle (label) {
  let style = ''
  if (label.fontSize) {
    style += `font-size: ${label.fontSize}px;`
  }
  if (label.color) {
    style += ` color: ${label.color}`
  }
  return style
}

export default class LabelsLayer extends WrappingMapLayer {
  constructor (props) {
    super(props)
    const { labels } = props
    this.icons = labels.map(label => L.divIcon({
      className: 'label-icon',
      html: `<div class="label-content" style='${getLabelStyle(label)}'>${label.name}</div>`
    }))
  }

  getData () {
    return this.props.labels
  }

  getElement (data, idx) {
    const { lat, lng } = data
    const el = new L.Marker([lat, lng], {icon: this.icons[idx]})
    el.lat = lat
    el.lng = lng
    return el
  }
}
