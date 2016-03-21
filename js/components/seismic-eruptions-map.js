import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer, Marker } from 'react-leaflet'
import EarthquakesLayer from './earthquakes-layer'
import subregionIcon from '../custom-leaflet/subregion-icon'

import '../../css/leaflet/leaflet.css'

function scaffoldUrl(subregion) {
  return '#' + window.encodeURIComponent(subregion.properties.scaffold)
}

@pureRender
export default class SeismicEruptionsMap extends Component {
  renderSubregionButtons() {
    const { region } = this.props
    const subregions = region.get('subregions') || []
    return subregions.map((sr, idx) => {
      return <Marker key={idx} position={sr.geometry.coordinates} icon={subregionIcon(sr.properties.label, scaffoldUrl(sr))}/>
    })
  }

  render() {
    const { region, earthquakes } = this.props
    const bounds = region.get('bounds')
    return (
      <Map className='seismic-eruptions-map' bounds={bounds} style={{height: '100%'}}>
        <TileLayer url='http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
                   subdomains={['otile1', 'otile2', 'otile3', 'otile4']}/>
        <EarthquakesLayer earthquakes={earthquakes}/>
        {this.renderSubregionButtons()}
      </Map>
    )
  }
}
