import { DivIcon } from 'leaflet'

import '../../css/custom-leaflet-icons.less'

function buttonMarkup(label, href) {
  return `<a class="cc-button" href=${href}>${label}</a>`
}

export function subregionIcon(label, href) {
  return new DivIcon({className: 'subregion-icon', html: buttonMarkup(label, href)})
}

export function invisibleIcon() {
  return new DivIcon({className: 'invisible-icon'})
}

// Cache icons. First, it's just faster. Second, it prevents us from unnecessary re-rendering and buttons blinking.
const iconsCache = {}

export function getCachedSubregionIcon(label, url) {
  const iconKey = label + url
  if (!iconsCache[iconKey]) iconsCache[iconKey] = subregionIcon(label, url)
  return iconsCache[iconKey]
}

export function getCachedInvisibleIcon() {
  const iconKey = 'invisible-icon'
  if (!iconsCache[iconKey]) iconsCache[iconKey] = invisibleIcon()
  return iconsCache[iconKey]
}
