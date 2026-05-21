import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import '../CSS/Date.css';

const Date = () => {
	// const [value, setValue] = useState(new Date());
	const [announcements, setAnnouncements] = useState([]);
	const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);

	useEffect(() => {
		fetchAnnouncements();
	}, []);

	const fetchAnnouncements = async () => {
		try {
			const response = await axios.get('https://eba-website.onrender.com/bulletin');
			setAnnouncements(response.data);
		} catch (error) {
			console.error('Error fetching announcements:', error);
		}
	};

	const handleDateClick = (date) => {
		setValue(date);
		const dayAnnouncements = announcements.filter(announcement => {
			const announcementDate = new Date(announcement.Date);
			return announcementDate.toDateString() === date.toDateString();
		});
		setSelectedAnnouncements(dayAnnouncements);
	};

	const tileContent = ({ date }) => {
		const hasAnnouncements = announcements.some(announcement => {
			const announcementDate = new Date(announcement.Date);
			return announcementDate.toDateString() === date.toDateString();
		});

		return hasAnnouncements ? (
			<div className="announcement-dot" />
		) : null;
	};

	return (
		<div className='date-container'>
			{/* <div className='date-header'>
				<p>{value.toLocaleDateString()}</p>
			</div>
			<div className="calendar-container">
				<Calendar
					onChange={handleDateClick}
					value={value}
					tileContent={tileContent}
					className="custom-calendar"
					style={{ width: '100%', height: 'auto' }}
				/>
				
				{selectedAnnouncements.length > 0 && (
					<div className="announcements-list">
						<h3>Announcements for {value.toLocaleDateString()}</h3>
						{selectedAnnouncements.map((announcement, index) => (
							<div key={index} className="announcement-item">
								<h4>{announcement.Title}</h4>
								<p>{announcement.Details}</p>
								<small>By: {announcement.Faculty} {announcement.Faculty_Staff}</small>
							</div>
						))}
					</div>
				)}
			</div> */}
		</div>
	);
};

export default Date;