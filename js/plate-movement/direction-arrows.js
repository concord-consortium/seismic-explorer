import THREE from 'three'
import vertexShader from 'raw!./direction-arrow-vertex.glsl'
import fragmentShader from 'raw!./direction-arrow-fragment.glsl'
import Arrow from './direction-arrow'

const MAX_COUNT = 250000

export default class {
  constructor() {
    const positions = new Float32Array(MAX_COUNT * 3)
    const angles = new Float32Array(MAX_COUNT * 1)
    const colors = new Float32Array(MAX_COUNT * 3)
    const sizes = new Float32Array(MAX_COUNT)

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('angle', new THREE.BufferAttribute(angles, 1))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Texture defines base shape.
    this.texture = getTexture()

    var material = new THREE.ShaderMaterial({
      uniforms: {
        color: { type: 'c', value: new THREE.Color(0xffffff) },
        texture: {type: 't', value: this.texture}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      alphaTest: 0.5,
    })

    this.root = new THREE.Points(geometry, material)
    this._renderedArrows = []
  }

  destroy() {
    this.root.geometry.dispose()
    this.root.material.dispose()
    this.texture.dispose()
  }

  setProps(data, latLngToPoint) {
    this._dataToProcess = data
    this._latLngToPoint = latLngToPoint
  }

  arrowAt(x, y) {
    for (let i = this._renderedArrows.length - 1; i >= 0; i--) {
      if (this._renderedArrows[i].hitTest(x, y)) return this._renderedArrows[i].data
    }
    return null
  }

  update(progress) {
    let transitionInProgress = false
    this._processNewData()
    return transitionInProgress
  }

  invalidatePositions(latLngToPoint) {
    this._latLngToPoint = latLngToPoint
    for (let i = 0, len = this._renderedArrows.length; i < len; i++) {
      const arrowData = this._currentData[i]
      const point = this._latLngToPoint(arrowData.position)
      const size = arrowData.velocity.vMag * 5;
      const angle = arrowData.velocity.vAngle

      this._renderedArrows[i].setPositionAttr(point)
      this._renderedArrows[i].setSizeAttr(size)
      this._renderedArrows[i].setAngleAttr(angle)
    }
  }

  _processNewData() {
    if (!this._dataToProcess) return
    let data = this._dataToProcess
    if (data.length > MAX_COUNT) {
      console.warn('Too many arrows! Some arrows will not be displayed.')
      data = data.splice(0, MAX_COUNT)
    }
    const attributes = this.root.geometry.attributes

    for (let i = 0, length = data.length; i < length; i++) {
      const arrowData = data[i]
      if (!this._renderedArrows[i] || this._renderedArrows[i].id !== eqData.id) {
        const point = this._latLngToPoint(arrowData.position)
        const size = arrowData.velocity.vMag * 5;
        const angle = arrowData.velocity.vAngle

        this._renderedArrows[i] = new Arrow(arrowData, i, attributes)
        this._renderedArrows[i].setPositionAttr(point)
        this._renderedArrows[i].setSizeAttr(size)
        this._renderedArrows[i].setAngleAttr(angle)
      }
      this._renderedArrows[i].targetVisibility = 1//arrowData.visible ? 1 : 0
    }
    // Reset old data.
    for (let i = data.length, length = this._renderedArrows.length; i < length; i++) {
      this._renderedArrows[i].destroy()
    }
    this._renderedArrows.length = data.length

    this._currentData = data
    this._dataToProcess = null
  }
}

function getTexture() {
  const size = 128
  const arrowHeadSize = 60
  const strokeWidth = size * 0.04
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // Arrow
  ctx.beginPath()

  // solid head
  // ctx.moveTo(size / 2, size - arrowHeadSize) // base of arrow point
  // ctx.lineTo(size / 2 + arrowHeadSize / 3, size - arrowHeadSize)
  // ctx.lineTo(size / 2, size)// arrow tip
  // ctx.lineTo(size / 2 - arrowHeadSize / 3, size - arrowHeadSize)
  // ctx.lineTo(size / 2, size - arrowHeadSize)
  // ctx.lineTo(size / 2, 0) // base of arrow

  // pointed head
  ctx.moveTo(size / 2, 0) // base of arrow
  ctx.lineTo(size / 2, size)// arrow tip
  ctx.lineTo(size / 2 + arrowHeadSize / 3, size - arrowHeadSize)
  ctx.moveTo(size / 2, size)// arrow tip
  ctx.lineTo(size / 2 - arrowHeadSize / 3, size - arrowHeadSize)

  // pointed head horizontal
  // ctx.moveTo(0, size / 2) // base of arrow
  // ctx.lineTo(size, size / 2)// arrow tip
  // ctx.lineTo(size - arrowHeadSize, size / 2 + arrowHeadSize / 3)
  // ctx.moveTo(size, size / 2)// arrow tip
  // ctx.lineTo(size - arrowHeadSize, size / 2 - arrowHeadSize / 3)

  //ctx.fillStyle = '#fff'
  //ctx.fill()
  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = '#fff'
  ctx.stroke()
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
