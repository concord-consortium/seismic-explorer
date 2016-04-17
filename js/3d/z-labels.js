import THREE from 'three'

const TICKS = 4
const TEXTURE_ASPECT_RATIO = 0.125

export default class ZLabels {
  constructor(maxDepth) {
    this.root = new THREE.Object3D()
    this.textures = []
    this.materials = []
    this.sprites = []
    const step = maxDepth / TICKS
    for (let i = 0; i <= TICKS; i++) {
      const value = (i * step).toFixed(0)
      const texture = getLabelTexture(value + 'km')
      const material = new THREE.SpriteMaterial({map: texture})
      const sprite = new THREE.Sprite(material)
      this.textures.push(texture)
      this.materials.push(material)
      this.sprites.push(sprite)
      this.root.add(sprite)
    }
  }

  setProps(height) {
    const positionStep = height / TICKS
    const size = height / 35
    this.sprites.forEach((sprite, index) => {
      sprite.position.z = index * positionStep
      sprite.scale.set(size / TEXTURE_ASPECT_RATIO, size, 1)
    })
  }

  destroy() {
    this.textures.forEach(m => m.dispose())
    this.materials.forEach(m => m.dispose())
  }
}

function getLabelTexture(label) {
  const width = 256
  const height = TEXTURE_ASPECT_RATIO * width
  const shadowBlur = height / 4
  const tickMarkWidth = width / 35
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = shadowBlur
  ctx.fillStyle = ctx.strokeStyle = '#fff'
  // Tick
  ctx.lineWidth = height / 6
  ctx.beginPath()
  ctx.moveTo(width / 2 - tickMarkWidth, height / 2)
  ctx.lineTo(width / 2 + tickMarkWidth, height / 2)
  ctx.stroke()
  // Label
  ctx.font = `${height * 0.7}px verdana, helvetica, sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(label + ' ', width / 2 - tickMarkWidth, height / 2)
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
