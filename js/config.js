// Exports global app configuration. Each option can be overwritten by URL query parameter, e.g.:
// ?api='USGS'&cache=false
const DEFAULT_CONFIG = {
  // Initial map region.
  minLat: -60,
  minLng: -120,
  maxLat: 60,
  maxLng: 120,
  // 'CC', 'USGS' or 'fake'
  api: 'CC',
  // Use CloudFront caching for API calls.
  cache: true,
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
  mapStyle: 'satellite',  // or 'street' or 'earthquake-density'
  // Enables / disables logging of user actions to parent frame (e.g. LARA).
  logging: true,
  // It controls "Data type" menu. There are a few preset configurations available. Take a look at layer-data-config.js.
  layerDataConfig: 5
}

function getURLParam (name) {
  const url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return true
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

const urlConfig = {}

Object.keys(DEFAULT_CONFIG).forEach(key => {
  const urlValue = getURLParam(key)
  if (urlValue === 'true') {
    urlConfig[key] = true
  } else if (urlValue === 'false') {
    urlConfig[key] = false
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
