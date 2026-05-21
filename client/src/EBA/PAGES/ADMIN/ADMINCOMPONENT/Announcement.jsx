import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faTrash } from "@fortawesome/free-solid-svg-icons";
import { VscLayoutSidebarRight } from "react-icons/vsc";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

const Announcement = ({ activeAdmin, openSidebar, role }) => {
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
      title: title,
      details: details,
      facultyname: facultyName,
      announcementdate: startDate.toISOString(),
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
    resetForm()
  };

  /* ---------------- HELPERS ---------------- */
  const resetForm = () => {
    setTitle("");
    setDetails("");
    setFacultyName("");
    setStartDate(new Date());
    setSelectedEvent(null);
    setShowModal(false);
    setShowConfirm(false);
    setMode("");
  };

  const flashMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000);
  };

  /* ---------------- CALENDAR EVENTS ---------------- */
  const events = announcements.map((a) => {
    const date = new Date(a.announcementdate);
    date.setHours(12, 0, 0, 0); // prevent timezone shifting

    return {
      id: a.id,
      title: a.title,
      start: date,
      end: date,
      allDay: true,
      desc: a.details,
      facultyname: a.faculty_staff || "",
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
    setFacultyName(event.facultyname);
    setStartDate(new Date(event.start));
    setShowModal(true);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [selected, setSelected] = useState('')
  const msg =
    mode === "add" ? "Add" :
    mode === "edit" ? "Edit" :
    mode === "delete" ? "Delete" :
    ""
  ;

  const handleRemove = (selected) => {
    setMode("delete");
    setSelected(selected);
    setShowConfirm(true);
  };

  const [formMessage, setFormMessage] = useState("");
  const handleConfirm = () => {
    if (mode === "add" || mode === "edit") {
      if (!title || !details || !facultyName) {
        setFormMessage("Please fill the blanks");
        setTimeout(() => {
          setFormMessage("");
        }, 2000);
        return;
      }
    }
    setShowConfirm(true);
  };

  const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;
  const [isTouch, setIsTouch] = useState(isTouchDevice());

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = () => setIsTouch(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);


  return (
    <div className="space-y-3">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={openSidebar} className="cursor-pointer lg:hidden">
            <VscLayoutSidebarRight size={20} />
          </button>
          <h1 className="text-(--secondary-text) text-2xl font-bold">
            Events & {activeAdmin}s
          </h1>
        </div>
      </div>

      <div className="h-[85vh] p-3 bg-(--primary-bg) rounded-lg shadow">
        <Calendar
          key={isTouch ? "touch-calendar" : "mouse-calendar"}
          localizer={localizer}
          events={events}
          selectable
          popup={false}
          longPressThreshold={0}
          date={calendarDate}
          view={calendarView}
          onNavigate={setCalendarDate}
          onView={setCalendarView}
          views={["month", "week", "day"]}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={() => ({
            style: {
              backgroundColor:
                "color-mix(in srgb, var(--accent) 75%, transparent)",
              color: "#fff",
              borderRadius: "6px",
              border: "none",
              touchAction: "manipulation",
            },
          })}
        />
      </div>

      {message && (
        <div className="w-3/4 lg:w-auto bg-(--primary-bg) shadow-[0_0_5px_#acacac] py-2 px-10 rounded-lg absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
          {message}
        </div>
      )}

      {showModal && (
        <div className="h-screen fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white text-[#2E2E2E] p-6 rounded w-3/4 lg:w-1/3 h-screen space-y-5">
            <div className="mb-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {role === "Admin"
                  ? "View Event"
                  : mode === "add"
                    ? "Add Event"
                    : "Edit Event"}
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
                placeholder="Ma'am Admin"
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

            {formMessage && (
              <div className="text-(--error) text-center">{formMessage}</div>
            )}

            <div
              className={`justify-between gap-3 pt-3 ${role !== "Admin" ? "flex" : "hidden"}`}
            >
              {(mode === "edit" || mode === "delete") && (
                <button
                  className="px-4 py-2 bg-(--error) flex-1 text-white rounded-lg cursor-pointer"
                  onClick={() => handleRemove(selectedEvent.id)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              )}

              <button
                className="px-4 py-2 bg-(--primary-btn) flex-1 text-white rounded-lg cursor-pointer"
                onClick={handleConfirm}
              >
                {mode === "add" ? "Save" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="h-screen p-3 fixed inset-0 bg-black/50 center-flex z-50">
          <div className="w-full bg-white text-[#2E2E2E] p-5 rounded-lg lg:w-1/3 overflow-auto flex justify-between flex-col gap-10">
            <div className="space-y-3">
              <h1 className="font-bold text-lg text-(--error)">
                {msg} Events & Announcement
              </h1>
              <p>Are you sure you want to {mode} this events & announcement?</p>
            </div>

            <div className="w-full flex justify-between items-center gap-3">
              <button
                className="flex-1 border border-(--outline) py-2 rounded-lg shadow cursor-pointer"
                onClick={resetForm}
              >
                No, cancel
              </button>
              <button
                className="flex-1 bg-(--error) text-white py-2 rounded-lg shadow cursor-pointer"
                onClick={() =>
                  (mode === "add" && createAnnouncement()) ||
                  (mode === "edit" && updateAnnouncement()) ||
                  (mode === "delete" && deleteAnnouncement(selected))
                }
              >
                Yes, {mode}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
