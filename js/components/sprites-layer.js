import { MapLayer, withLeaflet } from 'react-leaflet'
import { spritesLayer } from '../custom-leaflet/sprites-layer'

export default withLeaflet(class SpritesLayer extends MapLayer {
  componentDidMount () {
    super.componentDidMount()
    this.updateLeafletElement(null, this.props)
  }

  createLeafletElement (props) {
    return spritesLayer()
  }

  updateLeafletElement (fromProps, toProps) {
    const { earthquakes, volcanoes, eruptions, onEarthquakeClick, onVolcanoClick, onEruptionClick } = toProps
    this.leafletElement.setData(earthquakes, volcanoes, eruptions)
    this.leafletElement.onEarthquakeClick = onEarthquakeClick
    this.leafletElement.onVolcanoClick = onVolcanoClick
    this.leafletElement.onEruptionClick = onEruptionClick
  }
})
