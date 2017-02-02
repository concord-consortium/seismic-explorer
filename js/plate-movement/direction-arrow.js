import THREE from 'three'

const TRANSITION_COLOR = 0xFFFFFF

const colorHelper = new THREE.Color()

export default class {
  constructor(data, idx, attributes) {
    this.id = data.id
    this.color = 0xFFFFFF
    this.size = data.velocity.vMag * 5;
    this.data = data
    this.angle = data.velocity.vAngle

    // Particle system attributes (position, customColor, size)
    this.attributes = attributes
    // Index in attribute arrays.
    this.idx = idx

    this.targetVisibility = 1//data.visible ? 1 : 0
    this.transition = this.targetVisibility
  }

  destroy() {
    // There's an assumption that points that have size = 0 are invisible (see GLSL shaders code).
    this.setSizeAttr(0)
  }

  // Checks if (x, y) point hits rendered shape.
  hitTest(x, y) {
    const radius = this.attributes.size.array[this.idx] * 0.25
    if (radius === 0) return false
    const xDiff = this.attributes.position.array[this.idx * 3] - x
    const yDiff = this.attributes.position.array[this.idx * 3 + 1] - y
    return xDiff * xDiff + yDiff * yDiff <= radius * radius
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

   setAngleAttr(val) {
    if (this._oldAngleAttr === val) return
    this.attributes.angle.array[this.idx] = val
    this.attributes.angle.needsUpdate = true
    this._oldAngleAttr = val
  }

  setColorAttr(val) {
    if (this._oldColorAttr === val) return
    colorHelper.setHex(val)
    colorHelper.toArray(this.attributes.customColor.array, this.idx * 3)
    this.attributes.customColor.needsUpdate = true
    this._oldColorAttr = val
  }
}
