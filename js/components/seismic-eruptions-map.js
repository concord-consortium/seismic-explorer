import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer } from 'react-leaflet'
import EarthquakesLayer from './earthquakes-layer'

@pureRender
export default class SeismicEruptionsMap extends Component {
  render() {
    const { earthquakes } = this.props
    const position = [51.505, -0.09]
    return (
      <Map className='seismic-eruptions-map' center={position} zoom={4} style={{height: '100%'}}>
        <TileLayer url='http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
                   subdomains={['otile1', 'otile2', 'otile3', 'otile4']}/>
        <EarthquakesLayer earthquakes={earthquakes}/>
      </Map>
    )
  }
}
