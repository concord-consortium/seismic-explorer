// Processes USGS JSON and returns only necessary data. We save some memory
// and also it documents (and tests) which properties are necessary.
export function processUSGSGeoJSON(response) {
  const earthquakes = response.features.map(eq => {
    const coords = eq.geometry.coordinates
    const props = eq.properties
    return {
      id: eq.id,
      geometry: {
        // Swap lat and lng!
        // We expect lat first, then lng. USGS / GeoJSON format is the opposite.
        coordinates: [coords[1], coords[0], coords[2]]
      },
      properties: {
        mag: props.mag,
        place: props.place,
        time: props.time
      }
    }
  })
  // Sort data by time and return.
  return earthquakes.sort((a, b) => a.properties.time - b.properties.time)
}

export function copyAndShiftLng(data, offset) {
  return data.map(eq => {
    const coords = eq.geometry.coordinates
    return Object.assign({}, eq, {
      geometry: {
        coordinates: [coords[0], coords[1] + offset, coords[2]]
      }
    })
  })
}