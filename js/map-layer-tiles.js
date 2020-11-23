export const layerInfo = [
  {
    type: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 13,
    subdomains: []
  },
  {
    type: 'street',
    name: 'Street',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    subdomains: []
  },
  // {
  //   type: 'streetWikimedia',
  //   name: 'Street (Wikimedia)',
  //   url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{c}.png',
  //   maxZoom: 19,
  //   subdomains: []
  // },
  {
    type: 'relief',
    name: 'Relief',
    url: 'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/ETOPO1_Global_Relief_Model_Color_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: 'NOAA National Centers for Environmental Information (NCEI), https://noaa.maps.arcgis.com/home/item.html?id=c7cdc62ec1d44297becf264bf67449f9',
    maxZoom: 7,
    subdomains: []
  }
]

export function mapLayer (layerType) {
  return layerInfo.find(m => m.type === layerType)
}

export function tileUrl (layerType, zoom, x, y, scale) {
  const layer = mapLayer(layerType)
  const url = layer.url
  const subdomains = layer.subdomains
  const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)]
  const mapScale = scale && scale !== 1 ? '@2x' : ''
  return url.replace('{s}', subdomain).replace('{z}', zoom).replace('{x}', x).replace('{y}', y).replace('{c}', mapScale)
}
