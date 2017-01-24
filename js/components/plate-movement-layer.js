import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import { plateMovementCanvasLayer } from '../custom-leaflet/plate-movement-canvas-layer'
import points from '../data/plate-movement.js'


let _cachedPoints
function getPoints(map) {
  if (!_cachedPoints) {
    _cachedPoints = [];
    if (points) {
      for (var i = 0; i < points.length; i++)
      {
        let angle = points[i][5] / 180 * Math.PI
        let mag = points[i][4] > 10 ? points[i][4] : 10
        let pos = {
          position: { lng: points[i][0], lat: points[i][1] },
          velocity: { vMag: mag, vAngle: angle},
          text: points[i][0] + "," + points[i][1]
        }
        _cachedPoints.push(pos);
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
