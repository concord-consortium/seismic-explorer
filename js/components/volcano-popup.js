import React, { PureComponent } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { getCachedInvisibleIcon } from '../custom-leaflet/icons'

export default class VolcanoPopup extends PureComponent {
  constructor (props) {
    super(props)
    this.onPopupClose = this.onPopupClose.bind(this)
  }

  componentDidMount () {
    this.refs.marker.leafletElement.openPopup()
  }

  onPopupClose () {
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
  render () {
    const { map, volcano } = this.props
    const volcanoPos = []

    volcanoPos.push(volcano.position.lat)
    volcanoPos.push(volcano.position.lng)
    volcanoPos.push(0)
    return (
      <Marker ref='marker' map={map} position={volcanoPos}
        icon={getCachedInvisibleIcon()}
        onLeafletPopupclose={this.onPopupClose}>
        <Popup closeOnClick={false}>
          <div>
            Name: <b>{volcano.name}</b><br />
            Country: <b>{volcano.country}</b><br />
            Region: <b>{volcano.region}</b><br />
            Location:<b>{volcanoPos[0]}</b>,<b>{volcanoPos[1]}</b><br />
            Type: <b>{volcano.volcanotype}</b><br />
            Date: <b>{volcano.lastactivedate}</b><br />
          </div>
        </Popup>
      </Marker>
    )
  }
}
