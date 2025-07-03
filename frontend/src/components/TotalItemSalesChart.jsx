import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ItemSalesChart = ({ itemId, filterDate }) => {
  const [salesHistory, setSalesHistory] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/getItemsTotalSalesByPeriod/${filterDate}/${itemId}`, // Adjusted API route
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSalesHistory(response.data.sales);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchSales();
  }, [itemId, filterDate]);

  // Format labels dynamically based on filterDate
  const formatDateLabel = (date) => {
    const saleDate = new Date(date);
    if (filterDate === "Day") {
      return saleDate.toLocaleTimeString();
    } else if (filterDate === "Week") {
      return saleDate.toLocaleDateString();
    } else if (filterDate === "Month") {
      return `${saleDate.getDate()} ${saleDate.toLocaleString("default", {
        month: "short",
      })}`;
    } else if (filterDate === "Year") {
      return `${saleDate.toLocaleString("default", {
        month: "short",
      })} ${saleDate.getFullYear()}`;
    }
  };

  // Determine appropriate time unit based on filterDate
  const getTimeUnit = () => {
    if (filterDate === "Day") return "hour";
    if (filterDate === "Week") return "day";
    if (filterDate === "Month") return "day";
    if (filterDate === "Year") return "month";
  };

  const chartData = {
    labels: salesHistory.map((sale) => formatDateLabel(sale.date)),
    datasets: [
      {
        label: `Item Sales (Last ${filterDate})`,
        data: salesHistory.map((sale) => sale.count),
        fill: false,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        time: {
          unit: getTimeUnit(),
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div
      id="totalSalesOfThisItem"
      style={{ position: "relative", height: "100%", width: "100%" }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ItemSalesChart;
