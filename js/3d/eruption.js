import config from '../config'
import * as THREE from 'three'
import Sprite from './sprite'

function ageToColor (lastEruptionDate) {
  const age = new Date().getFullYear() - new Date(lastEruptionDate).getFullYear()
  if (config.volcanoColor !== -1) return parseInt(config.volcanoColor, 16)
  if (age <= 5) return 0xFF6600
  if (age <= 10) return 0xD26F2D
  if (age <= 15) return 0xAC7753
  if (age <= 30) return 0x8C7D73
  return 0x808080
}
function eruptionSize (isErupting) {
  // both 2D and 3D view use the same dimensions.
  if (isErupting) {
    return 60
  } else {
    return 30
  }
}

export default class Eruption extends Sprite {
  static getTexture () {
    const size = 128
    const strokeWidth = size * 0.07
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.moveTo(size, 0)
    ctx.lineTo(size, size)
    ctx.lineTo(0, size)
    ctx.lineTo(0, 0)
    ctx.lineTo(size, 0)
    ctx.closePath()

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
    return ageToColor(data.properties.startdate)
  }

  getSize (data) {
    return eruptionSize(!data.properties.enddate)
    // new Date(data.properties.enddate) > new Date())
  }
}
