import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { LayerGroup } from 'react-leaflet'
import earthquakeMarker from '../custom-leaflet/earthquake-marker'

import '../../css/earthquake-layer.less'

const MARKERS_CHUNK_SIZE = 300

// Custom rendering using direct Leaflet API.
// I have tried to use CircleMarker from react-leaflet, but it was too slow due to React rendering overhead.
// Also, addLayer and removeLayer operation is pretty expensive and time consuming. So, new earthquakes are added
// in small chunks using requestAnimationFrame callbacks. Also, old ones are removed in the same way (but they are
// hidden first, so user has an impression that they're removed immediately).

@pureRender
export default class EarthquakesLayer extends LayerGroup {
  constructor(props) {
    super(props)
    this.addRemoveMarkersChunk = this.addRemoveMarkersChunk.bind(this)
  }

  componentDidMount() {
    super.componentDidMount()
    this.renderedMarkers = {}
    this.renderMarkers()
  }

  componentWillUnmount() {
    this.cancelAddRemove()
  }

  componentDidUpdate() {
    this.renderMarkers()
  }

  renderMarkers() {
    const { earthquakes } = this.props
    // Show / hide existing markers. That's fast, as we only change element class.
    earthquakes.forEach(eq => {
      if (this.renderedMarkers[eq.id]) {
        this.renderedMarkers[eq.id].setVisible(eq.visible)
      }
    })
    // Add and remove markers asynchronously, as it's way slower than visibility toggling.
    this.markersToAdd = this.getMarkersToAdd()
    this.markersToRemove = this.getMarkersToRemove()
    // Also, hide markers that are going to be removed. That provides instant feedback for user and we can
    // cleanup DOM later.
    this.hideMarkersToRemove()
    this.cancelAddRemove()
    this.scheduleAddRemove()
  }

  cancelAddRemove() {
    if (this.animFrameID !== null) {
      window.cancelAnimationFrame(this.animFrameID)
      this.animFrameID = null
    }
  }

  scheduleAddRemove() {
    if (this.markersToAdd.length > 0 || this.markersToRemove.length > 0) {
      this.animFrameID = window.requestAnimationFrame(this.addRemoveMarkersChunk)
    }
  }

  getMarkersToRemove() {
    const { earthquakes } = this.props
    const validMarkers = {}
    earthquakes.forEach(e => validMarkers[e.id] = true)
    return Object.keys(this.renderedMarkers).filter(id => !validMarkers[id])
  }

  getMarkersToAdd() {
    const { earthquakes } = this.props
    return earthquakes.filter(e => !this.renderedMarkers[e.id])
  }

  hideMarkersToRemove() {
    this.markersToRemove.forEach(eqId => {
      this.renderedMarkers[eqId].setVisible(false)
    })
  }

  addRemoveMarkersChunk() {
    // Render new markers first, as markers to remove should be hidden anyway.
    if (this.markersToAdd.length > 0) {
      this.markersToAdd.splice(0, MARKERS_CHUNK_SIZE).forEach(eq => {
        const marker = earthquakeMarker(eq)
        this.leafletElement.addLayer(marker)
        marker.setVisible(eq.visible)
        this.renderedMarkers[eq.id] = marker
      })
    } else {
      // Remove old markers.
      this.markersToRemove.splice(0, MARKERS_CHUNK_SIZE).forEach(id => {
        this.leafletElement.removeLayer(this.renderedMarkers[id])
        delete this.renderedMarkers[id]
      })
    }
    this.scheduleAddRemove()
  }
}
