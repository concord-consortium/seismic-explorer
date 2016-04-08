export function swapCoords(data) {
  data.forEach(point => {
    const tmp = point.geometry.coordinates[0]
    point.geometry.coordinates[0] = point.geometry.coordinates[1]
    point.geometry.coordinates[1] = tmp
  })
  return data
}

export function sortByTime(data) {
  return data.sort((a, b) => a.properties.time - b.properties.time)
}

export function polygonToPoint(data) {
  data.forEach(polygon => {
    if (polygon.geometry.type === 'Point') return
    const coords = polygon.geometry.coordinates[0]
    let avgLat = 0
    let avgLong = 0
    coords.forEach(c => {
      avgLong += c[0]
      avgLat += c[1]
    })
    polygon.geometry.coordinates[0] = avgLat / coords.length
    polygon.geometry.coordinates[1] = avgLong / coords.length
    polygon.geometry.type = 'Point'
  })
  return data
}

export function timeRange(data) {
  let min = Infinity
  let max = -Infinity
  data.forEach(eq => {
    if (eq.properties.time > max) max = eq.properties.time
    if (eq.properties.time < min) min = eq.properties.time
  })
  return {min, max}
}
