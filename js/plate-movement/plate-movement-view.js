import * as THREE from 'three'
import 'three/examples/js/controls/OrbitControls'
import DirectionArrows from './direction-arrows'
import Camera from './camera'

// Share one renderer to avoid memory leaks
const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 0)

export default class {
  constructor (parentEl) {
    if (parentEl) {
      parentEl.appendChild(renderer.domElement)
    }
    this.props = {}
    this.camera = new Camera(renderer.domElement, false)
    this.arrows = new DirectionArrows()
    this._initScene()

    if (renderer.domElement.className.indexOf('canvas-plates') === -1) {
      renderer.domElement.className += ' canvas-plates'
    }
    renderer.domElement.render = this.render.bind(this)
  }

  destroy () {
    // Prevent memory leaks.
    this.arrows.destroy()
    this.camera.destroy()
  }

  setProps (newProps) {
    if (newProps.latLngToPoint) {
      this.props.latLngToPoint = newProps.latLngToPoint
    }
    if (this.props.PlateMovementPoints !== newProps.PlateMovementPoints) {
      const latLngDepthToPoint = getLatLngDepthToPoint(this.props.latLngToPoint, this._height)
      this.arrows.setProps(newProps.PlateMovementPoints, latLngDepthToPoint)
    }
    this.props = newProps
  }

  // Renders scene and returns true if some transitions are in progress (e.g. visibility transition).
  render (timestamp = window.performance.now()) {
    const progress = this._prevTimestamp ? timestamp - this._prevTimestamp : 0
    this.camera.update()
    const transitionInProgress = this.arrows.update(progress)
    renderer.render(this.scene, this.camera.camera)
    // Reset timestamp if transition has just ended, so when it starts next time, `progress` value starts from 0 again.
    this._prevTimestamp = transitionInProgress ? timestamp : null
    return transitionInProgress
  }

  setSize (newWidth, newHeight) {
    if (newWidth !== this._width || newHeight !== this._height) {
      renderer.setSize(newWidth, newHeight)
      this.camera.setSize(newWidth, newHeight)
      this._width = newWidth
      this._height = newHeight
      this.camera.setInitialCamPosition(newWidth / 2, newHeight / 2)
    }
  }

  invalidatePositions () {
    this.arrows.invalidatePositions(getLatLngDepthToPoint(this.props.latLngToPoint, this._height))
  }

  _initScene () {
    this.scene = new THREE.Scene()
    this.scene.add(this.arrows.root)
  }

  get canvas () {
    return renderer.domElement
  }
}

// Returns a function that converts [lat, lng] into 3D coordinates (instance of THREE.Vector3).
// This function depends on latLngToPoint function provided by Leaflet map, and screen width and height.
function getLatLngDepthToPoint (latLngToPoint, height) {
  // latLng is an array: [latitude, longitude]
  return function (latLng) {
    const point = latLngToPoint(latLng)
    return new THREE.Vector3(
      point.x,
      height - point.y,
      0
    )
  }
}
