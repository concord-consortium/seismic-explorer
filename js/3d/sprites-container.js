import * as THREE from 'three'
import vertexShader from './sprite-vertex.glsl'
import fragmentShader from './sprite-fragment.glsl'

export default class SpritesContainer {
  constructor (SpriteClass, maxCount) {
    this.SpriteClass = SpriteClass
    this.maxCount = maxCount

    // Texture defines base shape.
    this.texture = SpriteClass.getTexture()

    const positions = new Float32Array(this.maxCount * 3)
    const colors = new Float32Array(this.maxCount * 3)
    const sizes = new Float32Array(this.maxCount)

    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { type: 'c', value: new THREE.Color(0xffffff) },
        texture: { type: 't', value: this.texture }
      },
      vertexShader,
      fragmentShader,
      alphaTest: 0.5
    })

    this.root = new THREE.Points(geometry, material)
    // Fixes this issue:
    // https://stackoverflow.com/questions/32855271/three-js-buffergeometry-disappears-after-moving-camera-to-close
    // Another option would be to call this.root.geometry.computeBoundingSphere() each time we process new data, but it
    // doesn't make much sense - sprites are always visible in practice.
    this.root.frustumCulled = false

    this._renderedSprites = []
  }

  destroy () {
    this.root.geometry.dispose()
    this.root.material.dispose()
    this.texture.dispose()
  }

  setProps (data, latLngDepthToSprite) {
    this._dataToProcess = data
    this._latLngDepthToSprite = latLngDepthToSprite
  }

  spriteAt (x, y) {
    for (let i = this._renderedSprites.length - 1; i >= 0; i--) {
      if (this._renderedSprites[i].hitTest(x, y)) return this._renderedSprites[i].data
    }
    return null
  }

  update (progress) {
    let transitionInProgress = false
    this._processNewData()
    for (let i = 0, length = this._renderedSprites.length; i < length; i++) {
      const sprite = this._renderedSprites[i]
      sprite.transitionStep(progress)
      if (sprite.transitionInProgress) transitionInProgress = true
    }
    return transitionInProgress
  }

  invalidatePositions (latLngDepthToSprite) {
    this._latLngDepthToSprite = latLngDepthToSprite
    for (let i = 0, len = this._renderedSprites.length; i < len; i++) {
      const sprite = this._latLngDepthToSprite(this._currentData[i].geometry.coordinates)
      this._renderedSprites[i].setPositionAttr(sprite)
    }
  }

  _processNewData () {
    if (!this._dataToProcess) return
    let data = this._dataToProcess
    if (data.length > this.maxCount) {
      console.warn('Too many sprites! Some sprites will not be displayed.')
      data = data.splice(0, this.maxCount)
    }
    const attributes = this.root.geometry.attributes
    for (let i = 0, length = data.length; i < length; i++) {
      const spriteData = data[i]
      if (!this._renderedSprites[i] || this._renderedSprites[i].id !== spriteData.id) {
        this._renderedSprites[i] = new this.SpriteClass(spriteData, i, attributes)
        const pos = this._latLngDepthToSprite(spriteData.geometry.coordinates)
        this._renderedSprites[i].setPositionAttr(pos)
      }
      const renderedSprite = this._renderedSprites[i]
      // Color can change due to change in data (e.g. eruption can become active).
      const newColor = renderedSprite.getColor(spriteData)
      if (renderedSprite.color !== newColor) {
        renderedSprite.color = newColor
        renderedSprite.setColorAttr(newColor)
      }
      renderedSprite.targetVisibility = spriteData.visible ? 1 : 0
    }
    // Reset old data.
    for (let i = data.length, length = this._renderedSprites.length; i < length; i++) {
      this._renderedSprites[i].destroy()
    }
    this._renderedSprites.length = data.length

    this._currentData = data
    this._dataToProcess = null
  }
}
