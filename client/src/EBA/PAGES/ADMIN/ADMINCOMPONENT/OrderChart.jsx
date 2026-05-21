import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrdersChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/api/orders-data")
      .then((response) => {
        setChartData({
          labels: response.data.labels,
          datasets: response.data.datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: ["rgba(255, 193, 7, 0.8)", "rgba(76, 175, 80, 0.8)", "rgba(244, 67, 54, 0.8)"][index],
            borderColor: ["#FFC107", "#4CAF50", "#F44336"][index],
            borderWidth: 1,
            borderRadius: 5,
            hoverBackgroundColor: ["rgba(255, 193, 7, 1)", "rgba(76, 175, 80, 1)", "rgba(244, 67, 54, 1)"][index],
            hoverBorderColor: ["#FFC107", "#4CAF50", "#F44336"][index],
            hoverBorderWidth: 2,
          })),
        });
      })
      .catch((error) => console.error("Error fetching orders data:", error));
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' orders';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          },
          stepSize: 1
        }
      }
    }
  };

  return chartData ? (
    <div style={{ height: '300px', position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default OrdersChart;
