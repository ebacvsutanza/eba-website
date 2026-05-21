import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Dashboard from './ADMINCOMPONENT/Dashboard';
import Transaction  from './ADMINCOMPONENT/Transaction';
import Announcement from './ADMINCOMPONENT/Announcement';
import Inventory from './ADMINCOMPONENT/Inventory';
import ManageAccount from "./ADMINCOMPONENT/ManageAccount";


import './CSS/Admin.css';
import './CSS/Component.css';
import AdminSidebar from './AdminSidebar';


const AdminPanel = () => {
	const token = localStorage.getItem("token");
	useEffect(() => {
		if (!token) {
			alert('Please Login First')
			window.location.href = "/adminlogin";
			return;
		}

		fetchAdmin(token);
		fetchNotifications();
	}, []);

	const fetchAdmin = async (token) => {
		try {
			const res = await fetch("https://eba-website.onrender.com/adminpanel", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) throw new Error("Unauthorized");

			const data = await res.json();
			setImage(data.image);
			setUsername(data.username);
			setEmail(data.email_address);
			setRole(data.role);
		} catch {
      alert('Login expired, please login again');
			localStorage.removeItem("token");
			window.location.href = "/adminlogin";
		}
	};


	const [activeAdmin, setActiveComponent] = useState("Dashboard");
	const handleMenuClick = (componentName) => {
    setActiveComponent(componentName);
  };

	const [image, setImage] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
	
	const navigateTo = useNavigate();
	const handleLogout = () => {
		localStorage.removeItem("token");
		navigateTo("/adminlogin");
	};	

	const [isDarkMode, setIsDarkMode] = useState(false);
	
	const [notification, setNotifications] = useState([])
	const fetchNotifications = async () => {
		try {
			const response = await axios.get('https://eba-website.onrender.com/notifications');
			setNotifications(response.data);
			} catch (err) {
			console.error('Error fetching notifications:', err);
		}
	};

	const [sidebar, setSidebar] = useState(false);
	const openSidebar = () => {
		setSidebar(prev => !prev)
	}

	return (
    <div
      className={`h-screen bg-(--secondary-bg) text-(--primary-text) flex ${isDarkMode && "dark-mode"}`}
    >
      <AdminSidebar
        image={image}
        username={username}
        email={email}
        onMenuClick={handleMenuClick}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        handleLogout={handleLogout}
				notification={notification}
				sidebar={sidebar}
				setSidebar={setSidebar}
				role={role}
      />
      <div className="w-full xl:w-3/4 h-screen p-5 overflow-y-auto">
        {activeAdmin === "Dashboard" && <Dashboard activeAdmin={activeAdmin} openSidebar={openSidebar} />}
        {activeAdmin === "Transaction" && <Transaction activeAdmin={activeAdmin} openSidebar={openSidebar} role={role} />}
        {activeAdmin === "Announcement" && <Announcement activeAdmin={activeAdmin} openSidebar={openSidebar} role={role} />}
        {activeAdmin === "Inventory" && <Inventory activeAdmin={activeAdmin} openSidebar={openSidebar} role={role} />}
				{role !== 'Admin' && activeAdmin === "Manage Account" && <ManageAccount activeAdmin={activeAdmin} openSidebar={openSidebar} />}
      </div>
    </div>
  );
}

export default AdminPanel