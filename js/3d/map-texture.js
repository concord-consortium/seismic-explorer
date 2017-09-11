import THREE from 'three'
import { tileUrl } from '../map-layer-tiles'
import { tilesListByRow, lat2tilePos, lng2tilePos, tileBoundingBox, tileYOutOfBounds } from '../map-tile-helpers'

const TILE_SIZE = 256 // px
const MAX_TEXTURE_SIZE = 2048 // px

// Tiles can have negative X values or values bigger than allowed.
// If so, limit it to the allowed range.
function wrapTile (tile) {
  const range = Math.pow(2, tile.zoom)
  if (tile.x >= 0 && tile.x < range) {
    return tile
  }
  return {
    x: tile.x > 0 ? (tile.x % range) : (tile.x % range + range) % range,
    y: tile.y,
    zoom: tile.zoom
  }
}

function textureDimensions (rectangle, zoom) {
  const tiles = tilesListByRow(rectangle, zoom)
  return { width: tiles[0].length * TILE_SIZE, height: tiles.length * TILE_SIZE }
}

// Returns zoom level that will generate biggest available texture within MAX_TEXTURE_SIZE x MAX_TEXTURE_SIZE limit.
function optimalZoomLevel (rectangle) {
  let zoom = -1
  let dim = {width: 0, height: 0}
  while (dim.width < MAX_TEXTURE_SIZE && dim.height < MAX_TEXTURE_SIZE) {
    zoom += 1
    dim = textureDimensions(rectangle, zoom + 1)
  }
  return zoom
}

function tilesToTexture (tiles, layerType) {
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
      const tile = wrapTile(rawTile)
      if (tileYOutOfBounds(tile)) {
        // It might happen if rectangle point is outside the map area.
        ctx.fillStyle = 'rgba(0,0,0,0)'
        ctx.fillRect(tileIdx * TILE_SIZE * sx, rowIdx * TILE_SIZE * sy, TILE_SIZE * sx, TILE_SIZE * sy)
        texture.needsUpdate = true
        return
      }
      const url = tileUrl(layerType, tile.zoom, tile.x, tile.y)
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

function tileTexture (rectangle, zoom, layerType) {
  const tiles = tilesListByRow(rectangle, zoom)
  return tilesToTexture(tiles, layerType)
}

function textureUVs (rectangle, zoom) {
  const tileBBox = tileBoundingBox(rectangle, zoom)
  const width = tileBBox.right - tileBBox.left + 1
  const height = tileBBox.bottom - tileBBox.top + 1
  return rectangle.map(point => {
    const x = (lng2tilePos(point[1], zoom) - tileBBox.left) / width
    const y = 1 - (lat2tilePos(point[0], zoom) - tileBBox.top) / height
    return new THREE.Vector2(x, y)
  })
}

export default function mapTexture (rectangle, layerType) {
  const zoom = optimalZoomLevel(rectangle)
  return {
    texture: tileTexture(rectangle, zoom, layerType),
    uvs: textureUVs(rectangle, zoom)
  }
}
