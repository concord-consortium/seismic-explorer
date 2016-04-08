import THREE from 'three'
import { depthToColor, magnitudeToRadius, easeOutBounce, TRANSITION_TIME } from '../earthquake-properties'

const TRANSITION_COLOR = 0xFFFFFF

const colorHelper = new THREE.Color()

export default class {
  constructor(data, idx, attributes) {
    this.id = data.id
    this.color = depthToColor(data.geometry.coordinates[2])
    this.size = magnitudeToDiameter(data.properties.mag)

    // Particle system attributes (position, customColor, size). See earthquakes.js.
    this.attributes = attributes
    // Index in attribute arrays.
    this.idx = idx

    this.targetVisibility = data.visible ? 1 : 0
    this.transition = this.targetVisibility
  }

  destroy() {
    // There's an assumption that points that have size = 0 are invisible (see GLSL shaders code).
    this.setSizeAttr(0)
  }

  set transition(v) {
    v = Math.min(1, Math.max(0, v))
    this._transition = v
    const t = easeOutBounce(v)
    this.setSizeAttr(t * this.size)
    this.setColorAttr(this.transitionInProgress ? TRANSITION_COLOR : this.color)
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

  setPositionAttr(point) {
    if (this._oldPosAttr === point) return
    this.attributes.position.array[this.idx * 3] = point.x
    this.attributes.position.array[this.idx * 3 + 1] = point.y
    this.attributes.position.array[this.idx * 3 + 2] = point.z
    this.attributes.position.needsUpdate = true
    this._oldPosAttr = point
  }

  setSizeAttr(val) {
    if (this._oldSizeAttr === val) return
    this.attributes.size.array[this.idx] = val
    this.attributes.size.needsUpdate = true
    this._oldSizeAttr = val
  }

  setColorAttr(val) {
    if (this._oldColorAttr === val) return
    colorHelper.setHex(val)
    colorHelper.toArray(this.attributes.customColor.array, this.idx * 3)
    this.attributes.customColor.needsUpdate = true
    this._oldColorAttr = val
  }
}

function magnitudeToDiameter(mag) {
  // * 2 because size describes diameter, not radius. It ensures that both 2D and 3D view use
  // exactly the same dimensions.
  return window.devicePixelRatio * 2 * magnitudeToRadius(mag)
}
