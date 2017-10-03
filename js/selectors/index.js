import { createSelector } from 'reselect'
import crossSectionRectangle from '../core/cross-section-rectangle'
import pointInsidePolygon from '../core/point-inside-polygon'
import volcanoesData from '../data/volcanoes'

function getCrossSectionFilter (crossSectionPoints) {
  if (!crossSectionPoints) return () => true
  const p1 = crossSectionPoints.get(0)
  const p2 = crossSectionPoints.get(1)
  // When cross section mode is enabled, return a function that checks
  // if given point is within cross section rectangle.
  return pointInsidePolygon.bind(null, crossSectionRectangle(p1, p2))
}

// Basic map area and data coordinates are assumed to be between -180 and 180 lng.
// This function will return an array of multipliers that can be used to calculate shifted coordinates.
// E.g.:
// -180, 180 => [ 0 ]
// -200, 180 => [ -1, 0 ]
// -100, 250 => [ 0, 1 ]
// 600, 1000 => [ 2, 3 ]
function getMapAreaMultipliers (minLng, maxLng) {
  minLng += 180
  maxLng += 180
  const result = []
  for (let i = Math.floor(minLng / 360); i < Math.ceil(maxLng / 360); i += 1) {
    result.push(i)
  }
  return result
}

// Inputs

const earthquakesEnabled = state => state.get('layers').get('earthquakes')
const volcanoesLayerEnabled = state => state.get('layers').get('volcanoes')
const earthquakesData = state => state.get('data').get('earthquakes')
const filters = state => state.get('filters')
// It will limit recalculation when user is just drawing cross section points in 2d mode.
const crossSectionPoints = state => state.get('filters').get('crossSection') && state.get('crossSectionPoints')
const mapRegion = state => state.get('mapRegion').get('region')

// Earthquakes

export const getVisibleEarthquakes = createSelector(
  [ earthquakesEnabled, earthquakesData, filters, crossSectionPoints ],
  (earthquakesEnabled, earthquakesData, filters, crossSectionPoints) => {
    if (!earthquakesEnabled) {
      return []
    }
    const minMag = filters.get('minMag')
    const maxMag = filters.get('maxMag')
    const minTime = filters.get('minTime')
    const maxTime = filters.get('maxTime')
    const crossSectionFilter = getCrossSectionFilter(crossSectionPoints)
    // Two important notes:
    // - Make sure that result is always a new Array instance, so pure components can detect it's been changed.
    // - Yes, I don't copy and do mutate data.features elements. It's been done due to performance reasons.
    const result = []
    for (let i = 0, len = earthquakesData.length; i < len; i++) {
      const eq = earthquakesData[i]
      const props = eq.properties
      eq.visible = props.mag > minMag &&
        props.mag < maxMag &&
        props.time > minTime &&
        props.time < maxTime &&
        crossSectionFilter(eq.geometry.coordinates)
      result.push(eq)
    }
    return result
  }
)

// Volcanoes

export const getVisibleVolcanoes = createSelector(
  [ volcanoesLayerEnabled, crossSectionPoints, mapRegion ],
  (volcanoesLayerEnabled, crossSectionPoints, mapRegion) => {
    if (!volcanoesLayerEnabled) {
      return []
    }
    const crossSectionFilter = getCrossSectionFilter(crossSectionPoints)

    // Map region doesn't have very descriptive structure. It's an array of four points.
    const minLng = mapRegion[0][1] // south west lng
    const maxLng = mapRegion[3][1] // south east lng
    const mapAreaMultipliers = getMapAreaMultipliers(minLng, maxLng)

    const result = []
    // Two important notes:
    // - Make sure that result is always a new Array instance, so pure components can detect it's been changed.
    // - Yes, I don't copy and do mutate elements. It's been done due to performance reasons.
    mapAreaMultipliers.forEach(multiplier => {
      volcanoesData.forEach(v => {
        const shiftedLng = v.geometry.coordinates[1] + multiplier * 360
        if (shiftedLng < minLng || shiftedLng > maxLng) return
        const lat = v.geometry.coordinates[0]
        const depth = v.geometry.coordinates[2]
        const volcCopy = Object.assign({}, v)
        volcCopy.geometry = { coordinates: [ lat, shiftedLng, depth ] }
        // When cross section mode is disabled, this filter returns true.
        volcCopy.visible = crossSectionFilter(volcCopy.geometry.coordinates)
        result.push(volcCopy)
      })
    })
    return result
  }
)
