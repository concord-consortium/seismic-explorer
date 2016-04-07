import THREE from 'three'
import { crossSectionRectangle } from '../core'

const BOX_DEPTH = 700 // km
const POINT_RADIUS = window.devicePixelRatio * 5

export default class {
  constructor(latLngDepthToPoint) {
    this.latLngDepthToPoint = latLngDepthToPoint

    this.lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 4})
    this.boxMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 1})
    this.planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    })
    this.circleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    })
    this.root = new THREE.Object3D()
  }

  destroy() {
    this.lineMaterial.dispose()
    this.boxMaterial.dispose()
    this.planeMaterial.dispose()
    this.circleMaterial.dispose()
    this.destroyGeometry()
  }

  destroyGeometry() {
    if (this.lineGeometry) this.lineGeometry.dispose()
    if (this.boxGeometry) this.boxGeometry.dispose()
    if (this.planeGeometry) this.planeGeometry.dispose()
    if (this.circleGeometry) this.circleGeometry.dispose()
  }

  setData(crossSectionPoints) {
    this.destroyGeometry()
    const p1 = this.latLngDepthToPoint(crossSectionPoints.get(0))
    const p2 = this.latLngDepthToPoint(crossSectionPoints.get(1))
    const rect = crossSectionRectangle(crossSectionPoints.get(0), crossSectionPoints.get(1))
      .map(this.latLngDepthToPoint)
    this.replaceLine(p1, p2)
    this.replaceBox(rect)
    this.replacePlane(rect)
    this.replaceCircles(p1, p2)
  }

  update(camera) {
    if (this.circle1) this.circle1.lookAt(camera.position)
    if (this.circle2) this.circle2.lookAt(camera.position)
  }

  replaceLine(p1, p2) {
    if (this.line) this.root.remove(this.line)
    this.lineGeometry = new THREE.Geometry()
    this.lineGeometry.vertices = [p1, p2]
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial)
    this.root.add(this.line)
  }

  replaceBox(rect) {
    if (this.box) this.root.remove(this.box)
    const boxDepth = this.latLngDepthToPoint([0, 0, BOX_DEPTH]).z
    const rectBottom = rect.map(v => v.clone().setZ(boxDepth))
    this.boxGeometry = new THREE.Geometry()
    this.boxGeometry.vertices = [
      // top rect
      rect[0], rect[1],
      rect[1], rect[2],
      rect[2], rect[3],
      rect[3], rect[0],
      // bottom rect
      rectBottom[0], rectBottom[1],
      rectBottom[1], rectBottom[2],
      rectBottom[2], rectBottom[3],
      rectBottom[3], rectBottom[0],
      // side walls
      rect[0], rectBottom[0],
      rect[1], rectBottom[1],
      rect[2], rectBottom[2],
      rect[3], rectBottom[3],
    ]
    this.box = new THREE.LineSegments(this.boxGeometry, this.boxMaterial)
    this.root.add(this.box)
  }

  replacePlane(rect) {
    if (this.plane) this.root.remove(this.plane)
    this.planeGeometry = new THREE.Geometry()
    this.planeGeometry.vertices = rect
    this.planeGeometry.faces = [
      new THREE.Face3(0, 1, 2),
      new THREE.Face3(0, 2, 3)
    ]
    this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
    this.root.add(this.plane)
  }

  replaceCircles(p1, p2) {
    if (this.circle1) this.root.remove(this.circle1)
    if (this.circle2) this.root.remove(this.circle2)
    this.circleGeometry = new THREE.CircleGeometry(POINT_RADIUS, 16)
    this.circle1 = new THREE.Mesh(this.circleGeometry, this.circleMaterial)
    this.circle2 = new THREE.Mesh(this.circleGeometry, this.circleMaterial)
    this.circle1.position.copy(p1)
    this.circle2.position.copy(p2)
    this.root.add(this.circle1)
    this.root.add(this.circle2)
  }
}


