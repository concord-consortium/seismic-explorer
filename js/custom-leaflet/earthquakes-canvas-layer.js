import { CanvasLayer } from './canvas-layer'
import { DomUtil } from 'leaflet'
import TopView from '../3d/top-view'

export const EarthquakesCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
    this.latLngToPoint = this.latLngToPoint.bind(this)
    this._earthquakeClickHandler = function (event, earthquakeData) {}
  },

  _initCanvas: function () {
    this.externalView = new TopView()
    CanvasLayer.prototype._initCanvas.call(this, this.externalView.canvas)

    DomUtil.addClass(this._canvas, 'earthquakes-canvas-layer')
  },

  onAdd: function (map) {
    CanvasLayer.prototype.onAdd.call(this, map)
  },

  onRemove: function (map) {
    CanvasLayer.prototype.onRemove.call(this, map)
    // Very important, without it, there's a significant memory leak (each time this layer is added and removed,
    // what may happen quite often).
    this.externalView.destroy()
  },

  setEarthquakes: function (earthquakes) {
    if (this.externalView) {
      this.externalView.setProps({earthquakes, latLngToPoint: this.latLngToPoint})
      this.scheduleRedraw()
    }
  },

  onEarthquakeClick: function (handler) {
    this._earthquakeClickHandler = handler || function (event, earthquakeData) {}
  },

  _invalidatePositions: function () {
    this.externalView.invalidatePositions()
  },

  _reset: function () {
    let topLeft = this._map.containerPointToLayerPoint([0, 0])
    DomUtil.setPosition(this._canvas, topLeft)

    let size = this._map.getSize()

    if (this._canvas.width !== size.x || this._canvas.width !== size.y) {
      this.externalView.setSize(size.x, size.y)
    }

    this._invalidatePositions()
    this._redraw()
  },

  // This function is really expensive (especially when we call it for 10-20k earthquakes).
  // That's why we try to limit position recalculation if it's possible.
  latLngToPoint: function(latLng) {
    return this._map.latLngToContainerPoint(latLng)
  },

  draw: function () {
    const transitionInPgoress = this.externalView.render()
    if (transitionInPgoress) {
      this.scheduleRedraw()
    }
  }
})

export function earthquakesCanvasLayer() {
  return new EarthquakesCanvasLayer();
}
