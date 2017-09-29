import THREE from 'three'
import vertexShader from './earthquakes-vertex.glsl'
import fragmentShader from './earthquakes-fragment.glsl'

export default class PointsContainer {
  constructor (PointClass, maxCount) {
    this.PointClass = PointClass
    this.maxCount = maxCount

    // Texture defines base shape.
    this.texture = PointClass.getTexture()

    const positions = new Float32Array(this.maxCount * 3)
    const colors = new Float32Array(this.maxCount * 3)
    const sizes = new Float32Array(this.maxCount)

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {type: 'c', value: new THREE.Color(0xffffff)},
        texture: {type: 't', value: this.texture}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      alphaTest: 0.5
    })

    this.root = new THREE.Points(geometry, material)

    this._renderedPoints = []
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

  pointAt (x, y) {
    for (let i = this._renderedPoints.length - 1; i >= 0; i--) {
      if (this._renderedPoints[i].hitTest(x, y)) return this._renderedPoints[i].data
    }
    return null
  }

  update (progress) {
    let transitionInProgress = false
    this._processNewData()
    for (let i = 0, length = this._renderedPoints.length; i < length; i++) {
      const point = this._renderedPoints[i]
      point.transitionStep(progress)
      if (point.transitionInProgress) transitionInProgress = true
    }
    return transitionInProgress
  }

  invalidatePositions (latLngDepthToPoint) {
    this._latLngDepthToPoint = latLngDepthToPoint
    for (let i = 0, len = this._renderedPoints.length; i < len; i++) {
      const point = this._latLngDepthToPoint(this._currentData[i].geometry.coordinates)
      this._renderedPoints[i].setPositionAttr(point)
    }
  }

  _processNewData () {
    if (!this._dataToProcess) return
    let data = this._dataToProcess
    if (data.length > this.maxCount) {
      console.warn('Too many points! Some points will not be displayed.')
      data = data.splice(0, this.maxCount)
    }
    const attributes = this.root.geometry.attributes
    for (let i = 0, length = data.length; i < length; i++) {
      const pointData = data[i]
      if (!this._renderedPoints[i] || this._renderedPoints[i].id !== pointData.id) {
        const point = this._latLngDepthToPoint(pointData.geometry.coordinates)
        this._renderedPoints[i] = new this.PointClass(pointData, i, attributes)
        this._renderedPoints[i].setPositionAttr(point)
      }
      this._renderedPoints[i].targetVisibility = pointData.visible ? 1 : 0
    }
    // Reset old data.
    for (let i = data.length, length = this._renderedPoints.length; i < length; i++) {
      this._renderedPoints[i].destroy()
    }
    this._renderedPoints.length = data.length

    this._currentData = data
    this._dataToProcess = null
  }
}
