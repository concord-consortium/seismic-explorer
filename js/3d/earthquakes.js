import THREE from 'three'
import vertexShader from './earthquakes-vertex.glsl'
import fragmentShader from './earthquakes-fragment.glsl'
import Earthquake from './earthquake'

const MAX_COUNT = 200000

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
        color: {type: 'c', value: new THREE.Color(0xffffff)},
        texture: {type: 't', value: this.texture}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      alphaTest: 0.5
    })

    this.root = new THREE.Points(geometry, material)

    this._renderedEarthquakes = []
  }

  destroy () {
    this.root.geometry.dispose()
    this.root.material.dispose()
    this.texture.dispose()
  }

  setProps (data, latLngDepthToPoint) {
    this._dataToProcess = data
    this._latLngDepthToPoint = latLngDepthToPoint
  }

  earthquakeAt (x, y) {
    for (let i = this._renderedEarthquakes.length - 1; i >= 0; i--) {
      if (this._renderedEarthquakes[i].hitTest(x, y)) return this._renderedEarthquakes[i].data
    }
    return null
  }

  update (progress) {
    let transitionInProgress = false
    this._processNewData()
    for (let i = 0, length = this._renderedEarthquakes.length; i < length; i++) {
      const eq = this._renderedEarthquakes[i]
      eq.transitionStep(progress)
      if (eq.transitionInProgress) transitionInProgress = true
    }
    return transitionInProgress
  }

  invalidatePositions (latLngDepthToPoint) {
    this._latLngDepthToPoint = latLngDepthToPoint
    for (let i = 0, len = this._renderedEarthquakes.length; i < len; i++) {
      const point = this._latLngDepthToPoint(this._currentData[i].geometry.coordinates)
      this._renderedEarthquakes[i].setPositionAttr(point)
    }
  }

  _processNewData () {
    if (!this._dataToProcess) return
    let data = this._dataToProcess
    if (data.length > MAX_COUNT) {
      console.warn('Too many earthquakes! Some earthquakes will not be displayed.')
      data = data.splice(0, MAX_COUNT)
    }
    const attributes = this.root.geometry.attributes
    for (let i = 0, length = data.length; i < length; i++) {
      const eqData = data[i]
      if (!this._renderedEarthquakes[i] || this._renderedEarthquakes[i].id !== eqData.id) {
        const point = this._latLngDepthToPoint(eqData.geometry.coordinates)
        this._renderedEarthquakes[i] = new Earthquake(eqData, i, attributes)
        this._renderedEarthquakes[i].setPositionAttr(point)
      }
      this._renderedEarthquakes[i].targetVisibility = eqData.visible ? 1 : 0
    }
    // Reset old data.
    for (let i = data.length, length = this._renderedEarthquakes.length; i < length; i++) {
      this._renderedEarthquakes[i].destroy()
    }
    this._renderedEarthquakes.length = data.length

    this._currentData = data
    this._dataToProcess = null
  }
}

function getTexture () {
  const size = 128
  const strokeWidth = size * 0.06
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // Point
  ctx.arc(size / 2, size / 2, size / 2 - strokeWidth / 2, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = '#000'
  ctx.stroke()
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
