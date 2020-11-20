import React, { PureComponent } from 'react'
import { Popup } from 'react-leaflet'

export default class VolcanoPopup extends PureComponent {
  render () {
    const { volcano, onPopupClose } = this.props
    const pos = [ volcano.geometry.coordinates[0], volcano.geometry.coordinates[1], 0 ]
    return (
      <Popup closeOnClick={false} onClose={onPopupClose} position={pos}>
        <div className='popup-header'>Volcanic Eruption</div>
          <div>Volcano Name: <b>{volcano.properties.volcanoname}</b></div>
          <div>Volcano Rock Type: <b>{volcano.properties.majorrocktype}</b></div>
          <div>Location: <b>{pos[0]}</b>,<b>{pos[1]}</b></div>
          <div>Eruptions: <b>{volcano.properties.eruptioncount}</b>
          <div>Last Eruption Date: <b>{volcano.properties.lasteruptionyear}</b></div>
          <div>Previous Eruptions: <b>{volcano.properties.eruptionyears}</b></div>
        </div>
      </Popup>
    )
  }
}
