import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-plugins/layer/Marker.Rotate.js'

const arrowIcon = L.icon({
  iconUrl: 'plates-info.png',
  iconAnchor: [12, 12],
  popupAnchor: [0, 0]
})

const arrowHeadToBodyRatio = 0.25
const arrowAngleOffset = 0.2
const smallArrowMax = 30
const mediumArrowMax = 60

function markerMaker (posX, posY, angle, magnitude) {
  let arrowColor

  let rad = (angle - 90) * (Math.PI / 180)

  if (magnitude === 10) {
    arrowColor = '#00ffff'
  } else if (magnitude === 15) {
    arrowColor = '#ffff00'
  } else {
    arrowColor = '#ffaa00'
  }

  let arrowHeadLength = magnitude * arrowHeadToBodyRatio

  let latlngs = [[posX, posY],
                [posX + magnitude * Math.cos(rad), posY - magnitude * Math.sin(rad)],
                [posX + (magnitude - arrowHeadLength) * Math.cos(rad + arrowAngleOffset), posY - (magnitude - arrowHeadLength) * Math.sin(rad + arrowAngleOffset)],
                [posX + (magnitude - arrowHeadLength) * Math.cos(rad - arrowAngleOffset), posY - (magnitude - arrowHeadLength) * Math.sin(rad - arrowAngleOffset)],
                [posX + magnitude * Math.cos(rad), posY - magnitude * Math.sin(rad)]]
  return L.polygon(latlngs, {interactive: true, color: arrowColor, opacity: 1, weight: Math.abs(magnitude) / 15 + 1})
}

function getFixedMag (magnitude) {
  if (magnitude < smallArrowMax) {
    magnitude = Math.sign(magnitude) * 10
  } else if (magnitude < mediumArrowMax) {
    magnitude = Math.sign(magnitude) * 15
  } else {
    magnitude = Math.sign(magnitude) * 20
  }
  return magnitude
}

function divergeArrowMaker (posX, posY, angle, magnitude) {
  let marker = new L.Marker([posX, posY], {icon: arrowIcon}).bindPopup('<b>' + magnitude + ' mm/yr</b>')
  magnitude = getFixedMag(magnitude)

  return new L.LayerGroup([
    markerMaker(posX, posY, angle, magnitude),
    markerMaker(posX, posY, 180 + angle, magnitude),
    marker
  ])
}

function convergeArrowMaker (posX, posY, angle, magnitude) {
  let actualMag = magnitude
  magnitude = getFixedMag(magnitude)

  let rad = (angle - 180) * (Math.PI / 180)
  posX += (magnitude) * Math.sin(rad)
  posY += (magnitude) * Math.cos(rad)

  let arrow1 = markerMaker(posX, posY, angle, magnitude)

  let marker = new L.Marker([posX, posY], {icon: arrowIcon}).bindPopup('<b>' + actualMag + ' mm/yr</b>')

  return new L.LayerGroup([
    arrow1, marker
  ])
}

function transformArrowMaker (posX, posY, angle, magnitude) {
  let marker = new L.Marker([posX, posY], {icon: arrowIcon}).bindPopup('<b>' + magnitude + ' mm/yr</b>')

  magnitude = getFixedMag(magnitude)
  let rad = (angle - 180) * (Math.PI / 180)
  posX += (magnitude / 2) * Math.cos(rad - Math.PI / 3)
  posY -= (magnitude / 2) * Math.sin(rad - Math.PI / 3)

  let arrow1 = markerMaker(posX, posY, angle, magnitude)

  posX -= (magnitude / 2) * 2 * Math.cos(rad - Math.PI / 3)
  posY += (magnitude / 2) * 2 * Math.sin(rad - Math.PI / 3)

  let arrow2 = markerMaker(posX, posY, angle + 180, magnitude)

  return new L.LayerGroup([
    arrow1, arrow2, marker
  ])
}

function arrowLayerCreator () {
  let layer = new L.LayerGroup([
    transformArrowMaker(55.6776, 131.4844, -15, 9),
    transformArrowMaker(37.2303, -122.1021, 140, 40),
    divergeArrowMaker(28.1495, -43.9453, -14, 23),
    divergeArrowMaker(-25.6415, -14.0625, 4, 35),
    divergeArrowMaker(-52.6964, 19.3359, 50, 14),
    divergeArrowMaker(8.4072, 58.7109, 36, 27),
    divergeArrowMaker(-18.6462, 65.3906, 17, 44),
    divergeArrowMaker(9.2322, -104.3262, 3, 108),
    divergeArrowMaker(1.0107, -89.6265, 85, 70),
    divergeArrowMaker(-18.4796, -113.3789, -3, 156),
    divergeArrowMaker(-47.1598, -113.0273, -10, 94),
    divergeArrowMaker(-39.7410, -91.5381, 5, 59),
    divergeArrowMaker(48.1368, -27.7075, 5, 23),
    divergeArrowMaker(-35.4070, 53.8330, 95, 14),
    divergeArrowMaker(-43.3252, 91.7578, 65, 72),
    convergeArrowMaker(46.1849, -125.7108, 20, 39),
    convergeArrowMaker(49.9426, -179.2607, 110, 73),
    convergeArrowMaker(55.3399, -153.0634, 110, 58),
    convergeArrowMaker(-16.7882, -171.3108, 170, 237),
    convergeArrowMaker(-32.7086, -176.6770, 170, 88),
    convergeArrowMaker(15.2753, -99.5924, 60, 61),
    convergeArrowMaker(-50.1743, -77.0623, 4, 20),
    convergeArrowMaker(-19.5707, -72.6946, 15, 79),
    convergeArrowMaker(15.2154, -58.6994, 195, 18),
    convergeArrowMaker(-57.2585, -23.2260, 200, 78),
    convergeArrowMaker(34.4465, 23.9354, 115, 9),
    convergeArrowMaker(32.8410, 46.4989, 100, 27),
    convergeArrowMaker(28.4763, 79.7472, 80, 48),
    convergeArrowMaker(-9.0394, 103.9865, 80, 70),
    convergeArrowMaker(20.4039, 122.8402, 165, 94),
    convergeArrowMaker(49.4326, 159.2444, 140, 78),
    convergeArrowMaker(39.2460, 145.2241, 165, 92),
    convergeArrowMaker(16.1708, 148.7026, 180, 63),
    convergeArrowMaker(-6.4011, 140.8744, 25, 106),
    convergeArrowMaker(-22.4161, 167.9387, 30, 123)
  ])
  return layer
}

export class PlatesArrowsLayer extends MapLayer {
  createLeafletElement (props) {
    return arrowLayerCreator()
  }
}
