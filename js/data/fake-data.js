import { MIN_TIME, MAX_TIME } from '../earthquake-properties'

let ID = 0

const DEF_OPTIONS = {
  minLat: -90,
  maxLat: 90,
  minLng: -180,
  maxLng: 180,
  maxDep: 600,
  minDep: 0,
  minMag: 0,
  maxMag: 10
}
export function fakeDataset(count, options) {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(earthquake(options))
  }
  return {
    features: result.sort((a, b) => b.properties.mag - a.properties.mag),
  }
}

function earthquake(options) {
  const opts = Object.assign({}, DEF_OPTIONS, options)
  return {
    id: ID++,
    geometry: {
      coordinates: [gaussian(opts.minLng, opts.maxLng), gaussian(opts.minLat, opts.maxLat), gaussian(opts.minDep, opts.maxDep)]
    },
    properties: {
      place: 'test',
      mag: gaussian(opts.minMag, opts.maxMag),
      time: rand(MIN_TIME, MAX_TIME)
    }
  }
}

function gaussian(min, max) {
  return gaussianRand() * (max - min) + min
}

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function gaussianRand() {
  let rand = 0
  for (var i = 0; i < 6; i += 1) {
    rand += Math.random()
  }
  return rand / 6
}