import { fakeDataset } from './data/fake-data'
import { processUSGSGeoJSON, copyAndShiftLng } from './data/helpers'
import { wrapTileX, lngDiff, tile2LatLngBounds } from './map-tile-helpers'
import { MAX_TIME, MIN_TIME } from './earthquake-properties'
import Cache from './cache'

const USGS_LIMIT = 12000

function getUSGSPath(tile) {
  const formatDate = date => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  const bb = tile2LatLngBounds(tile)
  const minDate = formatDate(new Date(MIN_TIME))
  const maxDate = formatDate(new Date(MAX_TIME))
  const minMag = Math.max(7 - tile.zoom, 0) // so 5 for the world view (zoom = 2) and lower values for next ones.
  return `http://d1wr4s9s1xsblb.cloudfront.net/fdsnws/event/1/query.geojson?starttime=${minDate}&endtime=${maxDate}` +
    `&maxlatitude=${bb.maxLat}&minlatitude=${bb.minLat}&maxlongitude=${bb.maxLng}&minlongitude=${bb.minLng}` +
    `&minmagnitude=${minMag}&orderby=magnitude&limit=${USGS_LIMIT}`
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

  fetchTile(tile) {
    // Tile can be outside [-180, 180] range. Limit it to [-180, 180], ask API for this modified tile,
    // copy it then shift longitude values back to the initial range.
    const wrappedTile = wrapTileX(tile)
    const lngOffset = lngDiff(tile, wrappedTile)
    // Use fake data if there's hash parameter: #fake=<value>, e.g. #fake=2000, #fake=5000, etc.
    const useFakeData = window.location.hash.startsWith('#fake')
    const fakeDataTileCount = useFakeData && parseInt(window.location.hash.split('#fake=')[1])
    const dataPromise = useFakeData ? fakeData(wrappedTile, fakeDataTileCount) : this._fetchData(getUSGSPath(wrappedTile))
    return dataPromise
      .then(response => processUSGSGeoJSON(response))
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
      oReq.responseType = 'json'
      oReq.addEventListener('load', function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(this.response)
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