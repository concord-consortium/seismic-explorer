import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, Marker, Popup, TileLayer, CircleMarker } from 'react-leaflet'

@pureRender
class CircleMarker2 extends CircleMarker {
  componentDidUpdate(prevProps) {
    // console.log('cm didUpdate')
    return super.componentDidUpdate(prevProps)
  }

  render() {
    // console.log('cm render')
    return super.render()
  }
}

@pureRender
export default class SeismicEruptionsMap extends Component {
  renderEarthQuakes() {
    const { earthquakes } = this.props
    console.time('eq render')
    const result = earthquakes.map(eq => {
      return <CircleMarker2 key={eq.id} center={eq.geometry.coordinates} radius={8} opacity={0.2} color='#000' fillColor='red' fillOpacity={eq.hidden ? 0 : 0.8}/>
    })
    //const result = []
    console.timeEnd('eq render')
    return result
  }

  render() {
    const position = [51.505, -0.09]
    return (
      <Map center={position} zoom={4} style={{height: '100%'}}>
        <TileLayer
          url='http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
          subdomains={['otile1', 'otile2', 'otile3', 'otile4']}
        />
        {this.renderEarthQuakes()}
      </Map>
    )
  }
}
