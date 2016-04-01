import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
// Import plugin using imports-loader.
import 'imports?L=leaflet!leaflet-plugins/layer/vector/KML'
import L from 'leaflet'

let _cachedKML
function getKML() {
  if (!_cachedKML) {
    _cachedKML = new L.KML('plates.kml', {async: true})
  }
  return _cachedKML
}

@pureRender
export default class PlatesLayer extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = getKML()
  }

  render() {
    return null
  }
}
