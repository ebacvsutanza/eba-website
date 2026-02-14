import React, { useEffect, useState } from "react";
import axios from "axios";

import { IoFilter } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import { FaCheck } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { VscLayoutSidebarRight } from "react-icons/vsc";

const Transaction = ({ activeAdmin, openSidebar, role }) => {
  const [table, setTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 20;

  const fetchTotalPages = async () => {
    try {
      const res = await axios.get("http://localhost:3000/transaction/count");
      setTotalPages(Math.ceil(res.data.total / rowsPerPage));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTotalPages();
  }, []);


  const [transactions, setTransactions] = useState([]);
  const [statusSorted, setStatusSorted] = useState(false);

  const fetchTransactions = async (order = sortOrder, page = currentPage) => {
    const response = await axios.get(
      `http://localhost:3000/transaction?order=${order}&page=${page}`,
    );
    setTransactions(response.data);
    setStatusSorted(false);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const [selected, setSelected] = useState([]);
  const allSelected = transactions.length > 0 && selected.length === transactions.length;
  const toggleSelectAll = () => {
    if (selected.length === transactions.length) {
      setSelected([]);
    } else {
      setSelected(transactions.map((transaction) => transaction.ID));
    }
  };  
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const updateStatus = async (isConfirm, transaction = null) => {
    // SINGLE ACTION
    if (selected.length <= 1 && transaction) {
      if (isConfirm) {
        await confirmOrder(transaction);
      } else {
        await cancelOrder(transaction);
      }
      setSelected([]);
      setShowConfirm(false);
      return;
    }

    // BULK ACTION
    if (selected.length >= 2) {
      try {
        if (isConfirm) {
          setConfirming(true);
          await bulkConfirmOrders(selected);

          const updated = transactions.map((txn) =>
            selected.includes(txn.id) ? { ...txn, status: "Confirmed" } : txn,
          );
          setTransactions(statusSorted ? sortStatusList(updated) : updated);
          flashMessage("Transaction confirmed successfully");
        } else {
          setCancelling(true);
          await bulkCancelOrders(selected);

          const updated = transactions.map((txn) =>
            selected.includes(txn.id) ? { ...txn, status: "Cancelled" } : txn,
          );
          setTransactions(statusSorted ? sortStatusList(updated) : updated);
          flashMessage("Transaction cancelled successfully");
        }

        setSelected([]);
        setActiveTransaction(null);
      } catch (error) {
        console.error(error);
        alert("Bulk update failed.");
      } finally {
        setConfirming(false);
        setCancelling(false);
      }
    }

    resetForm()
  };
  const bulkConfirmOrders = async (ids) => {
    return axios.post("http://localhost:3000/bulk-confirm", {
      orderIds: ids,
    });
  };
  const bulkCancelOrders = async (ids) => {
    return axios.post("http://localhost:3000/bulk-cancel", {
      orderIds: ids,
    });
  };


  const [activeTransaction, setActiveTransaction] = useState(null);
  const handleStatus = (transaction) => {
    setActiveTransaction(
      activeTransaction === transaction.id ? null : transaction.id,
    );
  };
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const confirmOrder = async (transaction) => {
    setConfirming(true);
    try {
      const response = await axios.post("http://localhost:3000/confirm-order", {
        id: transaction.id,
        orderId: transaction.orderid,
        name: transaction.customer_name,
        customerEmail: transaction.email_address,
      });

      const updated = transactions.map((txn) =>
        txn.id === transaction.id ? { ...txn, status: "Confirmed" } : txn,
      );
      setTransactions(statusSorted ? sortStatusList(updated) : updated);
      setActiveTransaction(null);
      flashMessage("Transaction confirmed successfully");
      fetchTransactions()
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "An error occurred while confirming the order.",
      );
    } finally {
      setConfirming(false);
    }
  };
  const cancelOrder = async (transaction) => {
    setCancelling(true);
    try {
      const response = await axios.post("http://localhost:3000/cancel-order", {
        id: transaction.id,
        orderId: transaction.orderid,
        itemName: transaction.item_name,
        variant: transaction.variant,
        size: transaction.size,
        name: transaction.customer_name,
        customerEmail: transaction.email_address,
      });

      const updated = transactions.map((txn) =>
        txn.id === transaction.id ? { ...txn, status: "Cancelled" } : txn,
      );
      setTransactions(statusSorted ? sortStatusList(updated) : updated);
      setActiveTransaction(null);
      flashMessage("Transaction cancelled successfully");
      fetchTransactions()
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "An error occurred while cancelling the order.",
      );
    } finally {
      setCancelling(false);
    }
  };
  const sortStatusList = (list) => {
    const priority = { Confirmed: 1, Pending: 2, Cancelled: 3 };
    return [...list].sort((a, b) => priority[a.status] - priority[b.status]);
  };

  const [filter, setFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState("DESC");
  const toggleSortOrder = async () => {
    const newOrder = sortOrder === "DESC" ? "ASC" : "DESC";
    setSortOrder(newOrder);
    await fetchTransactions(newOrder);
  };
  const sortByStatus = () => {
    const statusPriority = { Confirmed: 1, Pending: 2, Cancelled: 3 };
    const sorted = [...transactions].sort((a, b) => {
      return statusPriority[a.status] - statusPriority[b.status];
    });
    setTransactions(sorted);
    setStatusSorted(true);
  };

  useEffect(() => {
    fetchTransactions(sortOrder, currentPage);
  }, [currentPage, sortOrder]);
  
  const [mode, setMode] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState('')
  const [row, setRow] = useState(false);
  const handleConfirm = (action, transaction) => {
    setShowConfirm(true);
    setRow(transaction);

    if (action === true) {
      setMsg("Confirm");
      setMode('confirm')
    } else {
      setMsg("Cancel");
      setMode('cancel')
    }
  };
  const resetForm = () => {
    setActiveTransaction(false);
    setShowConfirm(false);
  }

  const [message, setMessage] = useState("");
  const flashMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="transaction space-y-3">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={openSidebar} className="cursor-pointer lg:hidden">
            <VscLayoutSidebarRight size={20} />
          </button>
          <h1 className="text-(--secondary-text) text-2xl font-bold">
            {activeAdmin}
          </h1>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1 border-b border-gray-400">
          <button
            onClick={() => setTable(false)}
            className={`
              py-2 px-2 lg:px-8 cursor-pointer transition-all hover:text-(--secondary-text) hover:border-b hover:border-(--secondary-text)
              ${!table && "border-b border-(--secondary-text) text-(--secondary-text)"}
            `}
          >
            Order Information
          </button>
          <button
            onClick={() => setTable(true)}
            className={`
              py-2 px-8 cursor-pointer transition-all hover:text-(--secondary-text) hover:border-b hover:border-(--secondary-text)
              ${table && "border-b border-(--secondary-text) text-(--secondary-text)"}
            `}
          >
            Customer Information
          </button>

          <div className="ml-auto relative">
            <button
              className="flex items-center gap-2 py-2 px-8 cursor-pointer"
              onClick={() => setFilter(!filter)}
            >
              Filter
              <IoFilter />
            </button>
            {filter && (
              <div className="w-[150px] py-2 px-5 space-y-2 rounded-lg shadow absolute right-1 top-[105%] bg-(--primary-bg) text-left cursor-pointer">
                <button onClick={toggleSortOrder}>Sort by Date</button>
                <button onClick={sortByStatus}>Sort by Status</button>
              </div>
            )}
          </div>
        </div>

        <div className="no-scrollbar overflow-auto">
          <div className="min-w-[900px] space-y-3">
            <div className="min-w-full p-3 bg-(--primary-bg) rounded-lg text-center">
              <div
                className={`
                  ${!table ? "grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]" : "grid-cols-[minmax(100px,1fr)_repeat(6,minmax(100px,1fr))]"} 
                  px-3 grid place-items-center text-center
                `}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
                <div>Order Number</div>

                {!table ? (
                  <>
                    <div>Image</div>
                    <div>Item</div>
                    <div>Variant</div>
                    <div>Size</div>
                    <div>Quantity</div>
                    <div>Total Amount</div>
                  </>
                ) : (
                  <>
                    <div>Customer Name</div>
                    <div>Email Address</div>
                    <div>Date</div>
                    <div>Status</div>
                  </>
                )}
                <div>Action</div>
              </div>
            </div>

            <div className="min-w-full p-3 bg-(--primary-bg) rounded-lg text-center">
              {transactions.length === 0 ? (
                <p className="py-6 text-gray-500">No Transaction</p>
              ) : (
                transactions.map((transaction, index) => (
                  <div
                    className={`
                      mb-3 p-3 grid place-items-center shadow rounded-lg text-center border transition-all
                      ${!table ? "grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]" : "grid-cols-[minmax(100px,1fr)_repeat(6,minmax(100px,1fr))]"} 
                      ${selected.includes(transaction.id) ? "bg-(--accent)/15 border-transparent" : "bg-(--primary-bg) border-gray-400"}
                    `}
                    key={index}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(transaction.id)}
                      onChange={() => toggleSelect(transaction.id)}
                      className="cursor-pointer"
                    />
                    <div>{transaction.orderid}</div>

                    {!table ? (
                      <>
                        <div>
                          <img
                            src={`http://localhost:3000/ITEMS/${transaction.image}`}
                            alt=""
                            className="w-14 h-14 object-contain mx-auto rounded"
                          />
                        </div>

                        <div className="line-clamp-2 lg:line-clamp-1 font-medium">
                          {transaction.item_name}
                        </div>

                        <div>{transaction.variant || "-"}</div>
                        <div>{transaction.size || "-"}</div>
                        <div>{transaction.quantity}</div>
                        <div className="font-semibold">
                          ₱{transaction.amount}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="line-clamp-2 lg:line-clamp-1 max-w-[150px]">
                          {transaction.customer_name}
                        </div>
                        <div className="line-clamp-2 lg:line-clamp-1 max-w-[100px]">
                          {transaction.email_address}
                        </div>
                        <div>{formatDate(transaction.date)}</div>
                        <div>{transaction.status}</div>
                      </>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => handleStatus(transaction)}
                        disabled={role === "Admin"}
                        className="p-2 cursor-pointer"
                      >
                        <HiDotsVertical size={18} />
                      </button>

                      {activeTransaction === transaction.id && (
                        <div className="p-2 absolute bottom-0 right-[70%] bg-white border border-gray-200 shadow-lg rounded-md z-50 w-45">
                          <button
                            onClick={() => handleConfirm(true, transaction)}
                            disabled={
                              transaction.status === "Cancelled" ||
                              transaction.status === "Confirmed" ||
                              cancelling
                            }
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
                          >
                            <FaCheck />
                            Confirm
                          </button>

                          <button
                            onClick={() => handleConfirm(false, transaction)}
                            disabled={
                              transaction.status === "Cancelled" ||
                              transaction.status === "Confirmed" ||
                              confirming
                            }
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-(--error) cursor-pointer flex items-center gap-2"
                          >
                            <FaTrash />
                            Cancel
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
      </div>

      {message && (
        <div className="w-3/4 lg:w-auto bg-(--primary-bg) shadow-[0_0_5px_#acacac] py-2 px-10 rounded-lg absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
          {message}
        </div>
      )}

      {showConfirm && (
        <div className="h-screen p-3 fixed inset-0 bg-black/50 center-flex z-50">
          <div className="w-full bg-white p-5 rounded-lg lg:w-1/3 overflow-auto flex justify-between flex-col gap-10">
            <div className="space-y-3">
              <h1 className="font-bold text-lg text-(--error)">
                {msg} transaction
              </h1>
              <p>Are you sure you want to {mode} this transaction?</p>
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
                  (mode === "confirm" && updateStatus(true, row)) ||
                  (mode === "cancel" && updateStatus(false, row))
                }
              >
                {mode === "confirm"
                  ? confirming
                    ? "Confirming..."
                    : `Yes, ${mode}`
                  : cancelling
                    ? "Cancelling..."
                    : `Yes, ${mode}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;