import fetch from 'isomorphic-fetch'
import { fetchJSON } from '../api'

export const INVALIDATE_DATA = 'INVALIDATE_DATA'
export const REQUEST_DATA = 'REQUEST_DATA'
export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_REGION = 'RECEIVE_REGION'
export const RECEIVE_EARTHQUAKES = 'RECEIVE_EARTHQUAKES'
export const RECEIVE_ERROR = 'RECEIVE_ERROR'
export const SET_MIN_MAG = 'SET_MIN_MAG'
export const SET_MAX_MAG = 'SET_MAX_MAG'
export const SET_MIN_TIME = 'SET_MIN_TIME'
export const SET_MAX_TIME = 'SET_MAX_TIME'

export function requestData(path, dataType = 'region') { // dataType: 'region' or 'earthquakes'
  console.time('data fetching')
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
  console.timeEnd('data fetching')
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

export function setMinMag(value) {
  return {
    type: SET_MIN_MAG,
    value
  }
}

export function setMaxMag(value) {
  return {
    type: SET_MAX_MAG,
    value
  }
}

export function setMinTime(value) {
  return {
    type: SET_MIN_TIME,
    value
  }
}

export function setMaxTime(value) {
  return {
    type: SET_MAX_TIME,
    value
  }
}
