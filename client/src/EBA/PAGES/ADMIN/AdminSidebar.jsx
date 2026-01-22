import React, { useState } from 'react';
import { IoGrid, IoCalendarClear } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { BiSolidMegaphone } from "react-icons/bi";
import { MdInventory } from "react-icons/md";
import { RiFileCopyFill } from "react-icons/ri";
import { FaBars } from "react-icons/fa";

import { ImUserPlus } from "react-icons/im";
import { FaKey } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { FaMoon } from "react-icons/fa";
import { FaSun } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

import './CSS/Sidebar.css';

const SidebarBtn = [
  { name: "Dashboard", icon: <IoGrid size={20} /> },
  { name: "Transaction", icon: <GrTransaction size={20} /> },
  { name: "Announcement", icon: <BiSolidMegaphone size={20} /> },
  { name: "Inventory", icon: <MdInventory size={20} /> },
  { name: "Calendar", icon: <IoCalendarClear size={20} /> },
  { name: "Pages", icon: <RiFileCopyFill size={20} /> },
];

const AdminSidebar = ({ 
	image, 
	username, 
	email,
	isDarkMode,
	setIsDarkMode,
	onMenuClick, 
	handleLogout 
}) => {
  const [activeButton, setActiveButton] = useState("Dashboard");
  const handleButtonClick = (componentName) => {
    setActiveButton(componentName);
    onMenuClick(componentName);
  };

	const [openModal, setOpenModal] = useState(false);

  return (
    <div className="w-1/4 h-screen p-3 bg-(--primary-bg) shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3">
          <img src="logo.png" alt="Logo" className="w-15 h-15" />
          <div className="font-bold">
            <p>Cavite State University - Tanza</p>
            <p className="text-(--secondary-text)">EBA Admin Panel</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {SidebarBtn.map((button) => (
            <button
              key={button.name}
              onClick={() => handleButtonClick(button.name)}
              className={`py-2 px-5 flex items-center gap-3 hover:bg-(--accent) hover:text-white transition-all rounded-lg cursor-pointer ${activeButton === button.name && "bg-(--primary-btn) hover:bg-(--primary-btn) text-white"}`}
            >
              {button.icon} {button.name}
            </button>
          ))}
        </div>
      </div>

      <div className="py-1 px-3 flex items-center gap-3 border border-gray-400 rounded-lg relative">
        <img
          src={`http://localhost:3000/UPLOADS/${image}`}
          alt="Admin Profile"
          className="w-14 h-14 object-cover rounded-full"
        />

        <div className="space-y-1">
          <h3 className="font-bold text-md">{username}</h3>
          <p className="text-xs">{email}</p>
        </div>

        <button
          className="ml-auto cursor-pointer"
          onClick={() => setOpenModal(!openModal)}
        >
          <FaBars />
        </button>

        {openModal && (
          <div className="min-w-60 p-2 absolute left-[105%] bottom-0 bg-(--primary-bg) shadow-lg rounded-lg space-y-2">
            <button
              className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer"
              onClick={handleLogout}
            >
              <ImUserPlus size={20} />
              New Admin Account
            </button>

            <button
              className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer"
              onClick={handleLogout}
            >
              <FaKey size={20} />
              Manage Account
            </button>

            <button
              className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer relative"
              onClick={handleLogout}
            >
              <FaBell size={20} />
              Notification
              <span className="w-2 h-2 bg-(--error) rounded-full absolute right-0 top-0"></span>
            </button>

            <button
              className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer"
              onClick={() => setIsDarkMode((prev) => !prev)}
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <div className="w-full h-0.5 my-3 bg-gray-500/30" />

            <button
              className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer"
              onClick={handleLogout}
            >
              <MdLogout size={20} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
