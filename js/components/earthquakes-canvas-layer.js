import { MapLayer } from 'react-leaflet'
import { earthquakesCanvasLayer } from '../custom-leaflet/earthquakes-canvas-layer'

export default class EarthquakesCanvasLayer extends MapLayer {
  componentDidMount () {
    super.componentDidMount()
    this.updateLeafletElement(null, this.props)
  }

  createLeafletElement (props) {
    return earthquakesCanvasLayer()
  }

  updateLeafletElement (fromProps, toProps) {
    const { earthquakes, earthquakeClick } = toProps
    this.leafletElement.setEarthquakes(earthquakes)
    this.leafletElement.onEarthquakeClick(earthquakeClick)
  }
}
