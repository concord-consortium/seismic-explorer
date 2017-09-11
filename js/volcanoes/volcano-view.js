import THREE from 'three'
import 'imports?THREE=three!three/examples/js/controls/OrbitControls'
import Volcanoes from './volcanoes'
import Camera from './camera'

// Share one renderer to avoid memory leaks
const renderer = new THREE.WebGLRenderer({alpha: true})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 0)

export default class {
  constructor(parentEl) {
    if (parentEl) {
      parentEl.appendChild(renderer.domElement)
    }
    this.props = {}
    this.camera = new Camera(renderer.domElement, false)
    this.volcanoes = new Volcanoes()
    this._initScene()

    if (renderer.domElement.className.indexOf('canvas-volcanoes') === -1) {
      renderer.domElement.className += ' canvas-volcanoes'
    }
    renderer.domElement.render = this.render.bind(this)
  }

  destroy() {
    // Prevent memory leaks.
    this.volcanoes.destroy()
    this.camera.destroy()
  }

  volcanoAt(x, y) {
    return this.volcanoes.volcanoAt(x, this._height - y)
  }

  setProps(newProps) {
    if (newProps.latLngToPoint) {
      this.props.latLngToPoint = newProps.latLngToPoint
    }
    if (this.props.VolcanoPoints !== newProps.VolcanoPoints) {
      const latLngDepthToPoint = getLatLngDepthToPoint(this.props.latLngToPoint, this._height)
      this.volcanoes.setProps(newProps.VolcanoPoints, latLngDepthToPoint)
    }
    this.props = newProps
  }

  // Renders scene and returns true if some transitions are in progress (e.g. visibility transition).
  render(timestamp = performance.now()) {
    const progress = this._prevTimestamp ? timestamp - this._prevTimestamp : 0
    this.camera.update()
    const transitionInProgress = this.volcanoes.update(progress)
    renderer.render(this.scene, this.camera.camera)
    // Reset timestamp if transition has just ended, so when it starts next time, `progress` value starts from 0 again.
    this._prevTimestamp = transitionInProgress ? timestamp : null
    return transitionInProgress
  }

  setSize(newWidth, newHeight) {
    if (newWidth !== this._width || newHeight !== this._height) {
      renderer.setSize(newWidth, newHeight)
      this.camera.setSize(newWidth, newHeight)
      this._width = newWidth
      this._height = newHeight
      this.camera.setInitialCamPosition(newWidth / 2, newHeight / 2)
    }
  }

  invalidatePositions() {
    this.volcanoes.invalidatePositions(getLatLngDepthToPoint(this.props.latLngToPoint, this._height))
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.add(this.volcanoes.root)
  }

  get canvas() {
    return renderer.domElement
  }
}

// Returns a function that converts [lat, lng] into 3D coordinates (instance of THREE.Vector3).
// This function depends on latLngToPoint function provided by Leaflet map, and screen width and height.
function getLatLngDepthToPoint(latLngToPoint, height) {
  // latLng is an array: [latitude, longitude]
  return function(latLng) {
    const point = latLngToPoint(latLng)
    return new THREE.Vector3(
      point.x,
      height - point.y,
      0
    )
  }
}
