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
import { HiDotsVertical } from "react-icons/hi";
import { VscLayoutSidebarRight } from "react-icons/vsc";

const Inventory = ({ activeAdmin, openSidebar, role }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 20;

  const fetchTotalPages = async () => {
    try {
      const res = await axios.get("https://eba-website.onrender.com/inventory/count");
      setTotalPages(Math.ceil(res.data.total / rowsPerPage));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTotalPages();
  }, []);

  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const fetchInventories = async (page = currentPage) => {
    const response = await axios.get(
      `https://eba-website.onrender.com/inventory?page=${page}`,
    );
    setInventories(response.data);
    const categoryResponse = await axios.get("https://eba-website.onrender.com/categories");
    setCategories(categoryResponse.data);
  };

  const [message, setMessage] = useState("");
  const [activeInventory, setActiveInventory] = useState(null);
  const handleAction = (inventory) => {
    setActiveInventory(activeInventory === inventory.id ? null : inventory.id);
  };

  const [form, setForm] = useState(true);
  const [selection, setSelection] = useState(null);
  const initialFormData = {
    category: "",
    itemName: "",
    variant: "",
    size: "",
    quantity: "",
    price: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const [image, setImage] = useState();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const handleFile = (e) => {
    setImage(e.target.files[0]);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData({ ...formData, [name]: value });

    // Automatically hide Variant and Size if category is "Capstone Manual" or "Module"
    if (name === "category") {
      if (value === "Capstone Manual" || value === "Module") {
        setForm(false); // hide Variant and Size
        setSelection("Module"); // limit dropdown to Module/Capstone Manual
      } else {
        setForm(true); // show Variant and Size
        setSelection("Student Uniform"); // limit dropdown to uniforms
      }
    }
  };

  const [formMessage, setFormMessage] = useState("");
  const handleSubmit = async () => {
    const isMissingFields =
      !formData.category ||
      !formData.itemName ||
      (form && !formData.variant) ||
      (form && !formData.size) ||
      !formData.quantity ||
      !formData.price;

    if ((mode === "add" && !image) || isMissingFields) {
      setFormMessage(
        mode === "add" && !image
          ? "Please fill all fields including image"
          : "Please fill all required fields",
      );
      setTimeout(() => setFormMessage(""), 2000);
      return;
    }

    const formdata = new FormData();
    formdata.append("inventory", image);
    Object.entries(formData).forEach(([key, value]) => formdata.append(key, value));

    try {
      if (mode === "add") {
        await axios.post("https://eba-website.onrender.com/inventory", formdata);
        setMessage("Item added successfully");
      } else {
        await axios.put(
          `https://eba-website.onrender.com/inventory/${editingInventory.id}`,
          formdata,
        );
        setMessage("Item edited successfully");
      }

      setTimeout(() => setMessage(""), 2000);
      setShowModal(false);
      setEditingInventory(null);
      fetchInventories(currentPage);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setMode("add");
    setImage(null);
    setFormData(initialFormData);
    setShowModal(true);
  };
  
  const [editingInventory, setEditingInventory] = useState(null);
  const handleEdit = (inventory) => {
    setEditingInventory(inventory);
    setMode("edit");
    setImage(null);
    setShowModal(true);

    // Decide whether to show Variant & Size and what selection filter to use
    if (
      inventory.category === "Capstone Manual" ||
      inventory.category === "Module"
    ) {
      setForm(false); // hide Variant & Size
      setSelection("Module"); // only show Module / Capstone Manual categories
    } else {
      setForm(true); // show Variant & Size
      setSelection("Student Uniform"); // show only uniform categories
    }

    setFormData({
      category: inventory.category,
      itemName: inventory.item_name,
      variant: inventory.variant || "",
      size: inventory.size || "",
      quantity: inventory.quantity,
      price: inventory.price,
    });
  };

  const handleRemove = async (id) => {
    await axios.delete(`https://eba-website.onrender.com/inventory/${id}`);
    setInventories(inventories.filter((inventory) => inventory.id !== id));

    setMessage("Item removed successfully");
    setTimeout(() => {
      setMessage("");
    }, 2000);

    fetchInventories();
    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setActiveInventory(false);
    setMode("add");
    setFormData(initialFormData);
    setForm(true)
    setShowConfirm(false);
    setSelection(null);
  };

  useEffect(() => {
    fetchInventories(currentPage);
  }, [currentPage]);


  const [showConfirm, setShowConfirm] = useState(false);
  const [remove, setRemove] = useState('')
  const msg =
    mode === "add" ? "Add" :
    mode === "edit" ? "Edit" :
    mode === "delete" ? "Delete" :
    ""
  ;
  const handleRemoveItem = (item) => {
    setMode("delete");
    setRemove(item);
    setShowConfirm(true);
  };
  const handleConfirm = () => {
    const isMissingFields =
      !formData.category ||
      !formData.itemName ||
      (form && !formData.variant) ||
      (form && !formData.size) ||
      !formData.quantity ||
      !formData.price;

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

  return (
    <div className="space-y-3">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={openSidebar} className="cursor-pointer lg:hidden">
            <VscLayoutSidebarRight size={20} />
          </button>

          <h1 className="text-(--secondary-text) text-2xl font-bold">
            {activeAdmin}
          </h1>
        </div>

        <button
          onClick={handleAdd}
          className={`bg-(--accent) px-5 py-2 rounded-lg text-white cursor-pointer ${role === "Admin" && "hidden"}`}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Add New Item
        </button>
      </div>

      <div className="no-scrollbar overflow-auto">
        <div className="min-w-[900px] space-y-3">
          <div className="p-3 bg-(--primary-bg) shadow rounded-lg text-center">
            <div className="px-3 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center text-center">
              <div>Image</div>
              <div>Category</div>
              <div>Item</div>
              <div>Variant</div>
              <div>Size</div>
              <div>Quantity</div>
              <div>Price</div>
              <div>Action</div>
            </div>
          </div>
          <div className="p-3 bg-(--primary-bg) shadow rounded-lg text-center">
            {inventories.length === 0 ? (
              <p className="py-6 text-gray-500">No Items</p>
            ) : (
              inventories.map((inventory, index) => (
                <div
                  className={`
                      mb-3 p-3 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center shadow rounded-lg text-center transition-all
                      ${activeInventory === inventory.id ? "bg-(--accent)/15 border-transparent" : "bg-(--primary-bg) border-gray-400"}
                    `}
                  key={index}
                >
                  <div>
                    <img
                      src={`https://eba-website.onrender.com/ITEMS/${inventory.image}`}
                      alt=""
                      className="w-14 h-14 object-contain mx-auto rounded"
                    />
                  </div>
                  <div className="line-clamp-Font />-w-[130px]">
                    {inventory.category}
                  </div>
                  <div className="line-clamp-2 font-medium max-w-[130px]">
                    {inventory.item_name}
                  </div>
                  <div>{inventory.variant || "-"}</div>
                  <div>{inventory.size || "-"}</div>
                  <div>{inventory.quantity}</div>
                  <div className="font-medium">₱{inventory.price}</div>
                  <div className="relative">
                    <button
                      onClick={() => handleAction(inventory)}
                      disabled={role === "Admin"}
                      className="p-2 cursor-pointer"
                    >
                      <HiDotsVertical size={18} />
                    </button>

                    {activeInventory === inventory.id && (
                      <div className="p-2 absolute bottom-0 right-[70%] bg-(--primary-bg) shadow-lg rounded-md z-50 w-45">
                        <button
                          onClick={() => handleEdit(inventory)}
                          className="w-full text-left px-3 py-2 rounded cursor-pointer flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleRemoveItem(inventory.id)}
                          className="w-full text-left px-3 py-2 text-(--error) cursor-pointer flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-5">
        <button
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage <= 1}
          className="cursor-pointer disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage >= totalPages} // disable if on last page
          className="cursor-pointer disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
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
              <h2 className="text-2xl font-bold text-(--secondary-text)">
                {mode === "add" ? "Add Inventory" : "Edit Inventory"}
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
              <label className="text-lg font-medium">Category</label>
              <select
                value={formData.category}
                name="category"
                onChange={handleChange}
                required
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories
                  .filter((category) => {
                    if (mode === "edit") {
                      if (selection === "Module") {
                        return ["Module", "Capstone Manual"].includes(
                          category.category,
                        );
                      } else if (selection === "Student Uniform") {
                        return [
                          "Student Uniform",
                          "Department Shirt",
                          "Organizational Shirt",
                          "NTSP T-Shirt",
                        ].includes(category.category);
                      }
                    } else {
                      return [
                        "Student Uniform",
                        "Department Shirt",
                        "Organizational Shirt",
                        "NTSP T-Shirt",
                        "Module",
                        "Capstone Manual",
                      ].includes(category.category);
                    }
                  })
                  .map((category, index) => (
                    <option key={index} value={category.category}>
                      {category.category}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Item Name</label>
              <input
                type="text"
                name="itemName"
                placeholder="Enter item name"
                value={formData.itemName}
                onChange={handleChange}
                required
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              />
            </div>
            {form && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">Variant</label>
                  <input
                    type="text"
                    name="variant"
                    placeholder="Enter variant"
                    value={formData.variant}
                    onChange={handleChange}
                    required
                    className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">Size</label>
                  <select
                    value={formData.size}
                    name="size"
                    onChange={handleChange}
                    required
                    className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
                  >
                    <option value="" disabled>
                      Select Size
                    </option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">Extra Large</option>
                  </select>
                </div>
              </>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Quantity</label>
              <input
                type="number"
                name="quantity"
                placeholder="e.g. 500"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Price</label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-(--outline) outline-(--accent) rounded-lg p-2"
              />
            </div>

            {formMessage && (
              <div className="text-(--error) text-center">{formMessage}</div>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full px-4 py-2 bg-(--primary-btn) hover:bg-(--accent) transition-all text-white rounded-lg cursor-pointer"
            >
              {mode === "add" ? "Add Item" : "Update Item"}
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="h-screen p-3 fixed inset-0 bg-black/50 center-flex z-50">
          <div className="w-full bg-white text-[#2E2E2E] p-5 rounded-lg lg:w-1/3 overflow-auto flex justify-between flex-col gap-10">
            <div className="space-y-3">
              <h1 className="font-bold text-lg text-(--error)">{msg} item</h1>
              <p>Are you sure you want to {mode} this item?</p>
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
                  mode === "add" || mode === "edit"
                    ? handleSubmit()
                    : handleRemove(remove)
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

export default Inventory;
