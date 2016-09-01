import { CanvasLayer } from './canvas-layer'
import { DomUtil, DomEvent } from 'leaflet'
import TopView from '../3d/top-view'

export const EarthquakesCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
    this.latLngToPoint = this.latLngToPoint.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseClick = this._onMouseClick.bind(this)
    this._earthquakeClickHandler = function (event, earthquakeData) {}
  },

  _initCanvas: function () {
    this.externalView = new TopView()
    CanvasLayer.prototype._initCanvas.call(this, this.externalView.canvas)
    DomUtil.addClass(this._canvas, 'earthquakes-canvas-layer')
  },

  onAdd: function (map) {
    CanvasLayer.prototype.onAdd.call(this, map)
    DomEvent.on(this._canvas, 'mousemove', this._onMouseMove, this)
    DomEvent.on(this._canvas, 'click', this._onMouseClick, this)
  },

  onRemove: function (map) {
    CanvasLayer.prototype.onRemove.call(this, map)
    DomEvent.off(this._canvas, 'mousemove', this._onMouseMove)
    DomEvent.off(this._canvas, 'click', this._onMouseClick)
    // Very important, without it, there's a significant memory leak (each time this layer is added and removed,
    // what may happen quite often).
    this.externalView.destroy()
  },

  _onMouseMove: function (e) {
    if (this.externalView.earthquakeAt(e.clientX, e.clientY)) {
      this._canvas.style.cursor = 'pointer'
    } else {
      this._canvas.style.cursor = 'inherit'
    }
  },

  _onMouseClick: function (e) {
    const eqData = this.externalView.earthquakeAt(e.clientX, e.clientY)
    if (eqData) {
      this._earthquakeClickHandler(e, eqData)
    }
  },

  setEarthquakes: function (earthquakes) {
    this._earthquakesToProcess = earthquakes
    this.scheduleRedraw()
  },

  onEarthquakeClick: function (handler) {
    this._earthquakeClickHandler = handler || function (event, earthquakeData) {}
  },

  _reset: function () {
    let topLeft = this._map.containerPointToLayerPoint([0, 0])
    DomUtil.setPosition(this._canvas, topLeft)

    let size = this._map.getSize()
    this.externalView.setSize(size.x, size.y)
    this.externalView.invalidatePositions()
    this._redraw()
  },

  // This function is really expensive (especially when we call it for 10-20k earthquakes).
  // That's why we try to limit position recalculation if it's possible.
  latLngToPoint: function(latLng) {
    return this._map.latLngToContainerPoint(latLng)
  },

  draw: function () {
    if (this._earthquakesToProcess) {
      this.externalView.setProps({earthquakes: this._earthquakesToProcess, latLngToPoint: this.latLngToPoint})
      this._earthquakesToProcess = null
    }
    const transitionInPgoress = this.externalView.render()
    if (transitionInPgoress) {
      this.scheduleRedraw()
    }
  }
})

export function earthquakesCanvasLayer() {
  return new EarthquakesCanvasLayer();
}
