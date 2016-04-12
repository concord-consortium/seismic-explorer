import THREE from 'three'
import crossSectionRectangle from '../core/cross-section-rectangle'

export const BOX_DEPTH = 700 // km
const POINT_SIZE = 40 // px

export default class {
  constructor() {
    this.lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 4})
    this.boxMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 1})
    this.planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    })
    this.point1Texture = getPointTexture('P1')
    this.point2Texture = getPointTexture('P2')
    this.point1Material = new THREE.SpriteMaterial({map: this.point1Texture})
    this.point2Material = new THREE.SpriteMaterial({map: this.point2Texture})
    this.root = new THREE.Object3D()
    this.overlay = new THREE.Object3D()
  }

  destroy() {
    this.lineMaterial.dispose()
    this.boxMaterial.dispose()
    this.planeMaterial.dispose()
    this.point1Material.dispose()
    this.point2Material.dispose()
    this.point1Texture.dispose()
    this.point2Texture.dispose()
    this.destroyGeometry()
  }

  destroyGeometry() {
    if (this.lineGeometry) this.lineGeometry.dispose()
    if (this.boxGeometry) this.boxGeometry.dispose()
    if (this.planeGeometry) this.planeGeometry.dispose()
  }

  setData(crossSectionPoints, latLngDepthToPoint) {
    this.destroyGeometry()
    const p1 = latLngDepthToPoint(crossSectionPoints.get(0))
    const p2 = latLngDepthToPoint(crossSectionPoints.get(1))
    const rect = crossSectionRectangle(crossSectionPoints.get(0), crossSectionPoints.get(1)).map(latLngDepthToPoint)
    const boxDepth = latLngDepthToPoint([0, 0, BOX_DEPTH]).z
    this.createLine(p1, p2)
    this.createBox(rect, boxDepth)
    this.createPlane(rect)
    this.createPoints(p1, p2)
  }

  update(zoom) {
    const pointSize = POINT_SIZE / zoom
    this.point1.scale.set(pointSize, pointSize, 1)
    this.point2.scale.set(pointSize, pointSize, 1)
  }

  createLine(p1, p2) {
    if (this.line) this.root.remove(this.line)
    this.lineGeometry = new THREE.Geometry()
    this.lineGeometry.vertices = [p1, p2]
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial)
    this.root.add(this.line)
  }

  createBox(rect, boxDepth) {
    if (this.box) this.root.remove(this.box)
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

  createPlane(rect) {
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

  createPoints(p1, p2) {
    if (this.point1) this.overlay.remove(this.point1)
    if (this.point2) this.overlay.remove(this.point2)
    this.point1 = new THREE.Sprite(this.point1Material)
    this.point2 = new THREE.Sprite(this.point2Material)
    this.point1.position.copy(p1)
    this.point2.position.copy(p2)
    this.point1.scale.set(POINT_SIZE, POINT_SIZE, 1)
    this.point2.scale.set(POINT_SIZE, POINT_SIZE, 1)
    this.overlay.add(this.point1)
    this.overlay.add(this.point2)
  }
}

function getPointTexture(label) {
  const size = 64
  const shadowBlur = size / 4
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // Point
  ctx.arc(size / 2, size / 2, size / 2 - shadowBlur, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = shadowBlur
  ctx.fill()
  // Label
  ctx.fillStyle = '#444'
  ctx.shadowBlur = 0
  ctx.shadowColor = 'rgba(0,0,0,0)'
  ctx.font = `${size * 0.3}px verdana, helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, size / 2, size / 2)
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
