import React, { PureComponent } from 'react'
import { magnitudeToRadius, depthToColor } from '../earthquake-properties'
import OverlayButton from './overlay-button'
import LayersIcon from '@material-ui/icons/Layers'
import log from '../logger'
import keyArrowShort from '../../images/key-arrow-short.png'
import keyArrowMedium from '../../images/key-arrow-medium.png'
import keyArrowLong from '../../images/key-arrow-long.png'

import '../../css/map-key.less'
import '../../css/modal-style.less'

export default class MapKey extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      opened: false
    }
    this.open = this.open.bind(this)
    this.hide = this.hide.bind(this)
  }

  open () {
    this.setState({ opened: true })
    log('MapKeyOpened')
  }

  hide () {
    this.setState({ opened: false })
  }

  render () {
    const { boundaries, plateArrows, volcanoes, earthquakes, eruptions } = this.props
    const { opened } = this.state
    if (!plateArrows && !boundaries && !volcanoes && !earthquakes) {
      return null
    }
    return !opened
      ? <OverlayButton color='primary' icon={<LayersIcon />} title='Information about the symbols used on this map' onClick={this.open} dataTest='key'>Key</OverlayButton>
      : <div className='modal-style map-key-content' >
        <i onClick={this.hide} className='close-icon fa fa-close' />
        { earthquakes &&
        <table className='magnitude-density'>
          <tbody>
            <tr><th colSpan='2'>Magnitude</th><th colSpan='2'>Depth</th></tr>
            <tr><td>{circle(3)}</td><td>3</td><td>{earthquakeColor(20)}</td><td>0-30 km</td></tr>
            <tr><td>{circle(4)}</td><td>4</td><td>{earthquakeColor(50)}</td><td>30-100 km</td></tr>
            <tr><td>{circle(5)}</td><td>5</td><td>{earthquakeColor(150)}</td><td>100-200 km</td></tr>
            <tr><td>{circle(6)}</td><td>6</td><td>{earthquakeColor(250)}</td><td>200-300 km</td></tr>
            <tr><td>{circle(7)}</td><td>7</td><td>{earthquakeColor(400)}</td><td>300-500 km</td></tr>
            <tr><td>{circle(8)}</td><td>8</td><td>{earthquakeColor(550)}</td><td>> 500 km</td></tr>
            <tr><td>{circle(9)}</td><td>9</td></tr>
          </tbody>
        </table>
        }
        { boundaries &&
          <table className='boundaries'>
            <tbody>
              <tr><th colSpan='2'>Plate boundaries</th></tr>
              <tr><td>{boundaryColor('#ffff00')}</td><td>Convergent boundary</td></tr>
              <tr><td>{boundaryColor('#ff00ff')}</td><td>Transform boundary</td></tr>
              <tr><td>{boundaryColor('#00bfa6')}</td><td>Divergent boundary</td></tr>
            </tbody>
          </table>
        }
        {
          plateArrows &&
          <table className='plateArrows'>
            <tbody>
              <tr><th colSpan='2'>Plate movement arrows</th></tr>
              <tr><td><img src={keyArrowShort} width='28px' /></td><td>Velocity 0-30 mm/year</td></tr>
              <tr><td><img src={keyArrowMedium} width='42px' /></td><td>Velocity 30-60 mm/year</td></tr>
              <tr><td><img src={keyArrowLong} width='58px' /></td><td>Velocity > 60 mm/year</td></tr>
            </tbody>
          </table>
        }
        { (volcanoes || eruptions) &&
          <table className='volcanoes'>
            <tbody>
              <tr><th colSpan='2' height='28px'>Years since last volcanic eruption</th></tr>
              <tr><td>{volcanoIcon('#ffffff')}</td><td>Active eruption</td></tr>
              <tr><td>{volcanoIcon('#ff6600')}</td><td>{`< 100`}</td></tr>
              <tr><td>{volcanoIcon('#d26f2d')}</td><td>100-400</td></tr>
              <tr><td>{volcanoIcon('#ac7753')}</td><td>400-1600</td></tr>
              <tr><td>{volcanoIcon('#8c7d73')}</td><td>1600-6400</td></tr>
              <tr><td>{volcanoIcon('#808080')}</td><td>{`> 6400`}</td></tr>
              <tr><td>{volcanoIcon('#b1b1b1')}</td><td>Unknown</td></tr>
            </tbody>
          </table>
        }
      </div>
  }
}

function circle (magnitude) {
  const circleContainerSize = magnitude < 9 ? 42 : 48
  return <svg xmlns='http://www.w3.org/2000/svg' width={circleContainerSize} height={circleContainerSize}>
    <circle cx='24' cy='24' r={magnitudeToRadius(magnitude)} stroke='black' fill='rgba(0,0,0,0)' />
  </svg>
}

function earthquakeColor (depth) {
  return <div className='earthquake-color' style={{ backgroundColor: toHexStr(depthToColor(depth)) }} />
}

function boundaryColor (color) {
  return <div className='boundary-color' style={{ backgroundColor: color }} />
}

function volcanoIcon (color) {
  return <svg viewBox='0 0 64 64' width='24px' height='24px' xmlns='http://www.w3.org/2000/svg'>
    <polygon style={{ fill: color, stroke: 'rgb(0, 0, 0)' }} points='4 60 32 4 60 60 4 60' />
  </svg>
}

function toHexStr (d) {
  const hex = Number(d).toString(16)
  return '#000000'.substr(0, 7 - hex.length) + hex
}
