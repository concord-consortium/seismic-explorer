import { Map, List, Set } from 'immutable'
import {
  REQUEST_DATA, RESET_EARTHQUAKES, RECEIVE_EARTHQUAKES, RECEIVE_DATA, RECEIVE_ERROR,
  SET_FILTER, SET_BASE_LAYER, SET_PLATES_VISIBLE, SET_ANIMATION_ENABLED, SET_MODE,
  SET_CROSS_SECTION_POINT, MARK_2D_VIEW_MODIFIED, MARK_3D_VIEW_MODIFIED, SET_EARTHQUAKES_VISIBLE, SET_VOLCANOES_VISIBLE, SET_PLATE_MOVEMENT_VISIBLE, SET_PLATE_ARROWS_VISIBLE
} from '../actions'
import config from '../config'

const INITIAL_DOWNLOAD_STATUS = Map({
  requestsInProgress: 0
})
function downloadStatus (state = INITIAL_DOWNLOAD_STATUS, action) {
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

const INITIAL_DATA = Map({
  earthquakes: [],
  magnitudeCutOff: 0
})
function data (state = INITIAL_DATA, action) {
  switch (action.type) {
    case RESET_EARTHQUAKES:
      return INITIAL_DATA
    case RECEIVE_EARTHQUAKES:
      // Select max minimal magnitude among the tiles and remove all the earthquakes weaker than it.
      // It ensures that displayed data is consistent and there're no visual "holes" in earthquakes layer.
      const newCutOff = Math.max(action.response.magnitudeCutOff, state.get('magnitudeCutOff'))
      // Don't use ImmutableJS - this data is too big and it would also affect filtering time.
      const earthquakes = state.get('earthquakes')
        .concat(action.response.earthquakes)
        .filter(e => e.properties.mag >= newCutOff)
      return state.set('earthquakes', earthquakes)
                  .set('magnitudeCutOff', newCutOff)
    default:
      return state
  }
}

const INITIAL_FILTERS = Map({
  minMag: 0,
  maxMag: 10,
  minTime: config.startTime,
  maxTime: config.endTime,
  minTimeLimit: config.startTime,
  maxTimeLimit: config.endTime,
  animEndPoint: config.startTime,
  crossSection: false
})
function filters (state = INITIAL_FILTERS, action) {
  switch (action.type) {
    case SET_FILTER:
      return state.set(action.name, action.value)
    default:
      return state
  }
}

const INITIAL_LAYERS = Map({
  base: config.mapStyle,
  plates: false,
  earthquakes: false,
  volcanoes: false,
  platemovement: false,
  platearrows: false
})
function layers (state = INITIAL_LAYERS, action) {
  switch (action.type) {
    case SET_BASE_LAYER:
      return state.set('base', action.value)
    case SET_PLATES_VISIBLE:
      return state.set('plates', action.value)
    case SET_EARTHQUAKES_VISIBLE:
      return state.set('earthquakes', action.value)
    case SET_VOLCANOES_VISIBLE:
      return state.set('volcanoes', action.value)
    case SET_PLATE_MOVEMENT_VISIBLE:
      return state.set('platemovement', action.value)
    case SET_PLATE_ARROWS_VISIBLE:
      return state.set('platearrows', action.value)
    default:
      return state
  }
}

function animationEnabled (state = false, action) {
  switch (action.type) {
    case SET_ANIMATION_ENABLED:
      return action.value
    default:
      return state
  }
}

// '2d', 'cross-section', '3d'
function mode (state = '2d', action) {
  switch (action.type) {
    case SET_MODE:
      return action.value
    default:
      return state
  }
}

function crossSectionPoints (state = List(), action) {
  switch (action.type) {
    case SET_CROSS_SECTION_POINT:
      return state.set(action.index, action.latLng)
    default:
      return state
  }
}

function changedViews (state = Set(), action) {
  switch (action.type) {
    case MARK_2D_VIEW_MODIFIED:
      return action.value ? state.add('2d') : state.remove('2d')
    case MARK_3D_VIEW_MODIFIED:
      return action.value ? state.add('3d') : state.remove('3d')
    default:
      return state
  }
}

export default function reducer (state = Map(), action) {
  return state.set('layers', layers(state.get('layers'), action))
              .set('animationEnabled', animationEnabled(state.get('animationEnabled'), action))
              .set('mode', mode(state.get('mode'), action))
              .set('crossSectionPoints', crossSectionPoints(state.get('crossSectionPoints'), action))
              .set('data', data(state.get('data'), action))
              .set('filters', filters(state.get('filters'), action))
              .set('changedViews', changedViews(state.get('changedViews'), action))
              .set('downloadStatus', downloadStatus(state.get('downloadStatus'), action))
}
