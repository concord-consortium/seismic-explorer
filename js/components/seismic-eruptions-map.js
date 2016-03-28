import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer } from 'react-leaflet'
import EarthquakesCanvasLayer from './earthquakes-canvas-layer'
import EarthquakePopup from './earthquake-popup'
import PlatesLayer from './plates-layer'
import SubregionButtons from './subregion-buttons'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

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
    const { region, earthquakes, layers } = this.props
    const { boundsChanged, selectedEarthquake } = this.state
    const bounds = region.get('bounds')
    return (
      <div className='seismic-eruptions-map'>
        <Map ref='map' className='map' bounds={bounds} onLeafletMovestart={this.handleMoveStart}>
          {this.renderBaseLayer()}
          {layers.get('plates') && <PlatesLayer/>}
          <EarthquakesCanvasLayer earthquakes={earthquakes} earthquakeClick={this.handleEarthquakeClick}/>
          <SubregionButtons subregions={region.get('subregions')}/>
          <EarthquakePopup earthquake={selectedEarthquake} onPopupClose={this.handleEarthquakePopupClose}/>
        </Map>
        <div className='map-controls'>
          {boundsChanged && <div className='map-button' onClick={this.fitBounds}><i className='fa fa-map-marker'/></div>}
        </div>
      </div>
    )
  }
}
