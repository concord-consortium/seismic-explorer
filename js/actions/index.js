import fetch from 'isomorphic-fetch'
import { fetchJSON } from '../api'

export const UPDATE_REGIONS_HISTORY = 'UPDATE_REGIONS_HISTORY'
export const INVALIDATE_DATA = 'INVALIDATE_DATA'
export const REQUEST_DATA = 'REQUEST_DATA'
export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_REGION = 'RECEIVE_REGION'
export const RECEIVE_EARTHQUAKES = 'RECEIVE_EARTHQUAKES'
export const RECEIVE_ERROR = 'RECEIVE_ERROR'
export const SET_FILTER = 'SET_FILTER'
export const SET_BASE_LAYER = 'SET_BASE_LAYER'
export const SET_PLATES_VISIBLE = 'SET_PLATES_VISIBLE'
export const SET_ANIMATION_ENABLED = 'SET_ANIMATION_ENABLED'

export function updateRegionsHistory(path) {
  return {
    type: UPDATE_REGIONS_HISTORY,
    path: path
  }
}

export function requestData(path, dataType = 'region') { // dataType: 'region' or 'earthquakes'
  return dispatch => {
    dispatch({type: REQUEST_DATA})
    fetchJSON(path)
      .then(
        response => dispatch(receiveData(response, dataType)),
        error => dispatch(receiveError(error))
      )
  }
}

function receiveData(response, dataType) {
  return dispatch => {
    dispatch({
      type: RECEIVE_DATA,
      dataType,
      receivedAt: Date.now()
    })
    switch(dataType) {
      case 'region':
        return dispatch(receiveRegion(response))
      case 'earthquakes':
        return dispatch(receiveEarthquakes(response))
    }
  }
}

function receiveRegion(response) {
  return dispatch => {
    dispatch({
      type: RECEIVE_REGION,
      response: response,
      receivedAt: Date.now()
    })
    response.datasets.forEach(earthquakesPath =>
      dispatch(requestData(earthquakesPath, 'earthquakes'))
    )
  }
}

function receiveEarthquakes(response) {
  return {
    type: RECEIVE_EARTHQUAKES,
    response: response,
    receivedAt: Date.now()
  }
}

function receiveError(response) {
  return {
    type: RECEIVE_ERROR,
    response: response,
    receivedAt: Date.now()
  }
}

export function invalidateData() {
  return {type: INVALIDATE_DATA}
}

export function setFilter(name, value) {
  return {
    type: SET_FILTER,
    name,
    value
  }
}

export function setBaseLayer(value) {
  return {
    type: SET_BASE_LAYER,
    value
  }
}

export function setPlatesVisible(value) {
  return {
    type: SET_PLATES_VISIBLE,
    value
  }
}

export function setAnimationEnabled(value) {
  return {
    type: SET_ANIMATION_ENABLED,
    value
  }
}
