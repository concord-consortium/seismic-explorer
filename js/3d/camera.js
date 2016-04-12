import THREE from 'three'
import TWEEN from 'tween.js'
import { BOX_DEPTH } from './cross-section-box'

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
    this.controls.zoomSpeed = 0.3

    this.tweens = []
  }

  destroy() {
    this.controls.dispose()
  }

  update() {
    TWEEN.update()
    this.controls.update()
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
    this.stopAnimations()

    const p1 = latLngDepthToPoint(crossSectionPoints.get(0))
    const p2 = latLngDepthToPoint(crossSectionPoints.get(1))
    // Set target Z coordinate in the middle of the cross section box.
    const targetZ = latLngDepthToPoint([0, 0, BOX_DEPTH * 0.5]).z

    this.tweens.push(this.animationStep1(this.camera.position.clone(), p1, p2, targetZ))
    this.tweens.push(this.animationStep2(p1, p2, targetZ))
    this.tweens.push(this.animationStep3(p1, p2, targetZ))
    this.tweens.push(this.animationStep4(p1, p2, width))

    this.tweens[0].start()
    this.tweens[0].chain(this.tweens[1])
    this.tweens[1].chain(this.tweens[2])
    this.tweens[2].chain(this.tweens[3])
  }

  animationStep1(current, p1, p2, targetZ) {
    const final = center(p1, p2)
    return new TWEEN.Tween(current)
      .to(final, 500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.x = current.x
        this.camera.position.y = current.y
        this.camera.position.z = current.z
        this.controls.target.x = current.x
        this.controls.target.y = current.y
        this.controls.target.z = targetZ
        this.controls.update()
      })
  }

  animationStep2(p1, p2, targetZ) {
    const current = center(p1, p2)
    const final = new THREE.Vector3(
      current.x,
      current.y - DISTANCE_FROM_TARGET,
      targetZ + TARGET_Z_OFFSET
    )
    return new TWEEN.Tween(current)
      .to(final, 750)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.y = current.y
        this.camera.position.z = current.z
      })
  }

  animationStep3(p1, p2, targetZ) {
    const c = center(p1, p2)
    const current = new THREE.Vector3(
      c.x,
      c.y - DISTANCE_FROM_TARGET,
      targetZ + TARGET_Z_OFFSET
    )
    const final = side(p1, p2).setZ(targetZ + TARGET_Z_OFFSET)
    return new TWEEN.Tween(current)
      .to(final, 750)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.x = current.x
        this.camera.position.y = current.y
      })
  }

  animationStep4(p1, p2, width) {
    const current = {zoom: this.zoom}
    const final = {zoom: 0.9 * width / p1.distanceTo(p2)}
    return new TWEEN.Tween(current)
      .to(final, 750)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.zoom = current.zoom
        this.camera.updateProjectionMatrix()
      })
  }

  stopAnimations() {
    this.tweens.forEach(t => t.stop())
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
