import React, { PureComponent } from 'react'
import { Popup } from 'react-leaflet'

const dateFormatter = (date) => {
  // .getMonth() returns [0, 11] range.
  let month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  return `${month}/${day}/${date.getFullYear()}`
}
export default class EruptionPopup extends PureComponent {
  render () {
    const { eruption, onPopupClose } = this.props
    const pos = [ eruption.geometry.coordinates[0], eruption.geometry.coordinates[1], 0 ]
    return (
      <Popup closeOnClick={false} onClose={onPopupClose} position={pos}>
        <div>
          <div className='popup-header'>Volcanic Eruption</div>
          <div>Volcano Name: <b>{eruption.properties.volcanoname}</b></div>
          <div>Volcano Rock Type: <b>{eruption.properties.majorrocktype}</b></div>
          <div>Location: <b>{pos[0]}</b>,<b>{pos[1]}</b></div>
          <div>Type: <b>{eruption.properties.activitytype}</b></div>
          <div>Explosivity Index: <b>{eruption.properties.explosivityindexmax}</b></div>
          <div>Start Date: <b>{dateFormatter(eruption.properties.startdate)}</b></div>
          <div>End Date: <b>{eruption.properties.active ? 'Active Eruption' : dateFormatter(eruption.properties.enddate)}</b></div>
        </div>
      </Popup>
    )
  }
}
