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
    return 80
  } else {
    return 40
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
    ctx.moveTo(0, 0) // corner
    ctx.lineTo(size / 2 - size / 8, size) // tip
    ctx.lineTo(size / 2 + size / 8, size) // tip
    ctx.lineTo(size, 0)
    ctx.lineTo(0, 0)
    ctx.clip()

    ctx.fillStyle = '#fff'
    ctx.fill()

    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = '#000'
    ctx.stroke()

    ctx.fillStyle = `rgba(1,1,1,0.3)`
    ctx.strokeStyle = `rgba(1,1,1,0)`
    ctx.moveTo(size / 2, size)
    ctx.arc(size / 2, size, size / 4, Math.PI, 2 * Math.PI)
    ctx.fill()

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
