import iframePhone from 'iframe-phone'
import ga from './google-analytics'
import config from './config'

// Logging is enabled only if we're in iframe, as logs are sent to the parent (e.g. LARA) using iframe-phone.
const inIframe = (function () {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
})()

const phone = iframePhone.getIFrameEndpoint()
if (config.logging && inIframe) {
  phone.initialize()
}

export default function log (action, data, gaCategory = 'UserInteraction') {
  if (!config.logging) return
  if (inIframe) {
    phone.post('log', { action: action, data: data })
  }
  ga('send', 'event', gaCategory, action)
  console.log('[log]', action, data)
}
