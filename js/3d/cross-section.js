import THREE from 'three'
import 'imports?THREE=three!three/examples/js/controls/OrbitControls'
import Earthquakes from './earthquakes'
import CrossSectionBox from './cross-section-box'

const MAX_DEPTH = 800

// Share one renderer to avoid memory leaks (I couldn't fix them in other way).
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 1)

export default class {
  constructor(parentEl) {
    this.latLngDepthToPoint = this.latLngDepthToPoint.bind(this)
    this._depthScale = 1

    parentEl.appendChild(renderer.domElement)
    // Dimensions will be set in .resize() call.
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.01, 1e6)
    // Change default up orientation that affects orbit controls.
    // Assume that Z coord defines depth of the earthquakes.
    this.camera.up = new THREE.Vector3(0, 0, 1)
    this.controls = new THREE.OrbitControls(this.camera, renderer.domElement)
    this.earthquakes = new Earthquakes(this.latLngDepthToPoint)
    this.crossSectionBox = new CrossSectionBox(this.latLngDepthToPoint)
    this.resize()
    this._initScene()
    this._initCamera()
  }

  destroy() {
    // Prevent memory leaks.
    this.earthquakes.destroy()
    this.crossSectionBox.destroy()
  }

  // latLngDepth is an array: [latitude, longitude, depthInKm]
  latLngDepthToPoint(latLngDepth) {
    const point = this._latLngToPoint(latLngDepth)
    return new THREE.Vector3(
      point.x,
      this._height - point.y,
      this._depthScale * (-latLngDepth[2] || 0)
    )
  }

  // Depth scaling is be proportional to the the cross section line length and user's screen aspect ratio.
  // It ensures that when we zoom in to see the whole cross section box from the side, we'll still see
  // earthquakes (and other geometry) at MAX_DEPTH.
  calcDepthScale(crossSectionPoints) {
    // latLngDepthToPoint uses this._depthScale that we try to calculate, but it doesn't matter.
    // We're interested only in distance between those points on the XY plane.
    const p1 = this.latLngDepthToPoint(crossSectionPoints.get(0))
    const p2 = this.latLngDepthToPoint(crossSectionPoints.get(1))
    const aspectRatio = this._width / this._height
    this._depthScale = p1.distanceTo(p2) / aspectRatio / MAX_DEPTH
  }

  setProps(newProps) {
    this._latLngToPoint = newProps.latLngToPoint
    this.calcDepthScale(newProps.crossSectionPoints)

    this.earthquakes.setData(newProps.earthquakes)
    // Create cross section box which has depth proportional to the user's screen aspect ratio.
    // It ensures that box will nicely fill the whole screen when we zoom in.
    this.crossSectionBox.setData(newProps.crossSectionPoints)
  }

  render(timestamp) {
    const progress = this._prevTimestamp ? timestamp - this._prevTimestamp : 0
    this.resize()
    this.controls.update()
    this.earthquakes.update(progress)
    this.crossSectionBox.update(this.camera)
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
    this.scene.add(this.crossSectionBox.root)
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
