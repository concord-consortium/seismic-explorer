import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer } from 'react-leaflet'
import { earthquakesCanvasLayer } from '../custom-leaflet/earthquakes-canvas-layer'

@pureRender
export default class EarthquakesCanvasLayer extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = earthquakesCanvasLayer()
    this.leafletElement.setEarthquakes(this.props.earthquakes)
  }

  componentDidUpdate() {
    this.leafletElement.setEarthquakes(this.props.earthquakes)
  }

  render() {
    return null
  }
}
