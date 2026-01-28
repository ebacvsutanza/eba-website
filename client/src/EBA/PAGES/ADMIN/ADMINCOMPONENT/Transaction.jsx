import React, { useEffect, useState } from "react";
import axios from "axios";

import { IoFilter } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import { FaCheck } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const Transaction = ({ activeAdmin }) => {
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
      return;
    }

    // BULK ACTION
    if (selected.length >= 2) {
      try {
        if (isConfirm) {
          setConfirming(true);
          await bulkConfirmOrders(selected);

          const updated = transactions.map((txn) =>
            selected.includes(txn.ID) ? { ...txn, Status: "Confirmed" } : txn,
          );
          setTransactions(statusSorted ? sortStatusList(updated) : updated);
        } else {
          setCancelling(true);
          await bulkCancelOrders(selected);

          const updated = transactions.map((txn) =>
            selected.includes(txn.ID) ? { ...txn, Status: "Cancelled" } : txn,
          );
          setTransactions(statusSorted ? sortStatusList(updated) : updated);
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
      activeTransaction === transaction.ID ? null : transaction.ID,
    );
  };
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const confirmOrder = async (transaction) => {
    setConfirming(true);
    try {
      const response = await axios.post("http://localhost:3000/confirm-order", {
        orderId: transaction.ID,
        name: transaction.customerName,
        customerEmail: transaction.Email_Address,
      });

      const updated = transactions.map((txn) =>
        txn.ID === transaction.ID ? { ...txn, Status: "Confirmed" } : txn,
      );
      setTransactions(statusSorted ? sortStatusList(updated) : updated);
      setActiveTransaction(null);
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
        orderId: transaction.ID,
        name: transaction.Customer_Name,
        customerEmail: transaction.Email_Address,
      });

      const updated = transactions.map((txn) =>
        txn.ID === transaction.ID ? { ...txn, Status: "Cancelled" } : txn,
      );
      setTransactions(statusSorted ? sortStatusList(updated) : updated);
      setActiveTransaction(null);
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
    return [...list].sort((a, b) => priority[a.Status] - priority[b.Status]);
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
      return statusPriority[a.Status] - statusPriority[b.Status];
    });
    setTransactions(sorted);
    setStatusSorted(true);
  };

  useEffect(() => {
    fetchTransactions(sortOrder, currentPage);
  }, [currentPage, sortOrder]);
  
  return (
    <div className="transaction space-y-3">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-(--secondary-text) text-2xl font-bold">
          {activeAdmin}
        </h1>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 border-b border-gray-400">
          <button
            onClick={() => setTable(false)}
            className={`
              py-2 px-8 cursor-pointer transition-all hover:text-(--secondary-text) hover:border-b hover:border-(--secondary-text)
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

        <div className="p-3 bg-(--primary-bg) shadow rounded-lg text-center">
          <div
            className={`px-3 grid ${!table ? "grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]" : "grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr]"} place-items-center text-center`}
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

        <div className="p-3 bg-(--primary-bg) shadow rounded-lg text-center">
          {transactions.length === 0 ? (
            <p className="py-6 text-gray-500">No Transaction</p>
          ) : (
            transactions.map((transaction, index) => (
              <div
                className={`
                  mb-3 p-3 grid place-items-center shadow rounded-lg text-center border transition-all
                  ${!table ? "grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]" : "grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr]"} 
                  ${selected.includes(transaction.ID) ? "bg-(--accent)/15 border-transparent" : "bg-(--primary-bg) border-gray-400"}
                `}
                key={index}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(transaction.ID)}
                  onChange={() => toggleSelect(transaction.ID)}
                  className="cursor-pointer"
                />
                <div>{transaction.OrderID}</div>

                {!table ? (
                  <>
                    <div>
                      <img
                        src={`http://localhost:3000/ITEMS/${transaction.Image}`}
                        alt=""
                        className="w-14 h-14 object-contain mx-auto rounded"
                      />
                    </div>

                    <div className="line-clamp-1 font-medium">
                      {transaction.Item_Name}
                    </div>

                    <div>{transaction.Variant || "-"}</div>
                    <div>{transaction.Size || "-"}</div>
                    <div>{transaction.Quantity}</div>
                    <div className="font-semibold">₱{transaction.Amount}</div>
                  </>
                ) : (
                  <>
                    <div className="line-clamp-1 max-w-[150px]">
                      {transaction.Customer_Name}
                    </div>
                    <div className="line-clamp-1 max-w-[150px]">
                      {transaction.Email_Address}
                    </div>
                    <div>{formatDate(transaction.Date)}</div>
                    <div>{transaction.Status}</div>
                  </>
                )}

                <div className="relative">
                  <button
                    onClick={() => handleStatus(transaction)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <HiDotsVertical size={18} />
                  </button>

                  {activeTransaction === transaction.ID && (
                    <div className="p-2 absolute top-[60%] right-[60%] bg-white border border-gray-200 shadow-lg rounded-md z-20 w-45">
                      <button
                        onClick={() => updateStatus(true, transaction)}
                        disabled={
                          transaction.Status === "Cancelled" ||
                          transaction.Status === "Confirmed" ||
                          cancelling
                        }
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
                      >
                        <FaCheck />
                        {confirming ? "Confirming..." : "Confirm"}
                      </button>

                      <button
                        onClick={() => updateStatus(false, transaction)}
                        disabled={
                          transaction.Status === "Cancelled" ||
                          transaction.Status === "Confirmed" ||
                          confirming
                        }
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-(--error) cursor-pointer flex items-center gap-2"
                      >
                        <FaTrash />
                        {cancelling ? "Cancelling..." : "Cancel"}
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
      </div>
    </div>
  );
};

export default Transaction;