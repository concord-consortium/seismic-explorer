import THREE from 'three'
import 'imports?THREE=three!three/examples/js/controls/OrbitControls'
import Earthquakes from './earthquakes'

// Share one renderer to avoid memory leaks (I couldn't fix them in other way).
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 1)

export default class {
  constructor(parentEl) {
    parentEl.appendChild(renderer.domElement)
    // Dimensions will be set in .resize() call.
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.01, 1e6)
    // Change default up orientation that affects orbit controls.
    // Assume that Z coord defines depth of the earthquakes.
    this.camera.up = new THREE.Vector3(0, 0, 1)
    this.controls = new THREE.OrbitControls(this.camera, renderer.domElement)
    this.earthquakes = new Earthquakes(this.latLngDepthToPoint.bind(this))
    this.resize()
    this._initScene()
    this._initCamera()
  }

  destroy() {
    // Prevent memory leaks.
    this.earthquakes.destroy()
  }

  // latLngDepth is an array: [latitude, longitude, depthInKm]
  latLngDepthToPoint(latLngDepth) {
    const point = this._latLngToPoint(latLngDepth)
    point.y = this._height - point.y
    point.z = -latLngDepth[2] * this._height / 1000
    return point
  }

  setProps(newProps) {
    this._latLngToPoint = newProps.latLngToPoint
    this.earthquakes.setData(newProps.earthquakes)
  }

  render(timestamp) {
    const progress = this._prevTimestamp ? timestamp - this._prevTimestamp : 0
    this.resize()
    this.controls.update()
    this.earthquakes.update(progress)
    renderer.render(this.scene, this.camera)
    this._prevTimestamp = timestamp
  }

  // Resizes canvas to fill its parent.
  resize() {
    const parent = renderer.domElement.parentElement
    const newWidth = parent.clientWidth
    const newHeight = parent.clientHeight
    if (newWidth !== this._width || newHeight !== this._height) {
      renderer.setSize(newWidth, newHeight)
      const w = newWidth * 0.5
      const h = newHeight * 0.5
      this.camera.left = -w
      this.camera.right = w
      this.camera.top = h
      this.camera.bottom = -h
      this.camera.updateProjectionMatrix()

      this._width = newWidth
      this._height = newHeight
    }
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.add(this.earthquakes.particles)
  }

  _initCamera() {
    const w = this._width * 0.5
    const h = this._height * 0.5
    this.camera.position.x = w
    this.camera.position.y = h
    this.camera.position.z = 1000
    this.camera.updateProjectionMatrix()
    this.controls.rotateSpeed = 0.5
    this.controls.zoomSpeed = 0.3
    this.controls.target = new THREE.Vector3(w, h, this._height * -0.4)
  }
}
