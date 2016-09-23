import { fakeDataset } from './data/fake-data'
import { processAPIResponse, copyAndShiftLng, concatenateData } from './data/helpers'
import { wrapTileX, lngDiff, tile2LatLngBounds } from './map-tile-helpers'
import { MAX_TIME, MIN_TIME } from './earthquake-properties'
import Cache from './cache'

const TILE_LIMIT = 12000

// Other available APIs:
// const USGS_API = 'http://earthquake.usgs.gov/fdsnws/event/1/query.geojson'
// const CLOUDFRONT_USGS_API = 'http://d1wr4s9s1xsblb.cloudfront.net/fdsnws/event/1/query.geojson'
// const CONCORD_API = 'https://e401fd4io0.execute-api.us-east-1.amazonaws.com/production/earthquakes'
const CLOUDFRONT_CONCORD_API = 'http://d876rjgss4hzs.cloudfront.net/production/earthquakes'

function getAPIPath(tile) {
  const bb = tile2LatLngBounds(tile)
  const minDate = (new Date(MIN_TIME)).toISOString()
  const maxDate = (new Date(MAX_TIME)).toISOString()
  return `${CLOUDFRONT_CONCORD_API}?starttime=${minDate}&endtime=${maxDate}` +
    `&maxlatitude=${bb.maxLat}&minlatitude=${bb.minLat}&maxlongitude=${bb.maxLng}&minlongitude=${bb.minLng}` +
    `&orderby=magnitude&limit=${TILE_LIMIT}`
}

function fakeData(tile, count) {
  const options = tile2LatLngBounds(tile)
  options.minDep = (idx % 6) * 100
  options.maxDep = (idx % 6) * 100
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(fakeDataset(count, options))
    }, Math.random() * 1000)
  })
}

export class RequestAborted {}

export class APIError {
  constructor(statusText, response) {
    this.message = statusText
    this.response = response
  }
}

export default class EarthquakeDataAPI {
  constructor() {
    this.cache = new Cache()
    this.currentRequests = new Set()
  }

  isInCache(tile) {
    // Tile can be outside [-180, 180] range. Limit it to [-180, 180]. That's the convention we follow in
    // #getFromCache and #fetchTile.
    const wrappedTile = wrapTileX(tile)
    return this.cache.has(wrappedTile)
  }

  getFromCache(tile) {
    // Tile can be outside [-180, 180] range. Limit it to [-180, 180], ask cache for this modified tile,
    // copy it then shift longitude values back to the initial range.
    const wrappedTile = wrapTileX(tile)
    const lngOffset = lngDiff(tile, wrappedTile)
    const data = this.cache.get(wrappedTile)
    // Copy and shift so we don't modify cached data!
    return data && lngOffset !== 0 ? copyAndShiftLng(data, lngOffset) : data
  }

  getTilesFromCache(tiles) {
    const cachedTiles = tiles.filter(t => this.isInCache(t)).map(t => this.getFromCache(t))
    console.log('cached data tiles:', cachedTiles.length)
    // Optimization: instead of dispatching receiveEarthquakes X times, concat arrays first
    // and then dispatch it just once. It's way faster, as React update is triggered just once, not X times.
    return concatenateData(cachedTiles)
  }

  fetchTile(tile) {
    // Tile can be outside [-180, 180] range. Limit it to [-180, 180], ask API for this modified tile,
    // copy it then shift longitude values back to the initial range.
    const wrappedTile = wrapTileX(tile)
    const lngOffset = lngDiff(tile, wrappedTile)
    // Use fake data if there's hash parameter: #fake=<value>, e.g. #fake=2000, #fake=5000, etc.
    const useFakeData = window.location.hash.startsWith('#fake')
    const fakeDataTileCount = useFakeData && parseInt(window.location.hash.split('#fake=')[1])
    const dataPromise = useFakeData ? fakeData(wrappedTile, fakeDataTileCount) : this._fetchData(getAPIPath(wrappedTile))
    return dataPromise
      .then(response => processAPIResponse(response, TILE_LIMIT))
      .then(data => this.cache.set(wrappedTile, data))
      // Copy and shift so we don't modify cached data!
      .then(data => lngOffset !== 0 ? copyAndShiftLng(data, lngOffset) : data)
  }

  abortAllRequests() {
    this.currentRequests.forEach(request => request.abort())
    this.currentRequests.clear()
  }

  _fetchData(url) {
    return new Promise((resolve, reject) => {
      const oReq = new XMLHttpRequest()
      oReq.addEventListener('load', function () {
        if (this.status >= 200 && this.status < 300) {
          try {
            resolve(JSON.parse(this.responseText))
          } catch(e) {
            // Sometimes USGS API returns malformed JSONs. Report that.
            reject(new APIError('Malformed GeoJSON', e))
          }
        } else {
          reject(new APIError(this.statusText, this))
        }
      })
      oReq.addEventListener('abort', function () {
        reject(new RequestAborted())
      })
      oReq.addEventListener('error', function () {
        reject(new APIError(this.statusText, this))
      })
      oReq.open('GET', url)
      oReq.send()
      // Add it do the set so it can be aborted using #abortAllRequests.
      this.currentRequests.add(oReq)
    })
  }
}
