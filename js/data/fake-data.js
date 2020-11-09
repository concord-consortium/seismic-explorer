import config from '../config'

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
export function fakeDataset (count, options) {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(earthquake(options))
  }
  return {
    features: result.sort((a, b) => b.properties.mag - a.properties.mag)
  }
}

function earthquake (options) {
  const opts = Object.assign({}, DEF_OPTIONS, options)
  return {
    id: ID++,
    geometry: {
      coordinates: [gaussian(opts.minLng, opts.maxLng), gaussian(opts.minLat, opts.maxLat), gaussian(opts.minDep, opts.maxDep)]
    },
    properties: {
      place: 'test',
      mag: gaussian(opts.minMag, opts.maxMag),
      time: rand(config.startTime, config.endTime)
    }
  }
}
export function fakeEruptionDataset (count, options) {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(eruption(options))
  }
  return {
    features: result.sort((a, b) => b.properties.startdate - a.properties.startdate)
  }
}

function eruption (options) {
  const opts = Object.assign({}, DEF_OPTIONS, options)
  return {
    id: ID++,
    geometry: {
      coordinates: [gaussian(opts.minLng, opts.maxLng), gaussian(opts.minLat, opts.maxLat), 0]
    },
    properties: {
      eruptionnumber: '123',
      volcanonumber: gaussian(10, 100),
      startdate: rand(config.startTime, config.endTime),
      enddate: rand(config.startTime, config.endTime),
      majorrocktype: 'rock'
    }
  }
}

function gaussian (min, max) {
  return gaussianRand() * (max - min) + min
}

function rand (min, max) {
  return Math.random() * (max - min) + min
}

function gaussianRand () {
  let rand = 0
  for (var i = 0; i < 6; i += 1) {
    rand += Math.random()
  }
  return rand / 6
}
