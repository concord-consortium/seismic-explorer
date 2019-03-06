import React from 'react'
import CrossSection from '../3d/cross-section-view'

export default class CrossSection3D extends React.Component {
  constructor (props) {
    super(props)
    this.rafCallback = this.rafCallback.bind(this)
  }

  componentDidMount () {
    const { mark3DViewModified } = this.props
    this.externalView = new CrossSection(this.refs.container)
    this.externalView.setProps(this.props)
    this._rafId = window.requestAnimationFrame(this.rafCallback)
    // View is always "unchanged" when the component is created.
    mark3DViewModified(false)
    this.externalView.onCameraChange(() => {
      mark3DViewModified(true)
    })
  }

  componentWillUnmount () {
    window.cancelAnimationFrame(this._rafId)
    this.externalView.destroy()
  }

  componentWillReceiveProps (nextProps) {
    this.externalView.setProps(nextProps)
  }

  shouldComponentUpdate () {
    // Never update component as it's based on canvas.
    return false
  }

  // requestAnimationFrame callback.
  rafCallback (timestamp) {
    this.externalView.render(timestamp)
    this._rafId = window.requestAnimationFrame(this.rafCallback)
  }

  resetCamera () {
    const { mark3DViewModified } = this.props
    this.externalView.resetCamera()
    mark3DViewModified(false)
  }

  render () {
    return (
      <div ref='container' className='cross-section-3d' style={{ width: '100%', height: '100%' }}>
        {/* Canvas will be inserted here by the external view. */}
      </div>
    )
  }
}
