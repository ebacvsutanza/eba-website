import React, { useEffect, useState } from 'react'
import axios from 'axios';

import SalesChart from './SalesChart';
import OrderChart from './OrderChart';
import '../CSS/Admin.css'
import { VscLayoutSidebarRight } from "react-icons/vsc";

const Dashboard = ({ activeAdmin, openSidebar }) => {
  const [today, setToday] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  const day = today.toLocaleDateString(undefined, {
    weekday: "long",
  });
  const date = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchData();
  }, []);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionQuantity, setTransactionQuantity] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryQuantity, setInventoryQuantity] = useState(0);

  const fetchData = async () => {
    try {
      const responseTransaction = await axios.get(
        "https://capstone-cxej.onrender.com/transaction",
      );
      const transactionsData = responseTransaction.data;
      const responseInventory = await axios.get(
        "https://capstone-cxej.onrender.com/inventory",
      );

      const inventoriesData = responseInventory.data.map((inventory) => ({
        ...inventory,
      }));

      const totalSales = transactionsData
        .filter((transaction) => transaction.status === "Confirmed")
        .reduce((acc, transaction) => acc + transaction.amount, 0);

      setTransactionAmount(totalSales);
      const totalOrders = transactionsData
        .filter(transaction => transaction.status === "Confirmed")
        .reduce((acc, transaction) => acc + Number(transaction.quantity || 0), 0);

      setTransactionQuantity(totalOrders);
      
      const lowStock = inventoriesData.filter((item) => item.quantity < 11);
      setLowStockItems(lowStock);
      const totalInventory = inventoriesData.reduce(
        (acc, inventory) => acc + inventory.quantity,
        0,
      );
      setInventoryQuantity(totalInventory);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  const [bestSeller, setBestSeller] = useState(null);
  const [leastPurchased, setLeastPurchased] = useState(null);
  useEffect(() => {
    axios
      .get("https://capstone-cxej.onrender.com/api/best-seller")
      .then((res) => setBestSeller(res.data));
    axios
      .get("https://capstone-cxej.onrender.com/api/least-purchased")
      .then((res) => setLeastPurchased(res.data));
  }, []);

  const [newOrdersThisWeek, setNewOrdersThisWeek] = useState(0);

  useEffect(() => {
    const fetchNewOrders = async () => {
      try {
        const response = await axios.get(
          "https://capstone-cxej.onrender.com/api/dashboard/new-orders",
        );
        setNewOrdersThisWeek(response.data.new_orders);
      } catch (error) {
        console.error("Error fetching new orders:", error);
      }
    };

    fetchNewOrders();
  }, []);


  return (
    <div className="space-y-3">
      <div className="mb-10 flex justify-between">
        <div className="flex items-center gap-2">
          <button onClick={openSidebar} className="cursor-pointer lg:hidden">
            <VscLayoutSidebarRight size={20} />
          </button>
          <h1 className="text-(--secondary-text) text-2xl font-bold">
            {activeAdmin}
          </h1>
        </div>

        <div>
          <h1 className="text-xl font-bold">{day},</h1>
          <p>{date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-3">
        <div className="space-y-5 p-3 bg-(--primary-bg) border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Total Sales</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {formatCurrency(transactionAmount)}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Total Orders</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {transactionQuantity}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Items with Low Stock</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {lowStockItems.length}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Available Stocks</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {inventoryQuantity}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Sales</p>
          <SalesChart />
        </div>

        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Total Order</p>
          <OrderChart />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">New Orders of the Week</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {newOrdersThisWeek}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Best-seller</p>
          {bestSeller ? (
            <h2 className="text-xl text-(--secondary-text) font-bold">
              {bestSeller.item_name}
              {bestSeller.variant && `- ${bestSeller.variant}`}
            </h2>
          ) : (
            <h2 className="text-xl text-(--secondary-text) font-bold">
              No Best-seller Item
            </h2>
          )}
        </div>

        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg shadow">
          <p className="text-md font-bold">Least Purchased</p>
          {leastPurchased ? (
            <h2 className="text-xl text-(--secondary-text) font-bold">
              {leastPurchased.item_name}
              {leastPurchased.variant && `- ${leastPurchased.variant}`}
            </h2>
          ) : (
            <h2 className="text-xl text-(--secondary-text) font-bold">
              No Least Purchased Item
            </h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard