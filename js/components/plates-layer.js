import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
// Import plugin using imports-loader.
import 'imports?L=leaflet!leaflet-plugins/layer/vector/KML'
import 'imports?L=leaflet!leaflet-ajax'
import L from 'leaflet'

let _cachedKML
function getKML() {
  if (!_cachedKML) {
    _cachedKML = new L.KML('plates_modified_simple.kml', {async: true})
    //_cachedKML = new L.KML('plates_modified_complex.kml', {async: true})
  }
  return _cachedKML
}

let _cachedGeoJSON
function getGeoJSON()
{
  if(!_cachedGeoJSON)
  {
    _cachedGeoJSON = new L.GeoJSON.AJAX("ComplexSeismicConverted.json");
  }
  return _cachedGeoJSON
}

@pureRender
export class PlatesLayer extends MapLayer {

  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = getKML();
  }

  render() {
    return null
  }
}
