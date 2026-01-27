import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './AdminSidebar';
import Dashboard from './ADMINCOMPONENT/Dashboard';
import Transaction  from './ADMINCOMPONENT/Transaction';
import Announcement from './ADMINCOMPONENT/Announcement';
import Inventory from './ADMINCOMPONENT/Inventory';
import Calendar from './ADMINCOMPONENT/Calendar';
import AddNewAdmin from './ADMINCOMPONENT/AddNewAdmin';
import AddDesign from './ADMINCOMPONENT/AddDesign';
import Pages from './ADMINCOMPONENT/Pages';


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
		if (!["DEAN", "EBA"].includes(decodedToken.role)) {
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
		} catch (err) {
			localStorage.removeItem("token");
			window.location.href = "/adminlogin";
		}
	};


	const [activeAdmin, setActiveComponent] = useState("Transaction");
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




  const [notifications, setNotifications] = useState([]);
	const [notifDropdown, setNotifDropdown] = useState(false);

	const [isOpen, setIsOpen] = useState(false);

	

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
      />
      <div className="w-3/4 h-screen p-5 overflow-y-auto">
        {activeAdmin === "Dashboard" && <Dashboard activeAdmin={activeAdmin} />}
        {activeAdmin === "Transaction" && <Transaction activeAdmin={activeAdmin} />}
        {activeAdmin === "Announcement" && <Announcement activeAdmin={activeAdmin} />}
        {activeAdmin === "Inventory" && <Inventory activeAdmin={activeAdmin} />}
        {activeAdmin === "Calendar" && <Calendar activeAdmin={activeAdmin} />}
        {activeAdmin === "Pages" && <Pages activeAdmin={activeAdmin} />}
      </div>

      {/* <div className="navbar">
				<nav>
					<button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
						<FontAwesomeIcon icon={isOpen ? faX : faBars} className='icon' />
					</button>

					<div className="logo">
						<img src='/logo.png' alt="" />
						<h4>EBA Admin Panel</h4>
					</div>

					<div className="buttons">
						<button className='mail-btn'>
							<FontAwesomeIcon icon={faEnvelope} className='icon' />
						</button>

						<button onClick={() => setNotifDropdown(prev => !prev)} className='notif-btn'>
							<FontAwesomeIcon icon={faBell} className='icon'/>
							<span>{notifications.length}</span>
						</button>

						{notifDropdown && (
							<div className="notification-container">
								{notifications.length === 0 ? (
									<p>No new notifications.</p>
								) : (
									<ul className="notification">
										{notifications.map((notif, index) => (
											<li key={index}>
												{notif.type === 'transaction' ? (
													<div className='notif'>
														<p>🛒 New Order</p>
														<p><span>{notif.Item_Name}</span> ({notif.Variant}, {notif.Size})</p>
														<p>Quantity: {notif.Quantity}</p>
														<p>Order Time: {new Date(notif.time).toLocaleString()}</p>
													</div>
												) : (
													<div className='notif'>
														<p>⚠️ Low Stock</p>
														<p><span>{notif.Item_Name}</span> ({notif.Variant}, {notif.Size})</p>
														<p>Remaining: {notif.Quantity}</p>
													</div>
												)}
											</li>
										))}
									</ul>
								)}
							</div>
						)}

						<button onClick={() => setIsDarkMode(!isDarkMode)} className='theme-btn'>
							<FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className='icon' />
						</button>

						<div className="user-profile">
							<p>Hi, {username}</p>
							<img src={`http://localhost:3000/UPLOADS/${image}`} alt="" />
						</div>
					</div>
				</nav>
			</div>

			<div className="container">
				<Sidebar onMenuClick={handleMenuClick} isOpen={isOpen} handleLogout={handleLogout}/>

				<div className='content'>
					{activeAdmin === 'Dashboard' && <Dashboard />}
					{activeAdmin === 'Transaction' && <Transaction />}
					{activeAdmin === 'Announcement' && <Announcement />}
					{activeAdmin === 'Inventory' && <Inventory />}
					{activeAdmin === 'Calendar' && <Calendar />}
					{activeAdmin === 'AddNewAdmin' && <AddNewAdmin />}
					{activeAdmin === 'AddDesign' && <AddDesign />}
					{activeAdmin === 'Pages' && <Pages />}
				</div>
			</div> */}
    </div>
  );
}

export default AdminPanel