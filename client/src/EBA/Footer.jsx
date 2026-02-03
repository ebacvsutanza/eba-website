import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { CiGlobe } from "react-icons/ci";
import { IoMdMail } from "react-icons/io";
import { FaFacebookSquare } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = ({ toggleCheckStatus, openStatus }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const [isAbout, setIsAbout] = useState(false);
  const toggleAbout = () => {
    setIsAbout(!isAbout);
  };

  return (
    <footer className="lg:h-[350px] p-8 bg-[#455832] text-white flex flex-col lg:grid grid-cols-3 gap-5">
      <div className="h-full flex gap-2">
        <img src="/logo.png" alt="" className="w-15 h-15" />

        <div className="h-full pt-1 flex flex-col items-start justify-between gap-4 lg:gap-0">
          <div className="space-y-1">
            <h2 className="text-lg">Cavite State University - Tanza</h2>
            <p>External and Business Affairs</p>
          </div>

          <p>
            The Premier University in historic Cavite globally recognized for
            excellence in character development, academics, research, innovation
            and sustainable community engagement.
          </p>

          <button
            onClick={scrollToTop}
            className="border border-white p-3 rounded flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faArrowUp} />
            <p>BACK TO TOP</p>
          </button>

          <p>Copyright © 2026, Cavite State University - Tanza</p>
        </div>
      </div>

      <div className="py-3 flex flex-col justify-center gap-5">
        <h3 className="text-xl font-medium font-heading">Contact Us</h3>

        <div className="flex items-center gap-2">
          <CiGlobe size={25} />
          <p>www.cvsu-tanza.edu.ph</p>
        </div>

        <div className="flex items-center gap-2">
          <IoMdMail size={25} />
          <p>cvsutanza.cvsu.edu.ph</p>
        </div>

        <div className="flex items-center gap-2">
          <FaFacebookSquare size={25} />
          <p>Cavite State University - Tanza Campus</p>
        </div>

        <div className="flex items-center gap-2">
          <FaLocationDot size={25} />
          <p>Bahay Katuparan, Brgy. Bagtas, Tanza, Cavite, Philippines</p>
        </div>

        <div className="flex items-center gap-2">
          <FaPhoneAlt size={25} />
          <p>(046) 414-3979</p>
        </div>
      </div>

      <div className="py-3 flex flex-col justify-center gap-5">
        <h3 className="text-xl font-medium font-heading">Quick Links</h3>

        <Link to="/">Home</Link>
        <Link to="/news">News</Link>
        <Link to="/userlogin">Store</Link>
        <button
          onClick={toggleAbout}
          className="hover:underline cursor-pointer relative text-left"
        >
          <p
            className={
              isAbout
                ? "transition-all text-(--secondary-text)"
                : "transition-all group-hover:text-(--secondary-text)"
            }
          >
            About
          </p>
          {isAbout && (
            <div className="min-w-50 p-5 bg-(--primary-bg) text-(--primary-text) rounded-lg shadow flex items-start flex-col gap-3 absolute -top-25 left-0">
              <Link
                to="/abouteba"
                className="transition-all hover:text-(--secondary-text)"
              >
                Mission and Vision
              </Link>
              <Link
                to="/aboutdeveloper"
                className="transition-all hover:text-(--secondary-text)"
              >
                About the Developer
              </Link>
            </div>
          )}
        </button>
        <button
          onClick={toggleCheckStatus}
          className="hover:underline cursor-pointer text-left"
        >
          <p
            className={
              openStatus
                ? "transition-all text-(--secondary-text)"
                : "transition-all group-hover:text-(--secondary-text)"
            }
          >
            Check Status
          </p>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
