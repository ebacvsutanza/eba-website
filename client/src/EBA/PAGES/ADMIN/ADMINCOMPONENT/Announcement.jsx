import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faChevronLeft, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';

const localizer = momentLocalizer(moment);

const Announcement = () => {
	// const [announcements, setAnnouncements] = useState([]);
	// const [addAnnouncement, setAddAnnouncement] = useState('');
	// const [confirmation, setConfirmation] = useState(false);
	// const [msg, setMsg] = useState('');
	// const [IDRemove, setIDRemove] = useState('');
	
	// const [title, setTitle] = useState('');
	// const [details, setDetails] = useState('');
	// const [faculty, setFaculty] = useState('');
	// const [facultyName, setFacultyName] = useState('');
	// const [message, setMessage] = useState('');
	
	// const [showEditForm, setShowEditForm] = useState(false);
	// const [editAnnouncement, setEditAnnouncement] = useState(null);
	// const [formData, setFormData] = useState({ 
	// 	title: '', 
	// 	details: '', 
	// 	faculty: '', 
	// 	facultyName: '', 
	// 	announcementDate: new Date()
	// });

	// const [startDate, setStartDate] = useState(new Date());
	
	// useEffect(() => {
	// 	fetchAnnouncement();
	// }, []);
	
	// const fetchAnnouncement = async () => {
	// 	const response = await axios.get('http://localhost:3000/bulletin');
	// 	setAnnouncements(response.data);
	// };

	// const handleAddClick = (e) => {
	// 	e.preventDefault();

	// 	setMsg('add')
	// 	setConfirmation(prev => !prev)
	// 	setAddAnnouncement(false);
	// }
	// const handleEditClick = () => {
	// 	setMsg('edit')
	// 	setConfirmation(prev => !prev)
	// 	setShowEditForm(false);
	// }
	// const handleRemoveClick = (id) => {
	// 	setMsg('remove')
	// 	setConfirmation(prev => !prev)
	// 	setIDRemove(id)
	// }
	
	// const handleConfirm = () => {
	// 	setConfirmation(prev => !prev)
		
	// 	if (msg === 'add') {
	// 		createEventAnnouncement()
	// 	} else if (msg === 'edit') {
	// 		handleUpdate();
	// 	} else if (msg === 'remove') {
	// 		handleRemove(IDRemove)
	// 	}
	// }
	// const handleCancel = () => {
	// 	setMsg('')
	// 	setConfirmation(prev => !prev)
	// }

	// const toggleAddAnnouncement = () => {
	// 	setAddAnnouncement(!addAnnouncement);
	// };
	
	// const createEventAnnouncement = () => {
	// 	axios.post('http://localhost:3000/announcement', {
	// 		Title: title,
	// 		Details: details,
	// 		Faculty: faculty,
	// 		FacultyName: facultyName,
	// 		announcementDate: startDate.toISOString()
	// 	})
	// 	.then((response) => {
	// 		if (response.data.Status === "Success") {
	// 			setTitle('');
	// 			setDetails('');
	// 			setFaculty('');
	// 			setFacultyName('');
	// 			setStartDate(new Date());
				
	// 			setAddAnnouncement(null);
	// 			fetchAnnouncement();
	// 			setMessage('Event/Announcement added successfully');
	// 			setTimeout(() => {
	// 				setMessage('');
	// 			}, 2000);
	// 		}
	// 	})
	// }
	// const handleEdit = (announcement) => {
	// 	setShowEditForm(prev => !prev)
	// 	setEditAnnouncement(announcement);
	// 	setFormData({ 
	// 		title: announcement.Title, 
	// 		details: announcement.Details, 
	// 		faculty: announcement.Faculty, 
	// 		facultyName: announcement.Faculty_Staff,
	// 		announcementDate: announcement.announcementDate ? new Date(announcement.announcementDate) : new Date()
	// 	});
	// };
	// const handleUpdate = async () => {
	// 	const updatedData = {
	// 		Title: formData.title,
	// 		Details: formData.details,
	// 		Faculty: formData.faculty,
	// 		FacultyName: formData.facultyName,
	// 		announcementDate: formData.announcementDate.toISOString()
	// 	};

	// 	axios.put(`http://localhost:3000/announcement/${editAnnouncement.ID}`, updatedData)
	// 	.then(res => {
	// 		setMessage("Event/Announcement edited successfully");
	// 		setTimeout(() => {
	// 			setMessage('');
	// 		}, 2000);
			
	// 		setEditAnnouncement(false);
	// 		setShowEditForm(false);
	// 		fetchAnnouncement();
	// 	})
	// };

	// const handleChange = (e) => {
	// 	const { name, value } = e.target;
	// 	setFormData({ ...formData, [name]: value });
	// };

	// const handleRemove = async (id) => {
	// 	await axios.delete(`http://localhost:3000/announcement/${id}`);
	// 	setAnnouncements(announcements.filter(announcement => announcement.id !== id));
		
	// 	setMessage("Event/Announcement deleted successfully");
	// 	setTimeout(() => {
	// 		setMessage('');
	// 	}, 2000);

	// 	fetchAnnouncement();
	// };
	// const events = announcements.map(announcement => {
	// 	const eventDate = announcement.announcementDate ? new Date(announcement.announcementDate) : new Date();
		
	// 	return {
	// 		title: announcement.Title,
	// 		start: eventDate,
	// 		end: eventDate,
	// 		allDay: true,
	// 		desc: announcement.Details,
	// 		faculty: `${announcement.Faculty} ${announcement.Faculty_Staff}`
	// 	};
	// });
const [transactions, setTransactions] = useState([]);
const [inventories, setInventories] = useState([]);
const [selectedTransactions, setSelectedTransactions] = useState([]);

useEffect(() => {
  fetchTransactions();
  fetchInventory();
}, []);

const fetchTransactions = async () => {
  const res = await axios.get("http://localhost:3000/api/transaction");
  setTransactions(res.data);
};

const fetchInventory = async () => {
  const res = await axios.get("http://localhost:3000/inventory");
  setInventories(res.data);
};
const bulkConfirm = async () => {
  try {
    const res = await axios.put(
      "http://localhost:3000/api/transaction/bulk-confirm",
      { ids: selectedTransactions },
    );

    alert(res.data.message);
    fetchTransactions();
    fetchInventory();
    setSelectedTransactions([]);
  } catch (err) {
    alert(err.response?.data?.message || "Bulk confirm failed");
  }
};

const bulkCancel = async () => {
  try {
    await axios.put("http://localhost:3000/api/transaction/bulk-cancel", {
      ids: selectedTransactions,
    });

    fetchTransactions();
    setSelectedTransactions([]);
  } catch {
    alert("Bulk cancel failed");
  }
};


	return (
    // <div className="admin-content">
    // 	<h1>Events & Announcement</h1>

    // 	<div className="announcement main-content">
    // 		<Calendar
    // 			localizer={localizer}
    // 			events={events}
    // 			startAccessor="start"
    // 			endAccessor="end"
    // 			style={{ height: 500, margin: '20px 0' }}
    // 			views={['month', 'week', 'day']}
    // 			defaultView='month'
    // 			tooltipAccessor={(event) => `${event.title}\n${event.desc}\nBy: ${event.faculty}`}
    // 			popup
    // 			selectable
    // 			onSelectEvent={(event) => {
    // 				setMessage(`${event.title} - ${event.desc}`);
    // 				setTimeout(() => setMessage(''), 3000);
    // 			}}
    // 		/>
    // 	</div>

    // 	<div className="announcement main-content">
    // 		<div className="top">
    // 			<h2>Upcoming Events/Announcement</h2>
    // 			<button onClick={toggleAddAnnouncement}><FontAwesomeIcon icon={faCalendarPlus} /></button>
    // 		</div>

    // 		{announcements.length === 0 ? (
    // 			<h3 className='no'>No Announcement</h3>
    // 		) : (
    // 			<div className="lists">
    // 				{announcements.map((announcement, index) => (
    // 					<div className='card' key={index}>
    // 						<div className="card-btn">
    // 							<h3>{announcement.Title}</h3>

    // 							<div className="btn-block">
    // 								<button onClick={() => handleEdit(announcement)}><FontAwesomeIcon icon={faPenToSquare} /></button>
    // 								<button onClick={() => handleRemoveClick(announcement.ID)}><FontAwesomeIcon icon={faTrash} /></button>
    // 							</div>
    // 						</div>

    // 						<h5>Written by: {announcement.Faculty} {announcement.Faculty_Staff}</h5>
    // 						<p>{announcement.Details}</p>
    // 					</div>
    // 				))}
    // 			</div>
    // 		)}

    // 		{confirmation && (
    // 			<div className="modal-container">
    // 				<div className="confirmation">
    // 					<p>Are you sure you want to {msg} events/announcement?</p>
    // 					<div className="btn">
    // 						<button onClick={handleConfirm}>Yes</button>
    // 						<button onClick={handleCancel}>No</button>
    // 					</div>
    // 				</div>
    // 			</div>
    // 		)}

    // 		{message && <div className='messages'>{message}</div>}
    // 	</div>

    // 	{addAnnouncement && (
    // 		<div className="modal-container">
    // 			<div className="add-events-announcement modal">
    // 				<div className="title">
    // 				<FontAwesomeIcon icon={faChevronLeft} className='icon' onClick={() => setAddAnnouncement(null)}/>
    // 				<h3>Add Events/Announcement</h3>
    // 				</div>

    // 				<form onSubmit={handleAddClick}>
    // 					<div className="input-block">
    // 						<label>Title:</label>
    // 						<input
    // 							type="text"
    // 							value={title}
    // 							onChange={(e) => setTitle(e.target.value)}
    // 							placeholder='Enter Title'
    // 							required
    // 						/>
    // 					</div>

    // 					<div className="input-block">
    // 						<label>Details:</label>
    // 						<textarea
    // 							value={details}
    // 							onChange={(e) => setDetails(e.target.value)}
    // 							placeholder='Enter Details'
    // 							required
    // 						/>
    // 					</div>

    // 					<div className="input-block">
    // 						<label>Faculty Staff Name:</label>

    // 						<div className="group">
    // 							<select
    // 								value={faculty}
    // 								onChange={(e) => setFaculty(e.target.value)}
    // 								required
    // 							>
    // 								<option value="" disabled>Select Option</option>
    // 								<option value="Ms.">Ms.</option>
    // 								<option value="Mrs.">Mrs.</option>
    // 								<option value="Mr.">Mr.</option>
    // 								<option value="Mx.">Mx.</option>
    // 							</select>

    // 							<input
    // 								type="text"
    // 								value={facultyName}
    // 								onChange={(e) => setFacultyName(e.target.value)}
    // 								placeholder='Enter Faculty Name'
    // 								required
    // 							/>
    // 						</div>
    // 					</div>

    // 					<div className="input-block">
    // 						<label>Event Date:</label>
    // 						<DatePicker
    // 							selected={startDate}
    // 							onChange={(date) => setStartDate(date)}
    // 							showTimeSelect
    // 							timeFormat="HH:mm"
    // 							timeIntervals={15}
    // 							dateFormat="MMMM d, yyyy h:mm aa"
    // 							minDate={new Date()}
    // 							required
    // 							className="date-pickers"
    // 							placeholderText="Select date and time"
    // 						/>
    // 					</div>

    // 					<button type="submit">Add</button>
    // 				</form>
    // 			</div>
    // 		</div>
    // 	)}
    // 	{showEditForm && editAnnouncement && (
    // 		<div className="modal-container">
    // 			<div className="add-events-announcement modal">
    // 				<div className="title">
    // 				<FontAwesomeIcon icon={faChevronLeft} className='icon' onClick={() => setEditAnnouncement(null)}/>
    // 				<h3>Edit Events/Announcement</h3>
    // 				</div>

    // 				<form>
    // 					<div className="input-block">
    // 						<label>Title:</label>
    // 						<input
    // 							type="text"
    // 							name='title'
    // 							value={formData.title}
    // 							onChange={handleChange}
    // 							placeholder='Enter Title'
    // 							required
    // 						/>
    // 					</div>

    // 					<div className="input-block">
    // 						<label>Details:</label>
    // 						<textarea
    // 							name='details'
    // 							value={formData.details}
    // 							onChange={handleChange}
    // 							placeholder='Enter Details'
    // 							required
    // 						/>
    // 					</div>

    // 					<div className="input-block">
    // 						<label>Faculty Staff Name:</label>
    // 						<div className="group">
    // 							<select
    // 								name='faculty'
    // 								value={formData.faculty}
    // 								onChange={handleChange}
    // 								required
    // 							>
    // 								<option value="" disabled>Select Option</option>
    // 								<option value="Ms.">Ms.</option>
    // 								<option value="Mrs.">Mrs.</option>
    // 								<option value="Mr.">Mr.</option>
    // 								<option value="Mx.">Mx.</option>
    // 							</select>

    // 							<input
    // 								type="text"
    // 								name='facultyName'
    // 								value={formData.facultyName}
    // 								onChange={handleChange}
    // 								placeholder='Enter Faculty Name'
    // 								required
    // 							/>
    // 						</div>
    // 					</div>

    // 					<div className="input-block">
    // 						<label>Event Date:</label>
    // 						<DatePicker
    // 							selected={new Date(formData.announcementDate)}
    // 							onChange={(date) => setFormData({ ...formData, announcementDate: date })}
    // 							showTimeSelect
    // 							timeFormat="HH:mm"
    // 							timeIntervals={15}
    // 							dateFormat="MMMM d, yyyy h:mm aa"
    // 							minDate={new Date()}
    // 							required
    // 							className="date-picker"
    // 							placeholderText="Select date and time"
    // 						/>
    // 					</div>

    // 					<button type="button" onClick={handleEditClick}>Edit</button>
    // 				</form>
    // 			</div>
    // 		</div>
    // 	)}
    // </div>
    <div className="text-center">
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={bulkConfirm}
          disabled={selectedTransactions.length === 0}
        >
          Bulk Confirm
        </button>

        <button
          onClick={bulkCancel}
          disabled={selectedTransactions.length === 0}
          style={{ marginLeft: 10 }}
        >
          Bulk Cancel
        </button>
      </div>

      {/* TRANSACTION TABLE */}
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  transactions.length > 0 &&
                  selectedTransactions.length === transactions.length
                }
                onChange={(e) =>
                  setSelectedTransactions(
                    e.target.checked ? transactions.map((tx) => tx.ID) : [],
                  )
                }
              />
            </th>
            <th>ID</th>
            <th>Item</th>
            <th>Variant</th>
            <th>Size</th>
            <th>Amount</th>
            <th>Qty</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.ID}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedTransactions.includes(tx.ID)}
                  onChange={(e) =>
                    setSelectedTransactions((prev) =>
                      e.target.checked
                        ? [...prev, tx.ID]
                        : prev.filter((id) => id !== tx.ID),
                    )
                  }
                />
              </td>
              <td>{tx.ID}</td>
              <td>{tx.Item_Name}</td>
              <td>{tx.Variant}</td>
              <td>{tx.Size}</td>
              <td>{tx.Amount}</td>
              <td>{tx.Quantity}</td>
              <td>{tx.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>
<br/>
<br/>
<br/>
<br/>
<br/>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Image</th>
            <th>Category</th>
            <th>Item Name</th>
            <th>Variant</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {inventories.map((item) => (
            <tr key={item.ID}>
              <td>
                <input type="checkbox" />
              </td>

              <td>{item.ID}</td>

              <td>
                <img src={item.Image} alt={item.Item_Name} width="40" />
              </td>

              <td>{item.Category}</td>
              <td>{item.Item_Name}</td>
              <td>{item.Variant}</td>
              <td>{item.Size}</td>
              <td>{item.Quantity}</td>
              <td>₹{item.Price}</td>

              {/* Actions */}
              <td>
                <button>Edit</button>
                <button
                  style={{
                    marginLeft: 8,
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Announcement;
