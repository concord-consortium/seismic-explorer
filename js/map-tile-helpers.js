// Functions based on:
// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
export function lng2tilePos(lng, zoom) {
  return (lng + 180) / 360 * Math.pow(2, zoom)
}

export function lat2tilePos(lat, zoom) {
  return (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
}

export function lng2tile(lng, zoom) {
  return Math.floor(lng2tilePos(lng, zoom))
}

export function lat2tile(lat, zoom) {
  return Math.floor(lat2tilePos(lat, zoom))
}

export function tile2lng(x, zoom) {
  return (x / Math.pow(2, zoom) * 360 - 180)
}
export function tile2lat(y, zoom) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom)
  return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))))
}
export function tileInvalid(tile) {
  const maxVal = Math.pow(2, tile.zoom) - 1
  return tile.y < 0 || tile.y > maxVal
}
export function tileOutOfBounds(tile) {
  const maxVal = Math.pow(2, tile.zoom) - 1
  return tile.x < 0 || tile.x > maxVal
}

export function tileBoundingBox(rectangle, zoom) {
  const bBox = boundingBox(rectangle)
  return {
    top: lat2tile(bBox.north, zoom),
    bottom: lat2tile(bBox.south, zoom),
    left: lng2tile(bBox.west, zoom),
    right: lng2tile(bBox.east, zoom)
  }
}

// rectangle is an array of four points (point is a [lat, lng] array)
export function tilesListByRow(rectangle, zoom) {
  const tileBBox = tileBoundingBox(rectangle, zoom)
  const tiles = []
  for (let y = tileBBox.top; y <= tileBBox.bottom; y++) {
    const row = []
    tiles.push(row)
    for (let x = tileBBox.left; x <= tileBBox.right; x++) {
      row.push({x, y, zoom})
    }
  }
  return tiles
}

// rectangle is an array of four points (point is a [lat, lng] array)
export function tilesList(rectangle, zoom) {
  // Flatten array of arrays, so we return all the tiles in one array.
  return [].concat.apply([], tilesListByRow(rectangle, zoom));
}

function boundingBox(rectangle) {
  return {
    north: Math.max(...rectangle.map(p => p[0])),
    south: Math.min(...rectangle.map(p => p[0])),
    west: Math.min(...rectangle.map(p => p[1])),
    east: Math.max(...rectangle.map(p => p[1]))
  }
}
