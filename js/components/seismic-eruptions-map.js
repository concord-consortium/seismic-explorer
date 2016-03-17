import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer } from 'react-leaflet'
import EarthquakesLayer from './earthquakes-layer'

@pureRender
export default class SeismicEruptionsMap extends Component {
  render() {
    const { region, earthquakes } = this.props
    const bounds = region.get('bounds')
    const maxBounds = region.get('restricted') ? bounds : null
    return (
      <Map className='seismic-eruptions-map' bounds={bounds} maxBounds={maxBounds} style={{height: '100%'}}>
        <TileLayer url='http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
                   subdomains={['otile1', 'otile2', 'otile3', 'otile4']}/>
        <EarthquakesLayer earthquakes={earthquakes}/>
      </Map>
    )
  }
}
