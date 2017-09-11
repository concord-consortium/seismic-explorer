import React, { PureComponent } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { getCachedInvisibleIcon } from '../custom-leaflet/icons'

export default class EarthquakePopup extends PureComponent {
  constructor(props) {
    super(props)
    this.onPopupClose = this.onPopupClose.bind(this)
  }

  componentDidMount() {
    this.refs.marker.getLeafletElement().openPopup()
  }

  onPopupClose() {
    const { onPopupClose } = this.props
    // Delay callback execution. Otherwise, if the callbacks removes this component from parent,
    // there's a conflict with Leaflet method that closes the popup - it's getting confused
    // that parent is undefined already.
    setTimeout(() => {
      onPopupClose()
    }, 1)
  }

  // For some reason it's impossible to create popup without marker.
  // So, this component renders invisible marker with popup instead.
  render() {
    const { map, earthquake } = this.props
    const earthquakePos = earthquake.geometry.coordinates
    console.log(earthquakePos)
    return (
      <Marker ref='marker' map={map} position={earthquakePos}
              icon={getCachedInvisibleIcon()}
              onLeafletPopupclose={this.onPopupClose}>
        <Popup closeOnClick={false}>
          <div>
            Place: <b>{earthquake.properties.place}</b><br/>
            Magnitude: <b>{earthquake.properties.mag.toFixed(1)}</b><br/>
            Date: <b>{date(earthquake.properties.time)}</b><br/>
            Depth: <b>{earthquake.geometry.coordinates[2]} km</b>
          </div>
        </Popup>
      </Marker>
    )
  }
}

function date(timestamp) {
  const d = new Date(parseInt(timestamp))
  return d.toLocaleString ? d.toLocaleString() : d.toString()
}
