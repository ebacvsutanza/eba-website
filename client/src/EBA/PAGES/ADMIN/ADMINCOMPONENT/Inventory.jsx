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

const Inventory = ({ activeAdmin }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 20;

  const fetchTotalPages = async () => {
    try {
      const res = await axios.get("http://localhost:3000/inventory/count");
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
      `http://localhost:3000/inventory?page=${page}`,
    );
    setInventories(response.data);
    const categoryResponse = await axios.get("http://localhost:3000/exclusive");
    setCategories(categoryResponse.data);
  };

  const [message, setMessage] = useState("");
  const [activeInventory, setActiveInventory] = useState(null);
  const handleAction = (inventory) => {
    setActiveInventory(activeInventory === inventory.ID ? null : inventory.ID);
  };

  const [form, setForm] = useState(true);
  const [selection, setSelection] = useState(null);
  const [formData, setFormData] = useState({
    Category: "",
    ItemName: "",
    Variant: "",
    Size: "",
    Quantity: "",
    Price: "",
  });

  const [image, setImage] = useState();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const handleFile = (e) => {
    setImage(e.target.files[0]);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const form = new FormData();

    if (image) form.append("inventory", image);

    Object.entries(formData).forEach(([key, value]) => form.append(key, value));

    try {
      if (mode === "add") {
        await axios.post("http://localhost:3000/inventory", form);
      } else {
        await axios.put(
          `http://localhost:3000/inventory/${editingInventory.ID}`,
          form,
        );
      }

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
    setShowModal(true);
  };
  
  const [editingInventory, setEditingInventory] = useState(null);
  const handleEdit = (inventory) => {
    setEditingInventory(inventory);
    setMode("edit");
    setShowModal(true);

    if (
      inventory.Category === "Student Uniform" ||
      inventory.Category === "Department Shirt" ||
      inventory.Category === "Organizational Shirt"
    ) {
      setForm(true);
      setSelection("Student Uniform");
    } else {
      setForm(false);
      setSelection("Module");
    }

    setFormData({
      category: inventory.Category,
      itemName: inventory.Item_Name,
      variant: inventory.Variant || "",
      size: inventory.Size || "",
      quantity: inventory.Quantity,
      price: inventory.Price,
    });
  };

  const handleRemove = async (id) => {
    await axios.delete(`http://localhost:3000/inventory/${id}`);
    setInventories(inventories.filter((inventory) => inventory.id !== id));

    setMessage("Item removed successfully");
    setTimeout(() => {
      setMessage("");
    }, 2000);

    fetchInventories();
  };

  const resetForm = () => {
    setShowModal(false);
    setMode("add");
    setFormData({});
  };

  useEffect(() => {
    fetchInventories(currentPage);
  }, [currentPage]);

  return (
    <div className="space-y-3">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-(--secondary-text) text-2xl font-bold">
          {activeAdmin}
        </h1>

        <button
          onClick={handleAdd}
          className="bg-(--accent) px-5 py-2 rounded-lg text-white cursor-pointer"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Add New Item
        </button>
      </div>

      <div className="space-y-3">
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
                  ${activeInventory === inventory.ID ? "bg-(--accent)/15 border-transparent" : "bg-(--primary-bg) border-gray-400"}
                `}
                key={index}
              >
                <div>
                  <img
                    src={`http://localhost:3000/ITEMS/${inventory.Image}`}
                    alt=""
                    className="w-14 h-14 object-contain mx-auto rounded"
                  />
                </div>
                <div className="line-clamp-Font />-w-[130px]">
                  {inventory.Category}
                </div>
                <div className="line-clamp-2 font-medium max-w-[130px]">
                  {inventory.Item_Name}
                </div>
                <div>{inventory.Variant || "-"}</div>
                <div>{inventory.Size || "-"}</div>
                <div>{inventory.Quantity}</div>
                <div className="font-medium">₱{inventory.Price}</div>
                <div className="relative">
                  <button
                    onClick={() => handleAction(inventory)}
                    className="p-2 cursor-pointer"
                  >
                    <HiDotsVertical size={18} />
                  </button>

                  {activeInventory === inventory.ID && (
                    <div className="p-2 absolute top-[60%] right-[60%] bg-white border border-gray-200 shadow-lg rounded-md z-20 w-45">
                      <button
                        onClick={() => handleEdit(inventory)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleRemove(inventory.ID)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-(--error) cursor-pointer flex items-center gap-2"
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
          <div className="bg-(--primary-bg) shadow-[0_0_5px_#acacac] py-2 px-10 rounded-lg absolute bottom-5 left-1/2 -translate-x-1/2">
            {message}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white p-6 rounded w-1/3 h-screen space-y-5">
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
                <option value="" selected disabled>
                  Select Category
                </option>
                {categories
                  .filter((category) => {
                    if (selection === "Module") {
                      return ["Module", "Capstone Manual"].includes(
                        category.Category,
                      );
                    } else if (selection === "Student Uniform") {
                      return [
                        "Student Uniform",
                        "Department Shirt",
                        "Organizational Shirt",
                      ].includes(category.Category);
                    } else {
                      return [
                        "Student Uniform",
                        "Department Shirt",
                        "Organizational Shirt",
                        "Module",
                        "Capstone Manual",
                      ].includes(category.Category);
                    }
                  })
                  .map((category, index) => (
                    <option key={index} value={category.Category}>
                      {category.Category}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium">Item Name</label>
              <input
                type="text"
                name="itemName"
                placeholder="Enter name here"
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
                  ></input>
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
                    <option value="" selected disabled>
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

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-(--primary-btn) hover:bg-(--accent) transition-all text-white rounded-lg cursor-pointer"
            >
              {mode === "add" ? "Add Item" : "Update Item"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
