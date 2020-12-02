import React, { PureComponent } from 'react'

import '../../css/about-modal-content.less'

export default class AboutModalContent extends PureComponent {
  render () {
    const dateFormatter = () => {
      const date = new Date()
      // .getMonth() returns [0, 11] range.
      let month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      return `${month}/${day}/${date.getFullYear()}`
    }
    return (
      <div className='about-modal-content'>
        <div className='title'>About: Seismic Explorer</div>
        <div>
          <p>Geologists collect earthquake data every day. What are the patterns of earthquake magnitude, depth,
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
            href='http://earthquake.usgs.gov/earthquakes/map/' target='_blank'>United States Geological Survey</a>.
            Earthquake time is reported in Coordinated Universal Time (UTC).</p>
          <p>Volcanic Eruption data comes from the <a
            href='https://volcano.si.edu/reports_weekly.cfm' target='_blank'>Smithsonian / USGS Weekly Volcanic Activity Report</a>&nbsp;
            and Global Volcanism Program, 2013. Volcanoes of the World, v. 4.9.1. Venzke, E (ed.). Smithsonian Institution. Data
            Downloaded {dateFormatter()}. https://doi.org/10.5479/si.GVP.VOTW4-2013
          </p>
        </div>
      </div>
    )
  }
}
