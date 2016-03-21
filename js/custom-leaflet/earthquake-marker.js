import { CircleMarker } from 'leaflet'
import Rainbow from 'rainbowvis.js'

const MAX_DEPTH = 700
const rainbow = new Rainbow()
rainbow.setNumberRange(0, MAX_DEPTH)

function magnitudeToRadius(magnitude) {
  return 0.9 * Math.pow(1.5, (magnitude - 1))
}

function depthToColor(depth) {
  return `#${rainbow.colourAt(depth)}`
}

function date(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleString ? d.toLocaleString() : d.toString()
}

function popup(earthquake) {
  return `Place: <b>${earthquake.properties.place}</b></br>
          Magnitude: <b>${earthquake.properties.mag.toFixed(1)}</b></br>
          Date: <b>${date(earthquake.properties.time)}</b></br>
          Depth: <b>${earthquake.geometry.coordinates[2]} km</b>`
}

const EarthquakeMarker = CircleMarker.extend({
  setVisible: function (v) {
    if (this._visible === undefined) {
      this._visible = true
      this._setVis(true)
    }
    if (this._visible !== v) {
      // Update element only if it's really needed.
      this._setVis(v)
    }
    this._visible = v
  },

  _setVis: function (v) {
    if (this._container) {
      // SVG
      this._container.setAttribute('class', `earthquake-marker${v ? '' : ' hidden'}`)
    } else {
      // Canvas
      this.setStyle({opacity: v ? 0.2 : 0, fillOpacity: v ? 0.8 : 0})
    }
  }
})

export default function earthquakeMarker(earthquake) {
  const marker = new EarthquakeMarker(earthquake.geometry.coordinates, {
    radius: magnitudeToRadius(earthquake.properties.mag),
    fillColor: depthToColor(earthquake.geometry.coordinates[2]),
    color: '#000',
    weight: 1.5,
    opacity: 0.2,
    fillOpacity: 0.8
  })
  marker.bindPopup(popup(earthquake))
  return marker
}
