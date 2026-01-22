import React, { useEffect, useState } from 'react'
import axios from 'axios';

import Dates from './Date'
import SalesChart from './SalesChart';
import OrderChart from './OrderChart';
import '../CSS/Admin.css'

const Dashboard = ({ activeAdmin }) => {
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
  const [newOrdersThisWeek, setNewOrdersThisWeek] = useState(0);
	
  const fetchData = async () => {
    try {
      const responseTransaction = await axios.get(
        "http://localhost:3000/transaction",
      );
      const transactionsData = responseTransaction.data;
      const responseInventory = await axios.get(
        "http://localhost:3000/inventory",
      );

      const inventoriesData = responseInventory.data.map((inventory) => ({
        ...inventory,
      }));

      const totalSales = transactionsData.reduce(
        (acc, transaction) => acc + transaction.Amount,
        0,
      );
      setTransactionAmount(totalSales);
      const totalOrders = transactionsData.reduce(
        (acc, transaction) => acc + transaction.Quantity,
        0,
      );
      setTransactionQuantity(totalOrders);
      const lowStock = inventoriesData.filter((item) => item.Quantity < 11);
      setLowStockItems(lowStock);
      const totalInventory = inventoriesData.reduce(
        (acc, inventory) => acc + inventory.Quantity,
        0,
      );
      setInventoryQuantity(totalInventory);

			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newOrders = transactionsData.filter(
        (transaction) => new Date(transaction.Date) >= oneWeekAgo,
      ).length;
      setNewOrdersThisWeek(newOrders);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
	
  const [bestSeller, setBestSeller] = useState(null);
  const [leastPurchased, setLeastPurchased] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/best-seller")
      .then((res) => setBestSeller(res.data));
    axios
      .get("http://localhost:3000/api/least-purchased")
      .then((res) => setLeastPurchased(res.data));
  }, []);


  return (
    <div className="space-y-3">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-(--secondary-text) text-2xl font-bold">
          {activeAdmin}
        </h1>

        <div>
          <h1 className="text-xl font-bold">{day},</h1>
          <p>{date}</p>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Total Sales</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {formatCurrency(transactionAmount)}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Total Orders</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {transactionQuantity}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Items with Low Stock</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {lowStockItems.length}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Available Stocks</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {inventoryQuantity}
          </h2>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Sales</p>
          <SalesChart />
        </div>

        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Total Order</p>
          <OrderChart />
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">New Orders of the Week</p>
          <h2 className="text-xl text-(--secondary-text) font-bold">
            {newOrdersThisWeek}
          </h2>
        </div>
        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Best-seller</p>
          {bestSeller ? (
						<h2 className="text-xl text-(--secondary-text) font-bold">{bestSeller.Item_Name} {bestSeller.Variant && `- ${bestSeller.Variant}`}</h2>
          ) : (
						<h2 className="text-xl text-(--secondary-text) font-bold">No Best-seller Item</h2>
					)}
        </div>

        <div className="space-y-5 p-3 bg-(--primary-bg) flex-1 border border-gray-300 rounded-lg">
          <p className="text-md font-bold">Least Purchased</p>
          {leastPurchased ? (
						<h2 className="text-xl text-(--secondary-text) font-bold">{leastPurchased.Item_Name} {leastPurchased.Variant && `- ${leastPurchased.Variant}`}</h2>
          ) : (
						<h2 className="text-xl text-(--secondary-text) font-bold">No Least Purchased Item</h2>
					)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard