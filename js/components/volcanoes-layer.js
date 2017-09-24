import { MapLayer } from 'react-leaflet'
import { volcanoCanvasLayer } from '../custom-leaflet/volcano-canvas-layer'
import volcanoes from '../data/volcanoes_full.js'

let _cachedVolcanoes
function getVolcanoes () {
  if (!_cachedVolcanoes) {
    _cachedVolcanoes = []
    if (volcanoes) {
      for (var i = 0; i < volcanoes.length; i++) {
        // simple JSON array import
        // let lat = volcanoes[i][1]
        // let lng = volcanoes[i][0]
        // let date = volcanoes[i][2]
        // let pos = {
        //   position: { lng: lng, lat: lat },
        //   date: date
        // }

        // full JSON import
        let v = volcanoes[i]
        let lat = v.latitude
        let lng = v.longitude
        let age = v.lasteruptionyear !== 'Unknown' ? -(v.lasteruptionyear - 2017) : -15000

        let volcanoData = {
          position: {lng, lat},
          age,
          lastactivedate: v.lasteruptionyear,
          name: v.volcanoname,
          country: v.country,
          region: v.subregion,
          volcanotype: v.primaryvolcanotype
        }
        _cachedVolcanoes.push(volcanoData)
      }
    }
  }
  return _cachedVolcanoes
}

export default class VolcanoLayer extends MapLayer {
  componentDidMount () {
    super.componentDidMount()
    this.updateLeafletElement(null, this.props)
  }

  createLeafletElement (props) {
    return volcanoCanvasLayer()
  }

  updateLeafletElement (fromProps, toProps) {
    const { volcanoClick } = toProps
    this.leafletElement.setVolcanoPoints(getVolcanoes())
    this.leafletElement.onVolcanoClick(volcanoClick)
  }
}
