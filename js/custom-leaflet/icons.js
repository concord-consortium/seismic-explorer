import { DivIcon } from 'leaflet'

import '../../css/custom-leaflet-icons.less'

export function subregionIcon(label) {
  return new DivIcon({className: 'subregion-icon', html: `<a class="cc-button">${label}</a>`})
}

export function invisibleIcon() {
  return new DivIcon({className: 'invisible-icon'})
}

export function circleIcon(label) {
  return new DivIcon({className: 'circle-icon', html: label})
}

// Cache icons. First, it's just faster. Second, it prevents us from unnecessary re-rendering and buttons blinking.
const iconsCache = {}

export function getCachedSubregionIcon(label, url) {
  const iconKey = 'subregion' + label + url
  if (!iconsCache[iconKey]) iconsCache[iconKey] = subregionIcon(label, url)
  return iconsCache[iconKey]
}

export function getCachedInvisibleIcon() {
  const iconKey = 'invisible-icon'
  if (!iconsCache[iconKey]) iconsCache[iconKey] = invisibleIcon()
  return iconsCache[iconKey]
}


export function getCachedCircleIcon(label) {
  const iconKey = 'circle-icon' + label
  if (!iconsCache[iconKey]) iconsCache[iconKey] = circleIcon()
  return iconsCache[iconKey]
}
