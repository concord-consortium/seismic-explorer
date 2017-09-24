import React, { PureComponent } from 'react'
import { Popup } from 'react-leaflet'

export default class EarthquakePopup extends PureComponent {
  render () {
    const { earthquake, onPopupClose } = this.props
    const earthquakePos = earthquake.geometry.coordinates
    return (
      <Popup closeOnClick={false} onClose={onPopupClose} position={earthquakePos}>
        <div>
          Place: <b>{earthquake.properties.place}</b><br />
          Magnitude: <b>{earthquake.properties.mag.toFixed(1)}</b><br />
          Date: <b>{date(earthquake.properties.time)}</b><br />
          Depth: <b>{earthquake.geometry.coordinates[2]} km</b>
        </div>
      </Popup>
    )
  }
}

function date (timestamp) {
  const d = new Date(parseInt(timestamp))
  return d.toLocaleString ? d.toLocaleString() : d.toString()
}
