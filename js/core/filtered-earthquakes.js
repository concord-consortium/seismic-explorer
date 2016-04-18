import crossSectionRectangle from './cross-section-rectangle'

let cachedValue = null
let props = {}

function propsChanged(data, filters, crossSection) {
  // Note that we're dealing with immutable structures. Shallow comparison is enough.
  // We need to recalculate filtered earthquakes when:
  // 1. Data has been changed
  // 2. Filters has been changed
  // 3. Cross section line has been changed, but only if cross section filtering is enabled.
  return props.data !== data ||
    props.filters !== filters ||
    filters.get('crossSection') && props.crossSection !== crossSection
}

function pointInsidePolygon(point, polygon) {
  // Ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  const x = point[0]
  const y = point[1]
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function calcEarthquakes(data, filters, crossSectionPoints) {
  const minMag = filters.get('minMag')
  const maxMag = filters.get('maxMag')
  const minTime = filters.get('minTime')
  const maxTime = filters.get('maxTime')
  const crossSection = filters.get('crossSection')
  let polygonFilter = null
  if (crossSection) {
    const p1 = crossSectionPoints.get(0)
    const p2 = crossSectionPoints.get(1)
    if (p1 && p2) {
      polygonFilter = crossSectionRectangle(p1, p2)
    }
  }
  // Two important notes:
  // - Make sure that result is always a new Array instance, so pure components can detect it's been changed.
  // - Yes, I don't copy and do mutate data.features elements. It's been done due to performance reasons.
  const result = []
  for (let i = 0, len = data.length; i < len; i++) {
    const eq = data[i]
    const eqProps = eq.properties
    eq.visible = eqProps.mag > minMag &&
      eqProps.mag < maxMag &&
      eqProps.time > minTime &&
      eqProps.time < maxTime
    if (eq.visible && polygonFilter) {
      // This is not perfectly precise. We should project coordinates first, but in practice the difference
      // is unnoticeable and we can skip some expensive calculations.
      eq.visible = pointInsidePolygon(eq.geometry.coordinates, polygonFilter)
    }
    result.push(eq)
  }
  return result
}

// Accepts state and returns filtered earthquakes. Since this function might be expensive due to number of
// earthquakes that we need to deal with, the result is cached. There are two important assumptions:
// 1. State contains immutable structures.
// 2. If we call this function two times with the same data, it will return the same (cached) array object.
// The second point ensures that pure components won't re-render themselves unnecessary if data isn't changed.
export default function filteredEarthquakes(state) {
  const data = state.get('data')
  const filters = state.get('filters')
  const crossSection = state.get('crossSectionPoints')
  if (cachedValue === null || propsChanged(data, filters, crossSection)) {
    props = { data, filters, crossSection }
    cachedValue = calcEarthquakes(data, filters, crossSection)
  }
  return cachedValue
}
