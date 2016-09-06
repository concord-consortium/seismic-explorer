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
