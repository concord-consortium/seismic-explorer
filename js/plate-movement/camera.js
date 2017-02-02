import THREE from 'three'
import TWEEN from 'tween.js'
import TweenManager from '../tween-manager'

const DISTANCE_FROM_TARGET = 1000

export default class Camera {
  constructor(domElement, controlsEnabled) {
    // Dimensions will be set in .resize() call.
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.01, 1e6)
    // Change default up orientation that affects orbit controls.
    // Assume that Z coord defines depth of the earthquakes.
    this.camera.up = new THREE.Vector3(0, 0, 1)
   }

  destroy() {
  }

  update() {
  }

  setSize(width, height) {
    const w2 = width * 0.5
    const h2 = height * 0.5
    this.camera.left = -w2
    this.camera.right = w2
    this.camera.top = h2
    this.camera.bottom = -h2
    this.camera.updateProjectionMatrix()
  }

  setInitialCamPosition(x, y) {
    this.camera.position.x = x
    this.camera.position.y = y
    this.camera.position.z = DISTANCE_FROM_TARGET
    this.camera.updateProjectionMatrix()
    // Focus camera in the middle of the cross section box depth.
  }

  reset() {
  }

  get zoom() {
    return this.camera.zoom
  }

  get polarAngle() {
    // this.controls.getPolarAngle() seems to be broken in r75
    const v1 = new THREE.Vector3(0, 0, 1)
    const v2 = this.camera.position.clone().sub(this.controls.target).normalize()
    return v2.angleTo(v1)
  }
}

function leftPoint(point1, point2) {
  return point1.x < point2.x ? point1 : point2
}

function rightPoint(point1, point2) {
  return point1.x < point2.x ? point2 : point1
}

function center(pLeft, pRight) {
  return pLeft.clone().lerp(pRight, 0.5).setZ(DISTANCE_FROM_TARGET)
}

function azimuthAngle(pLeft, pRight, type) {
  const v1 = type === 'min' ? pLeft.clone().sub(pRight) : pRight.clone().sub(pLeft)
  const v2 = new THREE.Vector3(0, -1, 0)
  const sign = type === 'min' ? -1 : 1
  return sign * 1.01 * v2.angleTo(v1)
}
