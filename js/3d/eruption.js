import config from '../config'
import * as THREE from 'three'
import Sprite from './sprite'

function ageToColor (lastEruptionDate) {
  const age = new Date().getFullYear() - new Date(lastEruptionDate).getFullYear()
  if (config.volcanoColor !== -1) return parseInt(config.volcanoColor, 16)
  if (age <= 40) return 0xFF6600
  if (age <= 100) return 0xD26F2D
  if (age <= 400) return 0xAC7753
  if (age <= 1600) return 0x8C7D73
  return 0x808080
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
    // ctx.lineTo(size / 2 - size / 8, size) // left-of-tip use for flattened-top appearance
    // ctx.lineTo(size / 2 + size / 8, size) // right-of-tip
    ctx.lineTo(size / 2, size) // tip
    ctx.lineTo(size, 0)
    ctx.lineTo(0, 0)
    ctx.closePath()
    ctx.clip()

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
    const ageDate = data.properties.enddate ? data.properties.enddate : data.properties.startdate
    return ageToColor(ageDate)
  }

  getSize (data) {
    // we don't yet have a way to say "it's erupting right now" for an eruption
    // the sprite renders the same with only visible / invisible. Todo: either
    // add to this sprite to change appearance while active, or add new erupting layer
    const isErupting = false
    if (isErupting) {
      return 60
    } else {
      return 35
    }
  }
}
