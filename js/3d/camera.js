import THREE from 'three'

const DISTANCE_FROM_TARGET = 1000

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
  }

  destroy() {
    this.controls.dispose()
  }

  update() {
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

  lookAtCrossSection(crossSectionPoints, latLngDepthToPoint) {

  }

  get zoom() {
    return this.camera.zoom
  }
}
