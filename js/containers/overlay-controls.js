import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import MapKey from '../components/map-key'
import OverlayButton from '../components/overlay-button'
import BorderColorIcon from '@material-ui/icons/BorderColor'
import CenterFocusStrong from '@material-ui/icons/CenterFocusStrong'
import log from '../logger'
import config from '../config'

import '../../css/overlay-controls.less'

class OverlayControls extends PureComponent {
  constructor (props) {
    super(props)
    this.set3DMode = this.set3DMode.bind(this)
    this.exit3DMode = this.exit3DMode.bind(this)
    this.setCrossSectionDrawMode = this.setCrossSectionDrawMode.bind(this)
    this.cancelCrossSectionDrawMode = this.cancelCrossSectionDrawMode.bind(this)
  }

  exit3DMode () {
    const { setMode, crossSectionPoints } = this.props
    if (crossSectionPoints) {
      setMode('cross-section')
      log('CrossSectionDrawingStarted')
    } else {
      setMode('2d')
      log('MapViewOpened')
    }
  }

  cancelCrossSectionDrawMode () {
    const { setMode, crossSectionPoints, setCrossSectionPoint } = this.props
    // Remove cross section points when user cancels cross-section drawing.
    if (crossSectionPoints) {
      setCrossSectionPoint(0, null)
      setCrossSectionPoint(1, null)
      setMode('2d')
      log('MapViewOpened')
    }
  }

  setCrossSectionDrawMode () {
    const { setMode } = this.props
    setMode('cross-section')
    log('CrossSectionDrawingStarted')
  }

  set3DMode () {
    const { setMode } = this.props
    if (this.canOpen3D()) setMode('3d')
    log('3DViewOpened')
  }

  canOpen3D () {
    const { crossSectionPoints } = this.props
    return crossSectionPoints.get(0) && crossSectionPoints.get(1)
  }

  render () {
    const { mode, layers, changedViews, resetView } = this.props
    const canOpen3D = this.canOpen3D()
    const viewChanged = (mode !== '3d' && changedViews.has('2d')) || (mode === '3d' && changedViews.has('3d'))
    return (
      <div className='overlay-controls'>
        <div className={`controls top left ${mode === '3d' && ' cross-section'}`}>
          {mode !== 'cross-section' && viewChanged &&
            /* Don't display reset view icon when user is drawing a line (cross-section mode). */
            <OverlayButton color='primary' title='Reset map to show world view' onClick={resetView} icon={<CenterFocusStrong />} />}
        </div>
        <div className='controls bottom right'>
          {
            config.crossSection && mode === '2d' && layers.get('earthquakes') &&
            <OverlayButton
              color='primary'
              title='Draw a cross section line and open 3D view' onClick={this.setCrossSectionDrawMode}
              icon={<BorderColorIcon className='draw-cross-section-icon' />} dataTest='draw-cross-section'
            >
             Draw Cross-section
            </OverlayButton>
          }
          {mode === 'cross-section' &&
            <div>
              <OverlayButton title='Display the selected area and its earthquakes in 3D' onClick={this.set3DMode} disabled={!canOpen3D} icon='cube' dataTest='open-3d-view'>
                Open 3D View
              </OverlayButton>
              <OverlayButton title='Cancel drawing' onClick={this.cancelCrossSectionDrawMode} icon='close' dataTest='cancel-drawing'>
                Cancel
              </OverlayButton>
            </div>
          }
          {mode === '3d' &&
            <OverlayButton title='Exit 3D view and return to 2D map view' onClick={this.exit3DMode} icon='cube' dataTest='exit-3d-view'>
              Close 3D View
            </OverlayButton>
          }
        </div>
        <div className='controls top right'>
          <MapKey boundaries={layers.get('plateBoundaries') && mode !== '3d'} plateArrows={layers.get('plateArrows') && mode !== '3d'}
            earthquakes={layers.get('earthquakes')} volcanoes={layers.get('volcanoes')} eruptions={layers.get('eruptions')} />
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
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
