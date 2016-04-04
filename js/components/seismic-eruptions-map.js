import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Map, TileLayer } from 'react-leaflet'
import { Circle } from 'leaflet'
import EarthquakesCanvasLayer from './earthquakes-canvas-layer'
import EarthquakePopup from './earthquake-popup'
import PlatesLayer from './plates-layer'
import SubregionButtons from './subregion-buttons'
import CrossSectionLayer from './cross-section-layer'
import MapKey from './map-key'
import MapButton from './map-button'
import addTouchSupport from '../custom-leaflet/touch-support'

import '../../css/leaflet/leaflet.css'
import '../../css/seismic-eruptions-map.less'

// Leaflet map doesn't support custom touch events by default.
addTouchSupport()

export function goToRegion(path) {
  // This will update ReactRouter and App component will request a new region data.
  window.location.hash = '#/' +  window.encodeURIComponent(path)
}

@pureRender
export default class SeismicEruptionsMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      boundsChanged: false,
      selectedEarthquake: null
    }
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.handleEarthquakeClick = this.handleEarthquakeClick.bind(this)
    this.handleEarthquakePopupClose = this.handleEarthquakePopupClose.bind(this)
    this.handleGoUp = this.handleGoUp.bind(this)
    this.handleGoHome = this.handleGoHome.bind(this)
    this.fitBounds = this.fitBounds.bind(this)
    this.toggleCrossSectionMode = this.toggleCrossSectionMode.bind(this)
    this.toggle3DMode = this.toggle3DMode.bind(this)
  }

  get map() {
    return this.refs.map.getLeafletElement()
  }

  componentDidMount() {
    // Make sure that SVG overlay layer exists from the very beginning. It's created dynamically when the first
    // SVG object is added to the map. It solves / simplifies some issues. For example we don't want earthquakes
    // to be clickable when we enter cross-section drawing mode. The simplest solution is to set Canvas z-index
    // lower than SVG z-index, but it won't work if the SVG layer hasn't been created yet.
    createSVGOverlayLayer(this.map)
  }

  componentWillUpdate(nextProps) {
    if (this.props.region.get('bounds') !== nextProps.region.get('bounds')) {
      // This event is fired also when we change bounds property using API call (e.g. when user changes the region).
      this._ignoreMovestart = true
      this.setState({boundsChanged: false})
    }
  }

  componentDidUpdate() {
    this._ignoreMovestart = false
  }

  handleMoveStart() {
    if (!this._ignoreMovestart) {
      this.setState({boundsChanged: true})
    }
  }

  handleEarthquakeClick(event, earthquake) {
    this.setState({selectedEarthquake: earthquake})
  }

  handleEarthquakePopupClose() {
    this.setState({selectedEarthquake: null})
  }

  handleGoUp() {
    const { regionsHistory } = this.props
    // The last entry in history is the current region, so pick the earlier one (-2 index).
    goToRegion(regionsHistory.get(-2))
  }

  handleGoHome() {
    const { regionsHistory } = this.props
    goToRegion(regionsHistory.first())
  }

  fitBounds() {
    const { region } = this.props
    const bounds = region.get('bounds')
    this.map.fitBounds(bounds)
    this.setState({boundsChanged: false})
  }

  toggleCrossSectionMode() {
    const { mode, setMode, setCrossSectionPoint } = this.props
    const newMode = mode === '2d' ? 'cross-section' : '2d'
    if (newMode === '2d') {
      // Remove cross section points when user cancels cross-section drawing.
      setCrossSectionPoint(0, null)
      setCrossSectionPoint(1, null)
    }
    setMode(newMode)
  }

  toggle3DMode() {
    // 3D mode is not implemented yet.
    //const { setMode } = this.props
    // if (this.canOpen3D()) setMode('3d')
  }

  canGoBack() {
    const { regionsHistory } = this.props
    // > 1, as the last entry is the current path
    return regionsHistory.size > 1
  }

  canOpen3D() {
    const { crossSectionPoints } = this.props
    return crossSectionPoints.get(0) && crossSectionPoints.get(1)
  }

  renderBaseLayer() {
    // #key attribute is very important here. #subdomains is not a dynamic property, so we can't reuse the same
    // component instance when we switch between maps with subdomains and without.
    const { layers } = this.props
    switch(layers.get('base')) {
      case 'satellite':
        return <TileLayer key='with-subdomains' url='http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
                          subdomains={['otile1', 'otile2', 'otile3', 'otile4']}/>
      case 'street':
        return <TileLayer key='no-subdomains' url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'/>
      case 'earthquake-density':
        return <TileLayer key='no-subdomains' url='http://{s}.tiles.mapbox.com/v3/bclc-apec.map-rslgvy56/{z}/{x}/{y}.png'/>
    }
  }

  render() {
    const { mode, region, earthquakes, layers, crossSectionPoints, setCrossSectionPoint } = this.props
    const { boundsChanged, selectedEarthquake } = this.state
    const bounds = region.get('bounds')
    const canGoBack = this.canGoBack()
    const canOpen3D = this.canOpen3D()
    return (
      <div className={`seismic-eruptions-map mode-${mode}`}>
        <Map ref='map' className='map' bounds={bounds} onLeafletMovestart={this.handleMoveStart}>
          {this.renderBaseLayer()}
          {layers.get('plates') && <PlatesLayer/>}
          <EarthquakesCanvasLayer earthquakes={earthquakes} earthquakeClick={this.handleEarthquakeClick}/>
          <SubregionButtons subregions={region.get('subregions')} onSubregionClick={goToRegion}/>
          <EarthquakePopup earthquake={selectedEarthquake} onPopupClose={this.handleEarthquakePopupClose}/>
          {mode === 'cross-section' && <CrossSectionLayer crossSectionPoints={crossSectionPoints} setCrossSectionPoint={setCrossSectionPoint}/>}
        </Map>
        <div className='map-controls-top-left'>
          {canGoBack && <MapButton onClick={this.handleGoHome} icon='home'/>}
          {canGoBack && <MapButton onClick={this.handleGoUp} icon='arrow-up'/>}
        </div>
        <div className='map-controls-bottom-left'>
          {boundsChanged && <MapButton onClick={this.fitBounds} icon='map-marker'/>}
        </div>
        <div className='map-controls-bottom-right'>
          {mode === '2d' &&
            <MapButton onClick={this.toggleCrossSectionMode}>
              <span><i className='fa fa-paint-brush'/> Draw a cross section line and open 3D view</span>
            </MapButton>
          }
          {mode === 'cross-section' &&
            <div>
              <MapButton onClick={this.toggle3DMode} disabled={!canOpen3D} icon='cube'>
                <span> Open 3D view {!canOpen3D && '(draw a cross section line first!)'}</span>
              </MapButton>
              <MapButton onClick={this.toggleCrossSectionMode} icon='close'>
                <span> Cancel</span>
              </MapButton>
            </div>
          }
        </div>
        <MapKey showBoundariesInfo={layers.get('plates')}/>
      </div>
    )
  }
}

function createSVGOverlayLayer(map) {
  map.addLayer(new Circle([0,0], 0, {opacity: 0, fillOpacity: 0}))
}