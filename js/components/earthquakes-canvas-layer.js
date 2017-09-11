import React from 'react'
import { MapLayer } from 'react-leaflet'
import { earthquakesCanvasLayer } from '../custom-leaflet/earthquakes-canvas-layer'

export default class EarthquakesCanvasLayer extends MapLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = earthquakesCanvasLayer()
    this.setLeafletElementProps()
  }

  componentDidUpdate() {
   this.setLeafletElementProps()
  }

  setLeafletElementProps() {
    const { earthquakes, earthquakeClick } = this.props
    this.leafletElement.setEarthquakes(earthquakes)
    this.leafletElement.onEarthquakeClick(earthquakeClick)
  }

  render() {
    return null
  }
}
