import { DomUtil, DomEvent, Browser, Layer, Class, setOptions } from 'leaflet'

// Generic Leaflet CanvasLayer, based on:
// - https://github.com/Leaflet/Leaflet.heat
// - http://bl.ocks.org/sumbera/11114288

export const CanvasLayer = (Layer || Class).extend({
  initialize: function (options) {
    setOptions(this, options)
    this._redraw = this._redraw.bind(this)
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseClick = this._onMouseClick.bind(this)
    this.latLngToPoint = this.latLngToPoint.bind(this)
  },

  setOptions: function (options) {
    setOptions(this, options)
    return this.scheduleRedraw()
  },

  scheduleRedraw: function () {
    if (this._map && !this._frame && !this._map._animating) {
      this._frame = window.requestAnimationFrame(this._redraw)
    }
    return this
  },

  // Should be overwritten by a subclass.
  draw: function () {
  },

  // Mostl likely should be overwritten by a subclass.
  initCanvas: function (canvas = null) {
    if (!canvas) {
      canvas = DomUtil.create('canvas')
    }
    this._canvas = canvas
    let originProp = DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin'])
    canvas.style[originProp] = '50% 50%'

    let size = this._map.getSize()
    canvas.width = size.x
    canvas.height = size.y
    canvas.style.width = size.x + 'px'
    canvas.style.height = size.y + 'px'

    let animated = this._map.options.zoomAnimation && Browser.any3d
    DomUtil.addClass(canvas, 'leaflet-canvas-layer leaflet-layer leaflet-zoom-' + (animated ? 'animated' : 'hide'))
  },

  // This function is really expensive.
  // That's why we try to limit position recalculation if it's possible.
  latLngToPoint: function (latLng) {
    return this._map.latLngToContainerPoint(latLng)
  },

  // Can be overwritten by a subclass.
  onMouseMove: function (event, pos) {
  },

  // Can be overwritten by a subclass.
  onMouseClick: function (event, pos) {
  },

  onAdd: function (map) {
    this._map = map

    if (!this._canvas) {
      this.initCanvas()
    }

    map._panes.overlayPane.appendChild(this._canvas)

    map.on('moveend', this._reset, this)

    if (map.options.zoomAnimation && Browser.any3d) {
      map.on('zoomanim', this._animateZoom, this)
    }

    this._reset()

    this._initEventHandlers()
  },

  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._canvas)

    map.off('moveend', this._reset, this)

    if (map.options.zoomAnimation) {
      map.off('zoomanim', this._animateZoom, this)
    }

    this._removeEventHandlers()

    // Very important, without it, there's a significant memory leak (each time this layer is added and removed,
    // what may happen quite often).
    this.externalView.destroy()
  },

  addTo: function (map) {
    map.addLayer(this)
    return this
  },

  // Priv methods.

  _reset: function () {
    let topLeft = this._map.containerPointToLayerPoint([0, 0])
    DomUtil.setPosition(this._canvas, topLeft)

    let size = this._map.getSize()
    this.externalView.setSize(size.x, size.y)
    this.externalView.invalidatePositions()

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
  },

  _initEventHandlers: function () {
    DomEvent.on(this._canvas, 'mousedown', this._onMouseDown, this)
    DomEvent.on(this._canvas, 'touchstart', this._onMouseDown, this)
    DomEvent.on(this._canvas, 'mousemove', this._onMouseMove, this)
    DomEvent.on(this._canvas, 'touchmove', this._onMouseMove, this)
    DomEvent.on(this._canvas, 'mouseup', this._onMouseClick, this)
    DomEvent.on(this._canvas, 'touchend', this._onMouseClick, this)
  },

  _removeEventHandlers: function () {
    DomEvent.off(this._canvas, 'mousedown', this._onMouseDown)
    DomEvent.off(this._canvas, 'touchstart', this._onMouseDown)
    DomEvent.off(this._canvas, 'mousemove', this._onMouseMove)
    DomEvent.off(this._canvas, 'touchmove', this._onMouseMove)
    DomEvent.off(this._canvas, 'mouseup', this._onMouseClick)
    DomEvent.off(this._canvas, 'touchend', this._onMouseClick)
  },

  _onMouseDown: function () {
    this._wasMoving = false
  },

  _onMouseMove: function (e) {
    this._wasMoving = true
    const event = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e
    const pos = DomEvent.getMousePosition(event, this._canvas)
    this.onMouseMove(e, pos)
  },

  _onMouseClick: function (e) {
    if (this._wasMoving) {
      // Do not trigger click if pointer was moving around.
      return
    }
    const event = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e
    const pos = DomEvent.getMousePosition(event, this._canvas)
    this.onMouseClick(e, pos)
  }
})
