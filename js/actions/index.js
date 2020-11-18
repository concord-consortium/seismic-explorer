import EarthquakeDataAPI, { APIError, RequestAborted } from '../earthquake-data-api'
import EruptionDataAPI, { EruptionAPIError, EruptionRequestAborted } from '../eruption-data-api'
import { tilesList, tileYOutOfBounds } from '../map-tile-helpers'

export const SET_MAP_STATUS = 'SET_MAP_STATUS'
export const REQUEST_DATA = 'REQUEST_DATA'
export const RESET_EARTHQUAKES = 'RESET_EARTHQUAKES'
export const RESET_ERUPTIONS = 'RESET_ERUPTIONS'
export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_EARTHQUAKES = 'RECEIVE_EARTHQUAKES'
export const RECEIVE_ERUPTIONS = 'RECEIVE_ERUPTIONS'
export const RECEIVE_ERROR = 'RECEIVE_ERROR'
export const SET_FILTER = 'SET_FILTER'
export const SET_BASE_LAYER = 'SET_BASE_LAYER'
export const SET_PLATE_BOUNDARIES_VISIBLE = 'SET_PLATE_BOUNDARIES_VISIBLE'
export const SET_PLATE_NAMES_VISIBLE = 'SET_PLATE_NAMES_VISIBLE'
export const SET_CONTINENT_OCEAN_NAMES_VISIBLE = 'SET_CONTINENT_OCEAN_NAMES_VISIBLE'
export const SET_ANIMATION_ENABLED = 'SET_ANIMATION_ENABLED'
export const SET_MODE = 'SET_MODE'
export const SET_CROSS_SECTION_POINT = 'SET_CROSS_SECTION_POINT'
export const MARK_2D_VIEW_MODIFIED = 'MARK_2D_VIEW_MODIFIED'
export const MARK_3D_VIEW_MODIFIED = 'MARK_3D_VIEW_MODIFIED'
export const SET_EARTHQUAKES_VISIBLE = 'SET_EARTHQUAKES_VISIBLE'
export const SET_VOLCANOES_VISIBLE = 'SET_VOLCANOES_VISIBLE'
export const SET_ERUPTIONS_VISIBLE = 'SET_ERUPTIONS_VISIBLE'
export const SET_PLATE_MOVEMENT_VISIBLE = 'SET_PLATE_MOVEMENT_VISIBLE'
export const SET_PLATE_ARROWS_VISIBLE = 'SET_PLATE_ARROWS_VISIBLE'
export const SET_PIN = 'SET_PIN'
export const UPDATE_PIN = 'UPDATE_PIN'

const earthquakeApi = new EarthquakeDataAPI()
const eruptionApi = new EruptionDataAPI()

function requestEarthquakes (tile) {
  return dispatch => {
    dispatch({ type: REQUEST_DATA })
    earthquakeApi.fetchTile(tile)
      .then(
        response => {
          dispatch({ type: RECEIVE_DATA })
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
// - region is an object with min/max values of lng and lat
// - zoom is simple number, the current map zoom
function updateEarthquakesData (region, zoom) {
  return dispatch => {
    // First, reset earthquakes data and abort all the old requests.
    earthquakeApi.abortAllRequests()
    dispatch({
      type: RESET_EARTHQUAKES
    })
    // Process region, get tiles. Remove unnecessary ones (y values < 0 or > max value, we don't display map there).
    const tiles = tilesList(region, zoom).filter(t => !tileYOutOfBounds(t))
    // Then retrieve all the cached data tiles.
    console.time('Earthquake cached tiles processing')
    const cachedEarthquakes = earthquakeApi.getTilesFromCache(tiles)
    dispatch(receiveEarthquakes(cachedEarthquakes))
    console.timeEnd('Earthquake cached tiles processing')
    // Finally request new data tiles.
    const tilesToDownload = tiles.filter(t => !earthquakeApi.isInCache(t))
    console.log('Earthquake data tiles to download:', tilesToDownload.length)
    tilesToDownload.forEach((tile, idx) =>
      dispatch(requestEarthquakes(tile))
    )
  }
}

function requestEruptions (tile) {
  return dispatch => {
    dispatch({ type: REQUEST_DATA })
    eruptionApi.fetchTile(tile)
      .then(
        response => {
          dispatch({ type: RECEIVE_DATA })
          dispatch(receiveEruptions(response))
        },
        error => dispatch(eruptionReceiveError(error))
      )
  }
}

function receiveEruptions (response) {
  return {
    type: RECEIVE_ERUPTIONS,
    response: response
  }
}

function eruptionReceiveError (error) {
  if (error instanceof EruptionAPIError) {
    console.error('[API error]', error.message, error.response)
  } else if (!(error instanceof EruptionRequestAborted)) {
    // RequestAborted can happen when user is panning map quickly and various tiles stated loading, but
    // are not necessary anymore. That's normal case, so don't log it.
    console.error('[unknown error]', error)
  }
  return {
    type: RECEIVE_ERROR,
    response: error
  }
}

// Each time map region is changed (moved, panned, zoomed in / out), we need to update eruption data.
// - region is an object with min/max values of lng and lat
// - zoom is simple number, the current map zoom
function updateEruptionData (region, zoom) {
  return dispatch => {
    // First, reset eruption data and abort all the old requests.
    eruptionApi.abortAllRequests()
    dispatch({
      type: RESET_ERUPTIONS
    })
    // Process region, get tiles. Remove unnecessary ones (y values < 0 or > max value, we don't display map there).
    const tiles = tilesList(region, zoom).filter(t => !tileYOutOfBounds(t))
    // Then retrieve all the cached data tiles.
    console.time('Eruption cached tiles processing')
    const cachedEruptions = eruptionApi.getTilesFromCache(tiles)
    dispatch(receiveEruptions(cachedEruptions))
    console.timeEnd('Eruption cached tiles processing')
    // Finally request new data tiles.
    const tilesToDownload = tiles.filter(t => !eruptionApi.isInCache(t))
    console.log('Eruption data tiles to download:', tilesToDownload.length)
    tilesToDownload.forEach((tile, idx) =>
      dispatch(requestEruptions(tile))
    )
  }
}

export function setMapStatus (region, zoom, earthquakesVisible, eruptionsVisible) {
  return dispatch => {
    dispatch({
      type: SET_MAP_STATUS,
      region,
      zoom
    })
    earthquakesVisible && dispatch(updateEarthquakesData(region, zoom))
    eruptionsVisible && dispatch(updateEruptionData(region, zoom))
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

export function setEruptionsVisible (value, region, zoom) {
  return dispatch => {
    dispatch({
      type: SET_ERUPTIONS_VISIBLE,
      value
    })
    if (value && region !== undefined && zoom !== undefined) {
      dispatch(updateEruptionData(region, zoom))
    }
  }
}

export function setBaseLayer (value) {
  return {
    type: SET_BASE_LAYER,
    value
  }
}

export function setPlateBoundariesVisible (value) {
  return {
    type: SET_PLATE_BOUNDARIES_VISIBLE,
    value
  }
}

export function setPlateNamesVisible (value) {
  return {
    type: SET_PLATE_NAMES_VISIBLE,
    value
  }
}

export function setContinentOceanNamesVisible (value) {
  return {
    type: SET_CONTINENT_OCEAN_NAMES_VISIBLE,
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
export function setPin (index, latLng, label) {
  return {
    type: SET_PIN,
    index,
    latLng,
    label
  }
}

export function updatePin (index, latLng, marker) {
  return {
    type: UPDATE_PIN,
    index,
    latLng,
    marker
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
