import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import { plateMovementCanvasLayer } from '../custom-leaflet/plate-movement-canvas-layer'
import points from '../data/plate-movement-unavco.js'


let _cachedPoints
function getPoints(map) {
  if (!_cachedPoints) {
    _cachedPoints = [];
    if (points) {
      for (var i = 0; i < points.length; i++)
      {
        if (points[i][4] < 100) {
          let angle = points[i][5] // 180 * Math.PI
          let scaledMag = points[i][4] / 5
          let mag = scaledMag > 8 ? scaledMag : 8
          let lng = points[i][1]
          let lat = points[i][0]
          let pos = {
            position: { lng, lat },
            velocity: { vMag: mag, vAngle: angle },
            text: points[i][0] + "," + points[i][1]
          }
          _cachedPoints.push(pos);
        }
      }
    }
  }
  return _cachedPoints
}

@pureRender
export default class PlateMovementCanvasLayer extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = plateMovementCanvasLayer()
    this.setLeafletElementProps()
  }

  componentDidUpdate() {
   this.setLeafletElementProps()
  }

  setLeafletElementProps() {
    const { plateMovementPoints, map } = this.props
    this.leafletElement.setPlateMovementPoints(getPoints(map))
  }

  render() {
    return null
  }
}
