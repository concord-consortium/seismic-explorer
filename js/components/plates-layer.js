import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
// Import plugin using imports-loader.
import 'imports?L=leaflet!leaflet-plugins/layer/vector/KML'
import L from 'leaflet'


//Creating the Complex layer
let _cachedKMLC
export function getKMLC() {
  if (!_cachedKMLC) {
      //console.log('SIMPLE')
      _cachedKMLC = new L.KML('plates_modified_complex.kml', {async: true})
  }
  return _cachedKMLC
}

//Creating the Simple layer
let _cachedKMLS
export function getKMLS() {
  if (!_cachedKMLS) {
      //console.log('SIMPLE')
      _cachedKMLS = new L.KML('plates_modified_simple.kml', {async: true})
  }
  return _cachedKMLS
}


//Simple Layer class
@pureRender
export class PlatesLayerS extends MapLayer {

  constructor() {
    super();
    //console.log("NEW PLATES LAYER C" + val)
    this.leafletElement = getKMLS();
  }

  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = getKMLS();
  }

  render() {
    return null
  }
}

//Complex Layer Class
export class PlatesLayerC extends MapLayer {

  constructor() {
    super();
    //console.log("NEW PLATES LAYER S" + val)
    this.leafletElement = getKMLC();
  }

  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = getKMLC();
  }

  render() {
    return null
  }
}