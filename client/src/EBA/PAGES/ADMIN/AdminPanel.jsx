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


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faEnvelope, faBell, faSun, faMoon, faX } from '@fortawesome/free-solid-svg-icons';

import './CSS/Admin.css';
import './CSS/Component.css';

const AdminPanel = () => {
    const [notifications, setNotifications] = useState([]);
	const [notifDropdown, setNotifDropdown] = useState(false);

	const [isDarkMode, setIsDarkMode] = useState(false);
	const [activeAdmin, setActiveComponent] = useState('Dashboard');
	const [isOpen, setIsOpen] = useState(false);
	const [image, setImage] = useState('');
	const [username, setUsername] = useState('');

	const navigateTo = useNavigate();
	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			window.location.href = '/adminlogin';
			return;
		}

		const decodedToken = JSON.parse(atob(token.split('.')[1]));
		if (decodedToken.role !== 'DEAN' && decodedToken.role !== 'EBA') {
		  window.location.href = '/adminlogin';
		}

		setImage(decodedToken.image);
		setUsername(decodedToken.username);

		fetchNotifications();
	}, [token])

	const handleMenuClick = (componentName) => {
		setActiveComponent(componentName);
	}

	const handleLogout = () => {
		localStorage.removeItem('token');
		
		navigateTo('/adminlogin');
	};	

	const fetchNotifications = async () => {
		try {
			const response = await axios.get('http://localhost:3000/notifications');
			setNotifications(response.data);
			} catch (err) {
			console.error('Error fetching notifications:', err);
		}
	};

	return (
		<div className={` ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
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
			</div> */}

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
			</div>
		</div>
	)
}

export default AdminPanel