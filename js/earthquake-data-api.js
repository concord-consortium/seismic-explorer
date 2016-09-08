import { fakeDataset } from './data/fake-data'
import { limitData, sortByTime, swapCoords } from './data/helpers'
import { tile2lat, tile2lng } from './map-tile-helpers'
import { MAX_TIME, MIN_TIME } from './earthquake-properties'
import Cache from './cache'

const USGS_LIMIT = 12000
function getUSGSPath(tile) {
  const formatDate = date => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  const minDate = formatDate(new Date(MIN_TIME))
  const maxDate = formatDate(new Date(MAX_TIME))
  const minLng = tile2lng(tile.x, tile.zoom)
  const maxLng = tile2lng(tile.x + 1, tile.zoom)
  const maxLat = tile2lat(tile.y, tile.zoom)
  const minLat = tile2lat(tile.y + 1, tile.zoom)
  const minMag = Math.max(7 - tile.zoom, 2) // so 5 for the world view (zoom = 2) and lower values for next ones.
  return `http://d1wr4s9s1xsblb.cloudfront.net/fdsnws/event/1/query.geojson?starttime=${minDate}&endtime=${maxDate}` +
    `&maxlatitude=${maxLat}&minlatitude=${minLat}&maxlongitude=${maxLng}&minlongitude=${minLng}` +
    `&minmagnitude=${minMag}&orderby=magnitude&limit=${USGS_LIMIT}`
}

function fakeData(tile, count) {
  const options = {
    minLng: tile2lng(tile.x, tile.zoom),
    maxLng: tile2lng(tile.x + 1, tile.zoom),
    maxLat: tile2lat(tile.y, tile.zoom),
    minLat: tile2lat(tile.y + 1, tile.zoom),
    minDep: (idx % 6) * 100,
    maxDep: (idx % 6) * 100
  }
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
    return this.cache.has(tile)
  }

  getFromCache(tile) {
    return this.cache.get(tile)
  }

  fetchTile(tile) {
    // Use fake data if there's hash parameter: #fake=<value>, e.g. #fake=2000, #fake=5000, etc.
    const useFakeData = window.location.hash.startsWith('#fake')
    const fakeDataTileCount = useFakeData && parseInt(window.location.hash.split('#fake=')[1])
    const dataPromise = useFakeData ? fakeData(tile, fakeDataTileCount) : this._fetchData(getUSGSPath(tile))
    return dataPromise
      .then(response => {return {features: sortByTime(swapCoords(limitData(response.features)))}})
      .then(response => this.cache.set(tile, response))
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