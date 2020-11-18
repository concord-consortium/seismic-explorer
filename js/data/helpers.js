// If tile data reached provided limited, it means that some earthquakes below magnitude X were not downloaded.
// We should collect all the X values and display only earthquakes that have magnitude larger than the biggest X value
// to make sure that earthquakes are displayed in a nice, contiguous way (otherwise user might see some "holes"
// in earthquakes data in some regions where tiles contain lots of data, e.g. in California).
// See: https://www.pivotaltracker.com/story/show/130918575
function getMagnitudeCutoff (response, limit) {
  if (response.features.length === limit) {
    return response.features[limit - 1].properties.mag
  } else return 0
}

// Processes JSON returned by API (USGS or our own) and returns only necessary data.
// We save some memory and also it documents (and tests) which properties are necessary.
export function processAPIResponse (response, limit, enforcedMinMagnitude) {
  const magnitudeCutOff = Math.max(getMagnitudeCutoff(response, limit), enforcedMinMagnitude)
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
  return {
    // Sort data by time.
    earthquakes: earthquakes.sort((a, b) => a.properties.time - b.properties.time),
    magnitudeCutOff: magnitudeCutOff
  }
}
// Processes JSON returned by API (USGS or our own) and returns only necessary data.
// We save some memory and also it documents (and tests) which properties are necessary.
export function processEruptionAPIResponse (response, limit) {
  const eruptions = response.features.map(eruption => {
    const coords = eruption.geometry.coordinates
    const props = eruption.properties
    return {
      id: props.eruptionnumber,
      geometry: {
        // Swap lat and lng!
        // We expect lat first, then lng. USGS / GeoJSON format is the opposite.
        coordinates: [coords[1], coords[0], coords[2] ? coords[2] : -10]
      },
      properties: {
        eruptionnumber: props.eruptionnumber,
        volcanonumber: props.volcanonumber,
        volcanoname: props.volcanoname,
        activitytype: props.activitytype,
        explosivityindexmax: props.explosivityindexmax,
        majorrocktype: props.majorrocktype,
        latitude: props.latitude,
        longitude: props.longitude,
        startdate: props.startdate,
        startdateyear: props.startdateyear,
        enddate: props.enddate,
        active: props.active
      }
    }
  })
  return {
    eruptions
    // Sort data by time.
    //eruptions: eruptions.sort((a, b) => a.properties.startdate - b.properties.startdate)
  }
}

// Takes array of data objects (returned by processAPIResponse) and merges it into single one.
export function concatenateData (array) {
  // A bit overspoken, but this function is called quite often and it can take some time. Try to
  // concatenate data in CPU and memory-efficient way.
  let dataLength = 0
  let magCutOff = 0
  array.forEach(data => {
    dataLength += data.earthquakes.length
    magCutOff = Math.max(magCutOff, data.magnitudeCutOff)
  })
  const result = {
    earthquakes: new Array(dataLength),
    magnitudeCutOff: magCutOff
  }
  let idx = 0
  array.forEach(data => {
    for (let i = 0, len = data.earthquakes.length; i < len; i++) {
      result.earthquakes[idx++] = data.earthquakes[i]
    }
  })
  return result
}

export function concatenateEruptionData (array) {
  // A bit overspoken, but this function is called quite often and it can take some time. Try to
  // concatenate data in CPU and memory-efficient way.
  let dataLength = 0
  array.forEach(data => {
    dataLength += data.eruptions.length
  })
  const result = {
    eruptions: new Array(dataLength)
  }
  let idx = 0
  array.forEach(data => {
    for (let i = 0, len = data.eruptions.length; i < len; i++) {
      result.eruptions[idx++] = data.eruptions[i]
    }
  })
  return result
}


export function copyAndShiftLng (data, offset) {
  const newEarthquakes = data.earthquakes.map(eq => {
    const coords = eq.geometry.coordinates
    return Object.assign({}, eq, {
      geometry: {
        coordinates: [coords[0], coords[1] + offset, coords[2]]
      }
    })
  })
  return Object.assign({}, data, {
    earthquakes: newEarthquakes
  })
}


export function copyAndShiftEruptionLng (data, offset) {
  const newEruptions = data.eruptions.map(eruption => {
    const coords = eruption.geometry.coordinates
    return Object.assign({}, eruption, {
      geometry: {
        coordinates: [coords[0], coords[1] + offset, coords[2]]
      }
    })
  })
  return Object.assign({}, data, {
    eruptions: newEruptions
  })
}