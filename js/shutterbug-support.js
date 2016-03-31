import Shutterbug from 'shutterbug'
import L from 'leaflet'
import $ from 'jquery'

const TRANSFORM = L.DomUtil.TRANSFORM
const TRANSLATE_REGEXP = /translate(3d)?\((-?\d+px), (-?\d+px)/

export function enableShutterbug(appClassName) {
  Shutterbug.enable('.' + appClassName)
  Shutterbug.on('saycheese', beforeSnapshotHandler)
}

export function disableShutterbug() {
  Shutterbug.disable()
  Shutterbug.off('saycheese', beforeSnapshotHandler)
}

// Note that PhantomJS doesn't support 3D transforms that are extensively used by Leaflet maps.
// This function replaces `transform: translate3d(10px, 20px, ...)` with `left: 10px; top: 20px`
// for element which require that (map pane, markers). It also setups a handler that restores
// the original styles after snapshot has been taken.
function beforeSnapshotHandler() {
  const oldStyles = new Map()
  Array.from(document.querySelectorAll('.leaflet-container *')).forEach(elem => {
    if (!!elem.style[TRANSFORM]) {
      oldStyles.set(elem, {
        transform: elem.style[TRANSFORM],
        left: elem.style.left,
        top: elem.style.top
      })
      const position = $(elem).position()
      elem.style[TRANSFORM] = ''
      elem.style.left = position.left + 'px'
      elem.style.top = position.top + 'px'
    }
  })
  // It's necessary re-render 3D canvas when snapshot is taken, so .toDataUrl returns the correct image.
  // In this case, it's most likely the earthquake-canvas-layer which exposes those custom properties
  // (but other canvases can follow this convention in case of need).
  Array.from(document.querySelectorAll('.canvas-3d')).forEach(canvas => {
    if (canvas.render) canvas.render()
  })

  // Setup cleanup function executed after snapshot has been taken.
  Shutterbug.on('asyouwere', afterSnapshotHandler)
  function afterSnapshotHandler() {
    oldStyles.forEach((oldStyle, elem) => {
      elem.style[TRANSFORM] = oldStyle.transform
      elem.style.left = oldStyle.left
      elem.style.top = oldStyle.top
    })
    Shutterbug.off('asyouwere', afterSnapshotHandler)
  }
}
