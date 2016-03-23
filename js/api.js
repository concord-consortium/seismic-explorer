import fetch from 'isomorphic-fetch'

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
