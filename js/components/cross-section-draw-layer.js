import React, { PureComponent } from 'react'
import { Map } from 'leaflet'
import PropTypes from 'prop-types'
import { LayerGroup, Marker, Polyline, Polygon } from 'react-leaflet'
import { circleIcon } from '../custom-leaflet/icons'
import crossSectionRectangle, { pointToArray } from '../core/cross-section-rectangle'

const MOUSE_DOWN = 'mousedown touchstart'
const MOUSE_MOVE = 'mousemove touchmove'
const MOVE_UP = 'mouseup touchend'

export default class CrossSectionDrawLayer extends PureComponent {
  constructor (props) {
    super(props)
    this.drawStart = this.drawStart.bind(this)
    this.drawEnd = this.drawEnd.bind(this)
    this.setPoint1 = this.setPoint.bind(this, 0)
    this.setPoint2 = this.setPoint.bind(this, 1)
  }

  componentDidMount () {
    const { map } = this.context
    map.dragging.disable()
    map.on(MOUSE_DOWN, this.drawStart)
  }

  componentWillUnmount () {
    const { map } = this.context
    map.dragging.enable()
    map.off(MOUSE_DOWN, this.drawStart)
  }

  drawStart (event) {
    const { map } = this.context
    this.setPoint1(event)
    this.setPoint2(null)
    map.on(MOUSE_MOVE, this.setPoint2)
    map.on(MOVE_UP, this.drawEnd)
  }

  drawEnd () {
    const { map } = this.context
    map.off(MOUSE_MOVE, this.setPoint2)
    map.off(MOVE_UP, this.drawEnd)
  }

  setPoint (index, event) {
    const { setCrossSectionPoint } = this.props
    let point = null
    if (event) {
      // Event might be either Leaflet mouse event or Leaflet drag event.
      const latLng = event.latlng ? event.latlng : event.target.getLatLng()
      point = pointToArray(latLng)
    }
    setCrossSectionPoint(index, point)
  }

  render () {
    const { map } = this.context
    const { crossSectionPoints } = this.props
    const point1 = crossSectionPoints.get(0)
    const point2 = crossSectionPoints.get(1)
    const rect = crossSectionRectangle(point1, point2)
    return (
      <LayerGroup map={map}>
        {point1 && <Marker position={point1} draggable icon={circleIcon('P1')} onLeafletDrag={this.setPoint1} />}
        {point2 && <Marker position={point2} draggable icon={circleIcon('P2')} onLeafletDrag={this.setPoint2} />}
        {point1 && point2 && <Polyline clickable={false} className='cross-section-line' positions={[point1, point2]} color='#fff' opacity={1} />}
        {rect && <Polygon positions={rect} clickable={false} color='#fff' weight={2} />}
      </LayerGroup>
    )
  }
}

CrossSectionDrawLayer.contextTypes = {
  map: PropTypes.instanceOf(Map)
}
