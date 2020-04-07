import config from '../config'
import * as THREE from 'three'
import Sprite from './sprite'

function ageToColor (age) {
  if (config.volcanoColor !== -1) return parseInt(config.volcanoColor, 16)
  if (age <= 100) return 0xFF6600
  if (age <= 400) return 0xD26F2D
  if (age <= 1600) return 0xAC7753
  if (age <= 6400) return 0x8C7D73
  return 0x808080
}

export default class Volcano extends Sprite {
  static getTexture () {
    const size = 128
    const strokeWidth = size * 0.07
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    // Triangle
    ctx.moveTo(0, 0) // corner
    ctx.lineTo(size / 2, size)// tip
    ctx.lineTo(size, 0)
    ctx.lineTo(0, 0)

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
    return ageToColor(data.age)
  }

  getSize (data) {
    return 30
  }
}
