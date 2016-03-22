import Immutable, { Map } from 'immutable'
import {
  REQUEST_DATA, RECEIVE_DATA, RECEIVE_EARTHQUAKES, RECEIVE_REGION, RECEIVE_ERROR, INVALIDATE_DATA,
  SET_MIN_MAG, SET_MAX_MAG, SET_MIN_TIME, SET_MAX_TIME, SET_BASE_LAYER, SET_PLATES_VISIBLE
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

function region(state = Map(), action) {
  switch (action.type) {
    case RECEIVE_REGION:
      const data = action.response
      const bounds = [
        [data.minLatitude, data.minLongitude],
        [data.maxLatitude, data.maxLongitude]
      ]
      return state.set('bounds', bounds)
                  .set('subregions', polygonToPoint(data.features))
                  .set('restricted', data.restrictedView)
    default:
      return state
  }
}

function data(state = null, action) {
  switch (action.type) {
    case RECEIVE_EARTHQUAKES:
      // Don't use ImmutableJS - this data is too big and it would also affect filtering time.
      // .revert() to sort earthquakes by time.
      return swapCoords(action.response.features).reverse()
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
  minTime: -Infinity,
  maxTime: Infinity
})
function filters(state = INITIAL_FILTERS, action) {
  switch (action.type) {
    case RECEIVE_EARTHQUAKES:
      const times = action.response.features.map(eq => eq.properties.time)
      return state.set('minTime', Math.min(...times))
                  .set('maxTime', Math.max(...times))
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
              .set('region', region(state.get('region'), action))
              .set('data', newData)
              .set('filters', newFilters)
              .set('layers', layers(state.get('layers'), action))
              // Update filtered earthquakes only if data or filters have been changed.
              // Otherwise, reuse old data. It ensures that we won't update React components when it's not needed.
              .set('filteredEarthquakes', newData && filtersOrDataUpdated ? calcEarthquakes(newData, newFilters) : state.get('filteredEarthquakes'))
}

const calcEarthquakes = (data, filters) => {
  const minMag = filters.get('minMag')
  const maxMag = filters.get('maxMag')
  const minTime = filters.get('minTime')
  const maxTime = filters.get('maxTime')
  console.time('eq filtering')
  // Two important notes:
  // - Make sure that result is always a new Array instance, so pure components can detect it's been changed.
  // - Yes, I don't copy and do mutate data.features elements. It's been done due to performance reasons.
  const result = data.map(eq => {
    const props = eq.properties
    eq.visible = props.mag > minMag &&
                 props.mag < maxMag &&
                 props.time > minTime &&
                 props.time < maxTime
    return eq
  })
  console.timeEnd('eq filtering')
  return result
}

const swapCoords = (data) => {
  data.forEach(point => {
    const tmp = point.geometry.coordinates[0]
    point.geometry.coordinates[0] = point.geometry.coordinates[1]
    point.geometry.coordinates[1] = tmp
  })
  return data
}

const polygonToPoint = (data) => {
  data.forEach(polygon => {
    const coords = polygon.geometry.coordinates[0]
    let avgLat = 0
    let avgLong = 0
    coords.forEach(c => {
      avgLong += c[0]
      avgLat += c[1]
    })
    polygon.geometry.coordinates[0] = avgLat / coords.length
    polygon.geometry.coordinates[1] = avgLong / coords.length
    polygon.geometry.type = 'Point'
  })
  return data
}
