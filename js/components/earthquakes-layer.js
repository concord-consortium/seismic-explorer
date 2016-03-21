import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { LayerGroup } from 'react-leaflet'
import earthquakeMarker from '../custom-leaflet/earthquake-marker'

import '../../css/earthquake-layer.less'

@pureRender
export default class EarthquakesLayer extends LayerGroup {
  componentDidMount() {
    super.componentDidMount()
    this.renderedMarkers = {}
    this.renderMarkers()
  }

  componentDidUpdate() {
    this.renderMarkers()
  }

  // Custom rendering using direct Leaflet API.
  // I have tried to use CircleMarker from react-leaflet, but it was too slow due to React rendering overhead.
  renderMarkers() {
    console.time('eq render')
    const { earthquakes } = this.props
    const validMarkers = {}
    earthquakes.forEach(eq => {
      validMarkers[eq.id] = true
      // Don't render invisible markers unless it's necessary.
      if (eq.visible && !this.renderedMarkers[eq.id]) {
        const marker = earthquakeMarker(eq)
        this.leafletElement.addLayer(marker)
        this.renderedMarkers[eq.id] = marker
      }
      if (this.renderedMarkers[eq.id]) {
        this.renderedMarkers[eq.id].setVisible(eq.visible)
      }
    })
    // Remove markers that do not exist anymore.
    Object.keys(this.renderedMarkers).forEach(id => {
      if (!validMarkers[id]) {
        this.leafletElement.removeLayer(this.renderedMarkers[id])
        delete this.renderedMarkers[id]
      }
    })
    console.timeEnd('eq render')
  }
}
