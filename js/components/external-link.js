import React from 'react'

import '../../css/external-link.less'

export default function ExternalLink ({ href, children }) {
  return (
    <a className='external-link' href={href} target='_blank' rel='noopener noreferrer'>
      {children}
      <span className='visually-hidden'> (opens in a new tab)</span>
    </a>
  )
}
