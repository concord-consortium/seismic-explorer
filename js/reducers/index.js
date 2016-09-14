import { Map, List, Set } from 'immutable'
import {
  REQUEST_DATA, RESET_EARTHQUAKES, RECEIVE_EARTHQUAKES, RECEIVE_DATA, RECEIVE_ERROR,
  SET_FILTER, SET_BASE_LAYER, SET_PLATES_VISIBLE, SET_ANIMATION_ENABLED, SET_MODE,
  SET_CROSS_SECTION_POINT, MARK_2D_VIEW_MODIFIED, MARK_3D_VIEW_MODIFIED
} from '../actions'
import { MIN_TIME, MAX_TIME } from '../earthquake-properties'

const INITIAL_DOWNLOAD_STATUS = Map({
  requestsInProgress: 0
})
function downloadStatus(state = INITIAL_DOWNLOAD_STATUS, action) {
  switch (action.type) {
    case REQUEST_DATA:
      return state.set('requestsInProgress', state.get('requestsInProgress') + 1)
    case RECEIVE_DATA:
      return state.set('requestsInProgress', state.get('requestsInProgress') - 1)
    case RECEIVE_ERROR:
      return state.set('requestsInProgress', state.get('requestsInProgress') - 1)
    default:
      return state
  }
}

function data(state = [], action) {
  switch (action.type) {
    case RESET_EARTHQUAKES:
      return []
    case RECEIVE_EARTHQUAKES:
      // Don't use ImmutableJS - this data is too big and it would also affect filtering time.
      const newData = state.concat(action.response)
      window.earthquakes = newData
      return newData
    default:
      return state
  }
}

const INITIAL_FILTERS = Map({
  minMag: 5,
  maxMag: 10,
  minTime: MIN_TIME,
  maxTime: MIN_TIME,
  minTimeLimit: MIN_TIME,
  maxTimeLimit: MAX_TIME,
  crossSection: false
})
function filters(state = INITIAL_FILTERS, action) {
  switch (action.type) {
    case SET_FILTER:
      return state.set(action.name, action.value)
    default:
      return state
  }
}

const INITIAL_LAYERS = Map({
  base: 'satellite', // or 'street' or 'earthquake-density'
  plates: false
})
function layers(state = INITIAL_LAYERS, action) {
  switch (action.type) {
    case SET_BASE_LAYER:
      return state.set('base', action.value)
    case SET_PLATES_VISIBLE:
      return state.set('plates', action.value)
    default:
      return state;
  }
}

function animationEnabled(state = false, action) {
  switch (action.type) {
    case SET_ANIMATION_ENABLED:
      return action.value
    default:
      return state;
  }
}

// '2d', 'cross-section', '3d'
function mode(state = '2d', action) {
  switch (action.type) {
    case SET_MODE:
      return action.value
    default:
      return state;
  }
}

function crossSectionPoints(state = List(), action) {
  switch (action.type) {
    case SET_CROSS_SECTION_POINT:
      return state.set(action.index, action.latLng)
    default:
      return state;
  }
}

function changedViews(state = Set(), action) {
  switch (action.type) {
    case MARK_2D_VIEW_MODIFIED:
      return action.value ? state.add('2d') : state.remove('2d')
    case MARK_3D_VIEW_MODIFIED:
      return action.value ? state.add('3d') : state.remove('3d')
    default:
      return state;
  }
}

export default function reducer(state = Map(), action) {
  return state.set('layers', layers(state.get('layers'), action))
              .set('animationEnabled', animationEnabled(state.get('animationEnabled'), action))
              .set('mode', mode(state.get('mode'), action))
              .set('crossSectionPoints', crossSectionPoints(state.get('crossSectionPoints'), action))
              .set('data', data(state.get('data'), action))
              .set('filters', filters(state.get('filters'), action))
              .set('changedViews', changedViews(state.get('changedViews'), action))
              .set('downloadStatus', downloadStatus(state.get('downloadStatus'), action))
}
