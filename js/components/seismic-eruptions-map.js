import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer, Marker } from 'react-leaflet'
import EarthquakesLayer from './earthquakes-layer'
import PlatesLayer from './plates-layer'
import subregionIcon from '../custom-leaflet/subregion-icon'

import '../../css/leaflet/leaflet.css'

function scaffoldUrl(subregion) {
  return '#' + window.encodeURIComponent(subregion.properties.scaffold)
}

@pureRender
export default class SeismicEruptionsMap extends Component {
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
      return <Marker key={idx} position={sr.geometry.coordinates} icon={subregionIcon(sr.properties.label, scaffoldUrl(sr))}/>
    })
  }

  render() {
    const { region, earthquakes, layers } = this.props
    const bounds = region.get('bounds')
    return (
      <Map className='seismic-eruptions-map' bounds={bounds} style={{height: '100%'}}>
        {this.renderBaseLayer()}
        {layers.get('plates') && <PlatesLayer/>}
        <EarthquakesLayer earthquakes={earthquakes}/>
        {this.renderSubregionButtons()}
      </Map>
    )
  }
}
