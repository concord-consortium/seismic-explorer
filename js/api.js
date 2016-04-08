import fetch from 'isomorphic-fetch'
import { fakeRegion, fakeDataset } from './data/fake-data'

class Cache {
  constructor() {
    this.data = {}
  }

  // Use JSON.stringify and JSON.parse to ensure that data is copied and can't be mutated by client code.
  get(path) {
    return JSON.parse(this.data[path])
  }

  set(path, json) {
    this.data[path] = JSON.stringify(json)
    return json
  }

  has(path) {
    return !!this.data[path]
  }
}

const cache = new Cache()

export function fetchJSON(path) {
  if (path.startsWith('_fake')) {
    return fakeData(path)
  }
  if (cache.has(path)) {
    return new Promise(resolve => {
      resolve(cache.get(path))
    })
  }
  return fetch(path)
    .then(checkStatus)
    .then(response => response.json())
    .then(response => cache.set(path, response))
}

export class APIError {
  constructor(statusText, response) {
    this.message = statusText
    this.response = response
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    throw new APIError(response.statusText, response)
  }
}

function fakeData(path) {
  return new Promise(resolve => {
    const info = path.split('=')
    const type = info[0]
    const count = info[1]
    if (type === '_fake') {
      resolve(fakeRegion(count))
    }
    if (type === '_fake_dataset') {
      resolve(fakeDataset(count))
    }
  })
}
