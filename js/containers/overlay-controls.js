import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import * as actions from '../actions'
import MapKey from '../components/map-key'
import OverlayButton from '../components/overlay-button'
import log from '../logger'

import '../../css/overlay-controls.less'

@pureRender
class OverlayControls extends Component {
  constructor(props) {
    super(props)
    this.set3DMode = this.set3DMode.bind(this)
    this.exit3DMode = this.exit3DMode.bind(this)
    this.setCrossSectionDrawMode = this.setCrossSectionDrawMode.bind(this)
    this.cancelCrossSectionDrawMode = this.cancelCrossSectionDrawMode.bind(this)
  }
  componentDidUpdate() {
    const {layers, crossSectionPoints} = this.props
    if (layers.get('volcanos') && !layers.get('earthquakes') && crossSectionPoints) {
      this.cancelCrossSectionDrawMode()
    }
  }
  exit3DMode() {
    const { setMode, crossSectionPoints, setCrossSectionPoint } = this.props
    if (crossSectionPoints) {
      setMode('cross-section')
      log('CrossSectionDrawingStarted')
    } else {
      setMode('2d')
      log('MapViewOpened')
    }
  }

  cancelCrossSectionDrawMode() {
    const { setMode, crossSectionPoints, setCrossSectionPoint } = this.props
    // Remove cross section points when user cancels cross-section drawing.
    if (crossSectionPoints) {
      setCrossSectionPoint(0, null)
      setCrossSectionPoint(1, null)
      setMode('2d')
      log('MapViewOpened')
    }
  }

  setCrossSectionDrawMode() {
    const { setMode } = this.props
    setMode('cross-section')
    log('CrossSectionDrawingStarted')
  }

  set3DMode() {
    const { setMode } = this.props
    if (this.canOpen3D()) setMode('3d')
    log('3DViewOpened')
  }

  canOpen3D() {
    const { crossSectionPoints } = this.props
    return crossSectionPoints.get(0) && crossSectionPoints.get(1)
  }

  render() {
    const { mode, layers, changedViews, resetView, earthquakesCount, magnitudeCutOff} = this.props
    const canOpen3D = this.canOpen3D()
    const volcanoMode = layers.get('volcanos')
    const earthquakeMode = layers.get('earthquakes')
    const viewChanged = mode !== '3d' && changedViews.has('2d') || mode === '3d' && changedViews.has('3d')
    return (
      <div className='overlay-controls'>
        <div className='controls top left'>
          {mode !== 'cross-section' && viewChanged &&
            /* Don't display reset view icon when user is drawing a line (cross-section mode). */
            <OverlayButton title='Reset map to show world view' onClick={resetView} icon='globe'/>}
        </div>
        <div className='controls bottom right inline'>
          {mode === '2d' && earthquakeMode &&
            <OverlayButton title='Draw a cross section line and open 3D view' onClick={this.setCrossSectionDrawMode} icon='paint-brush'>
              Draw a cross section line and open 3D view
            </OverlayButton>
          }
          {mode === 'cross-section' && earthquakeMode &&
            <div>
              <OverlayButton title='Display the selected area and its earthquakes in 3D' onClick={this.set3DMode} disabled={!canOpen3D} icon='cube'>
                Open 3D view {!canOpen3D && '(draw a cross section line first!)'}
              </OverlayButton>
              <OverlayButton title='Cancel drawing' onClick={this.cancelCrossSectionDrawMode} icon='close'>
                Cancel
              </OverlayButton>
            </div>
          }
          {mode === '3d' &&
            <OverlayButton title='Exit 3D view and return to 2D map view' onClick={this.exit3DMode} icon='map'>
              Go back to 2D map
            </OverlayButton>
          }
        </div>
        <div className='controls top right'>
          <MapKey showBoundariesInfo={layers.get('plates') && mode !== '3d'}
            earthquakesCount={earthquakesCount} earthquakes={layers.get('earthquakes')} magnitudeCutOff={magnitudeCutOff} volcanos={layers.get('volcanos')}/>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    region: state.get('region'),
    layers: state.get('layers'),
    mode: state.get('mode'),
    regionsHistory: state.get('regionsHistory'),
    crossSectionPoints: state.get('crossSectionPoints'),
    changedViews: state.get('changedViews')
  }
}

export default connect(mapStateToProps, actions)(OverlayControls)
