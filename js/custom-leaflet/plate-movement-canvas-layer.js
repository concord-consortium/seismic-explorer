import { CanvasLayer } from './canvas-layer'
import { DomUtil } from 'leaflet'
import PlateMovementView from '../plate-movement/plate-movement-view'

export const PlateMovementCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
  },

  initCanvas: function () {
    this.externalView = new PlateMovementView()
    CanvasLayer.prototype.initCanvas.call(this, this.externalView.canvas)
    DomUtil.addClass(this._canvas, 'plate-movement-canvas-layer')
  },

  setPlateMovementPoints: function (points) {
    this._plateMovementPoints = points
    this.scheduleRedraw()
  },

  draw: function () {
    if (this._plateMovementPoints) {
      this.externalView.setProps({PlateMovementPoints: this._plateMovementPoints, latLngToPoint: this.latLngToPoint})
      this._plateMovementPoints = null
    }
    const transitionInProgress = this.externalView.render()
    if (transitionInProgress) {
      this.scheduleRedraw()
    }
  }
})

export function plateMovementCanvasLayer () {
  return new PlateMovementCanvasLayer()
}
