import * as THREE from 'three'
import TWEEN from 'tween.js'
import { BOX_DEPTH } from './cross-section-box'
import TweenManager from '../tween-manager'

const DISTANCE_FROM_TARGET = 1000
const TARGET_ANGLE = Math.PI * 0.485
const TARGET_Z_OFFSET = 85
const TWEEN_SEGMENT_DURATION = 1500

export default class Camera {
  constructor (domElement, controlsEnabled) {
    // Dimensions will be set in .resize() call.
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.01, 1e6)
    // Change default up orientation that affects orbit controls.
    // Assume that Z coord defines depth of the earthquakes.
    this.camera.up = new THREE.Vector3(0, 0, 1)
    this.controls = new THREE.OrbitControls(this.camera, domElement)
    this.controls.enabled = controlsEnabled
    this.controls.rotateSpeed = 0.5
    this.controls.zoomSpeed = 0.4
    this.controls.maxPolarAngle = 0.75 * Math.PI
    this.controls.enablePan = false

    this.tweens = new TweenManager()
  }

  destroy () {
    this.tweens.stopAll()
    this.controls.dispose()
  }

  update () {
    this.tweens.update()
    this.controls.update()
  }

  onChange (callback) {
    this.controls.addEventListener('change', () => {
      // Don't call onChange callback when we animate camera. Do it only when user modifies it.
      if (!this.tweens.animationInProgress) callback()
    })
  }

  setSize (width, height) {
    const w2 = width * 0.5
    const h2 = height * 0.5
    this.camera.left = -w2
    this.camera.right = w2
    this.camera.top = h2
    this.camera.bottom = -h2
    this.camera.updateProjectionMatrix()
  }

  setInitialCamPosition (x, y) {
    this.camera.position.x = x
    this.camera.position.y = y
    this.camera.position.z = DISTANCE_FROM_TARGET
    this.camera.updateProjectionMatrix()
    // Focus camera in the middle of the cross section box depth.
    this.controls.target = new THREE.Vector3(x, y, 0)
  }

  lookAtCrossSection (crossSectionPoints, finalZoom, latLngDepthToPoint) {
    this.tweens.stopAll()

    const p1 = latLngDepthToPoint(crossSectionPoints.get(0))
    const p2 = latLngDepthToPoint(crossSectionPoints.get(1))
    const pLeft = leftPoint(p1, p2)
    const pRight = rightPoint(p1, p2)
    // Set target Z coordinate in the middle of the cross section box.
    const targetZ = latLngDepthToPoint([0, 0, BOX_DEPTH * 0.5]).z

    // Lock angles, so user cannot look at the back side of the cross section.
    this.controls.minAzimuthAngle = azimuthAngle(pLeft, pRight, 'min')
    this.controls.maxAzimuthAngle = azimuthAngle(pLeft, pRight, 'max')

    const centerView = center(pLeft, pRight)
    const initialSideView = new THREE.Vector3(
      centerView.x,
      centerView.y - DISTANCE_FROM_TARGET,
      targetZ + TARGET_Z_OFFSET
    )
    // Save final camera position and zoom, so user can reset view later.
    this._finalSideView = side(pLeft, pRight, targetZ + TARGET_Z_OFFSET)
    this._finalZoom = finalZoom

    const t1 = this.tweens.add(this.animateCamAndTargetPos(centerView, targetZ))
    const t2 = this.tweens.add(this.animateCamPos(initialSideView))
    const t3 = this.tweens.add(this.animateCamPos(this._finalSideView))
    const t4 = this.tweens.add(this.animateZoom(this._finalZoom))

    t1.start()
    t1.chain(t2)
    t2.chain(t3)
    t3.chain(t4)
  }

  reset () {
    // Reset is possible only when the initial animation has finished and we calculated the final view.
    if (!this._finalSideView || !this._finalZoom) return
    this.tweens.add(this.animateCamPos(this._finalSideView)).start()
    this.tweens.add(this.animateZoom(this._finalZoom)).start()
  }

  animateCamAndTargetPos (finalCamPos, targetZ) {
    return new TWEEN.Tween(this.camera.position)
      .to(finalCamPos, TWEEN_SEGMENT_DURATION)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        // Move controls' target too.
        this.controls.target.x = this.camera.position.x
        this.controls.target.y = this.camera.position.y
        this.controls.target.z = targetZ
        this.controls.update()
      })
  }

  animateCamPos (finalCamPos) {
    return new TWEEN.Tween(this.camera.position)
      .to(finalCamPos, TWEEN_SEGMENT_DURATION)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.controls.update()
      })
  }

  animateZoom (finalCamZoom) {
    return new TWEEN.Tween(this.camera)
      .to({ zoom: finalCamZoom }, TWEEN_SEGMENT_DURATION)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.updateProjectionMatrix()
        this.controls.update()
      })
  }

  get zoom () {
    return this.camera.zoom
  }

  get polarAngle () {
    // this.controls.getPolarAngle() seems to be broken in r75
    const v1 = new THREE.Vector3(0, 0, 1)
    const v2 = this.camera.position.clone().sub(this.controls.target).normalize()
    return v2.angleTo(v1)
  }
}

function leftPoint (point1, point2) {
  return point1.x < point2.x ? point1 : point2
}

function rightPoint (point1, point2) {
  return point1.x < point2.x ? point2 : point1
}

function center (pLeft, pRight) {
  return pLeft.clone().lerp(pRight, 0.5).setZ(DISTANCE_FROM_TARGET)
}

function side (pLeft, pRight, z) {
  const c = center(pLeft, pRight)
  const dir = pLeft.clone().sub(pRight).applyAxisAngle(new THREE.Vector3(0, 0, 1), TARGET_ANGLE).setLength(DISTANCE_FROM_TARGET)
  return c.add(dir).setZ(z)
}

function azimuthAngle (pLeft, pRight, type) {
  const v1 = type === 'min' ? pLeft.clone().sub(pRight) : pRight.clone().sub(pLeft)
  const v2 = new THREE.Vector3(0, -1, 0)
  const sign = type === 'min' ? -1 : 1
  return sign * 1.01 * v2.angleTo(v1)
}
