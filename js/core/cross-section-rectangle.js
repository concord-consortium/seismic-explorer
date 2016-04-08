import L from 'leaflet'

const CROSS_SECTION_RECTANGLE_ASPECT_RATIO = 0.4

export default function crossSectionRectangle(point1, point2) {
  if (!point1 || !point2) return null
  // Projection is necessary, as otherwise rectangle wouldn't look like rectangle on the map.
  point1 = project(point1)
  point2 = project(point2)
  const ratio = CROSS_SECTION_RECTANGLE_ASPECT_RATIO / 2
  const middle1 = pointBetween(point1, point2, ratio)
  const middle2 = pointBetween(point2, point1, ratio)
  return [unproject(rotate(point1, middle1, 90)), unproject(rotate(point1, middle1, -90)),
          unproject(rotate(point2, middle2, 90)), unproject(rotate(point2, middle2, -90))]
}

// Converts Leaflet.LatLng or Leaflet.Point to array.
export function pointToArray(point) {
  if (point.lat !== undefined) return [point.lat, point.lng]
  if (point.x !== undefined) return [point.x, point.y]
  return point
}

function project(latLngArray) {
  return pointToArray(L.Projection.SphericalMercator.project(L.latLng(latLngArray)))
}

function unproject(pointArray) {
  return pointToArray(L.Projection.SphericalMercator.unproject(L.point(pointArray)))
}

function pointBetween(point1, point2, ratio = 0.5) {
  if (!point1 || !point2) return null
  const xDiff = point1[0] - point2[0]
  const yDiff = point1[1] - point2[1]
  return [point1[0] - xDiff * ratio, point1[1] - yDiff * ratio]
}

function rotate(center, point, angle) {
  const radians = (Math.PI / 180) * angle
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = (cos * (point[0] - center[0])) + (sin * (point[1] - center[1])) + center[0]
  const ny = (cos * (point[1] - center[1])) - (sin * (point[0] - center[0])) + center[1]
  return [nx, ny]
}
