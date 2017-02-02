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
        // at zoomed out distances, reducing the density could be useful, but we don't currently have
        // access to map zoom level - for now, reduce point density
        let reducedPointDensity = points[i][0] % 8 == 0 && points[i][1] % 8 == 0

        if (reducedPointDensity && points[i][4] < 100){// there's an outlier that's huge
          let angle = points[i][5]
          // scaling is an issue - source data magnitudes seem to range from 0.35mm/yr to around 100mm/yr
          let mag = points[i][4] / 2
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
