import * as THREE from 'three'
import { easeOutBounce, TRANSITION_TIME } from '../earthquake-properties'

const TRANSITION_COLOR = 0xFFFFFF

const colorHelper = new THREE.Color()

export default class Sprite {
  constructor (data, idx, attributes) {
    this.id = data.id
    this.data = data

    // Index in attribute arrays.
    this.idx = idx
    // Particle system attributes (position, customColor, size). See sprites-container.js.
    this.attributes = attributes

    // getSize and getColor need to be implemented by subclass.
    this.size = this.getSize(data)
    this.color = this.getColor(data)

    this.targetVisibility = data.visible ? 1 : 0
    this.currentVisibility = data.visible ? 1 : 0
  }

  getSize (data) {
    throw new Error('getSize not implemented')
  }

  getColor (data) {
    throw new Error('getColor not implemented')
  }

  destroy () {
    // There's an assumption that points that have size = 0 are invisible (see GLSL shaders code).
    this.setSizeAttr(0)
  }

  // Checks if (x, y) point hits rendered earthquake shape.
  hitTest (x, y) {
    const radius = this.attributes.size.array[this.idx] * 0.25
    if (radius === 0) return false
    const xDiff = this.attributes.position.array[this.idx * 3] - x
    const yDiff = this.attributes.position.array[this.idx * 3 + 1] - y
    return xDiff * xDiff + yDiff * yDiff <= radius * radius
  }

  set currentVisibility (v) {
    v = Math.min(1, Math.max(0, v))
    this._transition = v
    const t = easeOutBounce(v)
    this.setSizeAttr(t * this.size)
    this.setColorAttr(this.transitionInProgress ? TRANSITION_COLOR : this.color)
  }

  get currentVisibility () {
    return this._transition
  }

  get transitionInProgress () {
    return this.targetVisibility !== this.currentVisibility
  }

  transitionStep (progress) {
    progress /= TRANSITION_TIME // map to [0, 1]
    if (this.currentVisibility < this.targetVisibility) {
      this.currentVisibility += progress
    } else if (this.currentVisibility > this.targetVisibility) {
      this.currentVisibility -= progress
    }
  }

  setPositionAttr (point) {
    if (this._oldPosAttr === point) return
    this.attributes.position.array[this.idx * 3] = point.x
    this.attributes.position.array[this.idx * 3 + 1] = point.y
    this.attributes.position.array[this.idx * 3 + 2] = point.z
    this.attributes.position.needsUpdate = true
    this._oldPosAttr = point
  }

  setSizeAttr (val) {
    if (this._oldSizeAttr === val) return
    this.attributes.size.array[this.idx] = val
    this.attributes.size.needsUpdate = true
    this._oldSizeAttr = val
  }

  setColorAttr (val) {
    if (this._oldColorAttr === val) return
    colorHelper.setHex(val)
    colorHelper.toArray(this.attributes.customColor.array, this.idx * 3)
    this.attributes.customColor.needsUpdate = true
    this._oldColorAttr = val
  }
}
