import React, { useState } from 'react';
import { IoGrid, IoCalendarClear } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { BiSolidMegaphone } from "react-icons/bi";
import { MdInventory } from "react-icons/md";
import { FaBars } from "react-icons/fa";

import { FaBell } from "react-icons/fa";
import { FaMoon } from "react-icons/fa";
import { FaSun } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { FaUser } from 'react-icons/fa6';
import { VscLayoutSidebarRight } from "react-icons/vsc";

import './CSS/Sidebar.css';

const SidebarBtn = [
  { name: "Dashboard", icon: <IoGrid size={20} /> },
  { name: "Transaction", icon: <GrTransaction size={20} /> },
  { name: "Announcement", icon: <BiSolidMegaphone size={20} /> },
  { name: "Inventory", icon: <MdInventory size={20} /> },
  { name: "Manage Account", icon: <FaUser size={20} /> },
];

const AdminSidebar = ({
  image,
  username,
  email,
  isDarkMode,
  setIsDarkMode,
  onMenuClick,
  handleLogout,
  notification,
  sidebar,
  setSidebar
}) => {
  const [activeButton, setActiveButton] = useState("Dashboard");
  const handleButtonClick = (componentName) => {
    setActiveButton(componentName);
    onMenuClick(componentName);
  };

  const [openModal, setOpenModal] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const handleMenu = () => {
    setOpenModal(!openModal);
    setNotifDropdown(false);
  };

  return (
    <div
      className={`
      w-3/4 md:w-1/2 xl:w-1/4 h-screen p-3 bg-(--primary-bg) shadow-lg flex flex-col justify-between z-50 transition-all xl:relative xl:left-0 absolute top-0
      ${sidebar ? "left-0" : "-left-full"}
    `}
    >
      <div>
        <div className="flex items-center gap-3">
          <img src="logo.png" alt="Logo" className="w-15 h-15" />
          <div className="w-full font-bold flex xl:block items-center justify-between gap-2">
            <div>
              <p>Cavite State University - Tanza</p>
              <p className="hidden lg:block text-(--secondary-text)">
                EBA Admin Panel
              </p>
            </div>
            <button
              onClick={() => setSidebar((prev) => !prev)}
              className="xl:hidden"
            >
              <VscLayoutSidebarRight size={20} />
            </button>
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

        <button className="ml-auto cursor-pointer" onClick={handleMenu}>
          <FaBars />
        </button>

        {openModal &&
          (!notifDropdown ? (
            <div className="w-full max-w-70 p-2 absolute md:left-[105%] bottom-18 md:bottom-0 bg-(--primary-bg) shadow-lg rounded-lg space-y-2 z-50">
              <button
                className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer relative"
                onClick={() => setNotifDropdown((prev) => !prev)}
              >
                <FaBell size={20} />
                Notification
                <span className="w-4 h-4 bg-(--error) text-white text-[10px] rounded-full center-flex absolute right-0 top-0">
                  {notification.length}
                </span>
              </button>

              <button
                className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer"
                onClick={() => setIsDarkMode((prev) => !prev)}
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </button>

              <div className="w-full h-0.5 mt-10 mb-3 bg-gray-500/30" />

              <button
                className="w-full text-left py-2 px-4 hover:bg-(--accent)/25 transition-all rounded-lg flex items-center gap-3 cursor-pointer"
                onClick={handleLogout}
              >
                <MdLogout size={20} />
                Logout
              </button>
            </div>
          ) : notification.length === 0 ? (
            <p>No new notification.</p>
          ) : (
            <div className="w-full max-w-70 max-h-100 overflow-auto no-scrollbar p-2 absolute md:left-[105%] bottom-18 md:bottom-0 bg-(--primary-bg) shadow-lg rounded-lg space-y-2 z-50">
              {notification.map((notif, index) => (
                <li
                  key={index}
                  className="p-3 rounded-lg transition-all hover:bg-gray-200"
                >
                  {notif.type === "transaction" ? (
                    <div className="notif">
                      <p className="font-semibold">🛒 New Order</p>
                      <p>
                        Item Name: {notif.Item_Name} - {notif.Size}
                      </p>
                      <p>Variant: {notif.Variant}</p>
                      <p>Quantity: {notif.Quantity}</p>
                    </div>
                  ) : (
                    <div className="notif">
                      <p className="font-semibold">⚠️ Low Stock</p>
                      <p>
                        <span>{notif.Item_Name}</span> ({notif.Variant},{" "}
                        {notif.Size})
                      </p>
                      <p>
                        Remaining:{" "}
                        <span className="font-semibold">{notif.Quantity}</span>
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
