import React, {Component} from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/about-modal-content.less'

@pureRender
export default class AboutModalContent extends Component {
  render() {
    return (
      <div className='about-modal-content'>
        <div className='title'>About: Seismic Explorer</div>
        <div>
          <p>Geologists collect earthquake data everyday. What are the patterns of earthquake magnitude, depth,
            location, and frequency? What are the patterns of earthquakes along plate boundaries?</p>
          <p>Click the play button to see the earthquakes. You can drag the starting time to start playing earthquakes
            from a later date.</p>
          <p>Use the Magnitude slider to choose the earthquake size shown on the map. Click the Show plate boundaries
            button to see the outlines of tectonic plates.</p>
          <p>Make a cross-section to see a three-dimensional view of the earthquakes in a region. Click on the Draw a
            cross-section line then draw a line on the map. When you are done, click Open 3D view, and see the depths of
            the earthquakes in that cross-section. What does the pattern of earthquakes in a region tell you about the
            motion of tectonic plates?</p>
          <p>Seismic Explorer is based on Seismic Eruption, a program created by <a
            href='http://serc.carleton.edu/resources/23210.html' target='_blank'>Alan L. Jones at the State University
            of New York at Binghamton</a>.</p>
          <p>Seismic Explorer uses earthquake data (magnitude, depth, location, time) from the <a
            href='http://earthquake.usgs.gov/earthquakes/map/' target='_blank'>United States Geological Survey</a>.</p>
        </div>
      </div>
    )
  }
}

