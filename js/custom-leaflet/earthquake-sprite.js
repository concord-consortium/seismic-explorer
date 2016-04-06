import PIXI from 'pixi.js'

export const TRANSITION_TIME = 750
const TEXTURE_RESOLUTION = 12

export default class EarthquakeSprite extends PIXI.Sprite {
  constructor(depth, magnitude, coordinates) {
    super(earthquakeTexture(depth))
    this._defaultTexture = earthquakeTexture(depth)
    this._transitionTexture = transitionTexture()
    this._radius = magnitudeToRadius(magnitude) / TEXTURE_RESOLUTION
    this.coordinates = coordinates
    this.anchor.x = this.anchor.y = 0.5
    this.transition = 0
  }

  onClick(handler) {
    this.interactive = true
    this.buttonMode = true
    this.on('mousedown', handler)
    this.on('touchstart', handler)
  }

  setScale(v) {
    this.scale.x = this.scale.y = this._radius * v
  }

  // 0 or 1
  set targetVisibility(v) {
    this._targetVisibility = v
  }

  get targetVisibility() {
    return this._targetVisibility
  }

  set transition(v) {
    v = Math.min(1, Math.max(0, v))
    this._transition = v
    const t = easeOutBounce(v)
    this.setScale(t)
    if (this.transitionInProgress) {
      this.texture = this._transitionTexture
    } else {
      this.texture = this._defaultTexture
    }
  }

  get transition() {
    return this._transition
  }

  get transitionInProgress() {
    return this.targetVisibility !== this.transition
  }

  // Performs transition step and returns true if the transition is still in progress.
  transitionStep(progress) {
    progress /= TRANSITION_TIME // map to [0, 1]
    if (this.transition < this.targetVisibility) {
      this.transition += progress
    } else if (this.transition > this.targetVisibility) {
      this.transition -= progress
    }
  }
}

export function depthToColor(depth) {
  const depthRange = Math.floor(depth / 100)
  switch(depthRange) {
    case 0: // 0 - 100
      return 0xFF0A00
    case 1: // 100 - 200
      return 0xFF7A00
    case 2: // 200 - 300
      return 0xFFF700
    case 3: // 300 - 400
      return 0x56AB00
    case 4: // 400 - 500
      return 0x00603F
    default: // > 500
      return 0x0021BC
  }
}

export function magnitudeToRadius(magnitude) {
  return 0.9 * Math.pow(1.5, (magnitude - 1))
}

const textureCache = {}
function earthquakeTexture(depth) {
  const color = depthToColor(depth)
  if (!textureCache[color]) {
    const g = new PIXI.Graphics()
    g.lineStyle(0.2, 0x000000, 0.2)
    g.beginFill(color, 0.8)
    g.drawCircle(1, 1, 1)
    g.endFill()
    textureCache[color] = g.generateTexture(null, TEXTURE_RESOLUTION)
  }
  return textureCache[color]
}

function transitionTexture() {
  if (!textureCache['transition']) {
    const g = new PIXI.Graphics()
    g.lineStyle(0.2, 0x000000, 0.2)
    g.beginFill(0xFFFFFF, 0.7)
    g.drawCircle(1, 1, 1)
    g.endFill()
    textureCache['transition'] = g.generateTexture(null, TEXTURE_RESOLUTION)
  }
  return textureCache['transition']
}

// Generated using:
// http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
export function easeOutBounce(t) {
  let ts = t * t
  let tc = ts * t
  return 33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t
}
