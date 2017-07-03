(function () {
  // performance.now already exists
  if (window.performance && window.performance.now) {
    return
  }

  // performance exists and has the necessary methods to hack out the current DOMHighResTimestamp
  if (
    window.performance &&
    window.performance.timing &&
    window.performance.timing.navigationStart &&
    window.performance.mark &&
    window.performance.clearMarks &&
    window.performance.getEntriesByName
  ) {
    window.performance.now = function () {
      window.performance.clearMarks('__PERFORMANCE_NOW__')
      window.performance.mark('__PERFORMANCE_NOW__')
      return window.performance.getEntriesByName('__PERFORMANCE_NOW__')[0].startTime
    }
    return
  }

  // All else fails, can't access a DOMHighResTimestamp, use a boring old Date...
  window.performance = window.performance || {}
  var start = (new Date()).valueOf()
  window.performance.now = function () {
    return (new Date()).valueOf() - start
  }

})()
