import { CircleMarker } from 'leaflet'
import Rainbow from 'rainbowvis.js'

export default CircleMarker.extend({
  isVisible: function () {
    return this._visible || true
  },

  setVisible: function (v) {
    if (!this._visible && v) {
      this._container.setAttribute('class', 'earthquake-marker')
    } else if (this._visible && !v) {
      this._container.setAttribute('class', 'earthquake-marker hidden')
    }
    this._visible = v
  }
})

export function magnitudeToRadius(magnitude) {
  return 0.9 * Math.pow(1.5, (magnitude - 1))
}

const MAX_DEPTH = 700
const rainbow = new Rainbow()
rainbow.setNumberRange(0, MAX_DEPTH)
export function depthToColor(depth) {
  return `#${rainbow.colourAt(depth)}`
}
