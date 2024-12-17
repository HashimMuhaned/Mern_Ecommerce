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

const ItemCartChart = ({ itemId, filterDate }) => {
  const [cartHistory, setCartHistory] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await axios.get(
          `${process.env.BACKEND_API}/getItemCartCountLast${filterDate}/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCartHistory(response.data.carts);
      } catch (error) {
        console.error("Error fetching carts:", error);
      }
    };

    fetchCarts();
  }, [itemId, filterDate]);

  // Dynamically adjust labels based on the filterDate
  const formatDateLabel = (date) => {
    const cartDate = new Date(date);
    if (filterDate === "Day") {
      return cartDate.toLocaleTimeString(); // For last day, show time
    } else if (filterDate === "Week") {
      return cartDate.toLocaleDateString(); // For weeks, show day
    } else if (filterDate === "Month") {
      return `${cartDate.getDate()} ${cartDate.toLocaleString("default", {
        month: "short",
      })}`; // For months, show day and month
    } else if (filterDate === "Year") {
      return `${cartDate.toLocaleString("default", {
        month: "short",
      })} ${cartDate.getFullYear()}`; // For year, show month and year
    }
  };

  // Dynamically adjust the time unit for the X-axis scale
  const getTimeUnit = () => {
    if (filterDate === "Day") return "minute";
    if (filterDate === "Week") return "day";
    if (filterDate === "Month") return "day";
    if (filterDate === "Year") return "month";
  };

  const chartData = {
    labels: cartHistory.map((cart) => formatDateLabel(cart.date)), // Adjusted labels based on filter
    datasets: [
      {
        label: `Cart Count (Last ${filterDate})`,
        data: cartHistory.map((cart) => cart.count), // Y-axis: cart count
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1, // Smooth line
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Ensures chart fits its container
    scales: {
      x: {
        // type: "time",
        time: {
          unit: getTimeUnit(), // Dynamic time unit based on filter
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
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ItemCartChart;
