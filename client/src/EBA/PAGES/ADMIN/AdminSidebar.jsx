import React, { useState } from 'react';

import './CSS/Sidebar.css';

const Sidebar = ({ onMenuClick, isOpen, handleLogout }) => {
    const [activeButton, setActiveButton] = useState('Dashboard');
	const [settingOpen, setSettingOpen] = useState(false);

	const handleButtonClick = (componentName) => {
		setActiveButton(componentName);
		onMenuClick(componentName);
	};

	return (
		<div className="sidebar-container">
			<div className="sidebar">
				<div className="block">
					<div className="group">
						<button
							onClick={() => handleButtonClick('Dashboard')}
							className={activeButton === 'Dashboard' ? 'active' : ''}
						>
							<img src='/admin/dashboard.png' /> Dashboard
						</button>
						<button	
							onClick={() => handleButtonClick('Transaction')}
							className={activeButton === 'Transaction' ? 'active' : ''}
						>
							<img src='/admin/transaction.png' /> Transaction
						</button>
						<button
							onClick={() => handleButtonClick('Announcement')}
							className={activeButton === 'Announcement' ? 'active' : ''}
						>
							<img src='/admin/announcement.png' /> Events & Announcement
						</button>
						<button
							onClick={() => handleButtonClick('Inventory')}
							className={activeButton === 'Inventory' ? 'active' : ''}
						>
							<img src='/admin/inventory.png' /> Inventory
						</button>
						<button
							onClick={() => handleButtonClick('Calendar')}
							className={activeButton === 'Calendar' ? 'active' : ''}
						>
							<img src='/admin/calendar.png' /> Calendar
						</button>
					</div>

					<hr />

					<div className="group">
						<button
							onClick={() => setSettingOpen(!settingOpen)}
							className={activeButton === 'Settings' ? 'active' : 'setting'}
						>
							<img src='/admin/settings.png' /> Settings
						</button>

						{settingOpen && (
							<div className="setting-dropdown">
								<button
									onClick={() => handleButtonClick('AddNewAdmin')}
									className={activeButton === 'AddNewAdmin' ? 'active' : ''}
								>
									<img src='/admin/addnewadmin.png' /> Add New Admin
								</button>
								<button
									onClick={() => handleButtonClick('Pages')}
									className={activeButton === 'Pages' ? 'active' : ''}
								>
									<img src='/admin/pages.png' /> Manage Pages
								</button>
							</div>
						)}
						<button className='logout' onClick={handleLogout}>
							<img src="admin/logout.png" alt="" />
							Logout
						</button>
					</div>
				</div>
			</div>

			{/* <div className="responsive-sidebar">
				{isOpen && (
					<div className="block">
						<div className="group">
							<button
								onClick={() => handleButtonClick('Dashboard')}
								className={activeButton === 'Dashboard' ? 'active' : ''}
							>
								<img src='/admin/dashboard.png' /> Dashboard
							</button>
							<button
								onClick={() => handleButtonClick('Transaction')}
								className={activeButton === 'Transaction' ? 'active' : ''}
							>
								<img src='/admin/transaction.png' /> Transaction
							</button>
							<button
								onClick={() => handleButtonClick('Announcement')}
								className={activeButton === 'Announcement' ? 'active' : ''}
							>
								<img src='/admin/announcement.png' /> Events & Announcement
							</button>
							<button
								onClick={() => handleButtonClick('Inventory')}
								className={activeButton === 'Inventory' ? 'active' : ''}
							>
								<img src='/admin/inventory.png' /> Inventory
							</button>
							<button
								onClick={() => handleButtonClick('Calendar')}
								className={activeButton === 'Calendar' ? 'active' : ''}
							>
								<img src='/admin/calendar.png' /> Calendar
							</button>
						</div>

						<hr />

						<div className="group">
							<button
								onClick={() => setSettingOpen(!settingOpen)}
								className={activeButton === 'Settings' ? 'active' : 'setting'}
							>
								<img src='/admin/settings.png' /> Settings
							</button>

							{settingOpen && (
								<div className="setting-dropdown">
									<button
										onClick={() => handleButtonClick('AddNewAdmin')}
										className={activeButton === 'AddNewAdmin' ? 'active' : ''}
									>
										<img src='/admin/addnewadmin.png' /> Add New Admin
									</button>
									
									<button
										onClick={() => handleButtonClick('Pages')}
										className={activeButton === 'Pages' ? 'active' : ''}
									>
										<img src='/admin/pages.png' /> Manage Pages
									</button>
								</div>
							)}
							<button onClick={handleLogout}>
								<img src="admin/logout.png" alt="" />
								Logout
							</button>
						</div>
					</div>
				)}
			</div> */}
		</div>
	);
};

export default Sidebar;
