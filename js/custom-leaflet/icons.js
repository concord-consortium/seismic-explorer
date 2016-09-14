import { DivIcon } from 'leaflet'

import '../../css/custom-leaflet-icons.less'

export function invisibleIcon() {
  return new DivIcon({className: 'invisible-icon'})
}

export function circleIcon(label) {
  return new DivIcon({className: 'circle-icon', html: label})
}

// Cache icons. First, it's just faster. Second, it prevents us from unnecessary re-rendering and buttons blinking.
const iconsCache = {}

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
