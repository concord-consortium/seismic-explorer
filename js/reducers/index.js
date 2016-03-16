import Immutable, { Map, Set } from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, RECEIVE_ERROR, INVALIDATE_DATA,
  SET_MIN_MAG, SET_MAX_MAG, SET_MIN_TIME, SET_MAX_TIME
} from '../actions'

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


function data(state = null, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      // Don't use ImmutableJS - this data is too big and it would also affect filtering time.
      return Object.freeze(swapCoords(action.response))
    default:
      return state
  }
}

const INITIAL_FILTERS = Map({
  minMag: 0,
  maxMag: 10,
  minTime: -347155200000,
  maxTime: 1458142681658
})
function filters(state = INITIAL_FILTERS, action) {
  switch (action.type) {
    case SET_MIN_MAG:
      return state.set('minMag', action.value)
    case SET_MAX_MAG:
      return state.set('maxMag', action.value)
    case SET_MIN_TIME:
      return state.set('minTime', action.value)
    case SET_MAX_TIME:
      return state.set('maxTime', action.value)
    default:
      return state
  }
}

const INITIAL_STATE = Map({
  filteredEarthquakes: []
})
export default function reducer(state = INITIAL_STATE, action) {
  const oldData = state.get('data')
  const newData = data(oldData, action)
  const oldFilters = state.get('filters')
  const newFilters = filters(oldFilters, action)
  // We can use simple comparison as we use ImmutableJS structures.
  const filtersOrDataUpdated = oldData !== newData || oldFilters !== newFilters
  return state.set('dataStatus', dataStatus(state.get('dataStatus'), action))
              .set('data', newData)
              .set('filters', newFilters)
              // Update filtered earthquakes only if data or filters have been changed.
              // Otherwise, reuse old data. It ensures that we won't update React components when it's not needed.
              .set('filteredEarthquakes', newData && filtersOrDataUpdated ? calcEarthquakes2(newData, newFilters) : state.get('filteredEarthquakes'))
}

const calcEarthquakes = (data, filters) => {
  const minMag = filters.get('minMag')
  const maxMag = filters.get('maxMag')
  const minTime = filters.get('minTime')
  const maxTime = filters.get('maxTime')
  console.time('eq filtering')
  const result = data.features.map(eq => {
    const props = eq.properties
    eq.hidden = !(props.mag > minMag &&
                  props.mag < maxMag &&
                  props.time > minTime &&
                  props.time < maxTime)
    return eq
  })
  console.timeEnd('eq filtering')
  return result
}

const calcEarthquakes2 = (data, filters) => {
  const minMag = filters.get('minMag')
  const maxMag = filters.get('maxMag')
  const minTime = filters.get('minTime')
  const maxTime = filters.get('maxTime')
  console.time('eq filtering')
  const result = data.features.filter(eq => {
    const props = eq.properties
    return props.mag > minMag &&
           props.mag < maxMag &&
           props.time > minTime &&
           props.time < maxTime
  })
  console.timeEnd('eq filtering')
  return result
}

const swapCoords = (data) => {
  data.features.forEach(eq => {
    const tmp = eq.geometry.coordinates[0]
    eq.geometry.coordinates[0] = eq.geometry.coordinates[1]
    eq.geometry.coordinates[1] = tmp
  })
  return data
}
