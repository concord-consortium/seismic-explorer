import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { LayerGroup } from 'react-leaflet'
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
export default class PlatesLayer extends LayerGroup {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    super.componentDidMount()
    this.leafletElement.addLayer(getKML())
  }
}
