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
    <div>
      <Navbar
        toggleCheckStatus={toggleCheckStatus}
        openStatus={openStatus}
        setOpenStatus={setOpenStatus}
      />

      <div className="h-screen lg:p-10 flex items-center">
        <div className="p-5 flex flex-col gap-5 flex-1">
          <h1 className="text-(--secondary-text) text-3xl font-bold">
            About Us
          </h1>
          <div>
            <p>
              We are a team of student innovators dedicated to simplifying your
              campus experience.
            </p>
            <p>
              To create a high-quality AR fitting room, we’ve split our tasks
              into two core groups:
            </p>
            <p className="text-(--secondary-text)">
              Augmented Reality team and 3D Modelling team.
            </p>
            <br />
            <p>
              This division of labor allows us to push the boundaries of what’s
              possible in student-led tech.
            </p>
          </div>
        </div>

        <img src="exclamation.png" alt="" className="w-1/3 hidden lg:block" />
      </div>

      <div className="px-5 lg:px-10 space-y-10">
        <div className="space-y-3">
          <h1 className="text-(--secondary-text) text-3xl font-semibold">
            Augmented Reality Team
          </h1>
          <p className="lg:w-1/2">
            Focuses on the development and integration of Augmented Reality
            using Kinect technology and real-time body tracking to create a
            seamless virtual 'Magic Mirror' experience.
          </p>
        </div>
        <div className="xl:px-20 mb-20 grid grid-cols-2 lg:flex justify-center flex-wrap gap-3 lg:gap-10">
          <div className="lg:lg:w-[250px] h-[300px] lg:h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/lee.png" alt="Edishan Lee Tenorio" />
            </div>
            <h3 className="font-semibold">Edishan Lee Tenorio</h3>
            <p className="text-center">"Lately I been, I been losing sleep"</p>
          </div>

          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/paulo.png" alt="John Paulo Ramos" />
            </div>
            <h3 className="font-semibold">John Paulo Ramos</h3>
            <p className="text-center">
              "mas pipiliin kong ma deds kung buhay ko'y di fresh"
            </p>
          </div>

          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/wendell.png" alt="Chris Wendell Flaviano" />
            </div>
            <h3 className="font-semibold">Chris Wendell Flaviano</h3>
            <p className="text-center">
              "Everything has its own beginning, If there's a hole, there's a
              goal"
            </p>
          </div>

          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/nino.png" alt="Aerold Nino Bautista" />
            </div>
            <h3 className="font-semibold">Aerold Nino Bautista</h3>
            <p className="text-center">"Proseso bago Asenso"</p>
          </div>

          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/louie.png" alt="Louie Arceo" />
            </div>
            <h3 className="font-semibold">Louie Arceo</h3>
            <p className="text-center">
              "Hindi ka makakarating sa patutunguhan kung di ka marunong
              lumingon sa pinanggalingan"
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-(--secondary-text) text-3xl font-semibold">
            3D Modelling Team
          </h1>
          <p className="lg:w-1/2">
            Dedicated to the digital craftsmanship of the 3D clothing model
            assets to ensure every uniform looks and fits as realistically as
            possible on the user.{" "}
          </p>
        </div>
        <div className="lg:px-20 mb-20 grid grid-cols-2 lg:flex justify-center flex-wrap gap-3 lg:gap-10">
          {" "}
          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/mykel.png" alt="John Mykel Estoria" />
            </div>
            <h3 className="font-semibold">John Mykel Estoria</h3>
            <p className="text-center">
              "Do not boast of tomorrow, for you do not know what a day may
              bring forth"
            </p>
          </div>
          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/jv.png" alt="JV Recierdo" />
            </div>
            <h3 className="font-semibold">JV Recierdo</h3>
            <p className="text-center">
              "A comfort zone is a beautiful place, but nothing ever grows
              there"
            </p>
          </div>
          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/mar.png" alt="Rency Mar Tabangay" />
            </div>
            <h3 className="font-semibold">Rency Mar Tabangay</h3>
            <p className="text-center">
              "If you want to buy things without looking at the price, work
              without looking at the clock"
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-(--secondary-text) text-3xl font-semibold">
            EBA Bulletin Team
          </h1>
          <p className="lg:w-1/2">
            Specializes in developing the core information systems and user
            interface that manage uniform catalogs, campus announcements, and
            student order status tracking.
          </p>
        </div>
        <div className="lg:px-20 mb-20 grid grid-cols-2 lg:flex justify-center flex-wrap gap-3 lg:gap-10">
          {" "}
          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img
                src="/developers/blessel.png"
                alt="Dhaliane Blessel Palenzuela"
              />
            </div>
            <h3 className="font-semibold">Dhaliane Blessel Palenzuela</h3>
            <p className="text-center">
              "Programming isn't about what you know, it's about what you can
              figure out"
            </p>
          </div>
          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/joy.png" alt="Mary Joy Hilab" />
            </div>
            <h3 className="font-semibold">Mary Joy Hilab</h3>
            <p className="text-center">"Be your own kind of beauty"</p>
          </div>
          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/may.png" alt="Maria May Montano" />
            </div>
            <h3 className="font-semibold">Maria May Montano</h3>
            <p className="text-center">
              "Life changes with every breath you take and every word you read"
            </p>
          </div>
          <div className="lg:w-[250px] h-[300px] lg:h-[350px] p-3 bg-(--secondary-bg) rounded-lg shadow flex items-center flex-col gap-5">
            <div className="w-3/4 rounded-lg overflow-hidden">
              <img src="/developers/andrei.png" alt="Marc Andrei Nisperos" />
            </div>
            <h3 className="font-semibold">Marc Andrei Nisperos</h3>
            <p className="text-center">"Well done is better than well said"</p>
          </div>
        </div>
      </div>
      <Footer toggleCheckStatus={toggleCheckStatus} openStatus={openStatus} />
    </div>
  );
};

export default AboutUs;
