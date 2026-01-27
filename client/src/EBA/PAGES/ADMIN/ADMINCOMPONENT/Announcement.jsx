import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faTrash } from "@fortawesome/free-solid-svg-icons";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

const Announcement = ({ activeAdmin }) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");

  const [announcements, setAnnouncements] = useState([]);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [startDate, setStartDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [message, setMessage] = useState("");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const res = await axios.get("http://localhost:3000/bulletin");
    setAnnouncements(res.data);
  };

  /* ---------------- CREATE ---------------- */
  const createAnnouncement = async () => {
    await axios.post("http://localhost:3000/announcement", {
      Title: title,
      Details: details,
      FacultyName: facultyName,
      announcementDate: startDate.toISOString(),
    });

    resetForm();
    fetchAnnouncements();
    flashMessage("Event added successfully");
  };

  /* ---------------- UPDATE ---------------- */
  const updateAnnouncement = async () => {
    if (!selectedEvent) return;

    await axios.put(`http://localhost:3000/announcement/${selectedEvent.id}`, {
      Title: title,
      Details: details,
      FacultyName: facultyName,
      announcementDate: startDate.toISOString(),
    });

    resetForm();
    fetchAnnouncements();
    flashMessage("Event updated successfully");
  };

  /* ---------------- DELETE ---------------- */
  const deleteAnnouncement = async (id) => {
    await axios.delete(`http://localhost:3000/announcement/${id}`);
    fetchAnnouncements();
    flashMessage("Event deleted successfully");
    setShowModal(false);
  };

  /* ---------------- HELPERS ---------------- */
  const resetForm = () => {
    setTitle("");
    setDetails("");
    setFacultyName("");
    setStartDate(new Date());
    setSelectedEvent(null);
    setShowModal(false);
    setMode("add");
  };

  const flashMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000);
  };

  /* ---------------- CALENDAR EVENTS ---------------- */
  const events = announcements.map((a) => {
    const date = new Date(a.announcementDate);
    date.setHours(12, 0, 0, 0); // prevent timezone shifting

    return {
      id: a.ID,
      title: a.Title,
      start: date,
      end: date,
      allDay: true,
      desc: a.Details,
      facultyName: a.Faculty_Staff || "",
    };
  });

  /* ---------------- CALENDAR HANDLERS ---------------- */
  const handleSelectSlot = ({ start }) => {
    const safeDate = new Date(start);
    safeDate.setHours(12, 0, 0, 0);

    setMode("add");
    setStartDate(safeDate);
    setShowModal(true);
    setSelectedEvent(null);
    setTitle("");
    setDetails("");
    setFacultyName("");
  };

  const handleSelectEvent = (event) => {
    setMode("edit");
    setSelectedEvent(event);
    setTitle(event.title);
    setDetails(event.desc);
    setFacultyName(event.facultyName); // ✅ now works
    setStartDate(new Date(event.start));
    setShowModal(true);
  };

  return (
    <div className="space-y-3">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-(--secondary-text) text-2xl font-bold">
          Events & {activeAdmin}s
        </h1>
      </div>

      <div className="p-3 bg-(--primary-bg) rounded-lg shadow">
        <Calendar
          localizer={localizer}
          events={events}
          selectable
          popup
          style={{ height: 500 }}
          date={calendarDate}
          view={calendarView}
          onNavigate={setCalendarDate}
          onView={setCalendarView}
          views={["month", "week", "day", "agenda"]}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={() => ({
            style: {
              backgroundColor:
                "color-mix(in srgb, var(--accent) 75%, transparent)",
              color: "#fff",
              borderRadius: "6px",
              border: "none",
            },
          })}
        />
      </div>

      {message && (
        <div className="bg-(--primary-bg) shadow-[0_0_5px_#acacac] py-2 px-10 rounded-lg absolute bottom-5 left-1/2 -translate-x-1/2">
          {message}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white p-6 rounded w-1/3 h-screen space-y-5">
            <div className="mb-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-(--secondary-text)">
                {mode === "add" ? "Add Event" : "Edit Event"} {facultyName}
              </h2>

              <button className="cursor-pointer" onClick={resetForm}>
                <FontAwesomeIcon icon={faClose} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Event Title</label>
              <input
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
                placeholder="e.g. Flag Ceremony"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Faculty Staff</label>
              <input
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
                placeholder="Ms. John Jeomi"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Event Details</label>
              <textarea
                className="w-full h-[150px] border border-(--outline) outline-(--accent) rounded-lg p-2"
                placeholder="Enter event description or details here"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div className="flex justify-between gap-3 pt-3">
              {mode === "edit" && (
                <button
                  className="px-4 py-2 bg-(--error) flex-1 text-white rounded-lg cursor-pointer"
                  onClick={() => deleteAnnouncement(selectedEvent.id)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              )}

              <button
                className="px-4 py-2 bg-(--primary-btn) flex-1 text-white rounded-lg cursor-pointer"
                onClick={
                  mode === "add" ? createAnnouncement : updateAnnouncement
                }
              >
                {mode === "add" ? "Save" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
