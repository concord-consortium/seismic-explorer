import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class AboutModalContent extends Component {
  render() {
    return (
      <div>
        <div className='title'>About: Seismic Explorer</div>
        <div>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus tempus facilisis felis aliquam
          sollicitudin. Pellentesque massa diam, porttitor et mollis vulputate, aliquet nec ligula. Duis rutrum quam at
          quam aliquam convallis. Nulla a quam ante. Fusce fermentum odio at ipsum ultricies luctus. Vivamus ultrices
          leo lectus, ultricies dapibus lectus volutpat ac.
        </div>
      </div>
    )
  }
}

