import L, { Map } from 'leaflet'

const TouchExtend = L.Handler.extend({
  initialize: function (map) {
    this._map = map
    this._container = map._container
  },

  addHooks: function () {
    L.DomEvent.on(this._container, 'touchstart', this._onTouchEvent, this)
    L.DomEvent.on(this._container, 'touchmove', this._onTouchEvent, this)
    L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this)
  },

  removeHooks: function () {
    L.DomEvent.off(this._container, 'touchstart', this._onTouchEvent)
    L.DomEvent.off(this._container, 'touchmove', this._onTouchEvent)
    L.DomEvent.off(this._container, 'touchend', this._onTouchEnd)
  },

  _onTouchEvent: function (e) {
    if (!this._map._loaded) {
      return
    }
    const touch = e.touches[0]
    const containerPoint = L.point(touch.clientX, touch.clientY)
    const layerPoint = this._map.containerPointToLayerPoint(containerPoint)
    const latlng = this._map.layerPointToLatLng(layerPoint)
    return this._map.fire(e.type, {
      latlng: latlng,
      layerPoint: layerPoint,
      containerPoint: containerPoint,
      originalEvent: e
    })
  },

  _onTouchEnd: function (e) {
    if (!this._map._loaded) {
      return
    }
    this._map.fire(e.type, {
      originalEvent: e
    })
  }
})

export default function addTouchSupport() {
  L.Map.mergeOptions({
    touchExtend: true
  })
  L.Map.addInitHook('addHandler', 'touchExtend', TouchExtend)
}
