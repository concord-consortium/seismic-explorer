import THREE from 'three'
import crossSectionRectangle from '../core/cross-section-rectangle'
import TickMarks from './tick-marks'
import { latLng } from 'leaflet'

export const BOX_DEPTH = 800 // km
const POINT_SIZE = 40 // px

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

export default class {
  constructor() {
    this.root = new THREE.Object3D()
    this.overlay = new THREE.Object3D()

    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 4 })
    this.boxMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
    this.planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    })
    this.point1Texture = getPointTexture('P1')
    this.point2Texture = getPointTexture('P2')
    this.point1Material = new THREE.SpriteMaterial({ map: this.point1Texture })
    this.point2Material = new THREE.SpriteMaterial({ map: this.point2Texture })

    this.tickMarks = new TickMarks(BOX_DEPTH)
    this.overlay.add(this.tickMarks.root)
  }

  destroy() {
    this.lineMaterial.dispose()
    this.boxMaterial.dispose()
    this.planeMaterial.dispose()
    this.point1Material.dispose()
    this.point2Material.dispose()
    this.point1Texture.dispose()
    this.point2Texture.dispose()
    this.tickMarks.destroy()
    this.destroyGeometry()
  }

  destroyGeometry() {
    if (this.lineGeometry) this.lineGeometry.dispose()
    if (this.boxGeometry) this.boxGeometry.dispose()
    if (this.planeGeometry) this.planeGeometry.dispose()
  }

  setProps(crossSectionPoints, finalZoom, latLngDepthToPoint) {
    this.destroyGeometry()
    const p1LatLng = crossSectionPoints.get(0)
    const p2LatLng = crossSectionPoints.get(1)
    const p1 = latLngDepthToPoint(p1LatLng)
    const p2 = latLngDepthToPoint(p2LatLng)
    const rectLatLng = crossSectionRectangle(p1LatLng, p2LatLng)
    const rect = rectLatLng.map(latLngDepthToPoint)
    const boxDepth = latLngDepthToPoint([0, 0, BOX_DEPTH]).z
    this.setupLine(p1, p2)
    this.setupBox(rect, boxDepth)
    this.setupPlane(rect)
    this.setupPoints(p1, p2)
    this.setupTickMarks(rect, boxDepth, rectLatLng, finalZoom)
  }

  update(zoom) {
    const pointSize = POINT_SIZE / zoom
    this.point1.scale.set(pointSize, pointSize, 1)
    this.point2.scale.set(pointSize, pointSize, 1)
  }

  setupLine(p1, p2) {
    if (this.line) this.root.remove(this.line)
    this.lineGeometry = new THREE.Geometry()
    this.lineGeometry.vertices = [p1, p2]
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial)
    this.root.add(this.line)
  }

  setupBox(rect, boxDepth) {
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
      rect[3], rectBottom[3]
    ]
    this.box = new THREE.LineSegments(this.boxGeometry, this.boxMaterial)
    this.root.add(this.box)
  }

  setupPlane(rect) {
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

  setupPoints(p1, p2) {
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

  setupTickMarks(rect, boxDepth, rectLatLng, finalZoom) {
    // Note that order of rectangle points is strictly defined and based on what we should see in 3D view.
    // See: cross-section-rectangle.js
    const lengthKm = latLng(rectLatLng[3]).distanceTo(latLng(rectLatLng[0])) / 1000 // m -> km
    const widthKm = latLng(rectLatLng[1]).distanceTo(latLng(rectLatLng[0])) / 1000 // m -> km
    const lengthVector = rect[3].clone().sub(rect[0])
    const widthVector = rect[1].clone().sub(rect[0])
    // Make sure that labels always have constant size when camera zooms in.
    const labelSize = POINT_SIZE * 0.5 / finalZoom
    this.tickMarks.setProps({
      origin: rect[0],
      lengthVector,
      widthVector,
      depthVector: new THREE.Vector3(0, 0, boxDepth),
      format(val, type) {
        switch (type) {
          case 'depth':
            return Math.abs(Math.round(val * BOX_DEPTH / boxDepth)) + 'km'
          case 'length':
            return Math.round(val * lengthKm / lengthVector.length()) + 'km'
          default:
            return Math.round(val * widthKm / widthVector.length()) + 'km'
        }
      },
      lengthTicks: 6,
      widthTicks: 1,
      depthTicks: 4,
      labelSize
    })
  }
}
