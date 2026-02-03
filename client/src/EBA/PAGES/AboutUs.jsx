import React, { useState } from "react";
import "./About.css";

import Navbar from "../Navbar";
import Footer from "../Footer";

const AboutUs = () => {
  const [openStatus, setOpenStatus] = useState(false);
  const toggleCheckStatus = () => {
    setOpenStatus(!openStatus);
  };

  return (
    <div className="aboutus">
      <Navbar
        toggleCheckStatus={toggleCheckStatus}
        openStatus={openStatus}
        setOpenStatus={setOpenStatus}
      />	

      <div className="header">
        <h1>Meet the Developers</h1>
      </div>

      <div className="team-grid">
        <div className="member-card">
          <div className="member-image">
            <img src="/developers/lee.png" alt="Edishan Lee Tenorio" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Edishan Lee Tenorio</h3>
            <p className="member-quote">"Lately I been, I been losing sleep"</p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/paulo.png" alt="John Paulo Ramos" />
          </div>
          <div className="member-info">
            <h3 className="member-name">John Paulo Ramos</h3>
            <p className="member-quote">
              "mas pipiliin kong ma deds kung buhay ko'y di fresh"
            </p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/wendell.png" alt="Chris Wendell Flaviano" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Chris Wendell Flaviano</h3>
            <p className="member-quote">
              "Everything has its own beginning, If there's a hole, there's a
              goal"
            </p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/andrei.png" alt="Marc Andrei Nisperos" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Marc Andrei Nisperos</h3>
            <p className="member-quote">"Well done is better than well said"</p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/nino.png" alt="Aerold Nino Bautista" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Aerold Nino Bautista</h3>
            <p className="member-quote">"Proseso bago Asenso"</p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/mykel.png" alt="John Mykel Estoria" />
          </div>
          <div className="member-info">
            <h3 className="member-name">John Mykel Estoria</h3>
            <p className="member-quote">
              "Do not boast of tomorrow, for you do not know what a day may
              bring forth"
            </p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/mar.png" alt="Rency Mar Tabangay" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Rency Mar Tabangay</h3>
            <p className="member-quote">
              "If you want to buy things without looking at the price, work
              without looking at the clock"
            </p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/jv.png" alt="JV Recierdo" />
          </div>
          <div className="member-info">
            <h3 className="member-name">JV Recierdo</h3>
            <p className="member-quote">
              "A comfort zone is a beautiful place, but nothing ever grows
              there"
            </p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img
              src="/developers/blessel.png"
              alt="Dhaliane Blessel Palenzuela"
            />
          </div>
          <div className="member-info">
            <h3 className="member-name">Dhaliane Blessel Palenzuela</h3>
            <p className="member-quote">
              "Programming isn't about what you know, it's about what you can
              figure out"
            </p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/joy.png" alt="Mary Joy Hilab" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Mary Joy Hilab</h3>
            <p className="member-quote">"Be your own kind of beauty"</p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/may.png" alt="Maria May Montano" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Maria May Montano</h3>
            <p className="member-quote">
              "Life changes with every breath you take and every word you read"
            </p>
          </div>
        </div>

        <div className="member-card">
          <div className="member-image">
            <img src="/developers/louie.png" alt="Louie Arceo" />
          </div>
          <div className="member-info">
            <h3 className="member-name">Louie Arceo</h3>
            <p className="member-quote">
              "Hindi ka makakarating sa patutunguhan kung di ka marunong
              lumingon sa pinanggalingan"
            </p>
          </div>
        </div>
      </div>
      <Footer toggleCheckStatus={toggleCheckStatus} openStatus={openStatus} />
    </div>
  );
};

export default AboutUs;
