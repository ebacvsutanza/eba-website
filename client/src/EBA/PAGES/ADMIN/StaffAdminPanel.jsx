import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Sidebars from './StaffSidebar';
import Dashboard from './STAFFCOMPONENT/Dashboard';
import Transaction  from './STAFFCOMPONENT/Transaction';
import Announcement from './STAFFCOMPONENT/Announcement';
import Inventory from './STAFFCOMPONENT/Inventory';
import Date from './STAFFCOMPONENT/Date';

// import InputForm from '../../InputForm';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faEnvelope, faBell, faSun, faMoon, faX, faEye, faEyeSlash, faChevronDown } from '@fortawesome/free-solid-svg-icons';

import './CSS/Admin.css';
import './CSS/Component.css';

const AdminPanel = () => {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [activeAdmin, setActiveComponent] = useState('Dashboard');
	const [isOpen, setIsOpen] = useState(false);
	const [confirmation, setConfirmation] = useState(false);

	const [image, setImage] = useState('');
	const [username, setUsername] = useState('');
	const [openPass, setOpenPass] = useState(false);
	const [values, setValues] = useState({
		password: ''
	});
	
	const navigateTo = useNavigate();
	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			window.location.href = '/adminlogin';
			return;
		}

		const decodedToken = JSON.parse(atob(token.split('.')[1]));
		if (decodedToken.role !== 'Admin') {
		  window.location.href = '/adminlogin';
		}

		setImage(decodedToken.image);
		setUsername(decodedToken.username);
	}, [token])

	const handleMenuClick = (componentName) => {
		setActiveComponent(componentName);
	}

	const handleLogout = () => {
		localStorage.removeItem('token');
		
		navigateTo('/adminlogin');
	};

	const inputs = [
		{
			id: 1,
			type: 'password',
			name: 'password',
			placeholder: 'Enter new password',
			required: true
		}
	]

	const onChange = (e) => {
		setValues({...values, [e.target.name]: e.target.value})
	}

	const changePass = async () => {
		try {
			const token = localStorage.getItem('token'); // or retrieve from login response
	
			if (!token) {
				alert("No token found");
				return;
			}
	
			const decodedToken = JSON.parse(atob(token.split('.')[1]));
	
			const response = await axios.post('http://localhost:3000/adminchangepass', {
				id: decodedToken.id,
				password: values.password
			});
			setOpenPass(prev => !prev)
			alert('Password changed successfully');
		} catch (err) {
			console.error(err);
			alert('Invalid credentials or server error');
		}
	};
	
	const handleEditClick = (e) => {
		e.preventDefault();

		setConfirmation(prev => !prev)
	}

	const handleConfirm = () => {
		setConfirmation(prev => !prev)
		changePass()
	}
	const handleCancel = () => {
		
		setConfirmation(prev => !prev)
	}

	return (
		<div className={isDarkMode ? 'adminpanel dark-mode' : 'adminpanel light-mode'}>
			<div className="navbar">
				<nav>
					<button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
						<FontAwesomeIcon icon={isOpen ? faX : faBars} className='icon' />
					</button>

					<div className="logo">
						<img src='/logo.png' alt="" />
						<h4>EBA Admin Panel</h4>
					</div>

					<div className="buttons">
						<button>
							<FontAwesomeIcon icon={faEnvelope} className='icon' />
						</button>

						<button>
							<FontAwesomeIcon icon={faBell} className='icon'/>
						</button>

						<button onClick={() => setIsDarkMode(!isDarkMode)} className='toggle-theme'>
							<FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className='icon' />
						</button>

						<div className="user-profile" onClick={() => setOpenPass(!openPass)}>
							<p>Hi, {username}</p>
							<img src={`http://localhost:3000/UPLOADS/${image}`} alt="" />
							<FontAwesomeIcon icon={faChevronDown} />
						</div>

						{openPass && (
							<form onSubmit={handleEditClick} className="input-container changepass">
								{inputs.map((input) => (
									<InputForm 
										key={input.id} 
										{...input} 
										value={values[input.name]}
										onChange={onChange} 
									/>
								))}

								<button type='submit'>Change Password</button>
							</form>
						)}
					</div>
				</nav>
			</div>

			<div className="container">
				<Sidebars onMenuClick={handleMenuClick} isOpen={isOpen} handleLogout={handleLogout}/>
				
				{confirmation && (
					<div className="modal-container">
						<div className="confirmation">
							<p>Are you sure you want to change password?</p>
							<div className="btn">
								<button onClick={handleConfirm}>Yes</button>
								<button onClick={handleCancel}>No</button>
							</div>
						</div>
					</div>
				)}

				<div className='content'>
					{activeAdmin === 'Dashboard' && <Dashboard />}
					{activeAdmin === 'Transaction' && <Transaction />}
					{activeAdmin === 'Announcement' && <Announcement />}
					{activeAdmin === 'Inventory' && <Inventory />}
					{activeAdmin === 'Calendar' && <Date />}
					{activeAdmin === 'AddNewAdmin' && <AddNewAdmin />}
					{activeAdmin === 'AddDesign' && <AddDesign />}
					{activeAdmin === 'Pages' && <Pages />}
				</div>
			</div>
		</div>
	)
}

export default AdminPanel