import { CanvasLayer } from './canvas-layer'
import { DomUtil, DomEvent } from 'leaflet'
import TopView from '../3d/top-view'

export const PlateMovementCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
    this.latLngToPoint = this.latLngToPoint.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseClick = this._onMouseClick.bind(this)
    //this._earthquakeClickHandler = function (event, earthquakeData) {}
  },

  _initCanvas: function () {
    this.externalView = new TopView()
    CanvasLayer.prototype._initCanvas.call(this, this.externalView.canvas)
    DomUtil.addClass(this._canvas, 'plate-movement-canvas-layer')
  },

  onAdd: function (map) {
    CanvasLayer.prototype.onAdd.call(this, map)
    DomEvent.on(this._canvas, 'mousemove', this._onMouseMove, this)
    DomEvent.on(this._canvas, 'mouseup', this._onMouseClick, this)
    DomEvent.on(this._canvas, 'touchend', this._onMouseClick, this)
  },

  onRemove: function (map) {
    CanvasLayer.prototype.onRemove.call(this, map)
    DomEvent.off(this._canvas, 'mousemove', this._onMouseMove)
    DomEvent.off(this._canvas, 'mouseup', this._onMouseClick)
    DomEvent.off(this._canvas, 'touchend', this._onMouseClick)
    // Very important, without it, there's a significant memory leak (each time this layer is added and removed,
    // what may happen quite often).
    this.externalView.destroy()
  },

  _onMouseMove: function (e) {
    // const pos = DomEvent.getMousePosition(e, this._canvas)
    // if (this.externalView.earthquakeAt(pos.x, pos.y)) {
    //   this._canvas.style.cursor = 'pointer'
    // } else {
    //   this._canvas.style.cursor = 'inherit'
    // }
  },

  _onMouseClick: function (e) {
    // const event = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e
    // const pos = DomEvent.getMousePosition(event, this._canvas)
    // const eqData = this.externalView.earthquakeAt(pos.x, pos.y)
    // if (eqData) {
    //   this._earthquakeClickHandler(e, eqData)
    // }
  },

  setPlateMovementPoints: function (points) {
    this._plateMovementPoints = points
    this.scheduleRedraw()
  },

  // onEarthquakeClick: function (handler) {
  //   this._earthquakeClickHandler = handler || function (event, earthquakeData) {}
  // },

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
    if (this._plateMovementPoints) {
      this.externalView.setProps({PlateMovementPoints: this._plateMovementPoints, latLngToPoint: this.latLngToPoint})
      this._plateMovementPoints = null
    }
    const transitionInProgess = this.externalView.render()
    if (transitionInProgess) {
      this.scheduleRedraw()
    }
  }
})

export function plateMovementCanvasLayer() {
  return new PlateMovementCanvasLayer();
}
