import fetch from 'isomorphic-fetch'

export function fetchJSON(path) {
  return fetch(path)
    .then(checkStatus)
    .then(response => response.json())
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
