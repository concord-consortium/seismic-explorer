import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import { volcanoCanvasLayer } from '../custom-leaflet/volcano-canvas-layer'
import volcanos from '../data/volcanos_full.js'


let _cachedVolcanos
function getVolcanos(map) {
  if (!_cachedVolcanos) {
    _cachedVolcanos = [];
    if (volcanos) {
      for (var i = 0; i < volcanos.length; i++)
      {
        // simple JSON array import
        // let lat = volcanos[i][1]
        // let lng = volcanos[i][0]
        // let date = volcanos[i][2]
        // let pos = {
        //   position: { lng: lng, lat: lat },
        //   date: date
        // }

        // full JSON import
        let v = volcanos[i]
        let lat = v.latitude
        let lng = v.longitude
        let age = v.lasteruptionyear != 'Unknown' ? -( v.lasteruptionyear-2017): -15000

        let volcanoData = {
          position:{lng, lat},
          age,
          lastactivedate: v.lasteruptionyear,
          name: v.volcanoname,
          country: v.country,
          region: v.subregion,
          volcanotype: v.primaryvolcanotype
        }
        _cachedVolcanos.push(volcanoData);
      }
    }
  }
  return _cachedVolcanos
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
    this.leafletElement.setVolcanoPoints(getVolcanos(map))
    this.leafletElement.onVolcanoClick(volcanoClick)
  }

  render() {
    return null
  }
}
