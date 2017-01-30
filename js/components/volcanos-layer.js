import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import { volcanoCanvasLayer } from '../custom-leaflet/volcano-canvas-layer'
import points from '../data/volcanos_full.js'


let _cachedPoints
function getPoints(map) {
  if (!_cachedPoints) {
    _cachedPoints = [];
    if (points) {
      for (var i = 0; i < points.length; i++)
      {
        // simple JSON array import
        // let lat = points[i][1]
        // let lng = points[i][0]
        // let date = points[i][2]
        // let pos = {
        //   position: { lng: lng, lat: lat },
        //   date: date
        // }

        // full JSON import
        let p = points[i]
        let lat = p.latitude
        let lng = p.longitude
        let date = p.lasteruptionyear
        let name = p.volcanoname
        let country = p.country
        let volcanotype = p.primaryvolcanotype
        let pos = {
          position:{lng, lat},
          date,
          name,
          country,
          volcanotype
        }
        _cachedPoints.push(pos);
      }
    }
  }
  return _cachedPoints
}

@pureRender
export default class VolcanoLayer extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = volcanoCanvasLayer()
    this.setLeafletElementProps()
  }

  componentDidUpdate() {
   this.setLeafletElementProps()
  }

  setLeafletElementProps() {
    const { volcanoPoints, map, volcanoClick } = this.props
    this.leafletElement.setVolcanoPoints(getPoints(map))
    this.leafletElement.onVolcanoClick(volcanoClick)
  }

  render() {
    return null
  }
}
