import React, { PureComponent } from 'react'
import { Popup } from 'react-leaflet'

export default class VolcanoPopup extends PureComponent {
  render () {
    const { volcano, onPopupClose } = this.props
    const pos = [ volcano.geometry.coordinates[0], volcano.geometry.coordinates[1], 0 ]
    return (
      <Popup closeOnClick={false} onClose={onPopupClose} position={pos}>
        <div>
          <div>Volcano</div>
          <div>Name: <b>{volcano.name}</b></div>
          <div>Country: <b>{volcano.country}</b></div>
          <div>Region: <b>{volcano.region}</b></div>
          <div>Location:<b>{pos[0]}</b>,<b>{pos[1]}</b></div>
          <div>Type: <b>{volcano.volcanotype}</b></div>
          <div>Date: <b>{volcano.lastactivedate}</b></div>
        </div>
      </Popup>
    )
  }
}
