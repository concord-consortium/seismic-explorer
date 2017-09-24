import { CanvasLayer } from './canvas-layer'
import { DomUtil } from 'leaflet'
import TopView from '../3d/top-view'

export const EarthquakesCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
    this._earthquakeClickHandler = function (event, earthquakeData) {}
  },

  initCanvas: function () {
    this.externalView = new TopView()
    CanvasLayer.prototype.initCanvas.call(this, this.externalView.canvas)
    DomUtil.addClass(this._canvas, 'earthquakes-canvas-layer')
  },

  setEarthquakes: function (earthquakes) {
    this._earthquakesToProcess = earthquakes
    this.scheduleRedraw()
  },

  onEarthquakeClick: function (handler) {
    this._earthquakeClickHandler = handler || function (event, earthquakeData) {}
  },

  draw: function () {
    if (this._earthquakesToProcess) {
      this.externalView.setProps({earthquakes: this._earthquakesToProcess, latLngToPoint: this.latLngToPoint})
      this._earthquakesToProcess = null
    }
    const transitionInProgress = this.externalView.render()
    if (transitionInProgress) {
      this.scheduleRedraw()
    }
  },

  onMouseMove (event, pos) {
    if (this.externalView.earthquakeAt(pos.x, pos.y)) {
      this._canvas.style.cursor = 'pointer'
    } else {
      this._canvas.style.cursor = 'inherit'
    }
  },

  onMouseClick (event, pos) {
    const eqData = this.externalView.earthquakeAt(pos.x, pos.y)
    if (eqData) {
      this._earthquakeClickHandler(event, eqData)
    }
  }
})

export function earthquakesCanvasLayer () {
  return new EarthquakesCanvasLayer()
}
