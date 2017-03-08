export const layerInfo = [
  {
    type: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: []
  },
  {
    type: 'street',
    name: 'Street',
    url: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c']
  },
  {
    type: 'relief',
    name: 'Relief',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    maxZoom: 13,
    subdomains: []
  },
  {
    type: 'ocean-basemap',
    name: 'Ocean basemap',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
    maxZoom: 13,
    subdomains: []
  }
]
export function mapLayer(layerType) {
  return layerInfo.filter(m => m.type == layerType)[0]
}
export function tileUrl(layerType, zoom, x, y) {
  const layer = mapLayer(layerType)
  const url = layer.url
  const subdomains = layer.subdomains
  const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)]
  return url.replace('{s}', subdomain).replace('{z}', zoom).replace('{x}', x).replace('{y}', y)
}
