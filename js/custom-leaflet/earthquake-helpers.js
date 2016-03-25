import PIXI from 'pixi.js'

const TEXTURE_RESOLUTION = 12
const textureCache = {}

export function earthquakeTexture(depth) {
  const color = depthToColor(depth)
  if (!textureCache[color]) {
    const g = new PIXI.Graphics()
    g.lineStyle(0.2, 0x000000, 0.2)
    g.beginFill(color, 0.8)
    g.drawCircle(1, 1, 1)
    g.endFill()
    textureCache[color] = g.generateTexture(null, TEXTURE_RESOLUTION)
  }
  return textureCache[color]
}

export function earthquakeSprite(depth, magnitude) {
  const eqSprite = new PIXI.Sprite(earthquakeTexture(depth))
  eqSprite.anchor.x = eqSprite.anchor.y = 0.5
  eqSprite.scale.x = eqSprite.scale.y = magnitudeToRadius(magnitude) / TEXTURE_RESOLUTION
  return eqSprite
}

export function depthToColor(depth) {
  const depthRange = Math.floor(depth / 100)
  switch(depthRange) {
    case 0: // 0 - 100
      return 0xFF0A00
    case 1: // 100 - 200
      return 0xFF7A00
    case 2: // 200 - 300
      return 0xFFF700
    case 3: // 300 - 400
      return 0x56AB00
    case 4: // 400 - 500
      return 0x00603F
    default: // > 500
      return 0x0021BC
  }
}

export function magnitudeToRadius(magnitude) {
  return 0.9 * Math.pow(1.5, (magnitude - 1))
}
