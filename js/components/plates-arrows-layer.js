import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import Arrow from 'leaflet-arrows'
import getKMLC from './plates-layer'

function testArrow() {
    var arrowOptions = {
      distanceUnit: 'km',
      isWindDegree: true,
      stretchFactor: 1,
      popupContent: function (data) {
        return '<strong>' + data.title + '</strong>';
      },
      arrowheadLength: 0.8,
      color: '#ff00ff',
      opacity: 1
    };

    var arrowData = {
      latlng: L.latLng(42.27, 71.4),
      degree: 77,
      distance: 10,
      title: 'Demo'
    };

        //console.log("NEW ARROWs LAYER")

    var arr = new L.Arrow(arrowData, arrowOptions)
    return arr;
  }


@pureRender
export class PlatesArrowsLayer extends MapLayer {

  constructor() {
    super();
    //console.log(testArrow())
    this.leafletElement = testArrow();
  }

  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = testArrow();
  }

  render() {
    return null
  }
}