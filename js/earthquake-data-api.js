import { fakeDataset } from './data/fake-data'
import { processAPIResponse, copyAndShiftLng, concatenateData } from './data/helpers'
import { wrapTileX, lngDiff, tile2LatLngBounds } from './map-tile-helpers'
import Cache from './cache'
import config from './config'

const USGS_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson'
const CLOUDFRONT_USGS_API = 'https://d1wr4s9s1xsblb.cloudfront.net/fdsnws/event/1/query.geojson'
const CONCORD_API = 'https://e401fd4io0.execute-api.us-east-1.amazonaws.com/production/earthquakes'
const CLOUDFRONT_CONCORD_API = 'https://d876rjgss4hzs.cloudfront.net/production/earthquakes'

function getAPIHost() {
  if (config.api === 'CC' && config.cache) {
    return CLOUDFRONT_CONCORD_API
  } else if (config.api === 'USGS' && config.cache) {
    return CLOUDFRONT_USGS_API
  } else if (config.api === 'CC' && !config.cache) {
    return CONCORD_API
  } else if (config.api === 'USGS' && !config.cache) {
    return USGS_API
  }
}

function getAPIPath(tile, minMag) {
  const bb = tile2LatLngBounds(tile)
  const startTime = (new Date(config.startTime)).toISOString()
  const endTime = (new Date(config.endTime)).toISOString()
  return `${getAPIHost()}?starttime=${startTime}&endtime=${endTime}` +
    `&maxlatitude=${bb.maxLat}&minlatitude=${bb.minLat}&maxlongitude=${bb.maxLng}&minlongitude=${bb.minLng}` +
    `&minmagnitude=${minMag}&orderby=magnitude&limit=${config.tileLimit}`
}

// If USGS API is used, we need to make query a bit narrower as otherwise API returns an error / dies.
// Use min mag 5 for the world view (zoom = 2) and lower values for next ones.
function getMinMagnitude(zoom) {
  return config.api === 'CC' ? 0 : Math.max(7 - zoom, 0)
}

function fakeData(tile, count) {
  const options = tile2LatLngBounds(tile)
  options.minDep = (tile.x % 6) * 100
  options.maxDep = (tile.x % 6) * 100
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
    const minMagnitude = getMinMagnitude(wrappedTile.zoom)
    const dataPromise = config.api === 'fake' ?
      fakeData(wrappedTile, config.tileLimit) :
      this._fetchData(getAPIPath(wrappedTile, minMagnitude))
    return dataPromise
      .then(response => processAPIResponse(response, config.tileLimit, minMagnitude))
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
