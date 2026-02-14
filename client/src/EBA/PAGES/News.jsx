import React, { useEffect, useState } from 'react'
import Navbar from '../Navbar'
import Footer from '../Footer'
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

const News = () => {
  const [openStatus, setOpenStatus] = useState(false);
  const toggleCheckStatus = () => {
    setOpenStatus(!openStatus);
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 4;

  const fetchTotalPages = async () => {
    try {
      const res = await axios.get("https://capstone-cxej.onrender.com/bulletin/count");
      setTotalPages(Math.ceil(res.data.total / rowsPerPage));
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchTotalPages();
  }, []);

  const [bulletin, setBulletin] = useState([]);
  const fetchBulletin = async (page = currentPage) => {
    const response = await axios.get(
      `https://capstone-cxej.onrender.com/bulletin?&page=${page}`,
    );
    setBulletin(response.data);
  };

  useEffect(() => {
    fetchBulletin(currentPage);
  }, [currentPage]);

  return (
    <div>
      <Navbar
        toggleCheckStatus={toggleCheckStatus}
        openStatus={openStatus}
        setOpenStatus={setOpenStatus}
      />

      <div className="min-h-screen p-5 center-flex">
        <div className="w-full mt-20 lg:mt-0 space-y-5">
          <h1 className="text-2xl text-(--secondary-text) font-bold">
            News and Announcements
          </h1>

          {bulletin.length === 0 ? (
            <p className="py-10 text-gray-500 text-center">
              No News and Announcement
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {bulletin.map((bulletin, index) => (
                <div
                  key={index}
                  className="min-h-[300px] lg:min-h-[400px] p-5 bg-(--secondary-bg) rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.3)] flex flex-col gap-5"
                >
                  <p className="text-(--secondary-text) font-medium">
                    {new Date(bulletin.announcementdate).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}{" "}
                  </p>

                  <div>
                    <h3 className='text-lg font-semibold'>{bulletin.title}</h3>
                    <small>Posted by {bulletin.faculty_staff}</small>
                  </div>

                  <p className='mt-5'>
                    {bulletin.details}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage <= 1}
              className="cursor-pointer disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>

            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages}
              className="cursor-pointer disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      <Footer toggleCheckStatus={toggleCheckStatus} openStatus={openStatus} />
    </div>
  );
}

export default News;