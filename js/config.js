// Exports global app configuration. Each option can be overwritten by URL query parameter, e.g.:
// ?api='USGS'&cache=false

const DEFAULT_CONFIG = {
  // 'CC', 'USGS' or 'fake'
  api: 'CC',
  // Use CloudFront caching for API calls.
  cache: true,
  // Max number of earthquakes that can be provided for one tile.
  tileLimit: 12000
}

function getURLParam(name) {
  const url = window.location.href
  name = name.replace(/[\[\]]/g, "\\$&")
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return true
  return decodeURIComponent(results[2].replace(/\+/g, " "))
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
  } else if (urlValue !== null) {
    urlConfig[key] = urlValue
  }
})

const finalConfig = Object.assign({}, DEFAULT_CONFIG, urlConfig)
console.log('config', finalConfig)

export default finalConfig
