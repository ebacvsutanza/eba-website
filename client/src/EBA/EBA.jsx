import React, {useState} from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import Navbar from './Navbar';
import Footer from './Footer';

import './EBA.css'

const EBA = () => {
	// carousel
	const [currentIndex, setCurrentIndex] = useState(0);

	const slides = [
		{
			image: 'ITEMS/f2.png',
			title: 'Male Uniform',
			description: "Trying on the campus uniform is made easy with the help of Augmented Reality, you can easily see how the uniform would look while you're wearing it, without the need to wear one physically."
		},
		{
			image: 'ITEMS/f1.png',
			title: 'Female Uniform',
			description: "Trying on the campus uniform is made easy with the help of Augmented Reality, you can easily see how the uniform would look while you're wearing it, without the need to wear one physically."
		},
		{
			image: 'ITEMS/DIT.png',
			title: 'Department Shirt',
			description: "Trying on the campus uniform is made easy with the help of Augmented Reality, you can easily see how the uniform would look while you're wearing it, without the need to wear one physically."
		},
		{
			image: 'ITEMS/Anglicist_Guild-White.png',
			title: 'Organizational Shirt',
			description: "Trying on the campus uniform is made easy with the help of Augmented Reality, you can easily see how the uniform would look while you're wearing it, without the need to wear one physically."
		}
	];
	const goToPrevious = () => {
		const isFirstSlide = currentIndex === 0;
		const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
		setCurrentIndex(newIndex);
	};
	const goToNext = () => {
		const isLastSlide = currentIndex === slides.length - 1;
		const newIndex = isLastSlide ? 0 : currentIndex + 1;
		setCurrentIndex(newIndex);
	};


	return (
    <div className="eba">
      <Navbar />

      <div className="hero-section">
        <div className="hero-text">
          <h1>
            Visualize your uniform, <h1>Simplify your fit</h1>
          </h1>
          <div className='text'>
            <h3>Make trying-on clothes easier.</h3>
            <p>
              See yourself in the Cavite State University school uniform,
              without the need to wear the clothing physically. See how it
              would fit before you buy.
            </p>
            <small>
              Note: The system only measures and gives you an estimation, do
              not rely on it completely.
            </small>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="/ITEMS/heroeba.png"
            alt="Image shit"
            className="hero-img"
          />
        </div>
      </div>

      {/* Rest of the content */}

      {/* second page */}
      <div className="second-section">
        <div className="section-header">
          <h1>Drive your design to a new age</h1>
        </div>

        <div className="content-container">
          <div className="left-side">
            <div className="image-container">
              <img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                className="carousel-image"
              />
            </div>
            <div className="uniform-name">{slides[currentIndex].title}</div>
          </div>

          <div className="right-side">
            <div className="info-cards">
              <div className="info-card active">
                <div className="card-number">0{currentIndex + 1}</div>
                <h3>{slides[currentIndex].title}</h3>
                <p>{slides[currentIndex].description}</p>
              </div>

              {slides.map((slide, index) => {
                if (index !== currentIndex) {
                  return (
                    <div
                      key={index}
                      className="info-card inactive"
                      onClick={() => setCurrentIndex(index)}
                    >
                      <div className="card-number">0{index + 1}</div>
                      <h3>{slide.title}</h3>
                      <p>{slide.description}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="navigation-controls">
              <button className="nav-btn" onClick={goToPrevious}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="nav-btn" onClick={goToNext}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* third section */}
      <div className="third-section">
        <div className="text">
          <h1>
            <p>
              Why use <span>Augmented</span>
            </p>{" "}
            <span>Reality?</span>
          </h1>

          <p className="description">
            by using the innovating technology, specifically the Augmented
            Reality, the users are able to see a visual representation of the
            different clothing that are available through EBA.{" "}
          </p>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Efficiency</h3>
            <p>
              by using the system, you are capable of an efficient way of trying
              on different clothing, that would otherwise be time-consuming due
              to wearing the clothing yourself physically.
            </p>
          </div>

          <div className="card">
            <h3>Safety & Hygiene</h3>
            <p>
              by trying on clothing virtually through the AR system, you are at
              a lesser risk of being sick by wearing the same clothing that
              other people had also worn.
            </p>
          </div>
        </div>
      </div>

      {/* fourth section */}
      <div className="fourth-section">
        <h1>Available Services</h1>

        <p className="description">
          Currently, here are some of the services and products that the
          External Business and Affairs are offering.
        </p>

        <div className="group">
          <div className="card">
            <h3>Books</h3>
            <p>
              various modules and books for different programs are available in
              our EBA.
            </p>
          </div>

          <div className="card">
            <h3>Clothing Try-on</h3>
            <p>
              Trying on different uniforms and campus shirts has never been
              easy! With the help of Augmented Reality, you can easily try
              different clothes on!
            </p>
          </div>

          <div className="card">
            <h3>Capstone Module</h3>
            <p>
              Specifically for the Information Technology students, capstone
              manuals are also sold at EBA.
            </p>
          </div>

          <div className="card">
            <h3>Printing Services</h3>
            <p>
              Printing services inside of campus is also available through our
              EBA.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EBA