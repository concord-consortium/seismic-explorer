import React from 'react'
import CrossSection from '../3d/cross-section'

export default class CrossSection3D extends React.Component {
  constructor(props) {
    super(props)
    this.rafCallback = this.rafCallback.bind(this);
  }

  componentDidMount() {
    this.externalView = new CrossSection(this.refs.container)
    this.externalView.setProps(this.props)
    this._rafId = requestAnimationFrame(this.rafCallback)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._rafId)
    this.externalView.destroy()
  }

  componentWillReceiveProps(nextProps) {
    this.externalView.setProps(nextProps)
  }

  shouldComponentUpdate() {
    // Never update component as it's based on canvas.
    return false
  }

  // requestAnimationFrame callback.
  rafCallback(timestamp) {
    this.externalView.render(timestamp)
    this._rafId = requestAnimationFrame(this.rafCallback)
  }

  render() {
    return (
      <div ref='container' className='cross-section-3d' style={{width: '100%', height: '100%'}}>
        {/* Canvas will be inserted here by the external view. */}
      </div>
    )
  }
}
