import React, { useState } from 'react'

import Navbar from '../Navbar'
import Footer from '../Footer'

const About = () => {
	const [openStatus, setOpenStatus] = useState(false);
	const toggleCheckStatus = () => {
		setOpenStatus(!openStatus);
	};

	return (
    <div className="about mt-20">
      <Navbar
        toggleCheckStatus={toggleCheckStatus}
        openStatus={openStatus}
        setOpenStatus={setOpenStatus}
      />
      <div className="container">
        <div className="cvsu">
          <h1 className="text-3xl lg:text-4xl font-heading">
            CAVITE STATE UNIVERSITY - TANZA CAMPUS
          </h1>
        </div>

        <div className="university mission">
          <h1 className="w-full xl:w-1/3 text-3xl font-heading">University Mission</h1>

          <p>
            CAVITE STATE UNIVERSITY shall provide excellent, equitable and
            relevant educational opportunities in the arts, sciences, and
            technology through quality instruction and responsive research and
            development activities. It shall produce professional skilled and
            morally upright individuals for global competitiveness.
          </p>
        </div>

        <div className="university vision">
          <h1 className="w-full xl:w-1/3 text-3xl font-heading">University Vision</h1>

          <p>
            The premier university in historic Cavite globally recognized for
            excellence in character development, academics, research,
            innovation, and sustainable community engagement.
          </p>
        </div>
      </div>

      <Footer toggleCheckStatus={toggleCheckStatus} openStatus={openStatus} />
    </div>
  );
}

export default About