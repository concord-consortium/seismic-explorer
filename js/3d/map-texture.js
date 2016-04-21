import THREE from 'three'
import { tileUrl } from '../map-layer-tiles'

const TILE_SIZE = 256 // px
const MAX_TEXTURE_SIZE = 2048 // px

// Functions based on:
// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
function lng2tilePos(lng, zoom) {
  return (lng + 180) / 360 * Math.pow(2, zoom)
}

function lat2tilePos(lat, zoom) {
  return (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
}

function lng2tile(lng, zoom) {
  return Math.floor(lng2tilePos(lng, zoom))
}

function lat2tile(lat, zoom) {
  return Math.floor(lat2tilePos(lat, zoom))
}

function boundingBox(rectangle) {
  return {
    north: Math.max(...rectangle.map(p => p[0])),
    south: Math.min(...rectangle.map(p => p[0])),
    west: Math.min(...rectangle.map(p => p[1])),
    east: Math.max(...rectangle.map(p => p[1]))
  }
}

function tileBoundingBox(rectangle, zoom) {
  const bBox = boundingBox(rectangle)
  return {
    top: lat2tile(bBox.north, zoom),
    bottom: lat2tile(bBox.south, zoom),
    left: lng2tile(bBox.west, zoom),
    right: lng2tile(bBox.east, zoom)
  }
}

function tilesList(rectangle, zoom) {
  const tileBBox = tileBoundingBox(rectangle, zoom)
  const tiles = []
  for (let y = tileBBox.top; y <= tileBBox.bottom; y++) {
    const row = []
    tiles.push(row)
    for (let x = tileBBox.left; x <= tileBBox.right; x++) {
      row.push({x, y})
    }
  }
  return tiles
}

function tileInvalid(tile, zoom) {
  const maxVal = Math.pow(2, zoom) - 1
  return tile.y < 0 || tile.y > maxVal
}

// Tiles can have negative X values or values bigger than allowed.
// If so, limit it to the allowed range.
function wrapTile(tile, zoom) {
  const range = Math.pow(2, zoom)
  if (tile.x >= 0 && tile.x < range) {
    return tile
  }
  return {
    x: tile.x > 0 ? (tile.x % range) : (tile.x % range + range) % range,
    y: tile.y
  }
}

function textureDimensions(rectangle, zoom) {
  const tiles = tilesList(rectangle, zoom)
  return { width: tiles[0].length * TILE_SIZE, height: tiles.length * TILE_SIZE }
}

// Returns zoom level that will generate biggest available texture within MAX_TEXTURE_SIZE x MAX_TEXTURE_SIZE limit.
function optimalZoomLevel(rectangle) {
  let zoom = -1
  let dim = {width: 0, height: 0}
  while (dim.width < MAX_TEXTURE_SIZE && dim.height < MAX_TEXTURE_SIZE) {
    zoom += 1
    dim = textureDimensions(rectangle, zoom + 1)
  }
  return zoom
}

function tilesToTexture(tiles, zoom, layerType) {
  const rows = tiles.length
  const cols = tiles[0].length
  const height = rows * TILE_SIZE
  const width = cols * TILE_SIZE
  const sy = THREE.Math.isPowerOfTwo(height) ? 1 : THREE.Math.nearestPowerOfTwo(height) / height
  const sx = THREE.Math.isPowerOfTwo(width) ? 1 : THREE.Math.nearestPowerOfTwo(width) / width
  const canvas = document.createElement('canvas')
  canvas.height = Math.round(height * sy)
  canvas.width = Math.round(width * sx)
  const ctx = canvas.getContext('2d')
  const texture = new THREE.Texture(canvas)
  tiles.forEach((row, rowIdx) => {
    row.forEach((rawTile, tileIdx) => {
      const tile = wrapTile(rawTile, zoom)
      if (tileInvalid(tile, zoom)) {
        // It might happen if rectangle point is outside the map area.
        ctx.fillStyle = 'rgba(0,0,0,0)'
        ctx.fillRect(tileIdx * TILE_SIZE * sx, rowIdx * TILE_SIZE * sy, TILE_SIZE * sx, TILE_SIZE * sy)
        texture.needsUpdate = true
        return
      }
      const url = tileUrl(layerType, zoom, tile.x, tile.y)
      const img = document.createElement('img')
      img.crossOrigin = ''
      img.onload = () => {
        ctx.drawImage(img, tileIdx * TILE_SIZE * sx, rowIdx * TILE_SIZE * sy, TILE_SIZE * sx, TILE_SIZE * sy)
        texture.needsUpdate = true
      }
      img.src = url
    })
  })
  return texture
}

function tileTexture(rectangle, zoom, layerType) {
  const tiles = tilesList(rectangle, zoom)
  return tilesToTexture(tiles, zoom, layerType)
}

function textureUVs(rectangle, zoom) {
  const tileBBox = tileBoundingBox(rectangle, zoom)
  const width = tileBBox.right - tileBBox.left + 1
  const height = tileBBox.bottom - tileBBox.top + 1
  return rectangle.map(point => {
    const x = (lng2tilePos(point[1], zoom) - tileBBox.left) / width
    const y = 1 - (lat2tilePos(point[0], zoom) - tileBBox.top) / height
    return new THREE.Vector2(x, y)
  })
}

export default function mapTexture(rectangle, layerType) {
  const zoom = optimalZoomLevel(rectangle)
  return {
    texture: tileTexture(rectangle, zoom, layerType),
    uvs: textureUVs(rectangle, zoom)
  }
}
