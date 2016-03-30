import Shutterbug from 'shutterbug'
import L from 'leaflet'

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
  const oldTransforms = new Map()
  Array.from(document.querySelectorAll('.leaflet-container *')).forEach(elem => {
    const coords = !!elem.style[TRANSFORM] && getCoordsFromTransform(elem.style[TRANSFORM])
    if (coords) {
      oldTransforms.set(elem, elem.style[TRANSFORM])
      elem.style[TRANSFORM] = ''
      elem.style.left = coords.left
      elem.style.top = coords.top
    }
  })
  // It's necessary re-render 3D canvas when snapshot is taken, so .toDataUrl returns the correct image.
  // In this case, it's most likely the earthquake-canvas-layer which exposes those custom properties
  // (but other canvases can follow this convention in case of need).
  Array.from(document.querySelectorAll('canvas')).forEach(canvas => {
    if (canvas.canvas3D && canvas.render) {
      canvas.render()
    }
  })

  // Setup cleanup function executed after snapshot has been taken.
  Shutterbug.on('asyouwere', afterSnapshotHandler)
  function afterSnapshotHandler() {
    oldTransforms.forEach((transform, elem) => {
      elem.style[TRANSFORM] = transform
      elem.style.left = ''
      elem.style.top = ''
    })
    Shutterbug.off('asyouwere', afterSnapshotHandler)
  }
}

function getCoordsFromTransform(transformString) {
  const match = transformString.match(TRANSLATE_REGEXP)
  return match && {left: match[2], top: match[3]}
}
