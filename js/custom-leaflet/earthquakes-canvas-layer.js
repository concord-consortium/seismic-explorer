import { CanvasLayer } from './canvas-layer'
import PIXI from 'pixi.js'
import { DomUtil } from 'leaflet'
import { earthquakeSprite } from './earthquake-helpers'

const TRANSITION_SPEED = 0.05

export const EarthquakesCanvasLayer = CanvasLayer.extend({
  initialize: function (options) {
    CanvasLayer.prototype.initialize.call(this, options)
    this.draw = this.draw.bind(this)
  },

  _initCanvas: function () {
    CanvasLayer.prototype._initCanvas.call(this)

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

  _processNewEarthquakes: function () {
    if (!this._earthquakesToProcess) return
    this._renderedEarthquakes.forEach(eqSprite => {
      eqSprite._valid = false
    })
    this._earthquakesToProcess.forEach(e => {
      if (!this._renderedEarthquakes.has(e.id)) {
        this._addEarthquake(e)
      }
      const eqSprite = this._renderedEarthquakes.get(e.id)
      eqSprite._visible = e.visible
      eqSprite._valid = true
    })
    this._renderedEarthquakes.forEach((eqSprite, id) => {
      if (!eqSprite._valid) {
        this._container.removeChild(eqSprite)
        this._renderedEarthquakes.delete(id)
      }
    })
    this._earthquakesToProcess = null
  },

  _addEarthquake: function (e) {
    const eqSprite = earthquakeSprite(e.geometry.coordinates[2], e.properties.mag)
    eqSprite.coordinates = e.geometry.coordinates
    eqSprite.alpha = 0
    eqSprite.scale.x = eqSprite.scale.y = 0
    this._container.addChild(eqSprite)
    this._renderedEarthquakes.set(e.id, eqSprite)
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

  // This function is really expensive (when we call it for 20k earthquakes).
  // That's why we try to limit position recalculation if it's possible.
  latLngToPoint: function(latLng) {
    return this._map.latLngToContainerPoint(latLng)
  },

  draw: function () {
    console.time('pixi prep')
    let transitionInProgress = false
    this._processNewEarthquakes()
    this._renderedEarthquakes.forEach(eqSprite => {
      if (!eqSprite._positionValid) {
        const point = this.latLngToPoint(eqSprite.coordinates)
        eqSprite.position.x = point.x
        eqSprite.position.y = point.y
        eqSprite._positionValid = true
      }
      if (eqSprite._visible && eqSprite.alpha < 1) {
        eqSprite.alpha += TRANSITION_SPEED
        eqSprite.scale.x += TRANSITION_SPEED
        eqSprite.scale.y += TRANSITION_SPEED
        transitionInProgress = true
      } else if (!eqSprite._visible && eqSprite.alpha > 0) {
        eqSprite.alpha -= TRANSITION_SPEED
        eqSprite.scale.x -= TRANSITION_SPEED
        eqSprite.scale.y -= TRANSITION_SPEED
        transitionInProgress = true
      }
    })
    console.timeEnd('pixi prep')
    console.time('pixi draw')
    this._renderer.render(this._container)
    console.timeEnd('pixi draw')
    if (transitionInProgress) {
      this._frame = window.requestAnimationFrame(this.draw)
    } else {
      this._frame = null
    }
  }
})

export function earthquakesCanvasLayer() {
  return new EarthquakesCanvasLayer();
}
