import { fakeEruptionDataset } from './data/fake-data'
import { processEruptionAPIResponse, copyAndShiftEruptionLng, concatenateEruptionData } from './data/helpers'
import { wrapTileX, lngDiff, tile2LatLngBounds } from './map-tile-helpers'
import Cache from './cache'
import config from './config'

const CONCORD_API = 'https://e401fd4io0.execute-api.us-east-1.amazonaws.com/production/seismic-explorer-eruptions'
const CLOUDFRONT_CONCORD_API = 'https://d876rjgss4hzs.cloudfront.net/production/seismic-explorer-eruptions'

function getAPIHost () {
  if (config.cache) {
    return CLOUDFRONT_CONCORD_API
  } else {
    return CONCORD_API
  }
}

function getAPIPath (tile) {
  const bb = tile2LatLngBounds(tile)
  const startTime = config.showHistoricEruptions ? (new Date(1,1,1)).toISOString() : (new Date(config.startTime)).toISOString()
  const endTime = (new Date(config.endTime)).toISOString()
  const requestPath = `${getAPIHost()}?starttime=${startTime}&endtime=${endTime}` +
  `&maxlatitude=${bb.maxLat}&minlatitude=${bb.minLat}&maxlongitude=${bb.maxLng}&minlongitude=${bb.minLng}` +
  `&orderby=startdate-asc&limit=${config.tileLimit}`
  return requestPath
}

function fakeData (tile, count) {
  const options = tile2LatLngBounds(tile)
  return new Promise(resolve => {
    setTimeout(function () {
      resolve(fakeEruptionDataset(count, options))
    }, Math.random() * 1000)
  })
}

export class EruptionRequestAborted {}

export class EruptionAPIError {
  constructor (statusText, response) {
    this.message = statusText
    this.response = response
  }
}

export default class EruptionDataAPI {
  constructor () {
    this.cache = new Cache()
    this.currentRequests = new Set()
  }

  isInCache (tile) {
    // Tile can be outside [-180, 180] range. Limit it to [-180, 180]. That's the convention we follow in
    // #getFromCache and #fetchTile.
    const wrappedTile = wrapTileX(tile)
    return this.cache.has(wrappedTile)
  }

  getFromCache (tile) {
    // Tile can be outside [-180, 180] range. Limit it to [-180, 180], ask cache for this modified tile,
    // copy it then shift longitude values back to the initial range.
    const wrappedTile = wrapTileX(tile)
    const lngOffset = lngDiff(tile, wrappedTile)
    const data = this.cache.get(wrappedTile)
    // Copy and shift so we don't modify cached data!
    return data && lngOffset !== 0 ? copyAndShiftEruptionLng(data, lngOffset) : data
  }

  getTilesFromCache (tiles) {
    const cachedTiles = tiles.filter(t => this.isInCache(t)).map(t => this.getFromCache(t))
    console.log('cached data tiles:', cachedTiles.length)
    return concatenateEruptionData(cachedTiles)
  }

  fetchTile (tile) {
    // Tile can be outside [-180, 180] range. Limit it to [-180, 180], ask API for this modified tile,
    // copy it then shift longitude values back to the initial range.
    const wrappedTile = wrapTileX(tile)
    const lngOffset = lngDiff(tile, wrappedTile)
    const dataPromise = config.api === 'fake'
      ? fakeData(wrappedTile, 10)
      : this._fetchData(getAPIPath(wrappedTile))
    return dataPromise
      .then(response => processEruptionAPIResponse(response, config.tileLimit))
      .then(data => this.cache.set(wrappedTile, data))
      // Copy and shift so we don't modify cached data!
      .then(data => lngOffset !== 0 ? copyAndShiftEruptionLng(data, lngOffset) : data)
  }

  abortAllRequests () {
    this.currentRequests.forEach(request => request.abort())
    this.currentRequests.clear()
  }

  _fetchData (url) {
    return new Promise((resolve, reject) => {
      const oReq = new window.XMLHttpRequest()
      oReq.addEventListener('load', function () {
        if (this.status >= 200 && this.status < 300) {
          try {
            resolve(JSON.parse(this.responseText))
          } catch (e) {
            // Sometimes USGS API returns malformed JSONs. Report that.
            reject(new EruptionAPIError('Malformed GeoJSON', e))
          }
        } else {
          reject(new EruptionAPIError(this.statusText, this))
        }
      })
      oReq.addEventListener('abort', function () {
        reject(new EruptionRequestAborted())
      })
      oReq.addEventListener('error', function () {
        reject(new EruptionAPIError(this.statusText, this))
      })
      oReq.open('GET', url)
      oReq.send()
      // Add it do the set so it can be aborted using #abortAllRequests.
      this.currentRequests.add(oReq)
    })
  }
}
