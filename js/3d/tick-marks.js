import * as THREE from 'three'

export default class TickMarks {
  constructor () {
    this.root = new THREE.Object3D()
    this.textures = []
    this.materials = []
    this.sprites = []
  }

  setProps (props) {
    this.destroy()
    this.root.position.copy(props.origin)
    this._generateTicks(props.depthVector, props.format, props.labelSize, props.depthTicks, 'depth')
    this._generateTicks(props.lengthVector, props.format, props.labelSize, props.lengthTicks, 'length')
    this._generateTicks(props.widthVector, props.format, props.labelSize, props.widthTicks, 'width')
  }

  destroy () {
    this.textures.forEach(m => m.dispose())
    this.materials.forEach(m => m.dispose())
    this.sprites.forEach(s => this.root.remove(s))
    this.textures = []
    this.materials = []
    this.sprites = []
  }

  _generateTicks (depthVector, format, labelSize, ticksCount, type) {
    const positionStep = 1 / ticksCount
    // Draw central tick only once.
    const startTick = type === 'depth' ? 0 : 1
    for (let i = startTick; i <= ticksCount; i++) {
      const position = new THREE.Vector3(0, 0, 0).lerp(depthVector, i * positionStep)
      const texture = labelTexture(format(position.length(), type), type)
      const aspectRatio = texture.image.width / texture.image.height
      const material = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(material)
      sprite.position.copy(position)
      sprite.scale.copy(labelScale(labelSize, aspectRatio, type))
      this.textures.push(texture)
      this.materials.push(material)
      this.sprites.push(sprite)
      this.root.add(sprite)
    }
  }
}

function labelTexture (label, type) {
  switch (type) {
    case 'depth':
      return depthTexture(label)
    case 'length':
    case 'width':
      return lengthWidthTexture(label)
  }
}

function labelScale (size, aspectRatio, type) {
  switch (type) {
    case 'depth':
      return new THREE.Vector3(size * aspectRatio, size, 1)
    case 'length':
    case 'width':
      size *= 2
      return new THREE.Vector3(size * aspectRatio, size, 1)
  }
}

function depthTexture (label) {
  const width = 256
  const height = 32
  const shadowBlur = height / 4
  const tickMarkWidth = height / 7
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = shadowBlur
  ctx.fillStyle = ctx.strokeStyle = '#fff'
  // Label
  ctx.font = font(height * 0.7)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(label + ' ', width / 2 - tickMarkWidth, height / 2)
  // Tick
  ctx.lineWidth = height / 6
  ctx.beginPath()
  ctx.moveTo(width / 2 - tickMarkWidth, height / 2)
  ctx.lineTo(width / 2 + tickMarkWidth, height / 2)
  ctx.stroke()
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}

function lengthWidthTexture (label) {
  const width = 256
  const height = 64
  const shadowBlur = height / 4
  const tickMarHeight = height / 14
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur = shadowBlur
  ctx.fillStyle = ctx.strokeStyle = '#fff'
  // Tick
  ctx.lineWidth = height / 12
  ctx.beginPath()
  ctx.moveTo(width / 2, height / 2 - tickMarHeight)
  ctx.lineTo(width / 2, height / 2 + tickMarHeight)
  ctx.stroke()
  // Label
  ctx.font = font(height * 0.35)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, width / 2, height / 4)
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}

function font (size) {
  return `${size}px verdana, helvetica, sans-serif`
}
