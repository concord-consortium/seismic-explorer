import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import EarthquakesCanvasLayer from './earthquakes-canvas-layer'
import PlatesLayer from './plates-layer'
import subregionIcon from '../custom-leaflet/subregion-icon'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

function scaffoldUrl(subregion) {
  return '#' + window.encodeURIComponent(subregion.properties.scaffold)
}

// Cache icons. First, it's just fater. Second, it prevents us from unnecessary re-rendering and buttons blinking.
const _icons = {}
function getSubregionIcon(label, url) {
  const iconKey = label + url
  if (!_icons[iconKey]) {
    _icons[iconKey] = subregionIcon(label, url)
  }
  return _icons[iconKey]
}

@pureRender
export default class SeismicEruptionsMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      boundsChanged: false
    }
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.fitBounds = this.fitBounds.bind(this)
  }

  componentWillUpdate(nextProps) {
    if (this.props.region.get('bounds') !== nextProps.region.get('bounds')) {
      this._ignoreMovestart = true
      this.setState({boundsChanged: false})
    }
  }

  componentDidUpdate() {
    this._ignoreMovestart = false
  }

  handleMoveStart() {
    // This event is fired also when we change bounds property pragmatically (e.g. when user changes the region).
    if (!this._ignoreMovestart) {
      this.setState({boundsChanged: true})
    }
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

  renderSubregionButtons() {
    const { region } = this.props
    const subregions = region.get('subregions') || []
    return subregions.map((sr, idx) => {
      return <Marker key={idx} position={sr.geometry.coordinates} icon={getSubregionIcon(sr.properties.label, scaffoldUrl(sr))}/>
    })
  }

  render() {
    const { region, earthquakes, layers } = this.props
    const { boundsChanged } = this.state
    const bounds = region.get('bounds')
    return (
      <div className='seismic-eruptions-map'>
        <Map ref='map' className='map' bounds={bounds} onLeafletMovestart={this.handleMoveStart}>
          {this.renderBaseLayer()}
          {layers.get('plates') && <PlatesLayer/>}
          <EarthquakesCanvasLayer earthquakes={earthquakes}/>
          {this.renderSubregionButtons()}
        </Map>
        <div className='map-controls'>
          {boundsChanged && <div className='map-button' onClick={this.fitBounds}><i className='fa fa-map-marker'/></div>}
        </div>
      </div>
    )
  }
}
