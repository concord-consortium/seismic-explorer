import fetch from 'isomorphic-fetch'
import { getDataJSON } from '../api'

export const INVALIDATE_DATA = 'INVALIDATE_DATA'
export const REQUEST_DATA = 'REQUEST_DATA'
export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_ERROR = 'RECEIVE_ERROR'
export const SET_MIN_MAG = 'SET_MIN_MAG'
export const SET_MAX_MAG = 'SET_MAX_MAG'
export const SET_MIN_TIME = 'SET_MIN_TIME'
export const SET_MAX_TIME = 'SET_MAX_TIME'


// When fetch succeeds, receiveData action will be called with the response object (json in this case).
// REQUEST_DATA action will be processed by the reducer immediately.
// See: api-middleware.js
export function requestData(path) {
  return {
    type: REQUEST_DATA,
    fetchJSON: {
      path,
      successAction: receiveData,
      errorAction: receiveError
    }
  }
}

export function receiveData(response) {
  return {
    type: RECEIVE_DATA,
    response: response,
    receivedAt: Date.now()
  }
}

export function receiveError(response) {
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
