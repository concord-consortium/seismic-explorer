import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-rotatedmarker'
import 'leaflet-plugins/layer/Marker.Rotate.js'
import plateMovementData from '../data/plate-arrows'

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
    iconSize: [20, 50]
  }),
  transformMedium: L.icon({
    iconUrl: transformArrowsMediumPng,
    iconSize: [20, 77]
  }),
  transformLong: L.icon({
    iconUrl: transformArrowsLongPng,
    iconSize: [20, 100]
  }),
  convergentShort: L.icon({
    iconUrl: arrowShortPng,
    iconSize: [20, 25],
    iconAnchor: [10, 25]
  }),
  convergentMedium: L.icon({
    iconUrl: arrowMediumPng,
    iconSize: [20, 38.5],
    iconAnchor: [10, 38.5]
  }),
  convergentLong: L.icon({
    iconUrl: arrowLongPng,
    iconSize: [20, 60],
    iconAnchor: [10, 60]
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

function arrowMaker (data) {
  const { idx, lat, lng, angle, info, velocity, type } = data
  const infoIconAndPopup = new L.Marker([lat, lng], {icon: infoIcon}).bindPopup(
    `
    <div>Index: ${idx}</div>
    <div>Velocity: ${velocity} mm/year</div>
    <div>Info: ${info}</div>
    <div>Type: ${type}</div>
    `
  )
  const arrows = new L.Marker([lat, lng], {
    icon: getArrowIcon(type, velocity),
    rotationAngle: angle,
    rotationOrigin: type === 'convergent' ? 'bottom center' : 'center center'
  })
  return new L.LayerGroup([
    arrows, infoIconAndPopup
  ])
}

export class PlatesArrowsLayer extends MapLayer {
  createLeafletElement (props) {
    return new L.LayerGroup(plateMovementData.map(data => arrowMaker(data)))
  }
}
