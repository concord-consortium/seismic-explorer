import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { LayerGroup, Marker } from 'react-leaflet'
import { getCachedSubregionIcon } from '../custom-leaflet/icons'

@pureRender
export default class SubregionButtons extends Component {
  render() {
    const { map, subregions, onSubregionClick } = this.props
    return (
      <LayerGroup map={map}>
        {subregions.map((sr, idx) => {
          return <Marker key={idx} position={sr.geometry.coordinates}
                         icon={getCachedSubregionIcon(sr.properties.label)}
                         onClick={() => onSubregionClick(sr.properties.scaffold)}
          />
        })}
      </LayerGroup>
    )
  }
}

SubregionButtons.defaultProps = {
  subregions: []
}
