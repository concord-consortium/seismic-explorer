import THREE from 'three'
import 'imports?THREE=three!three/examples/js/controls/OrbitControls'
import Earthquakes from './earthquakes'
import CrossSectionBox from './cross-section-box'
import Camera from './camera'

const MAX_DEPTH = 800

// Share one renderer to avoid memory leaks (I couldn't fix them in other way).
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 1)
renderer.autoClear = false

export default class {
  constructor(parentEl) {
    parentEl.appendChild(renderer.domElement)
    this.props = {}
    this.camera = new Camera(renderer.domElement)
    this.earthquakes = new Earthquakes()
    this.crossSectionBox = new CrossSectionBox()
    this.resize()
    this._initScene()
    // Look at the center of the screen, make sure that 3D view lines up with the 2D map.
    this.camera.setInitialCamPosition(this._width / 2, this._height / 2)
  }

  destroy() {
    // Prevent memory leaks.
    this.earthquakes.destroy()
    this.crossSectionBox.destroy()
    this.camera.destroy()
  }

  setProps(newProps) {
    const latLngDepthToPoint = getLatLngDepthToPoint(
      newProps.latLngToPoint,
      newProps.crossSectionPoints,
      this._width, this._height
    )

    if (this.props.earthquakes !== newProps.earthquakes) {
      this.earthquakes.setData(newProps.earthquakes, latLngDepthToPoint)
    }
    if (this.props.crossSectionPoints !== newProps.crossSectionPoints) {
      this.crossSectionBox.setData(newProps.crossSectionPoints, latLngDepthToPoint)
      // .lookAtCrossSection starts an animation.
      this.camera.lookAtCrossSection(newProps.crossSectionPoints, latLngDepthToPoint)
    }
    this.props = newProps
  }

  render(timestamp) {
    const progress = this._prevTimestamp ? timestamp - this._prevTimestamp : 0

    this.resize()

    this.camera.update()
    this.earthquakes.update(progress)
    this.crossSectionBox.update(this.camera.zoom)

    renderer.clear()
    renderer.render(this.scene, this.camera.camera)
    renderer.clearDepth()
    renderer.render(this.sceneOverlay, this.camera.camera)

    this._prevTimestamp = timestamp
  }

  // Resizes canvas to fill its parent.
  resize() {
    const parent = renderer.domElement.parentElement
    const newWidth = parent.clientWidth
    const newHeight = parent.clientHeight
    if (newWidth !== this._width || newHeight !== this._height) {
      renderer.setSize(newWidth, newHeight)
      this.camera.setSize(newWidth, newHeight)
      this._width = newWidth
      this._height = newHeight
    }
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.sceneOverlay = new THREE.Scene()
    this.scene.add(this.earthquakes.root)
    this.scene.add(this.crossSectionBox.root)
    this.sceneOverlay.add(this.crossSectionBox.overlay)
  }
}

// Returns a function that converts [lat, lng, depth] into 3D coordinates (instance of THREE.Vector3).
// This function depends on latLngToPoint function provided by Leaflet map, cross section box dimensions
// and screen width and height.
// Depth scaling is be proportional to the the cross section line length and user's screen aspect ratio.
// It ensures that when we zoom in to see the whole cross section box from the side, we'll still see
// earthquakes (and other geometry) at MAX_DEPTH.
function getLatLngDepthToPoint(latLngToPoint, crossSectionPoints, width, height) {
  const p1 = latLngToPoint(crossSectionPoints.get(0))
  const p2 = latLngToPoint(crossSectionPoints.get(1))
  const aspectRatio = width / height
  const depthScale = p1.distanceTo(p2) / aspectRatio / MAX_DEPTH

  // latLngDepth is an array: [latitude, longitude, depthInKm]
  return function(latLngDepth) {
    const point = latLngToPoint(latLngDepth)
    return new THREE.Vector3(
      point.x,
      height - point.y,
      depthScale * (-latLngDepth[2] || 0)
    )
  }
}
