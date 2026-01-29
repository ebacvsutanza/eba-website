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

		const decodedToken = JSON.parse(atob(token.split(".")[1]));
		if (!["DEAN", "EBA Staff"].includes(decodedToken.role)) {
			alert("Please Login First");
      window.location.href = "/adminlogin";
      return;
    }

		fetchAdmin(token);
		fetchNotifications();
	}, []);

	const fetchAdmin = async (token) => {
		try {
			const res = await fetch("http://localhost:3000/adminpanel", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) throw new Error("Unauthorized");

			const data = await res.json();
			setImage(data.Image);
			setUsername(data.Username);
			setEmail(data.Email_Address);
		} catch {
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
	
	const navigateTo = useNavigate();
	const handleLogout = () => {
		localStorage.removeItem("token");
		navigateTo("/adminlogin");
	};	

	const [isDarkMode, setIsDarkMode] = useState(false);
	
	const [notification, setNotifications] = useState([])
	const fetchNotifications = async () => {
		try {
			const response = await axios.get('http://localhost:3000/notifications');
			setNotifications(response.data);
			} catch (err) {
			console.error('Error fetching notifications:', err);
		}
	};

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
      />
      <div className="w-3/4 h-screen p-5 overflow-y-auto">
        {activeAdmin === "Dashboard" && <Dashboard activeAdmin={activeAdmin} />}
        {activeAdmin === "Transaction" && <Transaction activeAdmin={activeAdmin} />}
        {activeAdmin === "Announcement" && <Announcement activeAdmin={activeAdmin} />}
        {activeAdmin === "Inventory" && <Inventory activeAdmin={activeAdmin} />}
        {activeAdmin === "Manage Account" && <ManageAccount activeAdmin={activeAdmin} />}
      </div>
    </div>
  );
}

export default AdminPanel