import THREE from 'three'
import Point from './point'
import { depthToColor, magnitudeToRadius } from '../earthquake-properties'

function magnitudeToDiameter (mag) {
  // * 2 because size describes diameter, not radius. It ensures that both 2D and 3D view use
  // exactly the same dimensions.
  return window.devicePixelRatio * 2 * magnitudeToRadius(mag)
}

export default class Earthquake extends Point {
  static getTexture () {
    const size = 128
    const strokeWidth = size * 0.06
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    // Point
    ctx.arc(size / 2, size / 2, size / 2 - strokeWidth / 2, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = '#000'
    ctx.stroke()
    const texture = new THREE.Texture(canvas)
    texture.needsUpdate = true
    return texture
  }

  getColor (data) {
    return depthToColor(data.geometry.coordinates[2])
  }

  getSize (data) {
    return magnitudeToDiameter(data.properties.mag)
  }
}
