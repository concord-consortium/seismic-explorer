// Exports global app configuration. Each option can be overwritten by URL query parameter, e.g.:
// ?api='USGS'&cache=false
const DEFAULT_CONFIG = {
  // Enables authoring mode
  authoring: false,
  // Authorable pins. A single pin is defined by array: [<lat>, <lng>, <label>]. E.g.:
  // pins=[[0, 0, "test pin"], [20, 50, "another pin"]]
  pins: [],
  // Initial map region.
  minLat: -60,
  minLng: -120,
  maxLat: 60,
  maxLng: 120,
  // Max number of earthquakes that can be provided for one tile.
  tileLimit: 12000,
  // Use dates independent of the current time zone to make sure that caching works better.
  // Set UTC noon, so users in US still see this date in UI in their local timezone as 1/1/1980 (instead of 12/31/1979).
  startTime: Date.parse('1980-01-01T12:00Z'),
  // Calculate noon in UTC timezone that was at least 1h ago (earthquakes DB is updated every few minutes, but let's be safe).
  // Don't use current time to be able cache API queries.
  endTime: (function () {
    const oneHour = 3600000 // ms
    const result = new Date(Date.now() - oneHour)
    if (result.getUTCHours() < 12) {
      result.setUTCDate(result.getUTCDate() - 1)
    }
    result.setUTCHours(12)
    result.setUTCMinutes(0)
    result.setUTCSeconds(0)
    result.setUTCMilliseconds(0)
    return result.getTime()
  }()),
  // 'CC', 'USGS' or 'fake'
  api: 'CC',
  mapStyle: 'satellite', // or 'street' or 'earthquake-density'
  // Use CloudFront caching for API calls.
  cache: true,
  // Enables / disables logging of user actions to parent frame (e.g. LARA).
  logging: true,
  // Data layers.
  crossSection: true,
  // In KM, but very very approximate, it doesn't respect map projection.
  maxCrossSectionLength: 4000,
  exclusiveDataLayers: false,
  plateBoundariesAvailable: true,
  plateBoundariesVisible: false,
  plateNamesAvailable: true,
  plateNamesVisible: false,
  continentOceanNamesAvailable: true,
  continentOceanNamesVisible: false,
  earthquakesAvailable: true,
  earthquakesVisible: true,
  earthquakesDisplayAllOnStart: false,
  volcanoesAvailable: true,
  volcanoesVisible: false,
  plateMovementAvailable: true,
  plateMovementVisible: false,
  detailedPlateMovementAvailable: false,
  detailedPlateMovementVisible: false
}

function getURLParam (name) {
  const url = window.location.href
  name = name.replace(/[[\]]/g, '\\$&')
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return true
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

const urlConfig = {}

function isArray (value) {
  return typeof value === 'string' && value.match(/^\[.*\]$/)
}

Object.keys(DEFAULT_CONFIG).forEach(key => {
  const urlValue = getURLParam(key)
  if (urlValue === true || urlValue === 'true') {
    urlConfig[key] = true
  } else if (urlValue === 'false') {
    urlConfig[key] = false
  } else if (isArray(urlValue)) {
    // Array can be provided in URL using following format:
    // &parameter=[value1,value2,value3]
    urlConfig[key] = JSON.parse(urlValue)
  } else if (urlValue !== null && !isNaN(urlValue)) {
    // !isNaN(string) means isNumber(string).
    urlConfig[key] = parseFloat(urlValue)
  } else if (urlValue !== null && (key === 'startTime' || key === 'endTime')) {
    urlConfig[key] = Date.parse(urlValue)
  } else if (urlValue !== null) {
    urlConfig[key] = urlValue
  }
})

const finalConfig = Object.assign({}, DEFAULT_CONFIG, urlConfig)
console.log('config', finalConfig)

export default finalConfig
