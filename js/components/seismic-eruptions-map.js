import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer } from 'react-leaflet'
import EarthquakesCanvasLayer from './earthquakes-canvas-layer'
import EarthquakePopup from './earthquake-popup'
import PlatesLayer from './plates-layer'
import SubregionButtons from './subregion-buttons'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

export function goToRegion(path) {
  // This will update ReactRouter and App component will request a new region data.
  window.location.hash = '#/' +  window.encodeURIComponent(path)
}

@pureRender
export default class SeismicEruptionsMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      boundsChanged: false,
      selectedEarthquake: null
    }
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.handleEarthquakeClick = this.handleEarthquakeClick.bind(this)
    this.handleEarthquakePopupClose = this.handleEarthquakePopupClose.bind(this)
    this.handleGoUp = this.handleGoUp.bind(this)
    this.handleGoHome = this.handleGoHome.bind(this)
    this.fitBounds = this.fitBounds.bind(this)
  }

  componentWillUpdate(nextProps) {
    if (this.props.region.get('bounds') !== nextProps.region.get('bounds')) {
      // This event is fired also when we change bounds property using API call (e.g. when user changes the region).
      this._ignoreMovestart = true
      this.setState({boundsChanged: false})
    }
  }

  componentDidUpdate() {
    this._ignoreMovestart = false
  }

  handleMoveStart() {
    if (!this._ignoreMovestart) {
      this.setState({boundsChanged: true})
    }
  }

  handleEarthquakeClick(event, earthquake) {
    this.setState({selectedEarthquake: earthquake})
  }

  handleEarthquakePopupClose() {
    this.setState({selectedEarthquake: null})
  }

  handleGoUp() {
    const { regionsHistory } = this.props
    // The last entry in history is the current region, so pick the earlier one (-2 index).
    goToRegion(regionsHistory.get(-2))
  }

  handleGoHome() {
    const { regionsHistory } = this.props
    goToRegion(regionsHistory.first())
  }

  fitBounds() {
    const { region } = this.props
    const bounds = region.get('bounds')
    this.refs.map.getLeafletElement().fitBounds(bounds)
    this.setState({boundsChanged: false})
  }

  renderBaseLayer() {
    // #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same
    // component instance when we switch between maps with subdomains and without.
    const { layers } = this.props
    switch(layers.get('base')) {
      case 'satellite':
        return <TileLayer key='with-subdomains' url='http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
                          subdomains={['otile1', 'otile2', 'otile3', 'otile4']}/>
      case 'street':
        return <TileLayer key='no-subdomains' url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'/>
      case 'earthquake-density':
        return <TileLayer key='no-subdomains' url='http://{s}.tiles.mapbox.com/v3/bclc-apec.map-rslgvy56/{z}/{x}/{y}.png'/>
    }
  }

  render() {
    const { region, earthquakes, layers, regionsHistory } = this.props
    const { boundsChanged, selectedEarthquake } = this.state
    const bounds = region.get('bounds')
    const canGoBack = regionsHistory.size > 1 // > 1, as the last entry is the current path
    return (
      <div className='seismic-eruptions-map'>
        <Map ref='map' className='map' bounds={bounds} onLeafletMovestart={this.handleMoveStart} minZoom={3}>
          {this.renderBaseLayer()}
          {layers.get('plates') && <PlatesLayer/>}
          <EarthquakesCanvasLayer earthquakes={earthquakes} earthquakeClick={this.handleEarthquakeClick}/>
          <SubregionButtons subregions={region.get('subregions')} onSubregionClick={goToRegion}/>
          <EarthquakePopup earthquake={selectedEarthquake} onPopupClose={this.handleEarthquakePopupClose}/>
        </Map>
        <div className='map-controls-top'>
          {canGoBack && <div className='map-button' onClick={this.handleGoHome}><i className='fa fa-home'/></div>}
          {canGoBack && <div className='map-button' onClick={this.handleGoUp}><i className='fa fa-arrow-up'/></div>}
        </div>
        <div className='map-controls-bottom'>
          {boundsChanged && <div className='map-button' onClick={this.fitBounds}><i className='fa fa-map-marker'/></div>}
        </div>
      </div>
    )
  }
}
