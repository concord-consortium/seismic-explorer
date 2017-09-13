import EarthquakeDataAPI, { APIError, RequestAborted } from '../earthquake-data-api'
import config from '../config'
import { tilesList, tileYOutOfBounds } from '../map-tile-helpers'

export const SET_MAP_REGION = 'SET_MAP_REGION'
export const REQUEST_DATA = 'REQUEST_DATA'
export const RESET_EARTHQUAKES = 'RESET_EARTHQUAKES'
export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_EARTHQUAKES = 'RECEIVE_EARTHQUAKES'
export const RECEIVE_ERROR = 'RECEIVE_ERROR'
export const SET_FILTER = 'SET_FILTER'
export const SET_BASE_LAYER = 'SET_BASE_LAYER'
export const SET_PLATES_VISIBLE = 'SET_PLATES_VISIBLE'
export const SET_ANIMATION_ENABLED = 'SET_ANIMATION_ENABLED'
export const SET_MODE = 'SET_MODE'
export const SET_CROSS_SECTION_POINT = 'SET_CROSS_SECTION_POINT'
export const MARK_2D_VIEW_MODIFIED = 'MARK_2D_VIEW_MODIFIED'
export const MARK_3D_VIEW_MODIFIED = 'MARK_3D_VIEW_MODIFIED'
export const SET_EARTHQUAKES_VISIBLE = 'SET_EARTHQUAKES_VISIBLE'
export const SET_VOLCANOES_VISIBLE = 'SET_VOLCANOES_VISIBLE'
export const SET_PLATE_MOVEMENT_VISIBLE = 'SET_PLATE_MOVEMENT_VISIBLE'
export const SET_PLATE_ARROWS_VISIBLE = 'SET_PLATE_ARROWS_VISIBLE'

const api = new EarthquakeDataAPI()

function requestEarthquakes (tile) {
  return dispatch => {
    dispatch({type: REQUEST_DATA})
    api.fetchTile(tile)
      .then(
        response => {
          dispatch({type: RECEIVE_DATA})
          dispatch(receiveEarthquakes(response))
        },
        error => dispatch(receiveError(error))
      )
  }
}

function receiveEarthquakes (response) {
  return {
    type: RECEIVE_EARTHQUAKES,
    response: response
  }
}

function receiveError (error) {
  if (error instanceof APIError) {
    console.error('[API error]', error.message, error.response)
  } else if (!(error instanceof RequestAborted)) {
    // RequestAborted can happen when user is panning map quickly and various tiles stated loading, but
    // are not necessary anymore. That's normal case, so don't log it.
    console.error('[unknown error]', error)
  }
  return {
    type: RECEIVE_ERROR,
    response: error
  }
}

// Each time map region is changed (moved, panned, zoomed in / out), we need to update earthquakes data.
// - region is an array of points that defines shape, e.g. [[lat, lng], [lat, lng], ...]
// - zoom is simple number, the current map zoom
function updateEarthquakesData (region, zoom) {
  return dispatch => {
    // First, reset earthquakes data and abort all the old requests.
    api.abortAllRequests()
    dispatch({
      type: RESET_EARTHQUAKES
    })
    // Process region, get tiles. Remove unnecessary ones (y values < 0 or > max value, we don't display map there).
    const tiles = tilesList(region, zoom).filter(t => !tileYOutOfBounds(t))
    // Then retrieve all the cached data tiles.
    console.time('cached tiles processing')
    const cachedEarthquakes = api.getTilesFromCache(tiles)
    dispatch(receiveEarthquakes(cachedEarthquakes))
    console.timeEnd('cached tiles processing')
    // Finally request new data tiles.
    const tilesToDownload = tiles.filter(t => !api.isInCache(t))
    console.log('data tiles to download:', tilesToDownload.length)
    tilesToDownload.forEach((tile, idx) =>
      dispatch(requestEarthquakes(tile))
    )
  }
}

export function setMapRegion (region, zoom, earthquakesVisible) {
  return dispatch => {
    dispatch({
      type: SET_MAP_REGION,
      region,
      zoom
    })
    if (earthquakesVisible) {
      dispatch(updateEarthquakesData(region, zoom))
    }
  }
}

export function setFilter (name, value) {
  return {
    type: SET_FILTER,
    name,
    value
  }
}

export function setEarthquakesVisible (value, region, zoom) {
  return dispatch => {
    dispatch({
      type: SET_EARTHQUAKES_VISIBLE,
      value
    })
    if (value && region !== undefined && zoom !== undefined) {
      dispatch(updateEarthquakesData(region, zoom))
    }
  }
}

export function setBaseLayer (value) {
  return {
    type: SET_BASE_LAYER,
    value
  }
}

export function setPlatesVisible (value) {
  return {
    type: SET_PLATES_VISIBLE,
    value
  }
}

export function setVolcanoesVisible (value) {
  return {
    type: SET_VOLCANOES_VISIBLE,
    value
  }
}

export function setPlateMovementVisible (value) {
  return {
    type: SET_PLATE_MOVEMENT_VISIBLE,
    value
  }
}

export function setPlateArrowsVisible (value) {
  return {
    type: SET_PLATE_ARROWS_VISIBLE,
    value
  }
}

export function setAnimationEnabled (value) {
  return {
    type: SET_ANIMATION_ENABLED,
    value
  }
}

// Reset stops animation and moves current animation progress to the beginning.
export function reset () {
  return (dispatch, getState) => {
    dispatch(setAnimationEnabled(false))
    dispatch(setFilter('maxTime', getState().get('filters').get('minTime')))
  }
}

// '2d', 'cross-section' or '3d'
export function setMode (value) {
  return dispatch => {
    dispatch({
      type: SET_MODE,
      value
    })
    // Mode change should automatically enable or disable cross section region filtering.
    if (value === '3d') {
      // Apply cross section box filtering with a small delay, so there's a nice animation visible.
      setTimeout(() => dispatch(setFilter('crossSection', true)), 500)
    } else {
      dispatch(setFilter('crossSection', false))
    }
  }
}

export function setCrossSectionPoint (index, latLng) {
  return {
    type: SET_CROSS_SECTION_POINT,
    index,
    latLng
  }
}

// When user drags a map.
export function mark2DViewModified (value) {
  return {
    type: MARK_2D_VIEW_MODIFIED,
    value
  }
}

// When user rotates camera.
export function mark3DViewModified (value) {
  return {
    type: MARK_3D_VIEW_MODIFIED,
    value
  }
}
