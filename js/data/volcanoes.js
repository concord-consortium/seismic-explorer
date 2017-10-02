import volcanoes from '../data/volcanoes-full.js'

function getVolcanoes () {
  const result = []
  for (let i = 0; i < volcanoes.length; i++) {
    let v = volcanoes[i]
    let lat = v.latitude
    let lng = v.longitude
    let age = v.lasteruptionyear !== 'Unknown' ? -(v.lasteruptionyear - 2017) : -15000

    let volcanoData = {
      id: i,
      geometry: {
        // Why -10 depth? It will place volcanoes above the ground in the 3D cross section view.
        coordinates: [lat, lng, -10]
      },
      age,
      lastactivedate: v.lasteruptionyear,
      name: v.volcanoname,
      country: v.country,
      region: v.subregion,
      volcanotype: v.primaryvolcanotype
    }
    result.push(volcanoData)
  }
  return result
}

const volcanoesProcessed = getVolcanoes()
export default volcanoesProcessed
