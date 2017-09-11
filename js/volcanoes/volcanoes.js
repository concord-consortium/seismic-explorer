import THREE from 'three'
import vertexShader from './volcano-vertex.glsl'
import fragmentShader from './volcano-fragment.glsl'
import Volcano from './volcano'

const MAX_COUNT = 50000

export default class {
  constructor () {
    const positions = new Float32Array(MAX_COUNT * 3)
    const colors = new Float32Array(MAX_COUNT * 3)
    const sizes = new Float32Array(MAX_COUNT)

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
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
      alphaTest: 0.5
    })

    this.root = new THREE.Points(geometry, material)
    this._renderedVolcanoes = []
  }

  destroy () {
    this.root.geometry.dispose()
    this.root.material.dispose()
    this.texture.dispose()
  }

  setProps (data, latLngToPoint) {
    this._dataToProcess = data
    this._latLngToPoint = latLngToPoint
  }

  volcanoAt (x, y) {
    for (let i = this._renderedVolcanoes.length - 1; i >= 0; i--) {
      if (this._renderedVolcanoes[i].hitTest(x, y)) return this._renderedVolcanoes[i].data
    }
    return null
  }

  update (progress) {
    let transitionInProgress = false
    this._processNewData()
    return transitionInProgress
  }

  invalidatePositions (latLngToPoint) {
    this._latLngToPoint = latLngToPoint
    for (let i = 0, len = this._renderedVolcanoes.length; i < len; i++) {
      const volcano = this._renderedVolcanoes[i]
      const volcanoData = this._currentData[i]
      const point = this._latLngToPoint(volcanoData.position)

      volcano.setSizeAttr(volcano.size)
      volcano.setColorAttr(volcano.color)
      volcano.setPositionAttr(point)
    }
  }

  _processNewData () {
    if (!this._dataToProcess) return
    let data = this._dataToProcess
    if (data.length > MAX_COUNT) {
      console.warn('Too many volcanoes! Some volcanoes will not be displayed.')
      data = data.splice(0, MAX_COUNT)
    }
    const attributes = this.root.geometry.attributes

    for (let i = 0, length = data.length; i < length; i++) {
      const volcanoData = data[i]
      if (!this._renderedVolcanoes[i] || this._renderedVolcanoes[i].id !== volcanoData.id) {
        const point = this._latLngToPoint(volcanoData.position)

        this._renderedVolcanoes[i] = new Volcano(volcanoData, i, attributes)
        const volcano = this._renderedVolcanoes[i]
        volcano.setSizeAttr(volcano.size)
        volcano.setColorAttr(volcano.color)
        volcano.setPositionAttr(point)
      }
      this._renderedVolcanoes[i].targetVisibility = 1// volcanoData.visible ? 1 : 0
    }
    // Reset old data.
    for (let i = data.length, length = this._renderedVolcanoes.length; i < length; i++) {
      this._renderedVolcanoes[i].destroy()
    }
    this._renderedVolcanoes.length = data.length
    this._currentData = data
    this._dataToProcess = null
  }
}

function getTexture () {
  const size = 128
  const strokeWidth = size * 0.07
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.beginPath()
  // Triangle
  ctx.moveTo(0, 0) // corner
  ctx.lineTo(size / 2, size)// tip
  ctx.lineTo(size, 0)
  ctx.lineTo(0, 0)

  ctx.fillStyle = '#fff'
  ctx.fill()

  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = '#000'
  ctx.stroke()

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
