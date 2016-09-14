const CACHE_MAX_SIZE = 50 // tiles stored locally
export default class Cache {
  constructor() {
    this.data = new Map()
  }

  key(tile) {
    return `${tile.zoom}-${tile.x}-${tile.y}`
  }

  get(tile) {
    return this.data.get(this.key(tile))
  }

  set(tile, json) {
    this.data.set(this.key(tile), json)
    this._limitDataSize()
    return json
  }

  has(tile) {
    return this.data.has(this.key(tile))
  }

  _limitDataSize() {
    for (const key of this.data.keys()) {
      if (this.data.size < CACHE_MAX_SIZE) return
      this.data.delete(key)
    }
  }
}
