import React, {useState} from 'react'
import { FaChevronUp } from 'react-icons/fa';

import Navbar from './Navbar';
import Footer from './Footer';

import './EBA.css'

const FAQ = [
  {
    question: "How accurate are the size recommendations?",
    answer:
      "This system is used mainly to give you an estimate of what uniform or shirt size would fit you. It roughly has around 80% accuracy.",
  },
  {
    question: "Can I try other clothes aside from the uniform?",
    answer: "You may only try the school uniform and the different shirt designs inside the campus.",
  },
  {
    question: "What is the Check Status page for?",
    answer: "It's used to check the order status for the EBA items you bought through EBA Shop.",
  },
  {
    question: "How does the system measure my body?",
    answer: "The kiosk uses a Kinect sensor to map your silhouette in real-time, allowing the 3D model to move alongside you as you turn around.",
  },
  {
    question: "What happens to the photos I take using the system?",
    answer: "The photos that you take through the AR try on system will only be stored temporarily, you have the choice to have it sent to your email or discarded.",
  },
  {
    question: "What if the measurement was incorrect?",
    answer: "Since the system only provides an estimation for you, you should still check the suggested size before you finally buy it.",
  },
];

const EBA = () => {
  const [openStatus, setOpenStatus] = useState(false);
  const toggleCheckStatus = () => {
    setOpenStatus(!openStatus);
  };
  
  const [openIndex, setOpenIndex] = useState(null);

	return (
    <div>
      <Navbar
        toggleCheckStatus={toggleCheckStatus}
        openStatus={openStatus}
        setOpenStatus={setOpenStatus}
      />

      <div className="min-h-screen overflow-x-hidden">
        <div className="h-screen flex items-center">
          <div className="lg:w-1/2 p-10 space-y-10">
            <div className="text-[.4in] lg:text-[.5in] font-semibold">
              <h1 className="text-(--secondary-text)">
                Visualize your uniform,
              </h1>
              <h1>Simplify your fit</h1>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium">
                Make trying-on clothes easier.
              </h3>
              <p>
                See yourself in the Cavite State University school uniform,
                without the need to wear the clothing physically. See how it
                would fit before you buy.
              </p>
            </div>
          </div>
          <div className="hero-image hidden lg:flex">
            <img
              src="/ITEMS/heroeba.png"
              alt="Image shit"
              className="hero-img"
            />
          </div>
        </div>

        <div className="lg:py-16 p-5 lg:px-20 bg-[#23451D]/90 space-y-10 text-white">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">How does it work?</h3>
            <p>Get your uniform size estimation in under a minute.</p>
          </div>

          <div className="lg:px-15 space-y-5">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white rounded">
                <img
                  src="/icon1.png"
                  alt=""
                  className="w-10 h-10 lg:w-15 lg:h-15 object-contain"
                />
              </div>

              <div className="space-y-3 flex-1">
                <p className="font-semibold">
                  Step 1: Stand in front of the EBA Bulletin Board Kiosk
                </p>
                <small className="lg:ml-5">
                  Visit the EBA Bulletin Board Kiosk on campus. Stand in front
                  of the vertical high-definition "Smart Mirror" and launch the
                  AR try-on application to get started.
                </small>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white rounded">
                <img
                  src="/icon2.png"
                  alt=""
                  className="w-10 h-10 lg:w-15 lg:h-15 object-contain"
                />
              </div>

              <div className="space-y-3 flex-1">
                <p className="font-semibold">
                  Step 2: Browse clothing thru the AR Try-on application
                </p>
                <small className="lg:ml-5">
                  Browse the digital catalog with a tap. Select from uniform or
                  shirts to try on, a 3D model will be mapped to your body in
                  real-time, allowing you to see yourself in the clothing you
                  selected without the need to wear it in person.{" "}
                </small>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white rounded">
                <img
                  src="/icon3.png"
                  alt=""
                  className="w-10 h-10 lg:w-15 lg:h-15 object-contain"
                />
              </div>

              <div className="space-y-3 flex-1">
                <p className="font-semibold">
                  Step 3: Get your size estimation through the application{" "}
                </p>
                <small className="lg:ml-5">
                  Get a rough estimation of your clothing size with the help of
                  Kinect technology, and an option to save details and photos of
                  yourself while trying on clothes using AR.{" "}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-screen py-10 center-flex flex-col relative">
          <div className="space-y-5 text-center">
            <h1 className="font-bold font-heading text-4xl text-(--secondary-text)">
              Help Center
            </h1>
            <p className="text-lg">Got questions? We’ve got answers.</p>
          </div>

          <div className="w-full mt-10 px-3 center-flex flex-col gap-5">
            {FAQ.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <button
                  key={index}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={`
                    w-full lg:w-1/2 p-4 shadow-[0_0_5px_rgba(0,0,0,0.3)] flex flex-col justify-between rounded-lg cursor-pointer overflow-hidden transition-all
                    ${isOpen ? "h-[120px]" : "h-[50px]"}
                  `}
                >
                  <div className="mb-5 flex lg:items-center justify-between text-left">
                    <h3 className="font-medium lg:text-[16px]">
                      {faq.question}
                    </h3>

                    <FaChevronUp
                      className={`transition-all ${
                        !isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>

                  <p className="text-left">{faq.answer}</p>
                </button>
              );
            })}
          </div>

          <p className="mt-5">
            Can’t find what you’re looking for? Send us an e-mail{" "}
            <a
              className="text-(--secondary-text) underline"
              href="mailto:support@example.com?subject=External%20and%20Business%20Affairs%20FAQ"
            >
              here
            </a>
            .
          </p>

          <div className="w-80 h-80 bg-(--primary-btn) rounded-full absolute bottom-25 -left-20 hidden lg:block" />
          <div className="w-40 h-40 bg-[#C4C4C4] rounded-full absolute bottom-10 -left-20 hidden lg:block" />
          <div className="w-40 h-40 bg-(--secondary-text) rounded-full absolute top-[40%] -right-10 hidden lg:block" />
          <div className="w-70 h-70 bg-(--accent) rounded-full absolute top-[25%] right-15 hidden lg:block" />
        </div>
      </div>

      {/* <div className="hero-section">
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
      </div> */}

      {/* <div className="second-section">
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
      </div> */}

      <Footer toggleCheckStatus={toggleCheckStatus} openStatus={openStatus} />
    </div>
  );
}

export default EBA