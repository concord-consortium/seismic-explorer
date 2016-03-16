import { CircleMarker } from 'leaflet'

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
