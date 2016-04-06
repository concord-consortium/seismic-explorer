const TIME_RANGE = 315400000000 // 10 years in ms

export function fakeRegion(count) {
  return {
    datasets: ['_fake_dataset=' + count],
    minLatitude: -20,
    minLongitude: -90,
    maxLatitude: 60,
    maxLongitude: 30
  }
}

export function fakeDataset(count) {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(earthquake(i))
  }
  return {
    features: result
  }
}

function earthquake(id) {
  return {
    id: id,
    geometry: {
      coordinates: [long(), lat(), depth()]
    },
    properties: {
      mag: magnitude(),
      time: time()
    }
  }
}

function lat() {
  return Math.random() * 160 - 80
}

function long() {
  return Math.random() * 360 - 180
}

function depth() {
  return 600 * Math.random()
}

function magnitude() {
  return Math.random() * 2 + 5
}

function time() {
  return new Date().getTime() - Math.floor(Math.random() * TIME_RANGE)
}
