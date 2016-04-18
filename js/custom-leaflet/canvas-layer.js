import { Util, DomUtil, Browser, Layer, Class, Bounds, setOptions, point } from 'leaflet'

// Generic Leaflet CanvasLayer, based on:
// - https://github.com/Leaflet/Leaflet.heat
// - http://bl.ocks.org/sumbera/11114288

export const CanvasLayer = (Layer ? Layer : Class).extend({
  initialize: function (options) {
    setOptions(this, options)
    this._redraw = this._redraw.bind(this)
  },

  setOptions: function (options) {
    setOptions(this, options)
    return this.scheduleRedraw()
  },

  scheduleRedraw: function () {
    if (this._map && !this._frame && !this._map._animating) {
      this._frame = requestAnimationFrame(this._redraw)
    }
    return this
  },

  // Overwrite.
  draw: function () {},

  onAdd: function (map) {
    this._map = map

    if (!this._canvas) {
      this._initCanvas()
    }

    map._panes.overlayPane.appendChild(this._canvas)

    map.on('moveend', this._reset, this)

    if (map.options.zoomAnimation && Browser.any3d) {
      map.on('zoomanim', this._animateZoom, this)
    }

    this._reset()
  },

  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._canvas)

    map.off('moveend', this._reset, this)

    if (map.options.zoomAnimation) {
      map.off('zoomanim', this._animateZoom, this)
    }
  },

  addTo: function (map) {
    map.addLayer(this)
    return this
  },

  _initCanvas: function () {
    let canvas = this._canvas = DomUtil.create('canvas', 'leaflet-canvas-layer leaflet-layer')

    let originProp = DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin'])
    canvas.style[originProp] = '50% 50%'

    let size = this._map.getSize()
    canvas.width = size.x
    canvas.height = size.y
    canvas.style.width = size.x + 'px'
    canvas.style.height = size.y + 'px'

    let animated = this._map.options.zoomAnimation && Browser.any3d
    DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'))
  },

  _reset: function () {
    let topLeft = this._map.containerPointToLayerPoint([0, 0])
    DomUtil.setPosition(this._canvas, topLeft)

    let size = this._map.getSize()

    if (this._canvas.width !== size.x) {
      this._canvas.width = size.x
      this._canvas.style.width = size.x + 'px'
    }
    if (this._canvas.width !== size.y) {
      this._canvas.height = size.y
      this._canvas.style.height = size.y + 'px'
    }

    this._redraw()
  },

  _redraw: function () {
    this._frame = null
    this.draw()
  },

  _animateZoom: function (e) {
    const scale = this._map.getZoomScale(e.zoom)
    const offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos())

    if (DomUtil.setTransform) {
      DomUtil.setTransform(this._canvas, offset, scale)
    } else {
      this._canvas.style[DomUtil.TRANSFORM] = DomUtil.getTranslateString(offset) + ' scale(' + scale + ')'
    }
  }
})
