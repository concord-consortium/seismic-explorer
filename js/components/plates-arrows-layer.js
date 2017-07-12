import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import 'imports?L=leaflet!leaflet-plugins/layer/Marker.Rotate.js'

const arrowHeadToBodyRatio = 0.25
const arrowAngleOffset = 0.2
function markerMaker(posX, posY, angle, magnitude)
{
  var arrowHeadLength = magnitude * arrowHeadToBodyRatio
  var trigLength = arrowHeadLength * Math.cos(angle)

  var latlngs = [[posX, posY],
                [posX + magnitude * Math.cos(angle),posY + magnitude * Math.sin(angle)],
                [posX + (magnitude - arrowHeadLength) * Math.cos(angle + arrowAngleOffset), posY + (magnitude - arrowHeadLength) * Math.sin(angle + arrowAngleOffset)],
                [posX + (magnitude - arrowHeadLength) * Math.cos(angle - arrowAngleOffset), posY + (magnitude - arrowHeadLength) * Math.sin(angle - arrowAngleOffset)],
                [posX + magnitude * Math.cos(angle),posY + magnitude * Math.sin(angle)]]
  var polyline = L.polyline(latlngs, {color: 'red', opacity:1});

  return polyline
}

function dualArrowMaker(posX, posY, angle, magnitude)
{
  return new L.LayerGroup([
    markerMaker(posX, posY, angle, magnitude),
    markerMaker(posX, posY, angle, -1 * magnitude)
  ])
}

function arrowLayerCreator()
{
  var layer = new L.LayerGroup([
    dualArrowMaker(0, 0, Math.random() * 2 * Math.PI, Math.random() * 8 + 2),
    dualArrowMaker(0, 0, Math.random() * 2 * Math.PI, Math.random() * 8 + 2),
  ])
  return layer
}

@pureRender
export class PlatesArrowsLayer extends MapLayer {

  constructor() {
    super();
    this.leafletElement = arrowLayerCreator()
  }

  componentWillMount() {
    super.componentWillMount();
    this.leafletElement =arrowLayerCreator()
  }

  render() {
    return null
  }
}