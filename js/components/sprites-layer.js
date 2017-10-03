import { MapLayer } from 'react-leaflet'
import { spritesLayer } from '../custom-leaflet/sprites-layer'

export default class SpritesLayer extends MapLayer {
  componentDidMount () {
    super.componentDidMount()
    this.updateLeafletElement(null, this.props)
  }

  createLeafletElement (props) {
    return spritesLayer()
  }

  updateLeafletElement (fromProps, toProps) {
    const { earthquakes, volcanoes, onEarthquakeClick, onVolcanoClick } = toProps
    this.leafletElement.setData(earthquakes, volcanoes)
    this.leafletElement.onEarthquakeClick = onEarthquakeClick
    this.leafletElement.onVolcanoClick = onVolcanoClick
  }
}
