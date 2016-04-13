import TWEEN from 'tween.js'

export default class TweenManager {
  constructor() {
    this.tweens = []
  }

  update(timestamp = performance.now()) {
    TWEEN.update(timestamp)
  }

  add(tween) {
    tween.onComplete(() => {
      const idx = this.tweens.indexOf(tween)
      this.tweens.splice(idx, 1)
    })
    this.tweens.push(tween)
    return tween
  }

  stopAll() {
    this.tweens.forEach(t => t.stop())
    this.tweens = []
  }

  get animationInProgress() {
    return this.tweens.length > 0
  }
}
