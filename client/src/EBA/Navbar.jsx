import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faBars,
  faClose,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ toggleCheckStatus, openStatus, setOpenStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAbout, setIsAbout] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState([]); // always an array
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleAbout = () => setIsAbout(!isAbout);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      axios
        .get(`http://localhost:3000/searchcustomer?q=${query}`)
        .then((res) => setResults(res.data || []))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleCancelOrder = (orderId, customer, email, item, variant) => {
    setCancelData({
      OrderID: orderId,
      Customer_Name: customer,
      Email_Address: email,
    });

    axios
      .post("http://localhost:3000/requestCancelOrder", {
        email,
        orderId,
        item,
        variant,
      })
      .then(() => setCancelModal(true))
      .catch((err) => console.error("Error sending cancel request:", err));
  };

  const resetModal = () => {
    setOpenStatus(false);
    setCancelModal(false);
    setCancellingOrderId(null);
    setQuery("");
    setSelectedTransaction([]);
  };

  // Compute pending transactions safely
  const pendingTransactions = (selectedTransaction || []).filter(
    (t) => t.Status === "Pending",
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-(--primary-bg)">
      <nav className="w-full p-3 bg-(--primary-bg) shadow fixed top-0 left-0 z-50">
        <div className="lg:px-[1in] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-15 h-15" />
            <p className="font-medium">
              <span className="text-(--secondary-text)">
                Cavite State University - Tanza
              </span>
              <br />
              External and Business Affairs
            </p>
          </div>

          <ul className="hidden lg:flex items-center gap-2">
            <Link
              to="/"
              className={`px-5 py-3 transition-all border-b ${
                isActive("/")
                  ? "text-(--secondary-text) border-(--secondary-text)"
                  : "hover:text-(--secondary-text) border-transparent hover:border-(--secondary-text)"
              }`}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`px-5 py-3 transition-all border-b ${
                isActive("/news")
                  ? "text-(--secondary-text) border-(--secondary-text)"
                  : "hover:text-(--secondary-text) border-transparent hover:border-(--secondary-text)"
              }`}
            >
              News
            </Link>
            <Link
              to="/userlogin"
              className="px-5 py-3 transition-all hover:text-(--secondary-text) border-b border-transparent hover:border-(--secondary-text)"
            >
              Store
            </Link>
            <button
              onClick={toggleAbout}
              className={`px-5 py-3 transition-all relative cursor-pointer border-b group ${
                isAbout
                  ? "border-(--secondary-text)"
                  : "border-transparent hover:border-(--secondary-text)"
              }`}
            >
              <p
                className={
                  isAbout
                    ? "transition-all text-(--secondary-text)"
                    : "transition-all group-hover:text-(--secondary-text)"
                }
              >
                About
              </p>
              {isAbout && (
                <div className="min-w-50 p-5 bg-(--primary-bg) rounded-lg shadow flex flex-col gap-3 absolute -bottom-25 left-0">
                  <Link
                    to="/abouteba"
                    className="transition-all hover:text-(--secondary-text)"
                  >
                    Mission and Vision
                  </Link>
                  <Link
                    to="/aboutdeveloper"
                    className="transition-all hover:text-(--secondary-text)"
                  >
                    About the Developer
                  </Link>
                </div>
              )}
            </button>
            <button
              onClick={toggleCheckStatus}
              className={`px-5 py-3 transition-all relative cursor-pointer border-b group ${
                openStatus
                  ? "border-(--secondary-text)"
                  : "border-transparent hover:border-(--secondary-text)"
              }`}
            >
              <p
                className={
                  openStatus
                    ? "transition-all text-(--secondary-text)"
                    : "transition-all group-hover:text-(--secondary-text)"
                }
              >
                Check Status
              </p>
            </button>
          </ul>

          <button onClick={toggleDropdown} className="block lg:hidden">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        {/* Check Status Modal */}
        {openStatus && !cancelModal && (
          <div className="h-screen fixed inset-0 bg-black/50 center-flex z-30">
            <div className="bg-(--primary-bg) m-3 p-6 rounded w-full lg:w-3/5 min-h-3/5 space-y-5 overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl text-(--secondary-text)">
                  Check Status
                </h2>
                <button onClick={resetModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Search Input */}
              <div className="w-full relative flex flex-col gap-1">
                <label htmlFor="studentEmail">
                  Enter your CvSU Account Name
                </label>
                <div className="w-full relative">
                  <input
                    type="text"
                    id="studentEmail"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="CvSU email address"
                    className="w-full p-2 rounded border-2 border-(--outline) outline-(--secondary-text)"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                  />
                </div>

                {/* Search Results */}
                <div className="space-y-1 max-h-[200px] bg-(--primary-bg) rounded shadow overflow-y-auto no-scrollbar">
                  {results.map((student) => (
                    <div
                      key={student.Email_Address}
                      className="w-full cursor-pointer"
                      onClick={() =>
                        setSelectedTransaction(student.transaction || [])
                      } // ✅ safe fallback
                    >
                      <p className="p-2 border border-gray-500 rounded">
                        {student.Customer_Name} - {student.Email_Address}
                      </p>
                    </div>
                  ))}
                  {results.length === 0 && query && (
                    <p className="p-2">No results found.</p>
                  )}
                </div>
              </div>

              {/* Pending Transactions */}
              <div className="space-y-3">
                <h3 className="text-xl text-(--secondary-text) font-bold">
                  Order Details
                </h3>
                <div className="min-h-[300px] p-2 border border-(--outline) rounded flex flex-col">
                  {pendingTransactions.length > 0 ? (
                    pendingTransactions.map((transaction, index) => (
                      <div
                        key={index}
                        className="w-full p-3 space-y-2 border-b border-gray-400"
                      >
                        <div className="flex gap-1">
                          <p className="font-medium">Order Number:</p>
                          <span>{transaction.OrderID}</span>
                        </div>
                        <div className="flex gap-1">
                          <p className="font-medium">Items:</p>
                          <span>
                            {transaction.Item_Name}
                            {transaction.Variant
                              ? ` - ${transaction.Variant}`
                              : ""}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setCancellingOrderId(transaction.ID);
                            handleCancelOrder(
                              transaction.OrderID,
                              transaction.Customer_Name,
                              transaction.Email_Address,
                              transaction.Item_Name,
                              transaction.Variant,
                            );
                          }}
                          className="flex items-center gap-1 text-white bg-[var(--error)] py-1 px-2 rounded cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faBan} />
                          {cancellingOrderId === transaction.ID
                            ? "Cancelling Order"
                            : "Cancel Order"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="m-auto">No pending transactions found.</p> // ✅ friendly fallback
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModal && (
          <div className="h-screen fixed inset-0 bg-black/50 center-flex z-30">
            <div className="bg-(--primary-bg) m-3 p-6 rounded lg:w-3/7 space-y-8 overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center">
                <h1 className="text-xl text-(--secondary-text) font-bold">
                  Cancellation Request
                </h1>
                <FontAwesomeIcon
                  icon={faClose}
                  onClick={resetModal}
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-3">
                <p>
                  A confirmation email has been sent to the account’s address.
                </p>
                <p>Please check your inbox for further instructions.</p>
              </div>
              {cancelData && (
                <div className="flex justify-end text-left">
                  <div>
                    <p className="font-medium">{cancelData.Customer_Name}</p>
                    <p>{cancelData.Email_Address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile dropdown */}
        {isOpen && (
          <ul className="mt-3 flex flex-col">
            <Link
              to="/"
              className={`w-full py-2 transition-all ${isActive("/") ? "text-(--secondary-text)" : "hover:text-(--secondary-text)"}`}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`w-full py-2 transition-all ${isActive("/news") ? "text-(--secondary-text)" : "hover:text-(--secondary-text)"}`}
            >
              News
            </Link>
            <Link
              to="/userlogin"
              className="w-full py-2 transition-all hover:text-(--secondary-text)"
            >
              Store
            </Link>
            <button
              onClick={toggleAbout}
              className="w-full text-left transition-all cursor-pointer group"
            >
              <p
                className={
                  isAbout
                    ? "py-2 transition-all text-(--secondary-text)"
                    : "py-2 transition-all group-hover:text-(--secondary-text)"
                }
              >
                About
              </p>
            </button>
            {isAbout && (
              <div className="w-full px-3 flex flex-col">
                <Link
                  to="/abouteba"
                  className="w-full py-2 transition-all hover:text-(--secondary-text)"
                >
                  Mission and Vision
                </Link>
                <Link
                  to="/aboutdeveloper"
                  className="w-full py-2 transition-all hover:text-(--secondary-text)"
                >
                  About the Developer
                </Link>
              </div>
            )}
            <button
              onClick={toggleCheckStatus}
              className="w-full text-left transition-all relative cursor-pointer group"
            >
              <p
                className={
                  openStatus
                    ? "py-2 transition-all text-(--secondary-text)"
                    : "py-2 transition-all group-hover:text-(--secondary-text)"
                }
              >
                Check Status
              </p>
            </button>
          </ul>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
