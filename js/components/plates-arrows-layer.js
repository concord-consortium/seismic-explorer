import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import 'imports?L=leaflet!leaflet-plugins/layer/Marker.Rotate.js'


function markerMaker()
{
  return new L.Marker([0, 0], {iconAngle: 27})
}

@pureRender
export class PlatesArrowsLayer extends MapLayer {

  constructor() {
    super();
    this.leafletElement = markerMaker();
  }

  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = markerMaker();
  }

  render() {
    return null
  }
}