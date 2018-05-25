import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-rotatedmarker'
import 'leaflet-plugins/layer/Marker.Rotate.js'
import plateMovementData from '../data/plate-arrows'
import mapAreaMultipliers from '../core/map-area-multipliers'

import infoIconPng from '../../images/plates-info.png'
import divArrowsShortPng from '../../images/div-arrows-short.png'
import divArrowsMediumPng from '../../images/div-arrows-medium.png'
import divArrowsLongPng from '../../images/div-arrows-long.png'
import transformArrowsShortPng from '../../images/transform-arrows-short.png'
import transformArrowsMediumPng from '../../images/transform-arrows-medium.png'
import transformArrowsLongPng from '../../images/transform-arrows-long.png'
import arrowShortPng from '../../images/arrow-short.png'
import arrowMediumPng from '../../images/arrow-medium.png'
import arrowLongPng from '../../images/arrow-long.png'

const infoIcon = L.icon({
  iconUrl: infoIconPng,
  iconSize: [19, 19]
})

const arrows = {
  divergentShort: L.icon({
    iconUrl: divArrowsShortPng,
    iconSize: [20, 50]
  }),
  divergentMedium: L.icon({
    iconUrl: divArrowsMediumPng,
    iconSize: [20, 77]
  }),
  divergentLong: L.icon({
    iconUrl: divArrowsLongPng,
    iconSize: [20, 100]
  }),
  transformShort: L.icon({
    iconUrl: transformArrowsShortPng,
    iconSize: [27, 55]
  }),
  transformMedium: L.icon({
    iconUrl: transformArrowsMediumPng,
    iconSize: [27, 77]
  }),
  transformLong: L.icon({
    iconUrl: transformArrowsLongPng,
    iconSize: [27, 100]
  }),
  convergentShort: L.icon({
    iconUrl: arrowShortPng,
    iconSize: [20, 35],
    iconAnchor: [10, 0]
  }),
  convergentMedium: L.icon({
    iconUrl: arrowMediumPng,
    iconSize: [20, 51],
    iconAnchor: [10, 0]
  }),
  convergentLong: L.icon({
    iconUrl: arrowLongPng,
    iconSize: [20, 70],
    iconAnchor: [10, 0]
  })
}

const SMALL_ARROW_MAX_VELOCITY = 30
const MEDIUM_ARROW_MAX_VELOCITY = 60

function getArrowIcon (type, velocity) {
  let size = 'Long'
  if (velocity < SMALL_ARROW_MAX_VELOCITY) {
    size = 'Short'
  } else if (velocity < MEDIUM_ARROW_MAX_VELOCITY) {
    size = 'Medium'
  }
  return arrows[type + size]
}

const _cachedArrows = {}
function arrowMaker (data) {
  const { idx, lat, lng, angle, info, velocity, type } = data
  const key = `${lat}:${lng}`
  if (!_cachedArrows[key]) {
    const infoIconAndPopup = new L.Marker([lat, lng], {icon: infoIcon})
    const arrows = new L.Marker([lat, lng], {
      icon: getArrowIcon(type, velocity),
      rotationAngle: angle,
      rotationOrigin: type === 'convergent' ? 'top center' : 'center center'
    })
    const group = new L.FeatureGroup([
      arrows, infoIconAndPopup
    ]).bindPopup(`
    <div>Plate boundary (${idx})</div>
    <div>Velocity: <b>${velocity} mm/year</b></div>
    <div>Info: <b>${info}</b></div>
    <div>Type: <b>${type}</b></div>
  `)
    group.coords = {lat, lng}
    _cachedArrows[key] = group
  }
  return _cachedArrows[key]
}

export default class PlateArrowsLayer extends MapLayer {
  createLeafletElement (props) {
    this.group = new L.FeatureGroup()
    this.visibleArrows = {}
    this.updateLeafletElement(null, props)
    return this.group
  }

  updateLeafletElement (fromProps, toProps) {
    const { mapRegion } = toProps
    const areas = mapAreaMultipliers(mapRegion.minLng, mapRegion.maxLng)
    areas.forEach(multiplier => {
      plateMovementData.map(data => {
        const dataCopy = Object.assign({}, data)
        dataCopy.lng += multiplier * 360
        const lng = dataCopy.lng
        const key = `${dataCopy.lat}:${lng}`
        if (lng >= mapRegion.minLng && lng <= mapRegion.maxLng && !this.visibleArrows[key]) {
          const arrow = arrowMaker(dataCopy)
          this.group.addLayer(arrow)
          this.visibleArrows[key] = arrow
        }
      })
    })
    Object.keys(this.visibleArrows).forEach(key => {
      const arrow = this.visibleArrows[key]
      const { lat, lng } = arrow.coords
      if (lat > mapRegion.maxLat || lat < mapRegion.minLat || lng > mapRegion.maxLng || lng < mapRegion.minLng) {
        this.group.removeLayer(arrow)
        delete this.visibleArrows[key]
      }
    })
  }
}
