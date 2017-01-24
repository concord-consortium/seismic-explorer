import THREE from 'three'
import vertexShader from 'raw!./volcano-vertex.glsl'
import fragmentShader from 'raw!./volcano-fragment.glsl'
import Volcano from './volcano'

const MAX_COUNT = 250000

export default class {
  constructor() {
    const positions = new Float32Array(MAX_COUNT * 3)
    const dates = new Float32Array(MAX_COUNT * 1)
    const colors = new Float32Array(MAX_COUNT * 3)

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('date', new THREE.BufferAttribute(dates, 1))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))

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
    this._renderedVolcanos = []
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

  volcanoAt(x, y) {
    for (let i = this._renderedVolcanos.length - 1; i >= 0; i--) {
      if (this._renderedVolcanos[i].hitTest(x, y)) return this._renderedVolcanos[i].data
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
    for (let i = 0, len = this._renderedVolcanos.length; i < len; i++) {
      const volcanoData = this._currentData[i]
      const point = this._latLngToPoint(volcanoData.position)
      const date = volcanoData.date

      this._renderedVolcanos[i].setPositionAttr(point)
      this._renderedVolcanos[i].setDateAttr(date)
    }
  }

  _processNewData() {
    if (!this._dataToProcess) return
    let data = this._dataToProcess
    if (data.length > MAX_COUNT) {
      console.warn('Too many volcanos! Some volcanos will not be displayed.')
      data = data.splice(0, MAX_COUNT)
    }
    const attributes = this.root.geometry.attributes

    for (let i = 0, length = data.length; i < length; i++) {
      const volcanoData = data[i]
      if (!this._renderedVolcanos[i] || this._renderedVolcanos[i].id !== eqData.id) {
        const point = this._latLngToPoint(volcanoData.position)
        const date = volcanoData.date

        this._renderedVolcanos[i] = new Arrow(volcanoData, i, attributes)
        this._renderedVolcanos[i].setPositionAttr(point)
        this._renderedVolcanos[i].setDateAttr(size)
      }
      this._renderedVolcanos[i].targetVisibility = 1//volcanoData.visible ? 1 : 0
    }
    console.log("rendered volcanos: ", this._renderedVolcanos)
    // Reset old data.
    for (let i = data.length, length = this._renderedVolcanos.length; i < length; i++) {
      this._renderedVolcanos[i].destroy()
    }
    this._renderedVolcanos.length = data.length
    this._currentData = data
    this._dataToProcess = null
  }
}

function getTexture() {
  const size = 128
  const strokeWidth = size * 0.04
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.beginPath()
  // Triangle
  ctx.moveTo(0, 0) // corner
  ctx.lineTo(size / 2, size)// tip
  ctx.lineTo(size, 0)
  ctx.lineTo(0,0)

  ctx.fillStyle = '#fffa'
  ctx.fill()
  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = '#fff'
  ctx.stroke()

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
