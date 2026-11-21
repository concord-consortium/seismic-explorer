import React from 'react'
import ExternalLink from './external-link'
import { LICENSING_EMAIL, LICENSING_URL, MIT_LICENSE_URL, TERMS_OF_USE_URL } from '../license-constants'

import '../../css/license-copy.less'

export default function LicenseCopy () {
  return (
    <div className='license-copy' data-test='license-copy'>
      <p>
        <strong>Seismic Explorer is free, open-source software.</strong> The Seismic Explorer source code is
        released under the <ExternalLink href={MIT_LICENSE_URL}>MIT License</ExternalLink>, so you’re welcome to use,
        modify, and build on it.
      </p>
      <p>
        <strong>Your use of Seismic Explorer at seismic-explorer.concord.org</strong> is governed by
        our <ExternalLink href={TERMS_OF_USE_URL}>Terms of Use</ExternalLink>. The hosted version is free for
        non-commercial use; commercial use requires a separate written agreement. For more information,
        visit <ExternalLink href={LICENSING_URL}>concord.org/licensing</ExternalLink> or
        contact <a href={`mailto:${LICENSING_EMAIL}`}>{LICENSING_EMAIL}</a>.
      </p>
      <p className='copyright'>© {new Date().getFullYear()} The Concord Consortium, Inc.</p>
    </div>
  )
}
