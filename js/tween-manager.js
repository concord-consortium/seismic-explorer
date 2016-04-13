import TWEEN from 'tween.js'

export default class TweenManager {
  constructor() {
    this.tweens = []
  }

  update(timestamp = performance.now()) {
    TWEEN.update(timestamp)
  }

  add(tween) {
    this.tweens.push(tween)
    return tween
  }

  stopAll() {
    this.tweens.forEach(t => t.stop())
    this.tweens = []
  }
}
