import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faClose,
  faPenToSquare,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { VscLayoutSidebarRight } from "react-icons/vsc";

const ManageAccount = ({ activeAdmin, openSidebar }) => {
  // ------------------------ State ------------------------
  const [manageAdmin, setManageAdmin] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage] = useState(20);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add"); // "add" or "edit"
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    Username: "",
    Role: "",
    Email_Address: "",
    Password: "",
  });
  
  const [message, setMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");

  // ------------------------ Fetch Total Pages ------------------------
  const fetchTotalPages = async () => {
    try {
      const res = await axios.get("http://localhost:3000/manageadmin/count");
      setTotalPages(Math.ceil(res.data.total / rowsPerPage));
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------ Fetch Admin Accounts ------------------------
  const fetchManageAccount = async (page = currentPage) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/manageadmin?page=${page}&limit=${rowsPerPage}`
      );
      setManageAdmin(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------ Handle Input Changes ------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    setImage(e.target.files[0]);
  };

  // ------------------------ Handle Add/Edit Modal ------------------------
  const handleEdit = (admin) => {
    setShowModal(true);
    setMode("edit");
    setEditingAdmin(admin);
    setImage(null);

    setFormData({
      Username: admin.Username,
      Role: admin.Role,
      Email_Address: admin.Email_Address,
      Password: "", // Leave blank so user can keep old password
    });
  };

  const handleAdd = () => {
    setShowModal(true);
    setMode("add");
    setEditingAdmin(null);
    setImage(null);
    setFormData({
      Username: "",
      Role: "",
      Email_Address: "",
      Password: "",
    });
  };

  const resetForm = () => {
    setShowModal(false);
    setMode("add");
    setEditingAdmin(null);
    setImage(null);
    setFormData({
      Username: "",
      Role: "",
      Email_Address: "",
      Password: "",
    });
    setFormMessage("");
    setShowConfirm(false);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [remove, setRemove] = useState('')
  const msg =
    mode === "add" ? "Add" :
    mode === "edit" ? "Edit" :
    mode === "delete" ? "Delete" :
    ""
  ; 
  const handleRemoveAccount = (admin) => {
    setMode('delete');
    setRemove(admin);
    setShowConfirm(true);
  }

  const handleConfirm = () => {
    
    const isMissingFields =
      !formData.Username ||
      !formData.Role ||
      !formData.Email_Address ||
      (mode === "add" && !formData.Password);

    if ((mode === "add" && !image) || isMissingFields) {
      setFormMessage(
        mode === "add" && !image
          ? "Please fill all fields including image"
          : "Please fill all required fields",
      );
      setTimeout(() => setFormMessage(""), 2000);
      return;
    }

    setShowConfirm(true);
  };


  // ------------------------ Handle Submit (Add/Edit) ------------------------
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.Username || !formData.Role || !formData.Email_Address || (mode === "add" && !formData.Password)) {
      setFormMessage("Please fill all required fields");
      setTimeout(() => setFormMessage(""), 2000);
      return;
    }

    const form = new FormData();
    if (image) form.append("manageadmin", image);
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "Password" && mode === "edit" && value === "") return; // skip empty password in edit
      form.append(key, value);
    });

    try {
      let res;
      if (mode === "add") {
        res = await axios.post("http://localhost:3000/manageadmin", form);
      } else {
        res = await axios.put(`http://localhost:3000/manageadmin/${editingAdmin.ID}`, form);
      }

      if (res.data.Status === "Success") {
        setMessage(mode === "add" ? "Admin added successfully" : "Admin updated successfully");
        fetchManageAccount(currentPage);
        resetForm();
      } else {
        setFormMessage(res.data.Status || "Error processing request");
      }

      setTimeout(() => setMessage(""), 2000);
      setTimeout(() => setFormMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setFormMessage("Server error, please try again");
      setTimeout(() => setFormMessage(""), 2000);
    }
  };

  // ------------------------ Handle Delete ------------------------
  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/manageadmin/${id}`);
      setMessage("Admin deleted successfully");
      fetchManageAccount(currentPage);
      setTimeout(() => setMessage(""), 2000);
      setShowConfirm(false)
    } catch (err) {
      console.error(err);
      setFormMessage("Failed to delete admin");
      setTimeout(() => setFormMessage(""), 2000);
    }
  };

  // ------------------------ Pagination ------------------------
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // ------------------------ Initial Load ------------------------
  useEffect(() => {
    fetchTotalPages();
    fetchManageAccount();
  }, []);

  useEffect(() => {
    fetchManageAccount(currentPage);
  }, [currentPage]);

  // ------------------------ Render ------------------------
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={openSidebar} className="cursor-pointer xl:hidden">
            <VscLayoutSidebarRight size={20} />
          </button>
          <h1 className="text-(--secondary-text) text-2xl font-bold">
            {activeAdmin}
          </h1>
        </div>

        <button
          onClick={handleAdd}
          className="bg-(--accent) px-5 py-2 rounded-lg text-white cursor-pointer"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          New Account
        </button>
      </div>

      {/* Table Header */}
      <div className="p-3 bg-(--primary-bg) shadow rounded-lg text-center">
        <div className="px-3 grid grid-cols-[1fr_1fr_1fr_1fr_1fr] place-items-center text-center">
          <div>Image</div>
          <div>Name</div>
          <div>Email Address</div>
          <div>Role</div>
          <div>Action</div>
        </div>
      </div>

      {/* Admin List */}
      <div className="p-3 bg-(--primary-bg) shadow rounded-lg text-center">
        {manageAdmin.length === 0 ? (
          <p className="py-6 text-gray-500">No Items</p>
        ) : (
          manageAdmin.map((admin) => (
            <div
              key={admin.ID}
              className="mb-3 p-3 grid grid-cols-[1fr_1fr_1fr_1fr_1fr] place-items-center shadow rounded-lg text-center transition-all hover:bg-(--accent)/15 hover:border-transparent bg-(--primary-bg) border-gray-400"
            >
              <div>
                <img
                  src={`http://localhost:3000/UPLOADS/${admin.Image}`}
                  alt=""
                  className="w-14 h-14 object-contain mx-auto rounded"
                />
              </div>
              <div className="line-clamp-1 w-[130px]">
                {admin.Username}
              </div>
              <div className="line-clamp-2 font-medium max-w-[130px]">
                {admin.Email_Address}
              </div>
              <div>{admin.Role}</div>
              <div className="center-flex">
                <button
                  onClick={() => handleEdit(admin)}
                  className="w-full text-left px-3 py-2 rounded cursor-pointer flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPenToSquare} /> Edit
                </button>
                <button
                  onClick={() => handleRemoveAccount(admin.ID)}
                  className="w-full text-left px-3 py-2 text-(--error) cursor-pointer flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3 mt-5">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="cursor-pointer disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="cursor-pointer disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="bg-(--primary-bg) shadow-[0_0_5px_#acacac] py-2 px-10 rounded-lg absolute bottom-5 left-1/2 -translate-x-1/2">
          {message}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="h-screen fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white p-6 rounded w-1/3 h-screen space-y-5 overflow-auto">
            <div className="mb-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-(--secondary-text)">
                {mode === "add" ? "Add Account" : "Edit Account"}
              </h2>
              <button className="cursor-pointer" onClick={resetForm}>
                <FontAwesomeIcon icon={faClose} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Image</label>
              <input
                type="file"
                onChange={handleFile}
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Username</label>
              <input
                type="text"
                name="Username"
                value={formData.Username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Email Address</label>
              <input
                type="email"
                name="Email_Address"
                value={formData.Email_Address}
                onChange={handleChange}
                placeholder="email@email.com"
                required
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Role</label>
              <select
                name="Role"
                value={formData.Role}
                onChange={handleChange}
                required
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="Admin">Admin</option>
                <option value="EBA Staff">EBA Staff</option>
                <option value="DEAN">DEAN</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Password</label>
              <input
                type="password"
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                placeholder={
                  mode === "edit"
                    ? "Leave blank to keep current password"
                    : "Enter Password"
                }
                required={mode === "add"}
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              />
            </div>

            {formMessage && <div className="text-(--error) text-center">{formMessage}</div>}
            
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full px-4 py-2 bg-(--primary-btn) hover:bg-(--accent) transition-all text-white rounded-lg cursor-pointer"
            >
              {mode === "add" ? "Create Account" : "Update Account"}
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="h-screen fixed inset-0 bg-black/50 center-flex z-50">
          <div className="bg-white p-5 rounded-lg w-1/3 overflow-auto flex justify-between flex-col gap-10">
            <div className="space-y-3">
              <h1 className="font-bold text-lg text-(--error)">{msg} account</h1>
              <p>Are you sure you want to {mode} this account?</p>
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
                onClick={() => mode === 'add' || mode === 'edit' ? handleSubmit() : handleRemove(remove)}
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

export default ManageAccount;
