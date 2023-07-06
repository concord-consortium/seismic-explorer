import * as THREE from 'three'
import Earthquake from './earthquake'
import Volcano from './volcano'
import Eruption from './eruption'
import SpritesContainer from './sprites-container'
import Camera from './camera'
import getThreeJSRenderer from '../get-threejs-renderer'

// Share one renderer to avoid memory leaks (I couldn't fix them in other way).
const RendererClass = getThreeJSRenderer()
const renderer = new RendererClass({ alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 0)

export default class {
  constructor (parentEl) {
    if (parentEl) {
      parentEl.appendChild(renderer.domElement)
    }
    this.props = {}
    this.camera = new Camera(renderer.domElement, false)
    this.earthquakes = new SpritesContainer(Earthquake, 200000)
    this.volcanoes = new SpritesContainer(Volcano, 5000)
    this.eruptions = new SpritesContainer(Eruption, 5000)
    this._initScene()
    // [ Shutterbug support ]
    // Since we use 3D context, it's necessary re-render canvas explicitly when snapshot is taken,
    // so .toDataUrl returns correct image. This method is used by shutterbug-support.js module.
    if (renderer.domElement.className.indexOf('canvas-3d') === -1) {
      renderer.domElement.className += ' canvas-3d'
    }
    renderer.domElement.render = this.render.bind(this)
  }

  destroy () {
    // Prevent memory leaks.
    this.volcanoes.destroy()
    this.earthquakes.destroy()
    this.eruptions.destroy()
    this.camera.destroy()
  }

  setProps (newProps) {
    if (newProps.latLngToPoint) {
      this.props.latLngToPoint = newProps.latLngToPoint
    }
    if (this.props.earthquakes !== newProps.earthquakes) {
      const latLngDepthToPoint = getLatLngDepthToPoint(this.props.latLngToPoint, this._height)
      this.earthquakes.setProps(newProps.earthquakes, latLngDepthToPoint)
    }
    if (this.props.volcanoes !== newProps.volcanoes) {
      const latLngDepthToPoint = getLatLngDepthToPoint(this.props.latLngToPoint, this._height)
      this.volcanoes.setProps(newProps.volcanoes, latLngDepthToPoint)
    }
    if (this.props.eruptions !== newProps.eruptions) {
      const latLngDepthToPoint = getLatLngDepthToPoint(this.props.latLngToPoint, this._height)
      this.eruptions.setProps(newProps.eruptions, latLngDepthToPoint)
    }
    this.props = newProps
  }

  spriteAt (x, y) {
    const eruption = this.eruptions.spriteAt(x, this._height - y)
    if (eruption) {
      return { type: 'eruption', data: eruption }
    }
    const volcano = this.volcanoes.spriteAt(x, this._height - y)
    if (volcano) {
      return { type: 'volcano', data: volcano }
    }
    const earthquake = this.earthquakes.spriteAt(x, this._height - y)
    if (earthquake) {
      return { type: 'earthquake', data: earthquake }
    }
    return null
  }

  // Renders scene and returns true if some transitions are in progress (e.g. earthquakes visibility transition).
  render (timestamp = window.performance.now()) {
    const progress = this._prevTimestamp ? timestamp - this._prevTimestamp : 0
    this.camera.update()
    const volcanoesTransition = this.volcanoes.update(progress)
    const earthquakesTransition = this.earthquakes.update(progress)
    const eruptionsTransition = this.eruptions.update(progress)
    const transitionInProgress = volcanoesTransition || earthquakesTransition || eruptionsTransition
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
    this.volcanoes.invalidatePositions(getLatLngDepthToPoint(this.props.latLngToPoint, this._height))
    this.earthquakes.invalidatePositions(getLatLngDepthToPoint(this.props.latLngToPoint, this._height))
    this.eruptions.invalidatePositions(getLatLngDepthToPoint(this.props.latLngToPoint, this._height))
  }

  _initScene () {
    this.scene = new THREE.Scene()
    this.scene.add(this.earthquakes.root)
    this.scene.add(this.volcanoes.root)
    this.scene.add(this.eruptions.root)
  }

  get canvas () {
    return renderer.domElement
  }
}

// Returns a function that converts [lat, lng, depth] into 3D coordinates (instance of THREE.Vector3).
// This function depends on latLngToPoint function provided by Leaflet map, and screen width and height.
function getLatLngDepthToPoint (latLngToPoint, height) {
  // latLngDepth is an array: [latitude, longitude, depthInKm]
  return function (latLngDepth) {
    const point = latLngToPoint(latLngDepth)
    return new THREE.Vector3(
      point.x,
      height - point.y,
      0
    )
  }
}
