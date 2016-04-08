import Immutable, { Map, List } from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, RECEIVE_EARTHQUAKES, RECEIVE_REGION, RECEIVE_ERROR, INVALIDATE_DATA,
  SET_FILTER, SET_BASE_LAYER, SET_PLATES_VISIBLE, SET_ANIMATION_ENABLED, UPDATE_REGIONS_HISTORY, SET_MODE,
  SET_CROSS_SECTION_POINT
} from '../actions'
import { swapCoords, sortByTime, polygonToPoint, timeRange } from '../data/helpers'

function dataStatus(state = Map(), action) {
  switch (action.type) {
    case INVALIDATE_DATA:
      return state.set('didInvalidate', true)
    case REQUEST_DATA:
      return state.set('isFetching', true)
    case RECEIVE_DATA:
      return state.set('isFetching', false)
                  .set('didInvalidate', false)
                  .set('error', null)
                  .set('lastUpdated', action.receivedAt)
    case RECEIVE_ERROR:
      return state.set('isFetching', false)
                  .set('didInvalidate', false)
                  .set('error', action.response)
                  .set('lastUpdated', action.receivedAt)
    default:
      return state
  }
}

function region(state = Map(), action) {
  switch (action.type) {
    case RECEIVE_REGION:
      const data = action.response
      const bounds = [
        [data.minLatitude, data.minLongitude],
        [data.maxLatitude, data.maxLongitude]
      ]
      return state.set('bounds', bounds)
                  .set('subregions', polygonToPoint(data.features || []))
                  .set('restricted', data.restrictedView)
    default:
      return state
  }
}

function data(state = [], action) {
  switch (action.type) {
    case RECEIVE_EARTHQUAKES:
      // Don't use ImmutableJS - this data is too big and it would also affect filtering time.
      return sortByTime(swapCoords(action.response.features))
    case RECEIVE_REGION:
      // Cleanup earthquakes when region is changed, as sometimes the same earthquake (with the same ID)
      // might have different coordinates, depending on region. It would confuse rendering components.
      return []
    default:
      return state
  }
}

const INITIAL_FILTERS = Map({
  minMag: 5,
  maxMag: 10,
  minTime: 0,
  maxTime: 0,
  minTimeLimit: 0,
  maxTimeLimit: 0,
  crossSection: false
})
function filters(state = INITIAL_FILTERS, action) {
  switch (action.type) {
    case RECEIVE_EARTHQUAKES:
      const time = timeRange(action.response.features)
      // Extend time range a bit, so we don't filter out the first and the last earthquake.
      time.min -= 1
      time.max += 1
      return state.set('minTime', time.min)
                  // It's intentional, no earthquakes should be visible when they're loaded.
                  .set('maxTime', time.min)
                  .set('minTimeLimit', time.min)
                  .set('maxTimeLimit', time.max)
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
    case RECEIVE_REGION:
      // Disable animation when user changes region.
      return false
    default:
      return state;
  }
}

function regionsHistory(state = List(), action) {
  switch (action.type) {
    case UPDATE_REGIONS_HISTORY:
      const indexOfPath = state.indexOf(action.path)
      if (indexOfPath !== -1) {
        // If path is in the history, remove all the newer paths (we're going back to the prev region).
        return state.slice(0, indexOfPath + 1)
      } else {
        // Otherwise, just append path to the history (we're going to the subregion).
        return state.push(action.path)
      }
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

export default function reducer(state = Map(), action) {
  return state.set('dataStatus', dataStatus(state.get('dataStatus'), action))
              .set('region', region(state.get('region'), action))
              .set('layers', layers(state.get('layers'), action))
              .set('animationEnabled', animationEnabled(state.get('animationEnabled'), action))
              .set('regionsHistory', regionsHistory(state.get('regionsHistory'), action))
              .set('mode', mode(state.get('mode'), action))
              .set('crossSectionPoints', crossSectionPoints(state.get('crossSectionPoints'), action))
              .set('data', data(state.get('data'), action))
              .set('filters', filters(state.get('filters'), action))
}
