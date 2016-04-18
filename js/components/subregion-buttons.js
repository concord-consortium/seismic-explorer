import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { LayerGroup, Marker } from 'react-leaflet'
import { getCachedSubregionIcon } from '../custom-leaflet/icons'
import { goToRegion } from '../api'

@pureRender
export default class SubregionButtons extends Component {
  render() {
    const { map, subregions } = this.props
    return (
      <LayerGroup map={map}>
        {subregions.map((sr, idx) =>
          (<Marker key={idx} position={sr.geometry.coordinates}
            icon={getCachedSubregionIcon(sr.properties.label)}
            onClick={() => goToRegion(sr.properties.scaffold)}
          />)
        )}
      </LayerGroup>
    )
  }
}

SubregionButtons.defaultProps = {
  subregions: []
}
