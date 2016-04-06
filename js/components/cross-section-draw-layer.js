import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { LayerGroup, Marker, Polyline, Polygon } from 'react-leaflet'
import { circleIcon, getCachedCircleIcon } from '../custom-leaflet/icons'
import { pointToArray, crossSectionRectangle } from '../core'

const MOUSE_DOWN = 'mousedown touchstart'
const MOUSE_MOVE = 'mousemove touchmove'
const MOVE_UP = 'mouseup touchend touchcancel touchleave'

@pureRender
export default class CrossSectionLayer extends Component {
  constructor(props) {
    super(props)
    this.drawStart = this.drawStart.bind(this)
    this.drawEnd = this.drawEnd.bind(this)
    this.setPoint1 = this.setPoint1.bind(this)
    this.setPoint2 = this.setPoint2.bind(this)
  }

  componentDidMount() {
    const { map } = this.props
    map.dragging.disable()
    map.on(MOUSE_DOWN, this.drawStart)
  }

  componentWillUnmount() {
    const { map } = this.props
    map.dragging.enable()
    map.off(MOUSE_DOWN, this.drawStart)
  }

  drawStart(event) {
    const { map } = this.props
    this.setPoint1(event)
    this.setPoint2(event)
    map.on(MOUSE_MOVE, this.setPoint2)
    map.on(MOVE_UP, this.drawEnd)
  }

  drawEnd() {
    const { map } = this.props
    map.off(MOUSE_MOVE, this.setPoint2)
    map.off(MOVE_UP, this.drawEnd)
  }

  setPoint1(event) {
    const { setCrossSectionPoint } = this.props
    // Event might be either Leaflet mouse event or Leaflet drag event.
    const latLng = event.latlng ? event.latlng : event.target.getLatLng()
    setCrossSectionPoint(0, pointToArray(latLng))
  }

  setPoint2(event) {
    const { setCrossSectionPoint } = this.props
    // Event might be either Leaflet mouse event or Leaflet drag event.
    const latLng = event.latlng ? event.latlng : event.target.getLatLng()
    setCrossSectionPoint(1, pointToArray(latLng))
  }

  render() {
    const { map, crossSectionPoints } = this.props
    const point1 = crossSectionPoints.get(0)
    const point2 = crossSectionPoints.get(1)
    const rect = crossSectionRectangle(point1, point2)
    return (
      <LayerGroup map={map}>
        {point1 && <Marker position={point1} draggable={true} icon={circleIcon('P1')} onLeafletDrag={this.setPoint1}/>}
        {point2 && <Marker position={point2} draggable={true} icon={circleIcon('P2')} onLeafletDrag={this.setPoint2}/>}
        {point1 && point2 && <Polyline clickable={false} className='cross-section-line' positions={[point1, point2]} color='#fff' opacity={1}/>}
        {rect && <Polygon positions={rect} clickable={false} color='#fff' weight={2}/>}
      </LayerGroup>
    )
  }
}
