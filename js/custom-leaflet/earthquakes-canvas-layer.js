import { CanvasLayer } from './canvas-layer'
import PIXI from 'pixi.js'
import { DomUtil } from 'leaflet'
import EarthquakeSprite from './earthquake-sprite'

export const EarthquakesCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
    this._earthquakeClickHandler = function (event, earthquakeData) {}
  },

  _initCanvas: function () {
    CanvasLayer.prototype._initCanvas.call(this)
    // Init PIXI too.
    this._container = new PIXI.Container()
    this._renderer = PIXI.autoDetectRenderer(0, 0, {
      view: this._canvas,
      transparent: true,
      resolution: window.devicePixelRatio
    })
    this._renderedEarthquakes = new Map()
  },

  setEarthquakes: function (earthquakes) {
    this._earthquakesToProcess = earthquakes
    this.scheduleRedraw()
  },

  // Handler should accept Pixi event and earthquake JSON data.
  onEarthquakeClick: function (handler) {
    this._earthquakeClickHandler = handler || function (event, earthquakeData) {}
  },

  _processNewEarthquakes: function () {
    if (!this._earthquakesToProcess) return
    // First, mark all the existing sprites as invalid (to be removed).
    this._renderedEarthquakes.forEach(eqSprite => {
      eqSprite._toRemove = true
    })
    // Process new earthquakes array. Create missing sprites
    // and mark all earthquakes from the new array as valid (_toRemove = false).
    this._earthquakesToProcess.forEach(e => {
      if (!this._renderedEarthquakes.has(e.id)) {
        this._addEarthquake(e)
      }
      const eqSprite = this._renderedEarthquakes.get(e.id)
      eqSprite.targetVisibility = e.visible ? 1 : 0
      eqSprite._toRemove = false
    })
    // Finally, remove sprites that don't have corresponding objects in the new earthquakes array.
    this._renderedEarthquakes.forEach((eqSprite, id) => {
      if (eqSprite._toRemove) {
        this._container.removeChild(eqSprite)
        this._renderedEarthquakes.delete(id)
      }
    })
    this._earthquakesToProcess = null
  },

  _addEarthquake: function (eq) {
    const eqSprite = new EarthquakeSprite(eq.geometry.coordinates[2], eq.properties.mag, eq.geometry.coordinates)
    eqSprite.onClick((event) => this._earthquakeClickHandler(event, eq))
    this._container.addChild(eqSprite)
    this._renderedEarthquakes.set(eq.id, eqSprite)
  },

  _invalidatePositions: function () {
    this._renderedEarthquakes.forEach(eqSprite => {
      eqSprite._positionValid = false
    })
  },

  _reset: function () {
    let topLeft = this._map.containerPointToLayerPoint([0, 0])
    DomUtil.setPosition(this._canvas, topLeft)

    let size = this._map.getSize()

    if (this._canvas.width !== size.x || this._canvas.width !== size.y) {
      this._renderer.resize(size.x, size.y)
      this._canvas.style.width = size.x + 'px'
      this._canvas.style.height = size.y + 'px'
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
    const timestamp = performance.now()
    const progress = this._prevTimestamp ? timestamp - this._prevTimestamp : 0
    let transitionInProgress = false
    this._processNewEarthquakes()
    this._renderedEarthquakes.forEach(eqSprite => {
      // Recalculate position only if it's necessary (expensive).
      if (!eqSprite._positionValid) {
        const point = this.latLngToPoint(eqSprite.coordinates)
        eqSprite.position.x = point.x
        eqSprite.position.y = point.y
        eqSprite._positionValid = true
      }
      // Visibility transition.
      eqSprite.transitionStep(progress)
      if (eqSprite.transitionInProgress) {
        transitionInProgress = true
      }
    })
    // PIXI render.
    this._renderer.render(this._container)
    // Schedule next frame only if there are some ongoing transitions.
    if (transitionInProgress) {
      this.scheduleRedraw()
      this._prevTimestamp = timestamp
    } else {
      this._prevTimestamp = null
    }
  }
})

export function earthquakesCanvasLayer() {
  return new EarthquakesCanvasLayer();
}
