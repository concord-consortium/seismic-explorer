import L from 'leaflet'

const CROSS_SECTION_RECTANGLE_ASPECT_RATIO = 0.4

// Note that order of returned points matters and is defined by what user should see in the 3D view.
// [0] - left point, close to the observer
// [1] - left point, far from the observer
// [2] - right point, far from the observer
// [3] - right point, close to the observer
export default function crossSectionRectangle (point1, point2) {
  if (!point1 || !point2) return null
  // Projection is necessary, as otherwise rectangle wouldn't look like rectangle on the map.
  const pLeft = leftPoint(project(point1), project(point2))
  const pRight = rightPoint(project(point1), project(point2))
  const ratio = CROSS_SECTION_RECTANGLE_ASPECT_RATIO / 2
  const middle1 = pointBetween(pLeft, pRight, ratio)
  const middle2 = pointBetween(pRight, pLeft, ratio)
  return [unproject(rotate(pLeft, middle1, 90)), unproject(rotate(pLeft, middle1, -90)),
    unproject(rotate(pRight, middle2, 90)), unproject(rotate(pRight, middle2, -90))]
}

// Converts Leaflet.LatLng or Leaflet.Point to array.
export function pointToArray (point) {
  if (point.lat !== undefined) return [point.lat, point.lng]
  if (point.x !== undefined) return [point.x, point.y]
  return point
}

// Limits distance between point1 and point2 to maxDistance by moving point2 if necessary. Returns modified point2.
export function limitDistance (point1, point2, maxDistance) {
  const p1Proj = project(point1)
  const p2Proj = project(point2)
  const dist = distanceBetween(p1Proj, p2Proj) / 1000
  if (dist <= maxDistance) {
    return point2
  }
  const ratio = maxDistance / dist
  return unproject(pointBetween(p1Proj, p2Proj, ratio))
}

// Distance between points on a plane (projected points).
function distanceBetween (point1, point2) {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
}

// Left point in 3D view. point1 and point2 are projected.
function leftPoint (point1, point2) {
  return point1[0] < point2[0] ? point1 : point2
}

// Right point in 3D view. point1 and point2 are projected.
function rightPoint (point1, point2) {
  return point1[0] < point2[0] ? point2 : point1
}

function project (latLngArray) {
  return pointToArray(L.Projection.SphericalMercator.project(L.latLng(latLngArray)))
}

function unproject (pointArray) {
  return pointToArray(L.Projection.SphericalMercator.unproject(L.point(pointArray)))
}

export function pointBetween (point1, point2, ratio = 0.5) {
  if (!point1 || !point2) return null
  const xDiff = point1[0] - point2[0]
  const yDiff = point1[1] - point2[1]
  return [point1[0] - xDiff * ratio, point1[1] - yDiff * ratio]
}

function rotate (center, point, angle) {
  const radians = (Math.PI / 180) * angle
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = (cos * (point[0] - center[0])) + (sin * (point[1] - center[1])) + center[0]
  const ny = (cos * (point[1] - center[1])) - (sin * (point[0] - center[0])) + center[1]
  return [nx, ny]
}
