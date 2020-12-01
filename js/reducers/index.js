import { Map, List, Set } from 'immutable'
import {
  SET_MAP_STATUS,
  REQUEST_DATA,
  RESET_EARTHQUAKES,
  RECEIVE_EARTHQUAKES,
  RESET_ERUPTIONS,
  RECEIVE_ERUPTIONS,
  RECEIVE_DATA,
  RECEIVE_ERROR,
  SET_FILTER,
  SET_BASE_LAYER,
  SET_PLATE_BOUNDARIES_VISIBLE,
  SET_PLATE_NAMES_VISIBLE,
  SET_CONTINENT_OCEAN_NAMES_VISIBLE,
  SET_ANIMATION_ENABLED,
  SET_MODE,
  SET_CROSS_SECTION_POINT,
  MARK_2D_VIEW_MODIFIED,
  MARK_3D_VIEW_MODIFIED,
  SET_EARTHQUAKES_VISIBLE,
  SET_VOLCANOES_VISIBLE,
  SET_ERUPTIONS_VISIBLE,
  SET_PLATE_MOVEMENT_VISIBLE,
  SET_PLATE_ARROWS_VISIBLE,
  SET_PIN,
  UPDATE_PIN
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

const INITIAL_MAP_STATUS = Map({
  region: {
    minLng: 0,
    maxLng: 0,
    minLat: 0,
    maxLat: 0
  },
  zoom: 0
})

function mapStatus (state = INITIAL_MAP_STATUS, action) {
  switch (action.type) {
    case SET_MAP_STATUS:
      return state
        .set('region', action.region)
        .set('zoom', action.zoom)
    default:
      return state
  }
}

const INITIAL_DATA = Map({
  earthquakes: [],
  magnitudeCutOff: 0,
  eruptions: [],
  volcanoes: []
})

function data (state = INITIAL_DATA, action) {
  switch (action.type) {
    case RESET_EARTHQUAKES:
      return state.set('earthquakes', []).set('magnitudeCutOff', 0)
    case RESET_ERUPTIONS:
      return state.set('eruptions', [])
    case RECEIVE_EARTHQUAKES:
      // Select max minimal magnitude among the tiles and remove all the earthquakes weaker than it.
      // It ensures that displayed data is consistent and there're no visual "holes" in earthquakes layer.
      const newCutOff = Math.max(action.response.magnitudeCutOff, state.get('magnitudeCutOff'))
      // Don't use ImmutableJS - this data is too big and it would also affect filtering time.
      const earthquakes = state.get('earthquakes')
        .concat(action.response.earthquakes)
        .filter(e => e.properties.mag >= newCutOff)
      return state.set('earthquakes', earthquakes).set('magnitudeCutOff', newCutOff)
    case RECEIVE_ERUPTIONS:
      const eruptions = state.get('eruptions').concat(action.response.eruptions)
      const volcanoes = state.get('volcanoes').concat(action.response.volcanoes)
      return state.set('eruptions', eruptions).set('volcanoes', volcanoes)
    default:
      return state
  }
}

const INITIAL_FILTERS = Map({
  minMag: 0,
  maxMag: 10,
  initialStartTime: config.startTime, // the start & end time won't change, caching them here for easier access in bottom controls when adjusting time slider
  initialEndTime: config.endTime,
  minTime: config.startTime,
  maxTime: config.earthquakesDisplayAllOnStart ? config.endTime : config.startTime,
  playbackMaxTime: config.endTime,
  minTimeLimit: config.startTime,
  maxTimeLimit: config.endTime,
  crossSection: false,
  historicEruptions: config.showHistoricEruptions
})

function filters (state = INITIAL_FILTERS, action) {
  switch (action.type) {
    case SET_FILTER:
      if (action.name === 'maxTime') {
        // exposing this value to the window to help update webgl sprites (eruptions when changing active -> inactive)
        Window.currentSimulationTime = new Date(action.value)
      }
      return state.set(action.name, action.value)
    default:
      return state
  }
}

const INITIAL_LAYERS = Map({
  base: config.mapStyle,
  plateBoundaries: config.plateBoundariesVisible,
  plateNames: config.plateNamesVisible,
  continentOceanNames: config.continentOceanNamesVisible,
  earthquakes: config.earthquakesVisible,
  eruptions: config.eruptionsVisible,
  volcanoes: config.volcanoesVisible,
  plateMovement: config.detailedPlateMovementVisible,
  plateArrows: config.plateMovementVisible,
  showUI: config.showUserInterface
})

function layers (state = INITIAL_LAYERS, action) {
  switch (action.type) {
    case SET_BASE_LAYER:
      return state.set('base', action.value)
    case SET_PLATE_BOUNDARIES_VISIBLE:
      return state.set('plateBoundaries', action.value)
    case SET_PLATE_NAMES_VISIBLE:
      return state.set('plateNames', action.value)
    case SET_CONTINENT_OCEAN_NAMES_VISIBLE:
      return state.set('continentOceanNames', action.value)
    case SET_EARTHQUAKES_VISIBLE:
      return state.set('earthquakes', action.value)
    case SET_VOLCANOES_VISIBLE:
      return state.set('volcanoes', action.value)
    case SET_ERUPTIONS_VISIBLE:
      return state.set('eruptions', action.value)
    case SET_PLATE_MOVEMENT_VISIBLE:
      return state.set('plateMovement', action.value)
    case SET_PLATE_ARROWS_VISIBLE:
      return state.set('plateArrows', action.value)
    default:
      return state
  }
}
const pinList = config.pins.map(data => ({ lat: data[0], lng: data[1], label: data[2], marker: undefined }))

const INITIAL_PINS = List(pinList)

function pins (state = INITIAL_PINS, action) {
  switch (action.type) {
    case SET_PIN:
      return state.set(action.index, { lat: action.latLng.lat, lng: action.latLng.lng, label: action.label, marker: undefined })
    case UPDATE_PIN:
      const updatedPinList = state.map((item, index) => {
        if (index !== action.index) {
          return item
        }
        // else this pin was moved / marker reference updated. Preserve label
        if (action.marker) {
          return { lat: action.latLng.lat, lng: action.latLng.lng, label: item.label, marker: action.marker }
        } else {
          // use existing marker reference
          return { lat: action.latLng.lat, lng: action.latLng.lng, label: item.label, marker: item.marker }
        }
      })
      return updatedPinList
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
  return state
    .set('mapStatus', mapStatus(state.get('mapStatus'), action))
    .set('layers', layers(state.get('layers'), action))
    .set('animationEnabled', animationEnabled(state.get('animationEnabled'), action))
    .set('mode', mode(state.get('mode'), action))
    .set('crossSectionPoints', crossSectionPoints(state.get('crossSectionPoints'), action))
    .set('data', data(state.get('data'), action))
    .set('filters', filters(state.get('filters'), action))
    .set('changedViews', changedViews(state.get('changedViews'), action))
    .set('downloadStatus', downloadStatus(state.get('downloadStatus'), action))
    .set('pins', pins(state.get('pins'), action))
}
