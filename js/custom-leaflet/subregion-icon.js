import { DivIcon } from 'leaflet'

import '../../css/subregion-icon.less'

function buttonMarkup(label, href) {
  return `<a class="cc-button" href=${href}>${label}</a>`
}

export default function subregionIcon(label, href) {
  return new DivIcon({className: 'subregion-icon', html: buttonMarkup(label, href)})
}
