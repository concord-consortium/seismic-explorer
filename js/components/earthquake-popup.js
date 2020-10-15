import React, { PureComponent } from 'react'
import { Popup } from 'react-leaflet'

export default class EarthquakePopup extends PureComponent {
  render () {
    const { earthquake, onPopupClose } = this.props
    const earthquakePos = earthquake.geometry.coordinates
    return (
      <Popup closeOnClick={false} onClose={onPopupClose} position={earthquakePos}>
        <div>
          <div>Earthquake</div>
          <div>Place: <b>{earthquake.properties.place}</b></div>
          <div>Magnitude: <b>{earthquake.properties.mag.toFixed(1)}</b></div>
          <div>Date: <b>{date(earthquake.properties.time)}</b></div>
          <div>Depth: <b>{earthquake.geometry.coordinates[2]} km</b></div>
        </div>
      </Popup>
    )
  }
}

function date (timestamp) {
  const d = new Date(parseInt(timestamp))
  return (d.toLocaleString ? d.toLocaleString() : d.toString()) + ' UTC'
}
