import { createSelector } from 'reselect'
import crossSectionRectangle from '../core/cross-section-rectangle'
import volcanoesData from '../data/volcanoes'

function pointInsidePolygon (polygon, point) {
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

function getCrossSectionFilter (crossSectionMode, crossSectionPoints) {
  const p1 = crossSectionPoints.get(0)
  const p2 = crossSectionPoints.get(1)
  if (crossSectionMode && p1 && p2) {
    // When cross section mode is enabled, return a function that checks
    // if given point is within cross section rectangle.
    const polygon = crossSectionRectangle(p1, p2)
    return pointInsidePolygon.bind(null, polygon)
  }
  // Otherwise, return function that always returns true.
  return () => true
}

const volcanoesLayerEnabled = state => state.get('layers').get('volcanoes')
const crossSectionMode = state => state.get('filters').get('crossSection')
const crossSectionPoints = state => state.get('crossSectionPoints')

export const getVisibleVolcanoes = createSelector(
  [ volcanoesLayerEnabled, crossSectionMode, crossSectionPoints ],
  (volcanoesLayerEnabled, crossSectionMode, crossSectionPoints) => {
    if (!volcanoesLayerEnabled) {
      return []
    }
    const crossSectionFilter = getCrossSectionFilter(crossSectionMode, crossSectionPoints)
    // Two important notes:
    // - Make sure that result is always a new Array instance, so pure components can detect it's been changed.
    // - Yes, I don't copy and do mutate elements. It's been done due to performance reasons.
    const result = []
    volcanoesData.forEach(v => {
      // When cross section mode is disabled, this filter returns true.
      v.visible = crossSectionFilter(v.geometry.coordinates)
      result.push(v)
    })
    return result
  }
)
