import { createSelector } from 'reselect'
import crossSectionRectangle from '../core/cross-section-rectangle'
import pointInsidePolygon from '../core/point-inside-polygon'
import mapAreaMultipliers from '../core/map-area-multipliers'
import volcanoesData from '../data/volcanoes'

function getCrossSectionFilter (crossSectionPoints) {
  if (!crossSectionPoints) return () => true
  const p1 = crossSectionPoints.get(0)
  const p2 = crossSectionPoints.get(1)
  // When cross section mode is enabled, return a function that checks
  // if given point is within cross section rectangle.
  return pointInsidePolygon.bind(null, crossSectionRectangle(p1, p2))
}

// Inputs

const earthquakesEnabled = state => state.get('layers').get('earthquakes')
const volcanoesLayerEnabled = state => state.get('layers').get('volcanoes')
const earthquakesData = state => state.get('data').get('earthquakes')
const filters = state => state.get('filters')
// It will limit recalculation when user is just drawing cross section points in 2d mode.
const crossSectionPoints = state => state.get('filters').get('crossSection') && state.get('crossSectionPoints')
const mapRegion = state => state.get('mapStatus').get('region')

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
    const mapMultipliers = mapAreaMultipliers(mapRegion.minLng, mapRegion.maxLng)
    const result = []
    // Two important notes:
    // - Make sure that result is always a new Array instance, so pure components can detect it's been changed.
    // - Yes, I don't copy and do mutate elements. It's been done due to performance reasons.
    mapMultipliers.forEach(multiplier => {
      volcanoesData.forEach(v => {
        const shiftedLng = v.geometry.coordinates[1] + multiplier * 360
        if (shiftedLng < mapRegion.minLng || shiftedLng > mapRegion.maxLng) return
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
