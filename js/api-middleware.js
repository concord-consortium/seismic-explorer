import { fetchJSON, APIError } from './api'

// This middleware is executed only if action includes .fetchJSON object.
// It calls API action defined in callAPI.type.
// If action succeeds and callAPI.successAction is defined, it will be called with response.
// If action fails and callAPI.errorAction is defined, it will be called with the error response object.
export default store => next => action => {
  if (action.fetchJSON) {
    const { path, successAction, errorAction } = action.fetchJSON
    fetchJSON(path)
      .then(response => successAction && next(successAction(response)))
      .catch(error => {
        if (error instanceof APIError && errorAction) {
          return next(errorAction(error.response))
        }
        // Remember to throw original error, as otherwise we would swallow every kind of error.
        throw error
      })
  }
  return next(action)
}
