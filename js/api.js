import { fakeDataset } from './data/fake-data'
import { sortByTime, swapCoords } from './data/helpers'
import { tile2lat, tile2lng } from './map-tile-helpers'

class Cache {
  constructor() {
    this.data = {}
  }

  key(tile) {
    return `${tile.zoom}-${tile.x}-${tile.y}`
  }

  get(tile) {
    return this.data[this.key(tile)]
  }

  set(tile, json) {
    this.data[this.key(tile)] = json
    return json
  }

  has(tile) {
    return !!this.data[this.key(tile)]
  }
}

const cache = new Cache()

export function isInCache(tile) {
  return cache.has(tile)
}

export function getFromCache(tile) {
  return cache.get(tile)
}

const USGS_LIMIT = 20000
function getAPIPath(tile) {
  const minLng = tile2lng(tile.x, tile.zoom)
  const maxLng = tile2lng(tile.x + 1, tile.zoom)
  const maxLat = tile2lat(tile.y, tile.zoom)
  const minLat = tile2lat(tile.y + 1, tile.zoom)
  const minMag = Math.max(7 - tile.zoom, 2) // so 5 for the world view (zoom = 2) and lower values for next ones.
  return `http://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1980-01-01&endtime=2016-01-01&maxlatitude=${maxLat}&minlatitude=${minLat}&maxlongitude=${maxLng}&minlongitude=${minLng}&minmagnitude=${minMag}&orderby=magnitude&limit=${USGS_LIMIT}`
}

export function fetchTile(tile, idx) {
  // Use fake data if there's hash parameter: #fake=<value>, e.g. #fake=2000, #fake=5000, etc.
  const useFakeData = window.location.hash.startsWith('#fake')
  const fakeDataTileCount = useFakeData && parseInt(window.location.hash.split('#fake=')[1])
  const dataPromise = useFakeData ? fakeData(tile, fakeDataTileCount, idx) :
                                    fetch(getAPIPath(tile))
                                      .then(checkStatus)
                                      .then(response => response.json())
  return dataPromise
          .then(response => {return {features: sortByTime(swapCoords(response.features))}})
          .then(response => cache.set(tile, response))
}

export class APIError {
  constructor(statusText, response) {
    this.message = statusText
    this.response = response
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    throw new APIError(response.statusText, response)
  }
}

function fakeData(tile, count, idx) {
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
    }, idx * 100)
  })
}
