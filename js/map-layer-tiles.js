export const layerInfo = {
  'satellite': {
    url: 'http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',
    subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
  },
  'street': {
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c']
  },
  'earthquake-density': {
    url: 'http://{s}.tiles.mapbox.com/v3/bclc-apec.map-rslgvy56/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c']
  }
}

export function tileUrl(layerType, zoom, x, y) {
  const layer = layerInfo[layerType]
  const url = layer.url
  const subdomains = layer.subdomains
  const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)]
  return url.replace('{s}', subdomain).replace('{z}', zoom).replace('{x}', x).replace('{y}', y)
}
