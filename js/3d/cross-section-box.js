import * as THREE from 'three'
import crossSectionRectangle from '../core/cross-section-rectangle'
import TickMarks from './tick-marks'
import { latLng } from 'leaflet'
import mapTexture from './map-texture'

export const BOX_DEPTH = 800 // km
const POINT_SIZE = 40 // px
// Adjust box lines and top plane a bit, so they're not overlapping. It can cause small artifacts.
// It also ensures that each earthquake is below the plane.
const TOP_RECT_Z_OFFSET = 5 // km
const TOP_PLANE_Z_OFFSET = -2.5 // km

// Map becomes more visible when user looks directly at it.
function mapOpacity (polarAngle) {
  const PI2 = Math.PI * 0.5
  let v
  if (polarAngle < PI2) {
    v = Math.pow((PI2 - polarAngle) / PI2, 0.3)
  } else {
    v = Math.pow((polarAngle - PI2) / (Math.PI * 0.25), 0.2)
  }
  v = Math.min(1, v)
  return 0.85 * v
}

export default class {
  constructor () {
    this.root = new THREE.Object3D()
    this.overlay = new THREE.Object3D()

    this.lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 4})
    this.boxMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 1})
    this.point1Texture = getPointTexture('P1')
    this.point2Texture = getPointTexture('P2')
    this.point1Material = new THREE.SpriteMaterial({map: this.point1Texture})
    this.point2Material = new THREE.SpriteMaterial({map: this.point2Texture})

    this.tickMarks = new TickMarks(BOX_DEPTH)
    this.overlay.add(this.tickMarks.root)
  }

  destroy () {
    // Static resources, created in constructor.
    this.lineMaterial.dispose()
    this.boxMaterial.dispose()
    this.point1Material.dispose()
    this.point2Material.dispose()
    this.point1Texture.dispose()
    this.point2Texture.dispose()
    this.tickMarks.destroy()
    this.destroyGeometry()
    // Dynamic resources, created when properties are set.
    if (this.planeMaterial) this.planeMaterial.dispose()
    if (this.planeTexture) this.planeTexture.dispose()
  }

  destroyGeometry () {
    if (this.lineGeometry) this.lineGeometry.dispose()
    if (this.boxGeometry) this.boxGeometry.dispose()
    if (this.planeGeometry) this.planeGeometry.dispose()
  }

  setProps (crossSectionPoints, mapType, finalZoom, latLngDepthToPoint) {
    this.destroyGeometry()
    const boxDepth = latLngDepthToPoint([0, 0, BOX_DEPTH]).z
    const rectZOffset = latLngDepthToPoint([0, 0, -TOP_RECT_Z_OFFSET]).z
    const planeZOffset = latLngDepthToPoint([0, 0, -TOP_PLANE_Z_OFFSET]).z
    const p1LatLng = crossSectionPoints.get(0)
    const p2LatLng = crossSectionPoints.get(1)
    const p1 = latLngDepthToPoint(p1LatLng)
    const p2 = latLngDepthToPoint(p2LatLng)
    p1.z += rectZOffset
    p2.z += rectZOffset
    const rectLatLng = crossSectionRectangle(p1LatLng, p2LatLng)
    const rect = rectLatLng.map(latLngDepthToPoint).map(v => v.setZ(v.z + rectZOffset))

    this.setupLine(p1, p2)
    this.setupBox(rect, boxDepth)
    this.setupPlane(rect, planeZOffset, rectLatLng, mapType)
    this.setupPoints(p1, p2)
    this.setupTickMarks(rect, boxDepth, rectLatLng, finalZoom)
  }

  update (zoom, polarAngle) {
    const pointSize = POINT_SIZE / zoom
    this.point1.scale.set(pointSize, pointSize, 1)
    this.point2.scale.set(pointSize, pointSize, 1)
    this.planeMaterial.opacity = mapOpacity(polarAngle)
  }

  setupLine (p1, p2) {
    if (this.line) this.root.remove(this.line)
    this.lineGeometry = new THREE.Geometry()
    this.lineGeometry.vertices = [p1, p2]
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial)
    this.root.add(this.line)
  }

  setupBox (rect, boxDepth) {
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

  setupPlane (rect, planeZOffset, rectLatLng, mapType) {
    if (this.plane) this.root.remove(this.plane)
    if (this.planeTexture) {
      this.planeTexture.dispose()
      this.planeMaterial.dispose()
    }
    const mapTextureData = mapTexture(rectLatLng, mapType)
    this.planeTexture = mapTextureData.texture
    this.planeMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      map: this.planeTexture
    })
    this.planeGeometry = new THREE.Geometry()
    this.planeGeometry.vertices = rect.map(v => v.clone().setZ(v.z + planeZOffset))
    this.planeGeometry.faces = [
      new THREE.Face3(0, 2, 1),
      new THREE.Face3(0, 3, 2)
    ]
    this.planeGeometry.computeFaceNormals()
    this.planeGeometry.computeVertexNormals()
    this.planeGeometry.faceVertexUvs = [[]]
    const uvs = mapTextureData.uvs
    this.planeGeometry.faceVertexUvs[0][0] = [uvs[0], uvs[2], uvs[1]]
    this.planeGeometry.faceVertexUvs[0][1] = [uvs[0], uvs[3], uvs[2]]
    this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
    this.root.add(this.plane)
  }

  setupPoints (p1, p2) {
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

  setupTickMarks (rect, boxDepth, rectLatLng, finalZoom) {
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
      lengthVector: lengthVector,
      widthVector: widthVector,
      depthVector: new THREE.Vector3(0, 0, boxDepth),
      format: function (val, type) {
        switch (type) {
          case 'depth':
            return Math.abs(Math.round(val * BOX_DEPTH / boxDepth)) + 'km'
          case 'length':
            return Math.round(val * lengthKm / lengthVector.length()) + 'km'
          case 'width':
            return Math.round(val * widthKm / widthVector.length()) + 'km'
        }
      },
      lengthTicks: 6,
      widthTicks: 1,
      depthTicks: 4,
      labelSize: labelSize
    })
  }
}

function getPointTexture (label) {
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
