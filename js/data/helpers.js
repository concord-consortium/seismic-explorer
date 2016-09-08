// Processes USGS JSON and returns only necessary data. We save some memory
// and also it documents (and tests) which properties are necessary.
export function limitData(data) {
  return data.map(eq => {
    return {
      id: eq.id,
      geometry: {
        coordinates: eq.geometry.coordinates // array of 3 floats
      },
      properties: {
        mag: eq.properties.mag,
        place: eq.properties.place,
        time: eq.properties.time
      }
    }
  })
}

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
