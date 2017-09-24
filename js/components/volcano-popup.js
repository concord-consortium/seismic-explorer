import React, { PureComponent } from 'react'
import { Popup } from 'react-leaflet'

export default class VolcanoPopup extends PureComponent {
  render () {
    const { volcano, onPopupClose } = this.props
    const pos = [ volcano.position.lat, volcano.position.lng, 0 ]
    return (
      <Popup closeOnClick={false} onClose={onPopupClose} position={pos}>
        <div>
          Name: <b>{volcano.name}</b><br />
          Country: <b>{volcano.country}</b><br />
          Region: <b>{volcano.region}</b><br />
          Location:<b>{pos[0]}</b>,<b>{pos[1]}</b><br />
          Type: <b>{volcano.volcanotype}</b><br />
          Date: <b>{volcano.lastactivedate}</b><br />
        </div>
      </Popup>
    )
  }
}
