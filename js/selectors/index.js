import { createSelector } from 'reselect'
import crossSectionRectangle from '../core/cross-section-rectangle'
import pointInsidePolygon from '../core/point-inside-polygon'

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
const eruptionsEnabled = state => state.get('layers').get('eruptions')
const earthquakesData = state => state.get('data').get('earthquakes')
const eruptionsData = state => state.get('data').get('eruptions')
const volcanoesData = state => state.get('data').get('volcanoes')
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
  [ volcanoesLayerEnabled, volcanoesData, filters, crossSectionPoints, mapRegion ],
  (volcanoesLayerEnabled, volcanoesData, filters, crossSectionPoints, mapRegion) => {
    if (!volcanoesLayerEnabled) {
      return []
    }
    const crossSectionFilter = getCrossSectionFilter(crossSectionPoints)
    const minTime = filters.get('minTime')
    const minYear = new Date(minTime).getUTCFullYear()
    const result = []

    if (volcanoesData.length > 0) {
      for (let i = 0, len = volcanoesData.length; i < len; i++) {
        const volcano = volcanoesData[i]
        if (volcano && volcano.properties) {
          volcano.visible = parseInt(volcano.properties.lasteruptionyear) <= minYear &&
            crossSectionFilter(volcano.geometry.coordinates)
          result.push(volcano)
        }
      }
    }
    return result
  }
)

// Eruptions

export const getVisibleEruptions = createSelector(
  [eruptionsEnabled, eruptionsData, filters, crossSectionPoints],
  (eruptionsEnabled, eruptionsData, filters, crossSectionPoints) => {
    if (!eruptionsEnabled) {
      return []
    }
    const minTime = filters.get('minTime')
    const maxTime = filters.get('maxTime')
    const crossSectionFilter = getCrossSectionFilter(crossSectionPoints)
    const result = []
    if (eruptionsData.length > 0) {
      for (let i = 0, len = eruptionsData.length; i < len; i++) {
        const eruption = eruptionsData[i]
        if (eruption && eruption.properties) {
          const props = eruption.properties
          const startDate = new Date(props.startdate)
          const endDate = new Date(props.enddate) // props.active ? new Date(2100, 1, 1) : new Date(props.enddate)

          if ((startDate > minTime && startDate <= maxTime) || (startDate < minTime && endDate >= maxTime)) {
            // const active = endDate >= maxTime || ((startDate > minTime || startYear > minYear) && props.active)
            eruption.visible = crossSectionFilter(eruption.geometry.coordinates)
            result.push(eruption)
          }
        }
      }
    }
    return result
  }
)
