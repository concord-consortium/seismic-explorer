import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { MapLayer, Marker, Popup } from 'react-leaflet'
import { getCachedInvisibleIcon } from '../custom-leaflet/icons'

@pureRender
export default class EarthquakePopup extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.earthquake !== this.props.earthquake) {
      this.refs.marker.getLeafletElement().openPopup()
    }
  }

  // For some reason it's impossible to create popup without marker.
  // So, this component renders invisible marker with popup instead.
  render() {
    const { map, earthquake, onPopupClose } = this.props
    const earthquakePos = earthquake ? earthquake.geometry.coordinates : [0, 0]
    return (
      <Marker ref='marker' map={map} position={earthquakePos} icon={getCachedInvisibleIcon()} onLeafletPopupclose={onPopupClose}>
        <Popup closeOnClick={false}>
          {earthquake &&
            <div>
              Place: <b>{earthquake.properties.place}</b><br/>
              Magnitude: <b>{earthquake.properties.mag.toFixed(1)}</b><br/>
              Date: <b>{date(earthquake.properties.time)}</b><br/>
              Depth: <b>{earthquake.geometry.coordinates[2]} km</b>
            </div>
          }
        </Popup>
      </Marker>
    )
  }
}

function date(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleString ? d.toLocaleString() : d.toString()
}
