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

const ItemFavoritesChart = ({ itemId, filterDate }) => {
  const [favoritesHistory, setFavoritesHistory] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(
          `${process.env.BACKEND_API}/getItemFavoritesLast${filterDate}/${itemId}`,
          {
            withCredentials: true,
          }
        );
        setFavoritesHistory(response.data.favorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [itemId, filterDate]);

  // Dynamically adjust labels based on the filterDate
  const formatDateLabel = (date) => {
    const favoriteDate = new Date(date);
    if (filterDate === "Day") {
      return favoriteDate.toLocaleTimeString(); // For last day, show time
    } else if (filterDate === "Week") {
      return favoriteDate.toLocaleDateString(); // For weeks, show day
    } else if (filterDate === "Month") {
      return `${favoriteDate.getDate()} ${favoriteDate.toLocaleString(
        "default",
        { month: "short" }
      )}`; // For months, show day and month
    } else if (filterDate === "Year") {
      return `${favoriteDate.toLocaleString("default", {
        month: "short",
      })} ${favoriteDate.getFullYear()}`; // For year, show month and year
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
    labels: favoritesHistory.map((favorite) => formatDateLabel(favorite.date)), // Adjusted labels based on filter
    datasets: [
      {
        label: `Favorite Count (Last ${filterDate})`,
        data: favoritesHistory.map((favorite) => favorite.count), // Y-axis: favorite count
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
    <div
      id="totalSalesOfThisItem"
      style={{ position: "relative", height: "100%", width: "100%" }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ItemFavoritesChart;
