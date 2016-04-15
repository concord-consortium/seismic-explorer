import THREE from 'three'
import TWEEN from 'tween.js'
import { BOX_DEPTH } from './cross-section-box'
import TweenManager from '../tween-manager'

const DISTANCE_FROM_TARGET = 1000
const TARGET_ANGLE = Math.PI * 0.485
const TARGET_Z_OFFSET = 50

export default class Camera {
  constructor(domElement) {
    // Dimensions will be set in .resize() call.
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.01, 1e6)
    // Change default up orientation that affects orbit controls.
    // Assume that Z coord defines depth of the earthquakes.
    this.camera.up = new THREE.Vector3(0, 0, 1)
    this.controls = new THREE.OrbitControls(this.camera, domElement)
    this.controls.rotateSpeed = 0.5
    this.controls.zoomSpeed = 0.4
    this.controls.maxPolarAngle = 0.75 * Math.PI
    this.controls.enablePan = false

    this.tweens = new TweenManager()
  }

  destroy() {
    this.tweens.stopAll()
    this.controls.dispose()
  }

  update() {
    this.tweens.update()
    this.controls.update()
  }

  onChange(callback) {
    this.controls.addEventListener('change', () => {
      // Don't call onChange callback when we animate camera. Do it only when user modifies it.
      if (!this.tweens.animationInProgress) callback()
    })
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
    this.controls.target = new THREE.Vector3(x, y, 0)
  }

  lookAtCrossSection(crossSectionPoints, latLngDepthToPoint, width) {
    this.tweens.stopAll()

    const p1 = latLngDepthToPoint(crossSectionPoints.get(0))
    const p2 = latLngDepthToPoint(crossSectionPoints.get(1))
    // Set target Z coordinate in the middle of the cross section box.
    const targetZ = latLngDepthToPoint([0, 0, BOX_DEPTH * 0.5]).z

    // Lock angles, so user cannot look at the back side of the cross section.
    this.controls.minAzimuthAngle = azimuthAngle(p1, p2, 'min')
    this.controls.maxAzimuthAngle = azimuthAngle(p1, p2, 'max')

    const centerView = center(p1, p2)
    const initialSideView = new THREE.Vector3(
      centerView.x,
      centerView.y - DISTANCE_FROM_TARGET,
      targetZ + TARGET_Z_OFFSET
    )
    // Save final camera position and zoom, so user can reset view later.
    this._finalSideView = side(p1, p2, targetZ + TARGET_Z_OFFSET)
    this._finalZoom = 0.9 * width / p1.distanceTo(p2)

    const t1 = this.tweens.add(this.animateCamAndTargetPos(centerView, targetZ))
    const t2 = this.tweens.add(this.animateCamPos(initialSideView))
    const t3 = this.tweens.add(this.animateCamPos(this._finalSideView))
    const t4 = this.tweens.add(this.animateZoom(this._finalZoom))

    t1.start()
    t1.chain(t2)
    t2.chain(t3)
    t3.chain(t4)
  }

  reset() {
    // Reset is possible only when the initial animation has finished and we calculated the final view.
    if (!this._finalSideView || !this._finalZoom) return
    this.tweens.add(this.animateCamPos(this._finalSideView)).start()
    this.tweens.add(this.animateZoom(this._finalZoom)).start()
  }

  animateCamAndTargetPos(finalCamPos, targetZ) {
    return new TWEEN.Tween(this.camera.position)
      .to(finalCamPos, 750)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        // Move controls' target too.
        this.controls.target.x = this.camera.position.x
        this.controls.target.y = this.camera.position.y
        this.controls.target.z = targetZ
        this.controls.update()
      })
  }

  animateCamPos(finalCamPos) {
    return new TWEEN.Tween(this.camera.position)
      .to(finalCamPos, 750)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.controls.update()
      })
  }

  animateZoom(finalCamZoom) {
    return new TWEEN.Tween(this.camera)
      .to({zoom: finalCamZoom}, 750)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.updateProjectionMatrix()
        this.controls.update()
      })
  }

  get zoom() {
    return this.camera.zoom
  }
}

// p1, p2 are instances of THREE.Vector3
function center(p1, p2) {
  return p1.clone().lerp(p2, 0.5).setZ(DISTANCE_FROM_TARGET)
}

function side(p1, p2, z) {
  const c = center(p1, p2)
  const angle = p1.x < p2.x ? TARGET_ANGLE : -TARGET_ANGLE
  const dir = p1.clone().sub(p2).applyAxisAngle(new THREE.Vector3(0, 0, 1), angle).setLength(DISTANCE_FROM_TARGET)
  return c.add(dir).setZ(z)
}

function azimuthAngle(p1, p2, type) {
  if (p1.x >= p2.x) {
    const tmp = p1
    p1 = p2
    p2 = tmp
  }
  const v1 = type === 'min' ? p1.clone().sub(p2) : p2.clone().sub(p1)
  const v2 = new THREE.Vector3(0, -1, 0)
  const sign = type === 'min' ? -1 : 1
  return sign * 1.01 * v2.angleTo(v1)
}
