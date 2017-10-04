// Basic map area and data coordinates are assumed to be between -180 and 180 lng.
// This function will return an array of multipliers that can be used to calculate shifted coordinates.
// E.g.:
// lng range: -180, 180 => [ 0 ]
// lng range: -200, 180 => [ -1, 0 ]
// lng range: -100, 250 => [ 0, 1 ]
// lng range: 600, 1000 => [ 2, 3 ]
export default function mapAreaMultipliers (minLng, maxLng) {
  minLng += 180
  maxLng += 180
  const result = []
  for (let i = Math.floor(minLng / 360); i < Math.ceil(maxLng / 360); i += 1) {
    result.push(i)
  }
  return result
}
