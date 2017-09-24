import { CanvasLayer } from './canvas-layer'
import { DomUtil, DomEvent } from 'leaflet'
import VolcanoView from '../volcanoes/volcano-view'

export const VolcanoCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
    this._volcanoClickHandler = function (event, volcanoData) {}
  },

  initCanvas: function () {
    this.externalView = new VolcanoView()
    CanvasLayer.prototype.initCanvas.call(this, this.externalView.canvas)
    DomUtil.addClass(this._canvas, 'volcanoes-canvas-layer')
  },

  onMouseMove: function (e, pos) {
    if (this.externalView.volcanoAt(pos.x, pos.y)) {
      this._canvas.style.cursor = 'pointer'
    } else {
      this._canvas.style.cursor = 'inherit'
    }
  },

  onMouseClick: function (e, pos) {
    const volcanoData = this.externalView.volcanoAt(pos.x, pos.y)
    if (volcanoData) {
      this._volcanoClickHandler(e, volcanoData)
    }
  },

  setVolcanoPoints: function (points) {
    this._volcanoPoints = points
    this.scheduleRedraw()
  },

  onVolcanoClick: function (handler) {
    this._volcanoClickHandler = handler || function (event, earthquakeData) {}
  },

  _reset: function () {
    let topLeft = this._map.containerPointToLayerPoint([0, 0])
    DomUtil.setPosition(this._canvas, topLeft)

    let size = this._map.getSize()
    this.externalView.setSize(size.x, size.y)
    this.externalView.invalidatePositions()
    this._redraw()
  },


  draw: function () {
    if (this._volcanoPoints) {
      this.externalView.setProps({VolcanoPoints: this._volcanoPoints, latLngToPoint: this.latLngToPoint})
      this._volcanoPoints = null
    }
    const transitionInProgress = this.externalView.render()
    if (transitionInProgress) {
      this.scheduleRedraw()
    }
  }
})

export function volcanoCanvasLayer () {
  return new VolcanoCanvasLayer()
}
