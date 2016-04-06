import THREE from 'three'
import vertexShader from 'raw!./earthquakes-vertex.glsl'
import fragmentShader from 'raw!./earthquakes-fragment.glsl'
import Earthquake from './earthquake'
import PIXI from 'pixi.js'

const TEXTURE_RESOLUTION = 128
const MAX_COUNT = 200000

export default class {
  constructor(latLngDepthToPoint) {
    this.latLngDepthToPoint = latLngDepthToPoint

    const positions = new Float32Array(MAX_COUNT * 3)
    const colors = new Float32Array(MAX_COUNT * 3)
    const sizes = new Float32Array(MAX_COUNT)

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Texture defines base shape.
    this.texture = new THREE.Texture(getTexture())
    this.texture.needsUpdate = true

    var material = new THREE.ShaderMaterial({
      uniforms: {
        color: {type: 'c', value: new THREE.Color(0xffffff)},
        texture: {type: 't', value: this.texture}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      alphaTest: 0.5,
    })

    this.particles = new THREE.Points(geometry, material)

    this._data = []
    this._renderedEarthquakes = []
  }

  destroy() {
    this.particles.geometry.dispose()
    this.particles.material.dispose()
    this.texture.dispose()
  }

  setData(data) {
    this._dataToProcess = data
  }

  update(progress) {
    this._processNewData()
    for (let i = 0, length = this._renderedEarthquakes.length; i < length; i++) {
      const eq = this._renderedEarthquakes[i]
      eq.transitionStep(progress)
    }
  }

  _processNewData() {
    if (!this._dataToProcess) return
    let data = this._dataToProcess
    if (data.length > MAX_COUNT) {
      console.warn('Too many earthquakes! Some earthquakes will not be displayed.')
      data = data.splice(0, MAX_COUNT)
    }
    const attributes = this.particles.geometry.attributes
    for (let i = 0, length = data.length; i < length; i++) {
      const eq = data[i]
      if (!this._renderedEarthquakes[i] || this._renderedEarthquakes[i].id !== eq.id) {
        const point = this.latLngDepthToPoint(eq.geometry.coordinates)
        this._renderedEarthquakes[i] = new Earthquake(eq, i, attributes)
        this._renderedEarthquakes[i].setPositionAttr(point)
      }
      this._renderedEarthquakes[i].targetVisibility = eq.visible ? 1 : 0
    }
    // Reset old data.
    for (let i = data.length, length = this._renderedEarthquakes.length; i < length; i++) {
      this._renderedEarthquakes[i].destroy()
    }
    this._renderedEarthquakes.length = data.length

    this._dataToProcess = null
  }
}

function getTexture() {
    const g = new PIXI.Graphics()
    g.lineStyle(0.06, 0x000000, 1)
    g.beginFill(0xFFFFFF, 1)
    g.drawCircle(0.5, 0.5, 0.47)
    g.endFill()
    return g.generateTexture(null, TEXTURE_RESOLUTION).baseTexture.source
}
